import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Optional } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { Repository, UpdateResult } from "typeorm";
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from "../dto/create-user.dto";
import { UpdateUserDto } from "../dto/update-user.dto";
import { v4 as uuid4 } from "uuid";
import { PaginationDto } from "../../../common/dto/pagination.dto";
import { EncryptionService } from "../../../common/services/encryption.service";
import { ConfigService } from "@nestjs/config";
import { Role } from "../enum/role.enum";

// Mock user for when database is disabled
const MOCK_USER: UserEntity = {
    id: '1',
    userName: 'demo',
    email: 'demo@example.com',
    password: '$2b$10$KlBGKASI0HX5Io0DRJ/yLePhMWMuB1r64QnZYvQqjuFzq1jXrdw5G', // password: 'password'
    apiKey: 'demo-api-key',
    role: Role.USER,
    enable2FA: false,
    twoFASecret: null,
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
};

@Injectable()
export class UserService {
    private readonly databaseEnabled: boolean;
    private readonly mockUsers: UserEntity[] = [MOCK_USER];

    constructor(
        @Optional() @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        private encryptionService: EncryptionService,
        private configService: ConfigService
    ) {
        this.databaseEnabled = this.configService.get<boolean>('DATABASE_ENABLED');
        console.log(`Database enabled: ${this.databaseEnabled}`);
    }

    async create(userDto: CreateUserDto): Promise<UserEntity> {
        if (!this.databaseEnabled) {
            throw new BadRequestException('Database functionality is disabled');
        }

        try {
            // Check if email already exists
            const existingUser = await this.userRepository.findOneBy({ email: userDto.email });
            if (existingUser) {
                throw new BadRequestException('User with this email already exists');
            }

            const user = new UserEntity();
            user.userName = userDto.userName;
            user.email = userDto.email;
            user.apiKey = uuid4();
            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(userDto.password, salt);

            const savedUser = await this.userRepository.save(user);
            delete savedUser.password;
            return savedUser;
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException('Failed to create user: ' + error.message);
        }
    }

    async findAll(paginationDto: PaginationDto): Promise<{ items: UserEntity[], total: number, page: number, pageSize: number, totalPages: number }> {
        if (!this.databaseEnabled) {
            const { page = 1, pageSize = 10 } = paginationDto;
            const mockUsersWithoutPassword = this.mockUsers.map(user => {
                const { password, ...userWithoutPassword } = { ...user };
                return userWithoutPassword as UserEntity;
            });

            return {
                items: mockUsersWithoutPassword,
                total: mockUsersWithoutPassword.length,
                page,
                pageSize,
                totalPages: 1
            };
        }

        try {
            const { page = 1, pageSize = 10 } = paginationDto;
            const skip = (page - 1) * pageSize;

            const [users, total] = await this.userRepository.findAndCount({
                skip,
                take: pageSize,
                order: {
                    createdAt: 'DESC'
                }
            });

            const items = users.map(user => {
                const userCopy = { ...user };
                delete userCopy.password;
                return userCopy;
            });

            return {
                items,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            };
        } catch (error) {
            throw new BadRequestException('Failed to fetch users: ' + error.message);
        }
    }

    async findOne(data: Partial<UserEntity>): Promise<UserEntity> {
        if (!this.databaseEnabled) {
            const mockUser = this.mockUsers.find(u => u.email === data.email);
            if (!mockUser) {
                throw new UnauthorizedException('User not found with the provided email');
            }
            return { ...mockUser };
        }

        try {
            const user = await this.userRepository.findOneBy({ email: data.email });
            if (!user) {
                throw new UnauthorizedException('User not found with the provided email');
            }
            return user;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Failed to find user: ' + error.message);
        }
    }

    async findByApiKey(apiKey: string): Promise<UserEntity> {
        if (!this.databaseEnabled) {
            const mockUser = this.mockUsers.find(u => u.apiKey === apiKey);
            if (!mockUser) {
                throw new UnauthorizedException('Invalid API key');
            }
            return { ...mockUser };
        }

        try {
            const user = await this.userRepository.findOneBy({ apiKey });
            if (!user) {
                throw new UnauthorizedException('Invalid API key');
            }
            return user;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException('Failed to authenticate with API key: ' + error.message);
        }
    }

    async findById(id: string): Promise<UserEntity> {
        if (!this.databaseEnabled) {
            const mockUser = this.mockUsers.find(u => u.id === id);
            if (!mockUser) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            const { password, ...userWithoutPassword } = { ...mockUser };
            return userWithoutPassword as UserEntity;
        }

        try {
            const user = await this.userRepository.findOneBy({ id });
            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
            delete user.password;

            // Decrypt 2FA secret if it exists
            if (user.twoFASecret) {
                try {
                    user.twoFASecret = this.encryptionService.decrypt(user.twoFASecret);
                } catch (error) {
                    console.error('Failed to decrypt 2FA secret:', error.message);
                }
            }

            return user;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to find user with ID ${id}: ${error.message}`);
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        if (!this.databaseEnabled) {
            throw new BadRequestException('Database functionality is disabled');
        }

        try {
            const user = await this.findById(id);

            if (updateUserDto.email && updateUserDto.email !== user.email) {
                const existingUser = await this.userRepository.findOneBy({ email: updateUserDto.email });
                if (existingUser) {
                    throw new BadRequestException('Email is already in use');
                }
            }

            if (updateUserDto.password) {
                const salt = await bcrypt.genSalt();
                updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
            }
            console.log(updateUserDto)
            const updatedUser = Object.assign(user, updateUserDto);
            await this.userRepository.save(updatedUser);
            delete updatedUser.password;
            return updatedUser;
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(`Failed to update user with ID ${id}: ${error.message}`);
        }
    }

    async remove(id: string): Promise<void> {
        if (!this.databaseEnabled) {
            throw new BadRequestException('Database functionality is disabled');
        }

        try {
            const result = await this.userRepository.delete(id);
            if (result.affected === 0) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(`Failed to delete user with ID ${id}: ${error.message}`);
        }
    }

    async updateSecretKey(userId: string, secret: string): Promise<UpdateResult> {
        if (!this.databaseEnabled) {
            throw new BadRequestException('Database functionality is disabled');
        }

        try {
            // Encrypt the 2FA secret before storing it
            const encryptedSecret = this.encryptionService.encrypt(secret);

            return this.userRepository.update({
                id: userId
            },
                {
                    twoFASecret: encryptedSecret,
                    enable2FA: true
                });
        } catch (error) {
            throw new BadRequestException(`Failed to update 2FA secret: ${error.message}`);
        }
    }

    async disable2FA(userId: string): Promise<UpdateResult> {
        if (!this.databaseEnabled) {
            throw new BadRequestException('Database functionality is disabled');
        }

        try {
            return this.userRepository.update({
                id: userId
            }, {
                enable2FA: false,
                twoFASecret: null
            });
        } catch (error) {
            throw new BadRequestException(`Failed to disable 2FA: ${error.message}`);
        }
    }

    async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
        if (!this.databaseEnabled) {
            // In-memory mock update for the demo user
            if (userId === '1') {
                this.mockUsers[0].refreshToken = await bcrypt.hash(refreshToken, 10);
            }
            return;
        }

        try {
            // Hash the refresh token before storing
            const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

            await this.userRepository.update(
                { id: userId },
                { refreshToken: hashedRefreshToken }
            );
        } catch (error) {
            throw new BadRequestException(`Failed to update refresh token: ${error.message}`);
        }
    }

    async removeRefreshToken(userId: string): Promise<void> {
        if (!this.databaseEnabled) {
            // In-memory mock update for the demo user
            if (userId === '1') {
                this.mockUsers[0].refreshToken = null;
            }
            return;
        }

        try {
            await this.userRepository.update(
                { id: userId },
                { refreshToken: null }
            );
        } catch (error) {
            throw new BadRequestException(`Failed to remove refresh token: ${error.message}`);
        }
    }
} 
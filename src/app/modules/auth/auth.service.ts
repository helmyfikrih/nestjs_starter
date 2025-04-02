import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy'
import { Injectable, UnauthorizedException, BadRequestException, Logger } from "@nestjs/common";
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
import { UserLoginDto } from './dto/login.dto';
import { JwtService } from "@nestjs/jwt";
import { Enable2FAType } from './types';
import { UpdateResult } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { EncryptionService } from "../../common/services/encryption.service";

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private encryptionService: EncryptionService) { }

    async login(loginDTO: UserLoginDto): Promise<{ accessToken: string } | { validate2FA: string, message: string }> {
        try {
            const user = await this.usersService.findOne(loginDTO);

            const passwordMatched = await bcrypt.compare(
                loginDTO.password,
                user.password
            );

            if (!passwordMatched) {
                throw new UnauthorizedException("Password does not match");
            }

            delete user.password;

            const payload = {
                email: user.email,
                sub: user.id,
                userName: user.userName
            };

            const token = await this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRATION', '1h')
            });

            return {
                accessToken: token
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException(`Login failed: ${error.message}`);
        }
    }

    async enable2FA(userId: number): Promise<Enable2FAType> {
        try {
            const user = await this.usersService.findById(userId);

            if (user.enable2FA) {
                // If 2FA is already enabled, return the decrypted secret
                return { secret: user.twoFASecret };
            }

            // Generate a new 2FA secret - will be encrypted by the UserService
            const secret = speakeasy.generateSecret();
            await this.usersService.updateSecretKey(user.id, secret.base32);

            return { secret: secret.base32 };
        } catch (error) {
            this.logger.error(`Failed to enable 2FA: ${error.message}`);
            throw new BadRequestException(`Failed to enable 2FA: ${error.message}`);
        }
    }

    async validate2FAToken(
        userId: number,
        token: string
    ): Promise<{ verified: boolean }> {
        try {
            const user = await this.usersService.findById(userId);

            // The secret is already decrypted in findById
            const verified = speakeasy.totp.verify({
                secret: user.twoFASecret,
                token: token,
                encoding: 'base32'
            });

            return { verified: verified };
        } catch (error) {
            this.logger.error(`Error verifying token: ${error.message}`);
            throw new UnauthorizedException("Error verifying token");
        }
    }

    async validateUserByApiKey(apiKey: string): Promise<UserEntity> {
        return this.usersService.findByApiKey(apiKey);
    }

    async disable2FA(userId: number): Promise<UpdateResult> {
        return this.usersService.disable2FA(userId);
    }

    getEnvVariables() {
        return {
            port: this.configService.get<number>("PORT"),
            nodeEnv: this.configService.get<string>("NODE_ENV"),
        };
    }
}
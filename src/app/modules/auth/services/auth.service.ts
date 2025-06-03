import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy'
import { Injectable, UnauthorizedException, BadRequestException, Logger } from "@nestjs/common";
import { UserService } from '../../user/services/user.service';
import { UserEntity } from '../../user/entities/user.entity';
import { UserLoginDto } from '../dto/login.dto';
import { JwtService } from "@nestjs/jwt";
import { Enable2FAType } from '../types/enable-2fa.type';
import { UpdateResult } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { EncryptionService } from "../../../common/services/encryption.service";
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private encryptionService: EncryptionService) { }

    async login(loginDTO: UserLoginDto): Promise<{ accessToken: string, refreshToken: string } | { validate2FA: string, message: string }> {
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

            const tokens = await this.generateTokens(user);

            // Store the refresh token in the database
            await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new BadRequestException(`Login failed: ${error.message}`);
        }
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string, refreshToken: string }> {
        try {
            const { refreshToken } = refreshTokenDto;

            // Verify the refresh token
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Find the user with this refresh token
            const user = await this.usersService.findById(payload.sub);

            // Validate that the refresh token matches what's stored
            if (!user || !user.refreshToken || !(await bcrypt.compare(refreshToken, user.refreshToken))) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Generate new tokens
            const tokens = await this.generateTokens(user);

            // Update the refresh token in the database
            await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            this.logger.error(`Refresh token failed: ${error.message}`);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string): Promise<void> {
        // Clear the refresh token when logging out
        await this.usersService.removeRefreshToken(userId);
    }

    private async generateTokens(user: UserEntity): Promise<{ accessToken: string, refreshToken: string }> {
        const payload = {
            email: user.email,
            sub: user.id,
            userName: user.userName,
            role: user.role
        };

        // Generate access token
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m')
        });

        // Generate refresh token with longer expiration
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d')
        });

        return {
            accessToken,
            refreshToken
        };
    }

    async enable2FA(userId: string): Promise<Enable2FAType> {
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
        userId: string,
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

    async disable2FA(userId: string): Promise<UpdateResult> {
        return this.usersService.disable2FA(userId);
    }

    getEnvVariables() {
        return {
            port: this.configService.get<number>("PORT"),
            nodeEnv: this.configService.get<string>("NODE_ENV"),
        };
    }
} 
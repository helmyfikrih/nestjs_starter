import { Controller, Post, Body, HttpStatus, UseGuards, Get } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { UserLoginDto } from "../dto/login.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { Enable2FADto } from "../dto/enable-2fa.dto";
import { ValidateTokenDTO } from "../dto/validate-token.dto";
import { Public } from "../../../common/decorators/public.decorator";
import { GetUser } from "../../../common/decorators/get-user.decorator";
import { UserEntity } from "../../user/entities/user.entity";
import { RefreshTokenDto } from "../dto/refresh-token.dto";

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @Public()
    @ApiOperation({ summary: 'User login' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User login successful',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsInVzZXJOYW1lIjoidXNlciIsImlhdCI6MTcwODUzMTQxNiwiZXhwIjoxNzA4NTM1MDE2fQ.WW6QWIwjMPTYU3DP-LYwaAoB_TB8Jn-S4MklA3n3Xc0',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsInVzZXJOYW1lIjoidXNlciIsImlhdCI6MTcwODUzMTQxNiwiZXhwIjoxNzA5MTM2MjE2fQ.mZhCuFjOWLQMco0PhbTnXDZ9RktT8CgJPEPCXHoMd68'
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Invalid credentials',
    })
    async login(@Body() userLoginDto: UserLoginDto) {
        return this.authService.login(userLoginDto);
    }

    @Post('refresh')
    @Public()
    @ApiOperation({ summary: 'Refresh access token' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Tokens refreshed successfully',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsInVzZXJOYW1lIjoidXNlciIsImlhdCI6MTcwODUzMTQxNiwiZXhwIjoxNzA4NTM1MDE2fQ.WW6QWIwjMPTYU3DP-LYwaAoB_TB8Jn-S4MklA3n3Xc0',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJzdWIiOjEsInVzZXJOYW1lIjoidXNlciIsImlhdCI6MTcwODUzMTQxNiwiZXhwIjoxNzA5MTM2MjE2fQ.mZhCuFjOWLQMco0PhbTnXDZ9RktT8CgJPEPCXHoMd68'
            },
        },
    })
    @ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Invalid refresh token',
    })
    async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout user' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged out successfully',
    })
    async logout(@GetUser() user: UserEntity) {
        await this.authService.logout(user.id);
        return { message: 'Logout successful' };
    }

    @Post('2fa/enable')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Enable two-factor authentication' })
    @ApiResponse({
        status: 200,
        description: 'It returns the 2FA secret to be used to generate OTP',
    })
    enable2FA(@Body() enable2FADto: Enable2FADto, @GetUser() user: UserEntity) {
        return this.authService.enable2FA(user.id);
    }

    @Post('2fa/validate')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({
        status: 200,
        description: 'It returns verified as true or false based on whether the token is valid',
    })
    validate2FA(@Body() validateTokenDTO: ValidateTokenDTO, @GetUser() user: UserEntity) {
        return this.authService.validate2FAToken(user.id, validateTokenDTO.token);
    }

    @Get('env')
    @Public()
    getEnvs() {
        return this.authService.getEnvVariables();
    }
} 
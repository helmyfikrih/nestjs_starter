import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './user.entity';
import { AuthenticationGuard } from '../auth/guards/auth.guard';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    @Public()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({
        status: 201,
        description: 'The user has been successfully created.',
        type: UserEntity
    })
    @ApiResponse({ status: 400, description: 'Bad Request.' })
    create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
        return this.userService.create(createUserDto);
    }

    @Get()
    @UseGuards(AuthenticationGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get all users' })
    @ApiResponse({
        status: 200,
        description: 'Returns all users.',
        type: [UserEntity]
    })
    findAll(@Query() paginationDto: PaginationDto) {
        // TODO: Implement pagination
        return this.userService.findAll(paginationDto);
    }

    @Get(':id')
    @UseGuards(AuthenticationGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get a user by id' })
    @ApiResponse({
        status: 200,
        description: 'Returns the user.',
        type: UserEntity
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    findOne(@Param('id') id: string) {
        return this.userService.findById(+id);
    }

    @Put(':id')
    @UseGuards(AuthenticationGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Update a user' })
    @ApiResponse({
        status: 200,
        description: 'The user has been successfully updated.',
        type: UserEntity
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.update(+id, updateUserDto);
    }

    @Delete(':id')
    @UseGuards(AuthenticationGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Delete a user' })
    @ApiResponse({
        status: 200,
        description: 'The user has been successfully deleted.'
    })
    @ApiResponse({ status: 404, description: 'User not found.' })
    remove(@Param('id') id: string) {
        return this.userService.remove(+id);
    }
} 
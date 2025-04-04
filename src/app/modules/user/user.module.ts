import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserEntity } from './entities/user.entity';
import { CommonModule } from '../../common/common.module';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ...(process.env.DATABASE_ENABLED === 'true' ? [TypeOrmModule.forFeature([UserEntity])] : []),
        CommonModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { SharedModule } from "../shared/shared.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity]),
        SharedModule
    ],
    providers: [UserService],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule { }
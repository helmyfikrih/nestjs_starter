import { Module } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    providers: [EncryptionService],
    exports: [EncryptionService],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, 
            envFilePath: '.env',
        }),
    ],
})
export class CommonModule { } 

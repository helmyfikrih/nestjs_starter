import { CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty({ description: 'Unique identifier' })
    id: string;

    @CreateDateColumn()
    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;

    @UpdateDateColumn()
    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: Date;
} 
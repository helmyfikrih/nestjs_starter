import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class FindOneParamsDTO {
    // @ApiPropertyOptional({ description: 'Role' })
    @IsNotEmpty()
    @IsString()
    @IsUUID()
    id: string
}

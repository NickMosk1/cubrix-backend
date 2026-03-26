import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class DepositDto {
  @ApiProperty({
    description: 'Сумма пополнения в копейках',
    example: 10000,
    minimum: 1,
  })
  @IsInt({ message: 'Сумма должна быть целым числом' })
  @Min(1, { message: 'Сумма пополнения должна быть положительной' })
  @Type(() => Number)
  amount: number;
}
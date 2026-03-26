import { ApiProperty } from '@nestjs/swagger';

export class BalanceResponseDto {
  @ApiProperty({ description: 'ID записи баланса' })
  id: string;

  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ description: 'Баланс в копейках', example: 15000 })
  value: number;

  @ApiProperty({ description: 'Дата обновления' })
  updatedAt: Date;
}
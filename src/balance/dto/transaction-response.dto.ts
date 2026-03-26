import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({ description: 'ID транзакции' })
  id: string;

  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ description: 'Тип транзакции', enum: ['deposit', 'purchase'] })
  type: 'deposit' | 'purchase';

  @ApiProperty({ description: 'Сумма в копейках', example: 10000 })
  amount: number;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;
}
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../interfaces/transaction-type.enum';

export class TransactionResponseDto {
  @ApiProperty({ description: 'ID транзакции' })
  id: string;

  @ApiProperty({ description: 'ID пользователя' })
  userId: string;

  @ApiProperty({ description: 'Тип транзакции', enum: TransactionType })
  type: 'deposit' | 'purchase' | 'achievement_reward';

  @ApiProperty({ description: 'Сумма в копейках', example: 10000 })
  amount: number;

  @ApiProperty({
    description: 'ID товара для транзакции покупки',
    nullable: true,
  })
  productId: string | null;

  @ApiProperty({
    description: 'ID коллекции для награды за ачивку',
    nullable: true,
  })
  collectionId: string | null;

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;
}

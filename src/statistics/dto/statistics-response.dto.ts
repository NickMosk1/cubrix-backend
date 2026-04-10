import { ApiProperty } from '@nestjs/swagger';

export class StatisticsResponseDto {
  @ApiProperty({ description: 'Текущий баланс пользователя' })
  balance: number;

  @ApiProperty({ description: 'Количество всех транзакций пользователя' })
  transactionsCount: number;

  @ApiProperty({ description: 'Количество уникально купленных товаров' })
  purchasedProductsCount: number;

  @ApiProperty({ description: 'Сумма всех пополнений' })
  totalDeposited: number;

  @ApiProperty({ description: 'Сумма всех покупок' })
  totalSpent: number;

  @ApiProperty({ description: 'Количество полученных наград за ачивки' })
  achievementRewardsCount: number;

  @ApiProperty({ description: 'Сумма всех наград за ачивки' })
  achievementRewardsAmount: number;

  @ApiProperty({ description: 'Общее количество доступных ачивок' })
  totalAchievementsCount: number;

  @ApiProperty({ description: 'Количество начатых ачивок' })
  startedAchievementsCount: number;

  @ApiProperty({ description: 'Количество ачивок в процессе выполнения' })
  inProgressAchievementsCount: number;

  @ApiProperty({ description: 'Количество выполненных ачивок' })
  completedAchievementsCount: number;
}

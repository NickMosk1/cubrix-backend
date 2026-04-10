import { ApiProperty } from '@nestjs/swagger';
import { AchievementResponseDto } from './achievement-response.dto';

export class AchievementListResponseDto {
  @ApiProperty({ description: 'Всего страниц' })
  totalPages: number;

  @ApiProperty({ description: 'Есть ли предыдущая страница' })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Есть ли следующая страница' })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Максимум элементов на странице' })
  limit: number;

  @ApiProperty({ description: 'Переданный offset для текущей страницы' })
  offset: number;

  @ApiProperty({ type: [AchievementResponseDto] })
  items: AchievementResponseDto[];
}

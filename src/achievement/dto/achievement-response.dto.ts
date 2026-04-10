import { ApiProperty } from '@nestjs/swagger';
import { CollectionResponseDto } from '../../collection/dto/collection-response.dto';

export class AchievementResponseDto extends CollectionResponseDto {
  @ApiProperty({
    description: 'Количество собранных товаров в коллекции',
  })
  collectedProductsCount: number;

  @ApiProperty({
    description: 'Общее количество товаров в коллекции',
  })
  totalProductsCount: number;

  @ApiProperty({ description: 'Полностью ли собрана коллекция' })
  isCompleted: boolean;
}

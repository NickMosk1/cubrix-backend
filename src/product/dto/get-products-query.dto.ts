import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class GetProductsQueryDto {
  @ApiPropertyOptional({
    description: 'Запрашиваемая страница (начиная с 1)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Страница должна быть целым числом' })
  @Min(1, { message: 'Страница должна быть не меньше 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Максимум элементов на странице',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть целым числом' })
  @Min(1, { message: 'Лимит должен быть не меньше 1' })
  @Max(100, { message: 'Лимит не может быть больше 100' })
  limit?: number = 10;
}
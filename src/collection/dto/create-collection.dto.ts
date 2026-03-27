import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCollectionDto {
  @ApiProperty({
    description: 'Название коллекции',
    example: 'StarWars',
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(255, { message: 'Название должно быть не длиннее 255 символов' })
  name: string;

  @ApiPropertyOptional({
    description: 'Описание коллекции',
    example: 'Наборы по вселенной Star Wars',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(500, { message: 'Описание должно быть не длиннее 500 символов' })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Ссылка на логотип коллекции',
    example: 'https://example.com/images/star-wars-logo.png',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'Logo должен быть строкой' })
  @IsUrl({}, { message: 'Logo должен быть валидным URL' })
  logo?: string | null;

  @ApiProperty({
    description: 'Массив UUID товаров, которые входят в коллекцию',
    type: [String],
    example: [],
  })
  @IsArray({ message: 'productIds должен быть массивом' })
  @ArrayUnique({
    message: 'productIds не должен содержать повторяющиеся значения',
  })
  @IsUUID('4', {
    each: true,
    message: 'Каждый элемент productIds должен быть валидным UUID',
  })
  productIds: string[];
}

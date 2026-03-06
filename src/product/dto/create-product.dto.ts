import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Название товара (только латиница, цифры, _, -)',
    example: 'LEGO_42110',
  })
  @IsString({ message: 'Название должно быть строкой' })
  @IsNotEmpty({ message: 'Название обязательно' })
  @MaxLength(255, { message: 'Название должно быть не длиннее 255 символов' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Название может содержать только латиницу, цифры, дефис и нижнее подчеркивание',
  })
  name: string;

  @ApiProperty({
    description: 'Цена товара',
    example: 14999,
  })
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price: number;

  @ApiProperty({
    description: 'Ссылка на изображение',
    example: 'https://example.com/images/lego-42110.jpg',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Ссылка на изображение должна быть строкой' })
  @IsUrl({}, { message: 'Ссылка на изображение должна быть валидным URL' })
  image?: string;
}
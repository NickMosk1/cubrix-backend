import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsEmail, 
  MinLength, 
  MaxLength, 
  Matches, 
  IsNotEmpty 
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Имя пользователя (только латиница, цифры, _, -)',
    minLength: 3,
    maxLength: 32,
    example: 'lego_fan_123',
  })
  @IsString({ message: 'Имя пользователя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя пользователя обязательно' })
  @MinLength(3, { message: 'Имя пользователя должно содержать минимум 3 символа' })
  @MaxLength(32, { message: 'Имя пользователя должно содержать максимум 32 символа' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Имя пользователя может содержать только латиницу, цифры, дефис и нижнее подчеркивание',
  })
  username: string;

  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email обязателен' })
  email: string;

  @ApiProperty({
    description: 'Пароль (минимум 8 символов, 1 заглавная, 1 строчная буква)',
    minLength: 8,
    example: 'Password123',
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @IsNotEmpty({ message: 'Пароль обязателен' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z]).*$/, {
    message: 'Пароль должен содержать хотя бы одну заглавную и одну строчную букву',
  })
  password: string;
}

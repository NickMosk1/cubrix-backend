import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/user/entities/user.entity';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT токен для авторизации',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Информация о пользователе',
    type: User,
  })
  user: User;
}

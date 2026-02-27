import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { User } from '../user/entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';

@ApiTags('Авторизация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ 
    status: 201, 
    description: 'Пользователь успешно зарегистрирован', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Ошибка валидации данных' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Имя пользователя или email уже заняты' 
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешный вход', 
    type: AuthResponseDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Неверные учетные данные' 
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение информации о текущем пользователе' })
  @ApiResponse({ 
    status: 200, 
    description: 'Информация о пользователе', 
    type: User 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  async getProfile(@GetUser() user: User): Promise<User> {
    return user;
  }

  @Get('check')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Проверка валидности токена' })
  @ApiResponse({ 
    status: 200, 
    description: 'Токен валиден' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Токен невалиден или истек' 
  })
  async checkToken(@GetUser() user: User): Promise<{ valid: boolean; user: User }> {
    return {
      valid: true,
      user,
    };
  }
}

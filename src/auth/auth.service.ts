import { 
  Injectable, 
  ConflictException, 
  UnauthorizedException 
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserRole } from 'src/types/user';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { username, email, password } = registerDto;

    // Проверяем, не занят ли username
    const existingUserByUsername = await this.userService.findByUsername(username);
    if (existingUserByUsername) {
      throw new ConflictException('Имя пользователя уже занято');
    }

    // Проверяем, не занят ли email
    const existingUserByEmail = await this.userService.findByEmail(email);
    if (existingUserByEmail) {
      throw new ConflictException('Email уже зарегистрирован');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const user = await this.userService.createUser({
      username,
      email,
      password: hashedPassword,
      role: UserRole.USER,
    });

    // Генерируем JWT токен
    const access_token = this.generateToken(user);

    return {
      access_token,
      user,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { username, password } = loginDto;

    // Ищем пользователя
    const user = await this.userService.findByUsername(username);

    if (!user) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    // Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверное имя пользователя или пароль');
    }

    // Генерируем JWT токен
    const access_token = this.generateToken(user);

    return {
      access_token,
      user,
    };
  }

  async getUserByToken(userId: string): Promise<User> {
    const user = await this.userService.findById(userId);
    
    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }
    
    return user;
  }

  private generateToken(user: User): string {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}

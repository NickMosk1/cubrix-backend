import { 
  Controller, 
  Get, 
  Param, 
  Patch, 
  Delete, 
  UseGuards,
  ParseUUIDPipe,
  Body
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiParam
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/user-response.dto';
import { UserRole } from 'src/types/user';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('Пользователи')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить всех пользователей (только для админов)' })
  @ApiResponse({ status: 200, type: [UserResponseDto] })
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Получить пользователя по ID (только для админов)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  @Patch(':id/role')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Изменить роль пользователя (только для админов)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: UserRole
  ): Promise<UserResponseDto> {
    return this.userService.updateRole(id, role);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Удалить пользователя (только для админов)' })
  @ApiParam({ name: 'id', description: 'UUID пользователя' })
  @ApiResponse({ status: 204, description: 'Пользователь удален' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}

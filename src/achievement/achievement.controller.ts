import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { AchievementService } from './achievement.service';
import { AchievementListResponseDto } from './dto/achievement-list-response.dto';
import { GetAchievementsQueryDto } from './dto/get-achievements-query.dto';

@ApiTags('Ачивки')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Get('achievements')
  @ApiOperation({ summary: 'Получить ачивки пользователя с прогрессом' })
  @ApiResponse({ status: 200, type: AchievementListResponseDto })
  async findAll(
    @GetUser('id') userId: string,
    @Query() query: GetAchievementsQueryDto,
  ): Promise<AchievementListResponseDto> {
    return this.achievementService.findAll(userId, query);
  }
}

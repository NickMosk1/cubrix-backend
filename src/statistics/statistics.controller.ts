import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StatisticsResponseDto } from './dto/statistics-response.dto';
import { StatisticsService } from './statistics.service';

@ApiTags('Статистика')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('statistics')
  @ApiOperation({ summary: 'Получить статистику текущего пользователя' })
  @ApiResponse({ status: 200, type: StatisticsResponseDto })
  async getCurrentUserStatistics(
    @GetUser('id') userId: string,
  ): Promise<StatisticsResponseDto> {
    return this.statisticsService.getCurrentUserStatistics(userId);
  }
}

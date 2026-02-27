import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Приложение')
@Controller()
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Информация о API' })
  @ApiResponse({ 
    status: 200, 
    description: 'Информация о сервисе',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Cubrix API' },
        version: { type: 'string', example: '1.0.0' },
        description: { type: 'string', example: 'Backend для LEGO магазина' },
        docs: { type: 'string', example: '/docs' },
        health: { type: 'string', example: '/health' }
      }
    }
  })
  getInfo() {
    return {
      name: 'Cubrix API',
      version: '1.0.0',
      description: 'Backend для интернет-магазина LEGO',
      docs: '/docs',
      health: '/health',
      endpoints: {
        auth: {
          register: 'POST /auth/register',
          login: 'POST /auth/login',
          profile: 'GET /auth/profile',
        },
        users: 'GET /users (admin only)',
      },
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Проверка работоспособности API' })
  @ApiResponse({ 
    status: 200, 
    description: 'API работает нормально',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T12:00:00.000Z' },
        uptime: { type: 'number', example: 123.45 },
        database: { type: 'string', example: 'connected' }
      }
    }
  })
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    database: string;
  }> {
    // Здесь можно добавить проверку подключения к БД
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected', // Предполагаем что БД подключена
    };
  }
}

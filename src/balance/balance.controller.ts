import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BalanceService } from './balance.service';
import { DepositDto } from './dto/deposit.dto';
import { BalanceResponseDto } from './dto/balance-response.dto';
import { TransactionResponseDto } from './dto/transaction-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@ApiTags('Баланс')
@ApiBearerAuth()
@Controller('balance')
@UseGuards(JwtAuthGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @ApiOperation({ summary: 'Получить текущий баланс пользователя' })
  @ApiResponse({ status: 200, type: BalanceResponseDto })
  async getBalance(@GetUser('id') userId: string): Promise<BalanceResponseDto> {
    return this.balanceService.getBalance(userId);
  }

  @Post('deposit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Пополнить баланс' })
  @ApiResponse({ status: 200, type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Неверные данные запроса' })
  async deposit(
    @GetUser('id') userId: string,
    @Body() depositDto: DepositDto,
  ): Promise<TransactionResponseDto> {
    return this.balanceService.deposit(userId, depositDto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'Получить историю транзакций' })
  @ApiResponse({ status: 200, type: [TransactionResponseDto] })
  async getTransactionHistory(
    @GetUser('id') userId: string,
  ): Promise<TransactionResponseDto[]> {
    return this.balanceService.getTransactionHistory(userId);
  }
}
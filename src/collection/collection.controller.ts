import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CollectionService } from './collection.service';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { ProductResponseDto } from '../product/dto/product-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/types/user';

@ApiTags('Коллекции')
@Controller()
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Get('collections')
  @ApiOperation({ summary: 'Получить список коллекций' })
  @ApiResponse({ status: 200, type: [CollectionResponseDto] })
  async findAll(): Promise<CollectionResponseDto[]> {
    return this.collectionService.findAll();
  }

  @Get('collections/:id/products')
  @ApiOperation({ summary: 'Получить товары коллекции по ID коллекции' })
  @ApiParam({ name: 'id', description: 'UUID коллекции' })
  @ApiResponse({ status: 200, type: [ProductResponseDto] })
  @ApiResponse({ status: 404, description: 'Коллекция не найдена' })
  async findProductsByCollectionId(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductResponseDto[]> {
    return this.collectionService.findProductsByCollectionId(id);
  }

  @Post('collections')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать коллекцию (только для админов)' })
  @ApiBody({ type: CreateCollectionDto })
  @ApiResponse({ status: 201, type: CollectionResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Некорректный payload или товары не найдены',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  async create(
    @Body() createCollectionDto: CreateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.create(createCollectionDto);
  }

  @Patch('collections/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить коллекцию (только для админов)' })
  @ApiParam({ name: 'id', description: 'UUID коллекции' })
  @ApiBody({ type: UpdateCollectionDto })
  @ApiResponse({ status: 200, type: CollectionResponseDto })
  @ApiResponse({
    status: 400,
    description: 'Некорректный payload или товары не найдены',
  })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Коллекция не найдена' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return this.collectionService.update(id, updateCollectionDto);
  }

  @Delete('collection/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить коллекцию (только для админов)' })
  @ApiParam({ name: 'id', description: 'UUID коллекции' })
  @ApiResponse({ status: 204, description: 'Коллекция удалена' })
  @ApiResponse({ status: 403, description: 'Недостаточно прав' })
  @ApiResponse({ status: 404, description: 'Коллекция не найдена' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.collectionService.remove(id);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { ProductListResponseDto } from './dto/product-list-response.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    const product = this.productRepository.create({
      ...createProductDto,
      image: createProductDto.image ?? null,
    });

    const savedProduct = await this.productRepository.save(product);
    return this.toResponseDto(savedProduct);
  }

  async findAll(query: GetProductsQueryDto): Promise<ProductListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const [products, totalItems] = await this.productRepository.findAndCount({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

    return {
      totalPages,
      hasPreviousPage: totalPages > 0 && page > 1,
      hasNextPage: totalPages > 0 && page < totalPages,
      limit,
      offset,
      items: products.map((product) => this.toResponseDto(product)),
    };
  }

  async findOne(id: string): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.toResponseDto(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updatedProduct = this.productRepository.merge(product, {
      ...updateProductDto,
      image: updateProductDto.image ?? product.image,
    });

    const savedProduct = await this.productRepository.save(updatedProduct);
    return this.toResponseDto(savedProduct);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }

  private toResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

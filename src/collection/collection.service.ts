import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Collection } from './entities/collection.entity';
import { Product } from '../product/entities/product.entity';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { ProductResponseDto } from '../product/dto/product-response.dto';
import { toProductResponseDto } from '../product/product.mapper';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private readonly collectionRepository: Repository<Collection>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<CollectionResponseDto[]> {
    const collections = await this.collectionRepository.find({
      order: { name: 'ASC' },
    });

    return collections.map((collection) => this.toResponseDto(collection));
  }

  async findProductsByCollectionId(id: string): Promise<ProductResponseDto[]> {
    const collection = await this.collectionRepository.findOne({
      where: { id },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    const products = await this.productRepository.find({
      where: { collectionId: id },
      order: { createdAt: 'DESC' },
    });

    return products.map(toProductResponseDto);
  }

  async create(
    createCollectionDto: CreateCollectionDto,
  ): Promise<CollectionResponseDto> {
    return this.collectionRepository.manager.transaction(async (manager) => {
      const collectionRepository = manager.getRepository(Collection);
      const productRepository = manager.getRepository(Product);

      await this.ensureProductsExist(
        productRepository,
        createCollectionDto.productIds,
      );

      const collection = collectionRepository.create({
        name: createCollectionDto.name,
        description: createCollectionDto.description ?? null,
        logo: createCollectionDto.logo ?? null,
      });

      const savedCollection = await collectionRepository.save(collection);

      if (createCollectionDto.productIds.length > 0) {
        await productRepository.update(
          { id: In(createCollectionDto.productIds) },
          { collectionId: savedCollection.id },
        );
      }

      return this.toResponseDto(savedCollection);
    });
  }

  async update(
    id: string,
    updateCollectionDto: UpdateCollectionDto,
  ): Promise<CollectionResponseDto> {
    if (Object.keys(updateCollectionDto).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const hasName = Object.hasOwn(updateCollectionDto, 'name');
    const hasDescription = Object.hasOwn(updateCollectionDto, 'description');
    const hasLogo = Object.hasOwn(updateCollectionDto, 'logo');
    const hasProductIds = Object.hasOwn(updateCollectionDto, 'productIds');

    return this.collectionRepository.manager.transaction(async (manager) => {
      const collectionRepository = manager.getRepository(Collection);
      const productRepository = manager.getRepository(Product);

      const collection = await collectionRepository.findOne({ where: { id } });

      if (!collection) {
        throw new NotFoundException(`Collection with ID ${id} not found`);
      }

      if (hasProductIds) {
        await this.ensureProductsExist(
          productRepository,
          updateCollectionDto.productIds ?? [],
        );
      }

      if (hasName) {
        collection.name = updateCollectionDto.name as string;
      }

      if (hasDescription) {
        collection.description = updateCollectionDto.description ?? null;
      }

      if (hasLogo) {
        collection.logo = updateCollectionDto.logo ?? null;
      }

      const shouldSaveCollection = hasName || hasDescription || hasLogo;

      const savedCollection = shouldSaveCollection
        ? await collectionRepository.save(collection)
        : collection;

      if (hasProductIds) {
        await productRepository.update(
          { collectionId: id },
          { collectionId: null },
        );

        if ((updateCollectionDto.productIds ?? []).length > 0) {
          await productRepository.update(
            { id: In(updateCollectionDto.productIds ?? []) },
            { collectionId: id },
          );
        }
      }

      return this.toResponseDto(savedCollection);
    });
  }

  async remove(id: string): Promise<void> {
    await this.collectionRepository.manager.transaction(async (manager) => {
      const collectionRepository = manager.getRepository(Collection);
      const productRepository = manager.getRepository(Product);

      const collection = await collectionRepository.findOne({ where: { id } });

      if (!collection) {
        throw new NotFoundException(`Collection with ID ${id} not found`);
      }

      await productRepository.update(
        { collectionId: id },
        { collectionId: null },
      );
      await collectionRepository.delete(id);
    });
  }

  private async ensureProductsExist(
    productRepository: Repository<Product>,
    productIds: string[],
  ): Promise<void> {
    if (productIds.length === 0) {
      return;
    }

    const products = await productRepository.findBy({ id: In(productIds) });
    const foundProductIds = new Set(products.map((product) => product.id));
    const missingProductIds = productIds.filter(
      (productId) => !foundProductIds.has(productId),
    );

    if (missingProductIds.length > 0) {
      throw new BadRequestException(
        `Products not found: ${missingProductIds.join(', ')}`,
      );
    }
  }

  private toResponseDto(collection: Collection): CollectionResponseDto {
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      logo: collection.logo,
    };
  }
}

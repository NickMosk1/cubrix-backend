import { ApiProperty } from '@nestjs/swagger';

export class CollectionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ nullable: true })
  logo: string | null;
}

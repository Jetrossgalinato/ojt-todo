import {
  IsString,
  IsOptional,
  IsIn,
  IsBoolean,
  IsArray,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(['low', 'medium', 'high'])
  priority?: string;

  @IsOptional()
  @IsIn(['pending', 'completed'])
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  dueTime?: string;

  @IsOptional()
  @IsBoolean()
  starred?: boolean;

  @IsOptional()
  @IsString()
  listId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    if (Array.isArray(value)) {
      return value
        .map((s: unknown) => (typeof s === 'string' ? s.trim() : s))
        .filter(Boolean);
    }
    return value as string[] | undefined;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

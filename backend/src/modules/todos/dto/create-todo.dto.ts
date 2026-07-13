import { IsString, IsOptional, IsIn } from "class-validator"

export class CreateTodoDto {
  @IsString()
  title: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  dueDate?: string

  @IsOptional()
  @IsString()
  dueTime?: string

  @IsOptional()
  @IsIn(["low", "medium", "high"])
  priority?: string

  @IsOptional()
  @IsString()
  tags?: string

  @IsOptional()
  @IsString()
  listName?: string
}
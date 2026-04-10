import { ApiProperty } from "@nestjs/swagger"
import { IsEnum, IsString } from "class-validator"

export class UploadDto {
  @ApiProperty({ description: "文件类型", enum: ["image", "video", "document"] })
  @IsEnum({ image: "image", video: "video", document: "document" })
  type!: "image" | "video" | "document"

  @ApiProperty({ description: "文件路径", example: "/uploads/abc.jpg" })
  @IsString()
  path!: string
}

import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from "@nestjs/common"
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"

import { BaseResponse, BaseResponseType } from "@/common/dto/response/base.response"
import { Roles } from "@/core/jwt/decorators/roles.decorator"
import { Role } from "@/core/prisma/generators/enums"
import { DeleteDirectoryDto } from "@/modules/file/dto/delete-directory.dto"
import { DeleteFileDto } from "@/modules/file/dto/delete-file.dto"
import { FileCursorListDto } from "@/modules/file/dto/file-cursor-list.dto"
import { DeleteDirectoryEntity } from "@/modules/file/entities/delete-directory.entity"
import { FileCursorListEntity } from "@/modules/file/entities/file-cursor-list.entity"
import { FileService } from "@/modules/file/file.service"

@Controller("/file")
@ApiTags("文件模块")
@ApiOkResponse({ description: "Success", type: BaseResponse })
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Delete()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "删除单个文件" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(Boolean) })
  async deleteFile(@Body() dto: DeleteFileDto) {
    await this.fileService.deleteFile(dto.path)
    return { data: true }
  }

  @Delete("/directory")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "删除指定目录下全部文件" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(DeleteDirectoryEntity) })
  async deleteDirectory(@Body() dto: DeleteDirectoryDto) {
    const data = await this.fileService.deleteDirectory(dto.directory)
    return { data }
  }

  @Post("/cursor/list")
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "获取文件列表（游标分页）" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(FileCursorListEntity) })
  async getFileCursorList(@Body() dto: FileCursorListDto) {
    const data = await this.fileService.listFilesByCursor(dto)
    return { data }
  }

  @Post("/directory/cursor/list")
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "获取目录列表（游标分页）" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(FileCursorListEntity) })
  async getDirectoryCursorList(@Body() dto: FileCursorListDto) {
    const data = await this.fileService.listDirectoriesByCursor(dto)
    return { data }
  }
}

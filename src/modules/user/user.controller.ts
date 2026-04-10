import type { Request } from "express"

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger"
import { memoryStorage } from "multer"

import { BasePagedResponseType, BaseResponse, BaseResponseType } from "@/common/dto/response/base.response"
import { Roles } from "@/core/jwt/decorators/roles.decorator"
import { SkipAuth } from "@/core/jwt/decorators/skip-auth.decorator"
import { JwtService } from "@/core/jwt/jwt.service"
import { Role } from "@/core/prisma/generators/enums"
import { FileService } from "@/modules/file/file.service"
import { AdminUpdateUserDto } from "@/modules/user/dto/admin-update-user.dto"
import { CreateUserDto } from "@/modules/user/dto/create-user.dto"
import { ResetUserPasswordDto } from "@/modules/user/dto/reset-user-password.dto"
import { UpdateUserEmailDto } from "@/modules/user/dto/update-user-email.dto"
import { UpdateUserPasswordDto } from "@/modules/user/dto/update-user-password.dto"
import { UpdateUserDto } from "@/modules/user/dto/update-user.dto"
import { UserPageQueryDto } from "@/modules/user/dto/user-list.dto"
import { UserEntity } from "@/modules/user/entities/user.entity"
import { UserService } from "@/modules/user/user.service"

@Controller("/users")
@ApiTags("用户模块")
@ApiOkResponse({ description: "Success", type: BaseResponse })
export class UserController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly fileService: FileService,
    private readonly userService: UserService,
  ) {}

  @Post("/")
  @SkipAuth()
  @ApiOperation({ summary: "创建用户" })
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async createUser(@Body() dto: CreateUserDto) {
    const data = await this.userService.createUser(dto)
    return { data }
  }

  @Get("/profile")
  @ApiOperation({ summary: "获取当前用户信息" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async getUser(@Req() req: Request) {
    const data = await this.userService.getUser(req.user!.userId)

    return { data }
  }

  @Get("/:userId")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "获取指定用户信息" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async getUserByUserId(@Param("userId") userId: string) {
    const data = await this.userService.getUser(userId)
    return { data }
  }

  @Patch("/password")
  @ApiOperation({ summary: "修改用户密码" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async updatePassword(@Req() req: Request, @Body() dto: UpdateUserPasswordDto) {
    const user = await this.userService.updatePassword(req.user!.userId, dto)
    return { data: user }
  }

  @Patch("/reset-password")
  @SkipAuth()
  @ApiOperation({ summary: "重置用户密码" })
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async resetPassword(@Body() dto: ResetUserPasswordDto) {
    const user = await this.userService.resetPassword(dto)
    return { data: user }
  }

  @Patch("/email")
  @ApiOperation({ summary: "更新用户邮箱" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async updateEmail(@Req() req: Request, @Body() dto: UpdateUserEmailDto) {
    const user = await this.userService.updateEmail(req.user!.userId, dto)
    return { data: user }
  }

  @Patch("/avatar")
  @UseInterceptors(
    FileInterceptor("avatar", {
      storage: memoryStorage(),
      fileFilter: (_, file, callback) => {
        if (!file?.mimetype.startsWith("image/"))
          return callback(new BadRequestException("Only image files are allowed!"), false)
        callback(null, true)
      },
      limits: { fileSize: 1024 * 1024 * 2 },
    }),
  )
  @ApiOperation({ summary: "更新用户头像" })
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiBody({ schema: { type: "object", properties: { avatar: { type: "string", format: "binary" } } } })
  @ApiOkResponse({ description: "Success", type: BaseResponseType(String) })
  async updateAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    const data = await this.userService.updateAvatar(req.user!.userId, file)
    return { data }
  }

  @Patch("/profile")
  @ApiOperation({ summary: "更新当前用户信息" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async updateUser(@Req() req: Request, @Body() dto: UpdateUserDto) {
    const user = await this.userService.updateUser(req.user!.userId, dto)
    return { data: user }
  }

  @Patch("/:userId")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "更新指定用户信息" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async updateUserByUserId(@Param("userId") userId: string, @Body() dto: AdminUpdateUserDto) {
    const user = await this.userService.updateUser(userId, dto)
    return { data: user }
  }

  @Delete("/profile")
  @ApiOperation({ summary: "注销当前用户" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async removeUser(@Req() req: Request) {
    const user = await this.userService.removeUser(req.user!.userId)

    await this.jwtService.revokeTokens(req.user!.userId)
    return { data: user }
  }

  @Delete("/:userId")
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "注销指定用户" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BaseResponseType(UserEntity) })
  async removeByUserId(@Param("userId") userId: string) {
    const user = await this.userService.removeUser(userId)

    await this.jwtService.revokeTokens(userId)
    return { data: user }
  }

  @Post("/list")
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: "获取用户列表" })
  @ApiBearerAuth()
  @ApiOkResponse({ description: "Success", type: BasePagedResponseType(UserEntity) })
  async getUserList(@Body() dto: UserPageQueryDto) {
    const data = await this.userService.getUserList(dto)
    return { data }
  }
}

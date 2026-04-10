import { Injectable } from "@nestjs/common"
import bcrypt from "bcrypt"

import { BCRYPT_SALT_ROUNDS } from "@/common/constants/bcrypt.constants"
import { Prisma } from "@/core/prisma/generators/client"
import { PrismaService } from "@/core/prisma/prisma.service"
import { AdminUpdateUserDto } from "@/modules/user/dto/admin-update-user.dto"
import { CreateUserDto } from "@/modules/user/dto/create-user.dto"
import { UpdateUserDto } from "@/modules/user/dto/update-user.dto"
import { UserListOrderBy, UserPageQueryDto } from "@/modules/user/dto/user-list.dto"
import { snowflake } from "@/tools/snowflake"

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildUserOrderBy(orderBy: UserListOrderBy, order: "ASC" | "DESC"): Prisma.UserOrderByWithRelationInput {
    const sortOrder: Prisma.SortOrder = order === "ASC" ? "asc" : "desc"

    switch (orderBy) {
      case "createdAt":
        return { createdAt: sortOrder }
      case "updatedAt":
        return { updatedAt: sortOrder }
      case "email":
        return { email: sortOrder }
      case "username":
        return { username: sortOrder }
      case "role":
        return { role: sortOrder }
    }
  }

  async findByUserId(userId: bigint) {
    return await this.prisma.user.findUnique({ where: { userId } })
  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } })
  }

  async create(data: CreateUserDto) {
    const { password, ...rest } = data
    return await this.prisma.user.create({
      data: { userId: snowflake.nextId(), password: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS), ...rest },
    })
  }

  async update(userId: bigint, data: UpdateUserDto | AdminUpdateUserDto) {
    return await this.prisma.user.update({ data, where: { userId } })
  }

  async updatePassword(userId: bigint, password: string) {
    return await this.prisma.user.update({
      data: { password: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS) },
      where: { userId },
    })
  }

  async updatePasswordByEmail(email: string, password: string) {
    return await this.prisma.user.update({
      data: { password: await bcrypt.hash(password, BCRYPT_SALT_ROUNDS) },
      where: { email },
    })
  }

  async updateEmail(userId: bigint, email: string) {
    return await this.prisma.user.update({ data: { email }, where: { userId } })
  }

  async updateAvatar(userId: bigint, avatar: string) {
    return await this.prisma.user.update({ data: { avatar }, where: { userId } })
  }

  async remove(userId: bigint) {
    return await this.prisma.user.delete({ where: { userId } })
  }

  async findMany(dto: UserPageQueryDto) {
    const { page = 1, pageSize = 10, orderBy = "createdAt", order = "DESC", keyword, role } = dto

    const where: Prisma.UserWhereInput = {}
    if (keyword) where.OR = [{ email: { contains: keyword } }, { username: { contains: keyword } }]
    if (role) where.role = role

    return await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
        orderBy: this.buildUserOrderBy(orderBy, order),
      }),
      this.prisma.user.count({ where }),
    ])
  }
}

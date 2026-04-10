import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class BaseResponse<T = unknown> {
  @ApiProperty({ description: "请求追踪ID", oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] })
  traceId!: string | string[]

  @ApiProperty({ description: "状态码" })
  code!: number

  @ApiProperty({ description: "提示信息", oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] })
  message!: string | string[]

  @ApiPropertyOptional({
    description: "响应数据",
    oneOf: [
      { type: "string" },
      { type: "number" },
      { type: "boolean" },
      { type: "array", items: { type: "object" } },
      { type: "object" },
    ],
  })
  data?: T
}

export class BasePagedResponse<T = unknown> {
  @ApiProperty({ description: "总记录数" })
  total!: number

  @ApiProperty({ description: "当前页码" })
  page!: number

  @ApiProperty({ description: "每页记录数" })
  pageSize!: number

  @ApiProperty({ description: "总页数" })
  totalPages!: number

  @ApiProperty({ description: "列表数据", type: [Object] })
  list!: T[]
}

export function BaseResponseType<T>(classRef?: new () => T) {
  class ResponseClass {
    @ApiProperty({
      description: "请求追踪ID",
      oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
    })
    traceId!: string | string[]

    @ApiProperty({ description: "状态码" })
    code!: number

    @ApiProperty({ description: "提示信息", oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] })
    message!: string | string[]

    @ApiPropertyOptional({ description: "响应数据", type: classRef || undefined })
    data?: T
  }

  Object.defineProperty(ResponseClass, "name", { value: `${classRef?.name ?? "BaseResponse"}Response` })

  return ResponseClass
}

export function BasePagedResponseType<T>(itemClass: new () => T) {
  class PagedDataClass extends BasePagedResponse<T> {
    @ApiProperty({ description: "列表数据", type: [itemClass] })
    declare list: T[]
  }

  Object.defineProperty(PagedDataClass, "name", { value: `${itemClass.name}PagedData` })

  return BaseResponseType(PagedDataClass)
}

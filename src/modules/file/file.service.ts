import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandOutput,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { BadRequestException, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"

import { FileCursorListDto } from "@/modules/file/dto/file-cursor-list.dto"
import { joinUrl } from "@/tools/url"

@Injectable()
export class FileService {
  private ASSETS_PREFIX: string
  private BUCKET: string
  private readonly client: S3Client

  constructor(private readonly configService: ConfigService) {
    this.ASSETS_PREFIX = this.configService.get<string>("ASSETS_PREFIX")!
    this.BUCKET = this.configService.get<string>("CLOUDFLARE_R2_BUCKET_NAME")!
    this.client = new S3Client({
      forcePathStyle: true,
      region: "auto",
      endpoint: this.configService.get<string>("CLOUDFLARE_R2_ENDPOINT")!,
      credentials: {
        accessKeyId: this.configService.get("CLOUDFLARE_R2_ACCESS_KEY")!,
        secretAccessKey: this.configService.get("CLOUDFLARE_R2_SECRET_KEY")!,
      },
    })
  }

  getFileUrl(path: string) {
    return joinUrl(this.ASSETS_PREFIX, path)
  }

  async uploadFile(file: Express.Multer.File | Buffer, path: string, mimetype?: string) {
    let body: Buffer
    let contentType = mimetype

    if (!Buffer.isBuffer(file) && "buffer" in file) {
      body = file.buffer
      contentType = contentType || file.mimetype
    } else {
      body = file
    }

    const command = new PutObjectCommand({
      Bucket: this.BUCKET,
      Key: path,
      Body: body,
      ContentType: contentType,
    })

    await this.client.send(command)
    return this.getFileUrl(path)
  }

  async downloadFile(path: string) {
    const result = await this.client.send(
      new GetObjectCommand({
        Bucket: this.BUCKET,
        Key: path,
      }),
    )

    if (!result.Body) throw new BadRequestException("File not found")

    const bytes = await result.Body.transformToByteArray()
    return Buffer.from(bytes)
  }

  async deleteFile(path?: string) {
    if (!path) return
    return await this.client.send(new DeleteObjectCommand({ Bucket: this.BUCKET, Key: path }))
  }

  private normalizePrefix(directory?: string) {
    if (directory === undefined) return undefined
    const normalized = directory.replace(/^\/+/, "").replace(/\/+$/, "")
    if (normalized.includes("..")) throw new BadRequestException("Invalid directory")
    return normalized || undefined
  }

  private async listCursorPage(pageSize: number, prefix?: string, continuationToken?: string, delimiter?: "/") {
    return await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.BUCKET,
        Prefix: prefix,
        Delimiter: delimiter,
        ContinuationToken: continuationToken,
        MaxKeys: pageSize,
      }),
    )
  }

  async deleteDirectory(directory: string) {
    const normalizedDirectory = this.normalizePrefix(directory)
    if (!normalizedDirectory) throw new BadRequestException("Invalid directory")

    const prefix = `${normalizedDirectory}/`
    let deletedCount = 0
    let continuationToken: string | undefined

    do {
      const listed: ListObjectsV2CommandOutput = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.BUCKET,
          Prefix: prefix,
          ContinuationToken: continuationToken,
        }),
      )

      const keys = listed.Contents?.map(item => item.Key).filter((key): key is string => Boolean(key)) ?? []
      if (keys.length > 0) {
        await this.client.send(
          new DeleteObjectsCommand({
            Bucket: this.BUCKET,
            Delete: {
              Objects: keys.map(Key => ({ Key })),
              Quiet: true,
            },
          }),
        )
        deletedCount += keys.length
      }

      continuationToken = listed.IsTruncated ? listed.NextContinuationToken : undefined
    } while (continuationToken)

    return { directory: normalizedDirectory, deletedCount }
  }

  async listFilesByCursor(dto: FileCursorListDto) {
    const { continuationToken, pageSize = 10 } = dto
    const normalizedDirectory = this.normalizePrefix(dto.directory)
    const prefix = normalizedDirectory ? `${normalizedDirectory}/` : undefined
    const listed = await this.listCursorPage(pageSize, prefix, continuationToken)

    return {
      list:
        listed.Contents?.map(item => ({
          path: item.Key!,
          url: this.getFileUrl(item.Key!),
          size: item.Size,
          lastModified: item.LastModified,
        })).filter(item => Boolean(item.path)) ?? [],
      pageSize,
      hasMore: Boolean(listed.IsTruncated),
      nextContinuationToken: listed.NextContinuationToken,
    }
  }

  async listDirectoriesByCursor(dto: FileCursorListDto) {
    const { continuationToken, pageSize = 10 } = dto
    const normalizedDirectory = this.normalizePrefix(dto.directory)
    const prefix = normalizedDirectory ? `${normalizedDirectory}/` : undefined
    const listed = await this.listCursorPage(pageSize, prefix, continuationToken, "/")

    return {
      list:
        listed.CommonPrefixes?.map(item => ({
          path: item.Prefix!.replace(/^\/+/, ""),
          url: this.getFileUrl(item.Prefix!.replace(/^\/+/, "")),
        })).filter(item => Boolean(item.path)) ?? [],
      pageSize,
      hasMore: Boolean(listed.IsTruncated),
      nextContinuationToken: listed.NextContinuationToken,
    }
  }
}

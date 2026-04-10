import type { Request } from "express"

import { ConfigService } from "@nestjs/config"
import { utilities } from "nest-winston"
import { isObject } from "radash"
import winston from "winston"
import DailyRotateFile from "winston-daily-rotate-file"

import { lookup } from "@/tools/ip"

export const createWinstonLoggerOptions = (configService: ConfigService): winston.LoggerOptions => {
  return {
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
      winston.format.printf(({ context, level, message, timestamp, ...meta }) => {
        return JSON.stringify({ context, timestamp, level, message, meta })
      }),
    ),
    transports: [
      new winston.transports.Console({
        level: "debug",
        format: winston.format.combine(
          winston.format.ms(),
          utilities.format.nestLike(configService.get<string>("APP_NAME"), { prettyPrint: true }),
        ),
      }),

      new DailyRotateFile({
        level: "info",
        dirname: "logs/info",
        filename: "app-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "14d",
      }),

      new DailyRotateFile({
        level: "error",
        dirname: "logs/error",
        filename: "error-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        zippedArchive: true,
        maxSize: "20m",
        maxFiles: "30d",
      }),
    ],
  }
}

export const formatRequestLog = async ({ method, url, ip, headers, params, query, body }: Request) => {
  const { country, province, city, isp } = await lookup(ip ?? "")
  const geography = ` (${[country, province, city, isp].join("|")})`

  return {
    message: `[${method}] ${url} ${ip}${geography}`,
    meta: Object.fromEntries(
      Object.entries({
        ["⏳"]: headers["x-trace-id"],
        ["🧭"]: headers["user-agent"],
        ["🔍"]: params,
        ["🧩"]: query,
        ["📦"]: body,
      }).filter(([_, value]) => !(value && isObject(value) && !Object.keys(value).length)),
    ),
  }
}

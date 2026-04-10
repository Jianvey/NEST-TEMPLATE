import { randomInt } from "crypto"

/**
 * 生成指定位数的数字验证码
 * @param digits 位数，默认 6
 */
export function generateCode(digits = 6): string {
  if (digits <= 0) throw new Error("Digits must be greater than 0")

  const min = 10 ** (digits - 1)
  const max = 10 ** digits

  return randomInt(min, max).toString()
}

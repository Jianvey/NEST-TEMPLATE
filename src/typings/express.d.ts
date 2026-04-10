declare module "express" {
  interface Request {
    user?: {
      /** JWT ID */
      jti: string
      userId: string
      role?: Role
    }
  }
}

export {}

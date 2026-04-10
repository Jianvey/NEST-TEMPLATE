import { createHash } from "crypto"

export const OSS_KEYS = {
  system: {
    avatar: {
      defaultAvatar: () => `system/avatars/default.png`,
      defaultFemaleAvatar: () => `system/avatars/default-female.png`,
      defaultMaleAvatar: () => `system/avatars/default-male.png`,
    },
  },
  backup: {
    mysql(filename: string) {
      return `backups/mysql/${filename}`
    },
  },
  avatar: {
    user(userId: string, filename: string) {
      const hash = createHash("md5").update(userId).digest("hex")
      return `avatars/users/${hash.slice(0, 2)}/${hash.slice(2, 4)}/${hash.slice(4, 6)}/${filename}`
    },
  },
}

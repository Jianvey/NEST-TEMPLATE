import { HttpAgent, HttpOptions, HttpsAgent } from "agentkeepalive"

const options: HttpOptions = {
  keepAlive: true,
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000,
  freeSocketTimeout: 30000,
}

export const httpAgent = new HttpAgent({ ...options })
export const httpsAgent = new HttpsAgent({ ...options })

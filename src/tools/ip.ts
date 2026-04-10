import { isIP } from "class-validator"
import geoip from "geoip-lite"
import { IPv4, loadContentFromFile, newWithBuffer } from "ip2region.js"
import { resolve } from "path"

export interface IpGeo {
  country: string
  province: string
  city: string
  area?: string
  isp?: string
}

const dbPath = resolve(__dirname, "../assets/region/ip_v4.xdb")
const searcher = createSearcher()

function createSearcher() {
  try {
    return newWithBuffer(IPv4, loadContentFromFile(dbPath))
  } catch {
    return null
  }
}

export async function lookup(ip: string): Promise<IpGeo> {
  const unknown: IpGeo = { country: "-", province: "-", city: "-", isp: "-" }

  try {
    if (!isIP(ip)) return unknown

    let country = unknown.country
    let province = unknown.province
    let city = unknown.city
    let isp = unknown.isp

    if (searcher) {
      const region = await searcher.search(ip)
      ;[country, province, city, isp] = region.split("|").map(item => (item !== "0" ? item : "-"))
    }

    const isChina = country === "中国" || country === "CN"

    if (isChina) return { country, province, city, isp }

    const data = geoip.lookup(ip)
    return { country: data?.country ?? country, province: data?.region ?? province, city: data?.city ?? city, isp }
  } catch {
    return unknown
  }
}

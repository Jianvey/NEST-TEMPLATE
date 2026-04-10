const EPOCH = 1535731200000n
const WORKER_ID_BITS = 5n
const DATACENTER_ID_BITS = 5n
const SEQUENCE_BITS = 12n

const MAX_WORKER_ID = (1n << WORKER_ID_BITS) - 1n
const MAX_DATACENTER_ID = (1n << DATACENTER_ID_BITS) - 1n
const SEQUENCE_MASK = (1n << SEQUENCE_BITS) - 1n

const WORKER_ID_SHIFT = SEQUENCE_BITS
const DATACENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS
const TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATACENTER_ID_BITS

export class Snowflake {
  private lastTimestamp = -1n
  private sequence = 0n
  private readonly maxClockBackward = 5n

  constructor(
    private readonly workerId: bigint = 1n,
    private readonly datacenterId: bigint = 1n,
  ) {
    if (workerId < 0n || workerId > MAX_WORKER_ID) {
      throw new Error(`workerId must be between 0 and ${MAX_WORKER_ID}`)
    }
    if (datacenterId < 0n || datacenterId > MAX_DATACENTER_ID) {
      throw new Error(`datacenterId must be between 0 and ${MAX_DATACENTER_ID}`)
    }
  }

  private currentTimestamp(): bigint {
    return BigInt(Date.now())
  }

  private waitNextMillis(lastTimestamp: bigint): bigint {
    let timestamp = this.currentTimestamp()
    while (timestamp <= lastTimestamp) {
      timestamp = this.currentTimestamp()
    }
    return timestamp
  }

  nextId(): bigint {
    let timestamp = this.currentTimestamp()

    if (timestamp < this.lastTimestamp) {
      const offset = this.lastTimestamp - timestamp
      if (offset <= this.maxClockBackward) {
        timestamp = this.lastTimestamp
      } else {
        throw new Error(`Clock moved backwards by ${offset} ms. Refusing to generate id`)
      }
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & SEQUENCE_MASK
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(this.lastTimestamp)
      }
    } else {
      this.sequence = 0n
    }

    this.lastTimestamp = timestamp

    return (
      ((timestamp - EPOCH) << TIMESTAMP_LEFT_SHIFT) |
      (this.datacenterId << DATACENTER_ID_SHIFT) |
      (this.workerId << WORKER_ID_SHIFT) |
      this.sequence
    )
  }

  toString(): string {
    return this.nextId().toString()
  }

  parse(id: bigint | string) {
    const value = typeof id === "string" ? BigInt(id) : id
    const timestamp = (value >> TIMESTAMP_LEFT_SHIFT) + EPOCH
    const datacenterId = (value >> DATACENTER_ID_SHIFT) & MAX_DATACENTER_ID
    const workerId = (value >> WORKER_ID_SHIFT) & MAX_WORKER_ID
    const sequence = value & SEQUENCE_MASK

    return { timestamp, datacenterId, workerId, sequence }
  }
}

export const snowflake = new Snowflake(1n, 1n)

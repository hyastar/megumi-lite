import Redis from 'ioredis'

let client: Redis | null = null

function createRedisClient() {
  const config = useRuntimeConfig()
  const { redisHost, redisPort, redisPassword } = config
  const port = Number(redisPort) || 6379
  const isUpstash = !!redisHost && redisHost.toLowerCase().includes('upstash')
  console.log(`[redis] init host=${redisHost} port=${port} tls=${isUpstash ? 'on' : 'off'}`)
  const options = {
    host: redisHost,
    port,
    password: redisPassword || undefined,
    tls: isUpstash ? {} : undefined,
    lazyConnect: true,
    connectTimeout: 5000,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1
  } as const

  const redis = new Redis(options)
  redis.connect()
    .then(() => console.log('[redis] connected'))
    .catch((err) => console.error('[redis] connect failed (non-blocking)', err))

  redis.on('error', (err) => {
    console.error('[redis] connection error', err)
  })
  return redis
}

export function getRedis() {
  if (!client) {
    client = createRedisClient()
  }
  return client
}

// Convenient singleton export
export const redis = getRedis()

import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  if (isConnected) {
    return mongoose.connection
  }

  // 使用 runtimeConfig 获取配置
  const config = useRuntimeConfig()
  const mongoUri = config.mongoUri || config.mongodbUri

  if (!mongoUri) {
    throw new Error('NUXT_MONGODB_URI environment variable is not set. Please set it in your .env file.')
  }

  try {
    const db = await mongoose.connect(mongoUri, {
      // MongoDB 6+ 不再需要这些选项
    })

    isConnected = true
    console.log('✅ MongoDB connected successfully')

    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err)
      isConnected = false
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected')
      isConnected = false
    })

    return db.connection
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    isConnected = false
    throw error
  }
}

// 注意：数据库连接应该通过 server/plugins/db.ts 在 Nitro 插件中处理
// 这里不再自动连接，避免在模块加载时立即执行


import mongoose from 'mongoose'

export default defineNitroPlugin(async (_nitroApp) => {
  const config = useRuntimeConfig()
  const MONGO_URI = config.mongodbUri

  if (!MONGO_URI) {
    console.error('❌ NUXT_MONGODB_URI environment variable is not set')
    throw new Error('MongoDB connection string is required. Please set NUXT_MONGODB_URI in your .env file.')
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log('✅ MongoDB Connected')
  } catch (e) {
    console.error('❌ MongoDB Connection Error:', e)
    throw e
  }
})

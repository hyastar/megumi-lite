import mongoose from 'mongoose'

export interface ITag extends mongoose.Document {
  name: string
  slug: string
  count?: number
  createdAt: Date
  updatedAt: Date
}

const TagSchema = new mongoose.Schema<ITag>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    count: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    collection: 'tags'
  }
)

// slug 字段已有 unique: true，会自动创建索引

export const Tag = mongoose.models.Tag || mongoose.model<ITag>('Tag', TagSchema)

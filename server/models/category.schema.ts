import mongoose from 'mongoose'

export interface ICategory extends mongoose.Document {
  name: string
  slug: string
  count?: number
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new mongoose.Schema<ICategory>(
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
    collection: 'categories'
  }
)

// slug 字段已有 unique: true，会自动创建索引

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

import mongoose, { Schema } from 'mongoose'

export interface IPhoto extends mongoose.Document {
  url: string
  width: number
  height: number
  gallery: mongoose.Types.ObjectId | null
  tags: any[]
  caption: string
  location: string
  createdAt: Date
  updatedAt: Date
}

const PhotoSchema = new Schema<IPhoto>(
  {
    url: { type: String, required: true, trim: true },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    gallery: { type: Schema.Types.ObjectId, ref: 'Gallery', default: null },
    tags: { type: [Schema.Types.Mixed], default: [] },
    caption: { type: String, default: '', trim: true },
    location: { type: String, default: '', trim: true }
  },
  {
    timestamps: true,
    collection: 'photos'
  }
)

PhotoSchema.index({ createdAt: -1 })
PhotoSchema.index({ gallery: 1 })

export const Photo = mongoose.models.Photo || mongoose.model<IPhoto>('Photo', PhotoSchema)

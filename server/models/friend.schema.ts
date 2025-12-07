import mongoose from 'mongoose'

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  link: { type: String, required: true },
  avatar: { type: String, default: '' },
  desc: { type: String, default: '' }
}, { timestamps: true })

export const Friend = mongoose.models.Friend || mongoose.model('Friend', schema)

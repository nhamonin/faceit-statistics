import mongoose, { Schema } from 'mongoose';

const tempPrediction = new Schema({
  match_id: {
    type: String,
    required: true,
  },
  predictions: {
    type: Array,
    required: true,
  },
  createdAt: { type: Date, expires: '6h', default: Date.now },
});

export const TempPrediction = mongoose.model('TempPrediction', tempPrediction);

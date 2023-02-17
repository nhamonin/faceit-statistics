import mongoose, { Schema } from 'mongoose';

const tempPredictionLast50 = new Schema({
  match_id: {
    type: String,
    required: true,
    unique: true,
  },
  predictions: {
    type: Array,
    required: true,
  },
  createdAt: { type: Date, expires: '6h', default: Date.now },
});

export const TempPredictionLast50 = mongoose.model(
  'TempPredictionLast50',
  tempPredictionLast50
);

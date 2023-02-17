import mongoose, { Schema } from 'mongoose';

export const matchLast50 = new Schema(
  {
    match_id: {
      type: String,
      required: true,
      unique: true,
    },
    winratePredictedValue: {
      type: Boolean,
      required: true,
    },
    avgPredictedValue: {
      type: Boolean,
      required: true,
    },
  },
  { timestamp: true }
);

export const MatchLast50 = mongoose.model('MatchLast50', matchLast50);

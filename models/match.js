import mongoose, { Schema } from 'mongoose';

export const matchSchema = new Schema(
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

export const Match = mongoose.model('Match', matchSchema);

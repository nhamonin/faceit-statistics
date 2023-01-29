import mongoose, { Schema } from 'mongoose';

export const matchPredictionSchema = new Schema(
  {
    totalMatches: {
      type: Number,
      default: 0,
    },
    avgPredictions: {
      type: Number,
      default: 0,
    },
    winratePredictions: {
      type: Number,
      default: 0,
    },
  },
  { timestamp: true }
);

export const MatchPrediction = mongoose.model(
  'MatchPrediction',
  matchPredictionSchema
);

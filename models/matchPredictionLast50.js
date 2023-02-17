import mongoose, { Schema } from 'mongoose';

export const matchPredictionLast50 = new Schema(
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

export const MatchPredictionLast50 = mongoose.model(
  'MatchPredictionLast50',
  matchPredictionLast50
);

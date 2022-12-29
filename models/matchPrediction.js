import mongoose, { Schema } from 'mongoose';

export const matchPredictionSchema = new Schema(
  {
    matches: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
      required: true,
    },
    avgMatchesPrediction: {
      type: Object,
      currentWinrate: {
        type: Number,
        default: 0,
      },
    },
    winrateMatchesPrediction: {
      type: Object,
      currentWinrate: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamp: true }
);

export const MatchPrediction = mongoose.model(
  'MatchPrediction',
  matchPredictionSchema
);

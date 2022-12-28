import mongoose, { Schema } from 'mongoose';

export const matchPredictionSchema = new Schema(
  {
    avgMatchesPrediction: {
      type: String,
      required: true,
      matches: {
        type: [{ type: String, ref: 'MatchSchema' }],
        required: true,
      },
      currentWinrate: {
        type: Number,
        default: function () {
          const correctlyPredictedValues = this.matches.filter(
            (match) => match.winratePredictedValue
          ).length;
          return correctlyPredictedValues / this.matches.length;
        },
      },
    },
    winrateMatchesPrediction: {
      type: String,
      required: true,
      matches: {
        type: [{ type: String, ref: 'MatchSchema' }],
        required: true,
      },
      currentWinrate: {
        type: Number,
        default: function () {
          const correctlyPredictedValues = this.matches.filter(
            (match) => match.avgPredictedValue
          ).length;
          return correctlyPredictedValues / this.matches.length;
        },
      },
    },
  },
  { timestamp: true }
);

export const MatchPrediction = mongoose.model(
  'MatchPrediction',
  matchPredictionSchema
);

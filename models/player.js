import mongoose, { Schema } from 'mongoose';

export const playerSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    player_id: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
    },
    elo: {
      type: Number,
      required: true,
    },
    lvl: {
      type: Number,
      required: true,
    },
    premium: {
      type: Boolean,
    },
    kd: {
      lifetime: {
        type: Number,
      },
      last10: {
        type: Number,
      },
      last20: {
        type: Number,
      },
      last50: {
        type: Number,
      },
    },
    avg: {
      last10: {
        type: Number,
      },
      last20: {
        type: Number,
      },
      last50: {
        type: Number,
      },
    },
    winrate: {
      lifetime: {
        type: Number,
      },
      last10: {
        type: Number,
      },
      last20: {
        type: Number,
      },
      last50: {
        type: Number,
      },
    },
    hs: {
      lifetime: {
        type: Number,
      },
      last10: {
        type: Number,
      },
      last20: {
        type: Number,
      },
      last50: {
        type: Number,
      },
    },
    highestElo: {
      type: Number,
    },
    highestEloDate: {
      type: Date,
    },
    matches: {
      type: Array,
    },
  },
  { timestamp: true }
);

export const Player = mongoose.model('Player', playerSchema);

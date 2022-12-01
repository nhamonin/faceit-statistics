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
    last20KD: {
      type: Number,
      required: true,
    },
    last50KD: {
      type: Number,
      required: true,
    },
  },
  { timestamp: true }
);

export const Player = mongoose.model('Player', playerSchema);

import mongoose, { Schema } from 'mongoose';

const playerSchema = new Schema(
  {
    player_id: {
      type: String,
      required: true,
      unique: true,
    },
    nickname: {
      type: String,
      required: true,
      unique: true,
    },
    elo: {
      type: Number,
      required: true,
    },
    lvl: {
      type: Number,
      required: true,
    },
  },
  { timestamp: true }
);

export const Player = mongoose.model('Player', playerSchema);

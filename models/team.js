import mongoose, { Schema } from 'mongoose';
import { playerSchema } from './player.js';

const teamSchema = new Schema(
  {
    chat_id: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: false,
    },
    players: {
      type: [{ type: playerSchema }],
      required: true,
    },
  },
  { timestamp: true }
);

export const Team = mongoose.model('Team', teamSchema);

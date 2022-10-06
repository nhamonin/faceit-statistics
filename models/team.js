import mongoose, { Schema } from 'mongoose';

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
      type: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
      required: true,
    },
  },
  { timestamp: true }
);

export const Team = mongoose.model('Team', teamSchema);

import mongoose, { Schema } from 'mongoose';

const teamSchema = new Schema(
  {
    chat_id: {
      type: Number,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    first_name: {
      type: String,
    },
    title: {
      type: String,
    },
    name: {
      type: String,
      required: false,
    },
    players: {
      type: [{ type: String, ref: 'Player' }],
      required: true,
    },
    settings: {
      lang: {
        type: String,
      },
      lastMatches: {
        type: Number,
      },
      subscriptions: {
        match_object_created: {
          calculateBestMaps: {
            type: Boolean,
          },
        },
        match_status_finished: {
          summaryStats: {
            type: Boolean,
          },
        },
      },
    },
  },
  { timestamp: true }
);

export const Team = mongoose.model('Team', teamSchema);

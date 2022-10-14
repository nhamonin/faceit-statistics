import mongoose, { Schema } from 'mongoose';

export const matchSchema = new Schema(
  {
    best_of: {
      type: String,
      required: true,
    },
    match_id: {
      type: String,
      required: true,
      unique: true,
    },
    round_stats: {
      Map: {
        type: String,
        required: true,
      },
      Rounds: {
        type: String,
        required: true,
      },
      Score: {
        type: String,
        required: true,
      },
      Winner: {
        type: String,
        required: true,
      },
    },
    teams: [
      {
        players: [
          {
            player_id: {
              type: String,
              required: true,
            },
            player_stats: {
              Assists: {
                type: String,
                required: true,
              },
              Deaths: {
                type: String,
                required: true,
              },
              Headshots: {
                type: String,
                required: true,
              },
              'Headshots %': {
                type: String,
                required: true,
              },
              'K/D Ratio': {
                type: String,
                required: true,
              },
              'K/R Ratio': {
                type: String,
                required: true,
              },
              Kills: {
                type: String,
                required: true,
              },
              MVPs: {
                type: String,
                required: true,
              },
              'Penta Kills': {
                type: String,
                required: true,
              },
              'Quadro Kills': {
                type: String,
                required: true,
              },
              'Triple Kills': {
                type: String,
                required: true,
              },
              Result: {
                type: String,
                required: true,
              },
            },
          },
        ],
        team_id: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamp: true }
);

export const Match = mongoose.model('Match', matchSchema);

import { db } from '#utils';

export const getTeamsByPlayerId = async (player_id) =>
  db('team')
    .select('team.*')
    .join('team_player', 'team.chat_id', '=', 'team_player.chat_id')
    .where('team_player.player_id', player_id);

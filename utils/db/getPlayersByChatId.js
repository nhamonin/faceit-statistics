import { db } from '#utils';

export const getPlayersByChatId = async (chat_id) =>
  db('player')
    .select('player.*')
    .join('team_player', 'player.player_id', '=', 'team_player.player_id')
    .where('team_player.chat_id', chat_id);

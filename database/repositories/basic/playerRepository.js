import { BaseRepository } from '../baseRepository.js';

export class PlayerRepository extends BaseRepository {
  constructor(db) {
    super(db, 'player');
  }

  async readAllByChatId(chat_id) {
    return this.db(this.tableName)
      .select('player.*')
      .join('team_player', 'player.player_id', '=', 'team_player.player_id')
      .where('team_player.chat_id', chat_id);
  }

  async updateHighestElo(player_id, updatedElo, highestEloDate) {
    return this.updateAllBy('player_id', player_id, {
      highestElo: updatedElo,
      highestEloDate,
    });
  }

  async readAllPlayerIds() {
    return this.db(this.tableName).pluck('player_id');
  }
}

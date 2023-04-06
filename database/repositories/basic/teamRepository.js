import { BaseRepository } from '../baseRepository.js';

export class TeamRepository extends BaseRepository {
  constructor(db) {
    super(db, 'team');
  }

  async readAllByPlayerId(player_id) {
    return this.db(this.tableName)
      .select('team.*')
      .join('team_player', 'team.chat_id', '=', 'team_player.chat_id')
      .where('team_player.player_id', player_id);
  }

  async updateSettings(chat_id, settings) {
    return this.updateAllBy(
      { chat_id },
      {
        settings: JSON.stringify(settings),
      }
    );
  }

  async readAllChatIds() {
    return this.db(this.tableName).pluck('chat_id');
  }
}

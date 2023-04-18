import { TeamRepository } from './repositories/basic/teamRepository.js';
import { PlayerRepository } from './repositories/basic/playerRepository.js';
import { TeamPlayerRepository } from './repositories/basic/teamPlayerRepository.js';
import { MatchRepository } from './repositories/basic/matchRepository.js';

import { TempPredictionRepository } from './repositories/prediction/tempPredictionRepository.js';
import { MatchPredictionRepository } from './repositories/prediction/matchPredictionRepository.js';

import db from './postgres.js';

export class Database {
  constructor() {
    this.teams = new TeamRepository(db);
    this.players = new PlayerRepository(db);
    this.teamsPlayers = new TeamPlayerRepository(db);
    this.matches = new MatchRepository(db);

    this.tempPredictions = new TempPredictionRepository(db);
    this.matchPredictions = new MatchPredictionRepository(db);
  }
}

const database = new Database();
export default database;

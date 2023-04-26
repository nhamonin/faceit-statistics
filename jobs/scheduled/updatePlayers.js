import database from '#db';
import { updatePlayers } from '#services';

export async function performUpdatePlayers() {
  const playerIDs = await database.players.readAllPlayerIds();
  await updatePlayers({ playerIDs, isHardUpdate, withAPIMatches });
}

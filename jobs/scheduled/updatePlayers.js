import database from '#db';
import { updatePlayers } from '#services';

export async function performUpdatePlayers() {
  const startTime = new Date();

  const playerIDs = await database.players.readAllBy(
    { in_match: false },
    { pluck: 'player_id' }
  );

  await updatePlayers({ playerIDs, withAPIMatches: true });

  const endTime = new Date();
  const timeTaken = endTime - startTime;

  console.log(
    `performUpdatePlayers done. Date: ${endTime.toLocaleString()}, Time taken: ${
      timeTaken / 1000
    } seconds`
  );
}

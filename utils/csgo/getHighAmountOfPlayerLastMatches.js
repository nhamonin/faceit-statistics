import database from '#db';
import { MAX_MATCHES_PER_REQUEST } from '#config';
import { getPlayerMatches, getEventEmitter, withErrorHandling } from '#utils';

const eventEmitter = getEventEmitter();

export const getHighAmountOfPlayerLastMatches = withErrorHandling(
  async function (player_id, amount = 20, chat_id) {
    const pages = [
      ...Array(Math.ceil(amount / MAX_MATCHES_PER_REQUEST)).keys(),
    ];
    const res = [];

    for await (const [index, page] of pages.entries()) {
      const matches = await getPlayerMatches(
        player_id,
        MAX_MATCHES_PER_REQUEST,
        page
      );

      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (!matches?.length) break;

      res.push(...matches);

      const percentage =
        index === pages.length - 1
          ? 100
          : ((index / pages.length) * 100).toFixed(1);

      if (!chat_id) continue;

      const player = await database.players.readBy({ player_id });

      eventEmitter.emit(
        `addingPlayerProcess-${chat_id}-${player.nickname}`,
        'addPlayer.progressLevel',
        {
          nickname: player.nickname,
          percentage,
        }
      );
    }

    return res;
  }
);

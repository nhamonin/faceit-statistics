import Bottleneck from 'bottleneck';

import database from '#db';
import {
  MAX_MATCHES_PER_REQUEST,
  MATCHES_FETCH_DELAY,
  TELEGRAM_MESSAGE_UPDATE_DELAY,
} from '#config';
import { getPlayerMatches, getEventEmitter, withErrorHandling } from '#utils';

const eventEmitter = getEventEmitter();
const matchLimiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: MATCHES_FETCH_DELAY,
});

export const getHighAmountOfPlayerLastMatches = withErrorHandling(
  async function (player_id, amount = 20, chat_id) {
    const pages = [
      ...Array(Math.ceil(amount / MAX_MATCHES_PER_REQUEST)).keys(),
    ];
    const res = [];

    for await (const [index, page] of pages.entries()) {
      const matches = await matchLimiter.schedule(() =>
        getPlayerMatches(player_id, MAX_MATCHES_PER_REQUEST, page)
      );

      if (!matches?.length) break;

      res.push(...matches);

      const percentage =
        index === pages.length - 1
          ? 100
          : ((index / pages.length) * 100).toFixed(1);

      if (!chat_id) continue;

      const player = await database.players.readBy({ player_id });
      const latestUpdates = new Map();

      if (latestUpdates.has(player_id)) {
        clearTimeout(latestUpdates.get(player_id));
      }

      latestUpdates.set(
        player_id,
        setTimeout(() => {
          eventEmitter.emit(
            `addingPlayerProcess-${chat_id}-${player?.nickname}`,
            'addPlayer.progressLevel',
            {
              nickname: player?.nickname,
              percentage,
            }
          );
        }, TELEGRAM_MESSAGE_UPDATE_DELAY)
      );
    }

    return res;
  }
);

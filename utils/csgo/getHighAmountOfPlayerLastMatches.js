import { MAX_MATCHES_PER_REQUEST } from '#config';
import { getPlayerMatches, getEventEmitter, withErrorHandling } from '#utils';

const eventEmitter = getEventEmitter();

export const getHighAmountOfPlayerLastMatches = withErrorHandling(
  async function (player_id, amount = 20, nickname, chat_id) {
    const pages = [
      ...Array(Math.ceil(amount / MAX_MATCHES_PER_REQUEST)).keys(),
    ];
    const res = [];

    for await (const page of pages) {
      const matches = await getPlayerMatches(
        player_id,
        MAX_MATCHES_PER_REQUEST,
        page
      );

      if (!matches?.length) break;

      res.push(...matches);

      eventEmitter.emit(
        `addingPlayerProcess-${chat_id}-${nickname}`,
        'addPlayer.progressLevel',
        {
          nickname,
          percentage: ((page / pages.length) * 100).toFixed(1),
        }
      );
    }
    return res;
  }
);

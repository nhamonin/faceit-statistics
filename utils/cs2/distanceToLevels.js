import { faceitLevels } from '#config';

export function distanceToLevels(elo) {
  let currentLevel = null;

  for (let level in faceitLevels) {
    if (elo >= faceitLevels[level][0] && elo <= faceitLevels[level][1]) {
      currentLevel = parseInt(level);
      break;
    }
  }

  if (currentLevel < 1 || currentLevel > 10) {
    throw new Error(`Invalid currentLevel: ${currentLevel}, elo: ${elo}`);
  }

  let prevEloDistance, nextEloDistance;

  if (currentLevel === 1) {
    prevEloDistance = '∞';
  } else if (currentLevel === 2) {
    prevEloDistance = elo - faceitLevels[1][0];
  } else {
    prevEloDistance = elo - faceitLevels[currentLevel - 1][1];
  }

  if (currentLevel === 10) {
    nextEloDistance = '∞';
  } else {
    nextEloDistance = faceitLevels[currentLevel + 1][0] - elo;
  }

  return { prevEloDistance: '-' + prevEloDistance, nextEloDistance: '+' + nextEloDistance };
}

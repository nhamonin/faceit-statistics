export const getClass = {
  kd: getKDColorClass,
  elo: getEloColorClass,
  avg: getAvgColorClass,
  winrate: getWinRateColorClass,
  hs: getHsColorClass,
};

function getEloColorClass(value) {
  if (value < 1000) {
    return 'red';
  } else if (value < 2001) {
    return 'yellow';
  } else if (value < 2500) {
    return 'green';
  } else if (value < 3000) {
    return 'aqua';
  } else {
    return 'purple';
  }
}

function getKDColorClass(value) {
  if (value < 1) {
    return 'red';
  } else if (value < 1.1) {
    return 'yellow';
  } else if (value < 1.3) {
    return 'green';
  } else if (value < 1.5) {
    return 'aqua';
  } else {
    return 'purple';
  }
}

function getAvgColorClass(value) {
  if (value < 12) {
    return 'red';
  } else if (value < 14) {
    return 'yellow';
  } else if (value < 16) {
    return 'green';
  } else if (value < 19.2) {
    return 'aqua';
  } else {
    return 'purple';
  }
}

function getWinRateColorClass(value) {
  if (value < 49) {
    return 'red';
  } else if (value < 51) {
    return 'yellow';
  } else if (value < 53) {
    return 'green';
  } else if (value < 55) {
    return 'aqua';
  } else {
    return 'purple';
  }
}

function getHsColorClass(value) {
  if (value < 40) {
    return 'red';
  } else if (value < 45) {
    return 'yellow';
  } else if (value < 50) {
    return 'green';
  } else if (value < 55) {
    return 'aqua';
  } else {
    return 'purple';
  }
}

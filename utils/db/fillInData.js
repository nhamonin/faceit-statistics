db('player')
  .insert(
    players.map((player) => ({
      player_id: player.player_id,
      nickname: player.nickname,
      elo: player.elo,
      lvl: player.lvl,
      kd: player.kd,
      avg: player.avg,
      hs: player.hs,
      winrate: player.winrate,
      highestElo: player.highestElo,
      highestEloDate: player.highestEloDate,
    }))
  )
  .onConflict('player_id')
  .merge()
  .then(() => {
    console.log('Players inserted');
  })
  .catch((error) => {
    console.error(error);
  });

// const teams = await Team.find({});

teams.map(({ chat_id, players }) => {
  players.map((player_id) => {
    db('team_player')
      .insert({ chat_id, player_id })
      .then(function () {
        console.log('New relationship added: ', { chat_id, player_id });
      });
  });
});

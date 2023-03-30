db.schema
  .createTable('team', (table) => {
    table.integer('chat_id').primary();
    table.string('type').notNullable();
    table.string('username');
    table.string('first_name');
    table.string('title');
    table.string('name');
    table.json('players').notNullable();
    table.json('settings').notNullable();
    table.timestamps(true, true);
  })
  .then(() => {
    console.log('teams table created');
  })
  .catch((error) => {
    console.error(error);
  });

db.schema
  .createTable('player', (table) => {
    table.string('player_id').primary().notNullable();
    table.string('nickname').notNullable();
    table.integer('elo').notNullable();
    table.integer('lvl').notNullable();
    table.json('kd').notNullable();
    table.json('avg').notNullable();
    table.json('winrate').notNullable();
    table.json('hs').notNullable();
    table.integer('highestElo').notNullable();
    table.date('highestEloDate').notNullable();
    table.timestamps(true, true);
  })
  .then(() => {
    console.log('players table created');
  })
  .catch((error) => {
    console.error(error);
  });

db.schema
  .createTable('team_player', (table) => {
    table.integer('chat_id').unsigned().references('chat_id').inTable('team');
    table
      .string('player_id')
      .unsigned()
      .references('player_id')
      .inTable('player');
    table.primary(['chat_id', 'player_id']);
  })
  .then(() => {
    console.log('team_player table created');
  })
  .catch((error) => {
    console.error(error);
  });

db.schema
  .createTable('match_prediction', function (table) {
    table.bigIncrements('id').primary();
    table.bigInteger('totalMatches').defaultTo(0);
    table.float('avgPredictions').defaultTo(0);
    table.float('winratePredictions').defaultTo(0);
    table.timestamps(true, true);
  })
  .then(() => {
    console.log('match_prediction table created');
  })
  .catch((error) => {
    console.error(error);
  });

db.schema
  .createTable('temp_prediction', (table) => {
    table.string('match_id').primary().notNullable().unique();
    table.jsonb('predictions').notNullable();
    table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
  })
  .then(() => {
    console.log('temp_prediction table created');
  })
  .catch((error) => {
    console.error(error);
  });

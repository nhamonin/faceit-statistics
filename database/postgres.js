import knex from 'knex';
import pg from 'pg';

import { PG_CONNECTION_STRING } from '#config';

const { Client } = pg;
knex.Client = Client;

const db = knex({
  client: 'pg',
  connection: PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
  pool: {
    min: 10,
    max: 200,
  },
});

export default db;

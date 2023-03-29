import knex from 'knex';
import pg from 'pg';

import { PG_CONNECTION_STRING } from '#config';

const { Client } = pg;
knex.Client = Client;

const connectionOptions = {
  client: 'pg',
  connection: PG_CONNECTION_STRING,
  searchPath: ['knex', 'public'],
  pool: {
    min: 1,
    max: 100,
  },
};

const db = knex(connectionOptions);

export default db;

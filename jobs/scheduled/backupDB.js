import path from 'node:path';
import fs from 'node:fs';

import pg from 'pg';
import { execute } from '@getvim/execute';

import {
  PG_CONNECTION_STRING,
  TELEGRAM_BACKUPS_CHAT_ID,
  isProduction,
} from '#config';
import { getTelegramBot } from '#utils';

const { Client } = pg;
const tBot = getTelegramBot();
const backupDir = path.join(process.cwd(), 'database', 'backups');
const excludedTables = ['match', 'temp_prediction'];
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

// Ensure the backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

export async function backupDB() {
  const client = new Client({
    connectionString: PG_CONNECTION_STRING,
  });
  const date = new Date();
  const currentDate = `${date.getFullYear()}.${
    date.getMonth() + 1
  }.${date.getDate()}`;
  const fileName = path.join(backupDir, `database-backup-${currentDate}.sql`);
  const schemaOnlyFileName = path.join(
    backupDir,
    `database-schema-only-backup-${currentDate}.sql`
  );

  try {
    await client.connect();
    const res = await client.query(
      `SELECT tablename FROM pg_catalog.pg_tables
         WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`
    );
    const allTables = res.rows.map((row) => row.tablename);
    const tablesWithData = allTables.filter(
      (tablename) => !excludedTables.includes(tablename)
    );
    const tablesWithDataOptions = tablesWithData
      .map((table) => `-t ${table}`)
      .join(' ');
    const tablesWithoutData = allTables.filter((tablename) =>
      excludedTables.includes(tablename)
    );
    const tablesWithoutDataOptions = tablesWithoutData
      .map((table) => `-t ${table}`)
      .join(' ');

    // first pg_dump to backup schema and data of non-excluded tables
    await execute(
      `pg_dump ${PG_CONNECTION_STRING} ${tablesWithDataOptions} -f ${fileName}`
    );

    // second pg_dump to backup only schema (no data) of excluded tables
    await execute(
      `pg_dump ${PG_CONNECTION_STRING} ${tablesWithoutDataOptions} -s -f ${schemaOnlyFileName}`
    );

    // send backup files to Telegram
    if (isProduction) {
      await tBot.sendDocument(TELEGRAM_BACKUPS_CHAT_ID, fileName);
      await tBot.sendDocument(TELEGRAM_BACKUPS_CHAT_ID, schemaOnlyFileName);
    }

    // Delete files older than 7 days
    await deleteOldBackups(backupDir);
  } catch (error) {
    console.log(error);
  } finally {
    await client.end();
  }
}

async function deleteOldBackups() {
  const files = fs.readdirSync(backupDir);
  const now = Date.now();

  for (const file of files) {
    const filePath = path.join(backupDir, file);
    const datePattern = /\d{4}.\d{1,2}.\d{1,2}/;
    const dateString = file.match(datePattern)[0];
    const [year, month, day] = dateString.split('.').map(Number);
    const fileDate = new Date(year, month - 1, day);

    if (now - fileDate.getTime() > SEVEN_DAYS) {
      fs.unlinkSync(filePath);
    }
  }
}

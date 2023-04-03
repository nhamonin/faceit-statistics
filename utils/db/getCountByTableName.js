import { db } from '#utils';

export async function getCountByTableName(tableName) {
  const res = await db(tableName).count('* as count');

  return res.length > 0 ? res[0].count : 0;
}

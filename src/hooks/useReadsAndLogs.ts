import { db, ReadLog } from '../db.ts';
import { useLiveQuery } from 'dexie-react-hooks';

export const useReadsAndLogs = () => {
  return useLiveQuery(async () => {
    const reads = await db.reads.toArray();
    const promises: Promise<ReadLog[]>[] = [];

    for (let i = 0; i < reads.length; i++) {
      const prom = db
        .readLogs
        .where('readId')
        .equals(reads[i].id)
        .sortBy('timestamp')
        .then((arr) => arr.reverse());

      promises.push(prom);
    }

    return {
      reads,
      logs: await Promise.all(promises),
    };
  });
};

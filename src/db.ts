// db.ts
import Dexie, { type EntityTable } from 'dexie';

interface Read {
  id: number;
  name: string;
  baseUrl: string;
  timestamp: number;
}

interface ReadLog {
  id: number;
  readId: number;
  url: string;
  label: string;
  scrollX: number;
  scrollY: number;
  xPath?: string;
  timestamp: number;
}

const VERSION = 1;
const db = new Dexie('ReaderKeep') as Dexie & {
  reads: EntityTable<Read, 'id'>;
  readLogs: EntityTable<ReadLog, 'id'>;
};

db.version(VERSION).stores({
  reads: '++id, name, baseUrl, timestamp',
  readLogs: '++id, readId, url, label, scrollX, scrollY, xPath, timestamp',
});

export type { Read, ReadLog };
export { db };
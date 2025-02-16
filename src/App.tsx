import './App.css';
import { useReadsAndLogs } from './hooks/useReadsAndLogs.ts';
import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill';
import { Action, ACTIONS } from './actions.ts';
import { onTabComplete } from './utils.ts';
import { db, Read, ReadLog } from './db.ts';
import { TrashIcon } from './icons/TrashIcon.tsx';

const formatTimestamp = (timstamp: number) => {
  const d = new Date(timstamp);

  return `${d.getDate()}/${d.getMonth()}/${d.getFullYear().toString().substring(-2)} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
};
const openLog = async (log: ReadLog) => {
  const tab = await browser.tabs.create({
    url: log.url,
    active: true,
  });

  await onTabComplete(tab, async () => {
    await browser.tabs.sendMessage<Action>(tab.id!, {
      type: ACTIONS.OPEN_LOG,
      payload: log,
    });
  });
};
const deleteRead = async (read: Read) => {
  browser.runtime.sendMessage({
    type: ACTIONS.DELETE_READ,
    payload: read,
  });
};
const deleteLog = async (log: ReadLog) => {
  db.readLogs.delete(log.id);
};

function App() {
  const data = useReadsAndLogs();

  if (!data || !data.reads || !data.logs) {
    return null;
  }

  const {reads, logs} = data;

  return (
    <ul className="menu">
      {reads.map((read, i) => (
        <li key={`read-${read.id}-${nanoid()}`}>
          <a>
            {read.name}
            <button
              className="btn btn-transparent text-red-100"
              type="button"
              onClick={(e) => {e.stopPropagation(); return deleteRead(read);}}
            >
              <TrashIcon className="size-3" />
            </button>
          </a>
          <ul>
            {logs[i].map((log) => (
              <li
                key={`log-${read.id}-${log.id}-${nanoid()}`}
                onClick={() => openLog(log)}
              >
                <a>
                  {log.label} {formatTimestamp(log.timestamp)}
                  <button
                    className="btn btn-transparent text-red-100"
                    type="button"
                    onClick={(e) => {e.stopPropagation(); return deleteLog(log);}}
                  >
                    <TrashIcon className="size-3" />
                  </button>
                </a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default App;

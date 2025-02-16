import './App.css';
import { useReadsAndLogs } from './hooks/useReadsAndLogs.ts';
import { nanoid } from 'nanoid';
import browser from 'webextension-polyfill';
import { Action, ACTIONS } from './actions.ts';
import { onTabComplete } from './utils.ts';

const formatTimestamp = (timstamp: number) => {
  const d = new Date(timstamp);

  return `${d.getDate()}/${d.getMonth()}/${d.getFullYear().toString().substring(-2)} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
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
          <a>{read.name}</a>
          <ul>
            {logs[i].map((log) => (
              <li
                key={`log-${read.id}-${log.id}-${nanoid()}`}
                onClick={async () => {
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
                }}
              >
                <a>{log.label} {formatTimestamp(log.timestamp)}</a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

export default App;

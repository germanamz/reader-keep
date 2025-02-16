import { db, Read, ReadLog } from './db';
import { Action, ACTIONS } from './actions';
import browser from 'webextension-polyfill';
import { PageData } from './types.ts';

const ROOT_MENU_ITEMS = {
  keepRead: 'keepRead',
  addReadLog: 'addReadLog',
};
const getPageData = async (tabId: number) => await browser.tabs.sendMessage<Action, PageData>(tabId, {
  type: ACTIONS.GET_PAGE_DATA,
});
const createRead = async (pageData: PageData) => {
  const readData = {
    name: pageData.title,
    baseUrl: pageData.url,
    timestamp: new Date().getTime(),
  };
  const id = await db.reads.add(readData);

  return {
    id,
    ...readData,
  } as Read;
};
const createLog = async (readId: number, pageData: PageData) => {
  const url = new URL(pageData.url);
  const label = pageData.selection || url.pathname;

  const logData = {
    readId,
    url: pageData.url,
    scrollY: pageData.scrollY,
    scrollX: pageData.scrollX,
    xPath: pageData.xPath,
    label,
    timestamp: new Date().getTime(),
  };
  const id = await db.readLogs.add(logData);

  return {
    id,
    ...logData,
  } as ReadLog;
};
const startContextMenu = async () => {
  await browser.contextMenus.removeAll();

  const reads = await db.reads.toArray();

  browser.contextMenus.create({
    id: ROOT_MENU_ITEMS.keepRead,
    title: 'Create Read',
    contexts: ['all'],
  });

  if (!reads.length) {
    return;
  }

  browser.contextMenus.create({
    id: ROOT_MENU_ITEMS.addReadLog,
    title: 'Add Log',
    contexts: ['all'],
  });

  reads.forEach((read) => {
    chrome.contextMenus.create({
      id: `read-${read.id}`,
      title: read.name,
      contexts: ['all'],
      parentId: ROOT_MENU_ITEMS.addReadLog,
    });
  });
};

browser.runtime.onInstalled.addListener(async () => {
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });
  await startContextMenu();

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (!tab?.id) {
      return;
    }

    if (info.parentMenuItemId === ROOT_MENU_ITEMS.addReadLog) {
      const readId = Number((info.menuItemId as string).replace('read-', ''));
      const pageData = await getPageData(tab.id);

      await createLog(readId, pageData);

      return;
    }

    if (info.menuItemId === ROOT_MENU_ITEMS.keepRead) {
      const pageData = await getPageData(tab.id);
      const read = await createRead(pageData);
      await createLog(read.id, pageData);

      await startContextMenu();
      return;
    }
  });

  // browser.runtime.onMessage.addListener(async (req) => {
  //   const action = req as Action;
  //
  //   console.log(action);
  //
  //   if (action.type === ACTIONS.OPEN_LOG) {
  //     const tab = await browser.tabs.create({
  //       url: action.payload.url,
  //       active: true,
  //     });
  //
  //     await onTabComplete(tab, async () => {
  //       await openLog(tab.id!, action.payload);
  //     });
  //
  //     return;
  //   }
  // });
});

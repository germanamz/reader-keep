import browser, { Tabs } from 'webextension-polyfill';

export const onTabComplete = (tab: Tabs.Tab, cb: () => Promise<void> | void) => {
  return new Promise((resolve, reject) => {
    const readyHandler = async (tabId: number, info: Tabs.OnUpdatedChangeInfoType) => {
      if (tabId !== tab.id || info.status !== 'complete') {
        return;
      }

      try {
        await cb();
      } catch (e) {
        reject(e);
      } finally {
        browser.tabs.onUpdated.removeListener(readyHandler);
      }

      resolve(undefined);
    };

    browser.tabs.onUpdated.addListener(readyHandler);
  });
};

export const isElement = (target: Node | Element): target is Element => {
  return target.nodeType === Node.ELEMENT_NODE;
};

export const getXPath = (target: Node | Element): string => {
  if (isElement(target) && target.id) {
    return `//*[@id="${target.id}"]`;
  }

  const parts: string[] = [];
  let el: Element | null = isElement(target) ? target : target.parentElement;

  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let index = 0;
    let sibling = el.previousElementSibling;

    while (sibling) {
      if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === el.nodeName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = el.tagName.toLowerCase();
    const part = index ? `${tagName}[${index + 1}]` : tagName;

    parts.unshift(part);
    el = el.parentElement;
  }

  return parts.length ? `/${parts.join('/')}` : '';
};

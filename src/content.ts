import { Action, ACTIONS } from './actions';
import browser from 'webextension-polyfill';
import { PageData } from './types.ts';
import { getXPath } from './utils.ts';

browser.runtime.onMessage.addListener(async (req) => {
  const action = req as Action;

  if (action.type === ACTIONS.GET_PAGE_DATA) {
    const selection = getSelection();
    const xPath = selection && getXPath(selection.anchorNode as Element);

    return {
      scrollX: window.scrollX,
      scrollY: window.scrollY,
      url: window.location.href,
      title: document.title,
      xPath,
      selection: selection?.toString(),
    } as PageData;
  }

  if (action.type === ACTIONS.OPEN_LOG) {
    if (action.payload.xPath) {
      const el = document.evaluate(action.payload.xPath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement | null;

      if (el) {
        el.scrollIntoView({
          behavior: 'smooth',
        });
        const style = document.createElement('style');
        const arrow = document.createElement('span');
        style.innerHTML = `@keyframes readerKeepArrowFadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}`;
        arrow.innerHTML = '&rarr;';
        arrow.style.color = 'red';
        arrow.style.animation = 'readerKeepArrowFadeIn 0.3s ease-in-out 0s infinite alternate';
        el.prepend(style);
        el.prepend(arrow);

        setTimeout(() => {
          arrow.remove();
          style.remove();
        }, 5000);
      }

      return;
    }

    window.scroll({
      top: action.payload.scrollY,
      left: action.payload.scrollX,
      behavior: 'smooth',
    });

    return;
  }
});
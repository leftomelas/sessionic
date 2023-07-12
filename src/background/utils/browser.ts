import browser from 'webextension-polyfill';

import { isFirefox } from './constants';

//TODO support discarded in chromium, fix popup open bug in firefox
export async function openInCurrentWindow(window: EWindow) {
  window.id = (await browser?.windows?.getCurrent()).id;

  for (const tab of window?.tabs) {
    createTab(tab, window.id);
  }
}

export async function openInNewWindow(window: EWindow) {
  const windowId = (
    await browser?.windows?.create({
      incognito: window.incognito,
      ...(window.state !== 'normal'
        ? { state: window.state }
        : {
            top: window.top,
            left: window.left,
            height: window.height,
            width: window.width,
          }),
    })
  ).id;

  for (const tab of window?.tabs) {
    createTab(tab, windowId);
  }
}

export async function openSession(session: ESession, newWindow?: boolean) {
  for (const window of session.windows) {
    if (newWindow) {
      openInNewWindow(window);
      continue;
    }

    openInCurrentWindow(window);
  }
}

export async function createTab(
  tab: ETab,
  windowId?: number,
  discarded?: boolean
) {
  const {
    url,
    active,
    pinned,
    cookieStoreId,
    isInReaderMode,
    mutedInfo,
    incognito,
  } = tab;

  return browser?.tabs?.create({
    url,
    active,
    windowId: windowId ?? tab.windowId,
    pinned,
    ...(isFirefox && {
      discarded: discarded ?? !active,
      openInReaderMode: isInReaderMode,
      muted: mutedInfo.muted,
      ...(!incognito && { cookieStoreId }),
    }),
  });
}
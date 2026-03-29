import { MESSAGE_EXPLAIN_CONTEXT } from "./lib/types";

const MENU_ID = "clarte-explain-context";

function createContextMenu(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: "Explain Context",
      contexts: ["selection"]
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) {
    return;
  }

  chrome.tabs.sendMessage(tab.id, { type: MESSAGE_EXPLAIN_CONTEXT }, () => {
    void chrome.runtime.lastError;
  });
});

chrome.action.onClicked.addListener(() => {
  const optionsUrl = chrome.runtime.getURL("options.html");
  chrome.tabs.create({ url: optionsUrl }, () => {
    if (chrome.runtime.lastError) {
      chrome.runtime.openOptionsPage();
    }
  });
});

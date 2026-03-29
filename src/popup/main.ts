const optionsUrl = chrome.runtime.getURL("options.html");

chrome.tabs.create({ url: optionsUrl }, () => {
  if (chrome.runtime.lastError) {
    chrome.runtime.openOptionsPage();
  }
  window.close();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_DOM") {
    const domContent = document.documentElement.innerText;

    if (domContent && domContent.trim() !== "") {
      chrome.runtime.sendMessage({ type: "DOM_CONTENT", payload: domContent });
      sendResponse({ status: "DOM sent to background script" });
    }
  }

  return true;
});


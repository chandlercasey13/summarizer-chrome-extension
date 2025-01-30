
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_DOM") {
    const domContent = document.documentElement.innerText;

    if (domContent && domContent.trim() !== "") {
     console.log('bongus')
      chrome.runtime.sendMessage({ type: "DOM_CONTENT", length:
        message.length, payload: domContent });
      sendResponse({ status: "DOM sent to background script" });
    }
  }

  return true;
});


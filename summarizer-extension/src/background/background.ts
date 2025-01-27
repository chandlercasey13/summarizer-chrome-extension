const tabResponseCache: Map<number, string> = new Map();
const currentTabsWithExtensionOpened: Map<number, boolean> = new Map();

let currentTab: number;

//send extension open message to app.tsx
function notifyExtensionOpened() {
  chrome.runtime.sendMessage({ type: "EXTENSION_OPENED" });
  currentTabsWithExtensionOpened.set(currentTab, true);
 
}

//onconnect is how we know if the extension is open

chrome.runtime.onConnect.addListener(handleConnect);

chrome.tabs.onUpdated.addListener(
  async (tabId) => await handleOpenSidePanel(tabId)
);

chrome.tabs.onActivated.addListener(handleTabActivation);

chrome.tabs.onRemoved.addListener(handleTabRemoval);

chrome.runtime.onMessage.addListener(handleIncomingMessages);


function handleConnect(port: chrome.runtime.Port) {
  notifyExtensionOpened();

  (async () => {
    if (!chrome?.tabs?.query) {
      console.error("Chrome tabs API is not available");
      return;
    }
  
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
  
    if (tab.id) {
     
  
      currentTab = tab.id
    }
  })()






  port.onDisconnect.addListener(() => {
    if (currentTab) {
      currentTabsWithExtensionOpened.delete(currentTab);
    }
  });
}

//this allows the toggle of sidepanel when clicking on extension button
async function handleOpenSidePanel(tabId: number) {
  await chrome.sidePanel.setOptions({
    tabId,
    path: "js/index.html",
    enabled: true,
  });
}

//this deactivates side panel for the specific tab when swapping out of that tab

function handleTabActivation(activeInfo: chrome.tabs.TabActiveInfo) {
  currentTab = activeInfo.tabId;

  if (currentTab && currentTab !== activeInfo.tabId) {
    chrome.sidePanel.setOptions({
      tabId: currentTab,
      enabled: false,
    });
  }

  chrome.runtime.sendMessage(
    {
      type: "IS_EXTENSION_OPEN_IN_CURRENT_TAB",
      data: currentTabsWithExtensionOpened.has(activeInfo.tabId),
    },
    
  );
}

//if tab is deleted, response is removed from cache
function handleTabRemoval(tabId: number) {
  if (tabResponseCache.has(tabId)) {
    tabResponseCache.delete(tabId);
  }
  if (currentTabsWithExtensionOpened.has(tabId)) {
    

    currentTabsWithExtensionOpened.delete(tabId);
  }
}

function handleIncomingMessages(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): true | undefined {
  //if we're sending a message to send the dom content, and the tab we're requesting
  //isn't already in our cache

  if (message.type === "DOM_CONTENT" && !tabResponseCache.has(currentTab)) {
    console.log("sending DOM");
    const domContent = message.payload;

    fetch("http://3.129.21.98/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domContent }),
    })
      .then((response) => {
        if (!response.body) {
          throw new Error("ReadableStream is not supported.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let fullText: string = "";

        const readStream: any = () => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              chrome.runtime.sendMessage({
                type: "STREAM_COMPLETE",
                data: fullText,
              });

              tabResponseCache.set(currentTab, fullText);

              sendResponse({ status: "Success", data: fullText });
              return;
            }

            const chunkText = decoder.decode(value, { stream: true });
            fullText += chunkText;
            

            return readStream();
          });
        };

        return readStream();
      })
      .catch((error) => {
        console.error("Error sending DOM to backend:", error);
        sendResponse({ status: "Error", error: error.message });
      });

    return true;
  }

  if (message.type === "IS_EXTENSION_OPEN_IN_CURRENT_TAB") {
    

    if (currentTabsWithExtensionOpened.has(message.data)) {
      sendResponse({
        booleanresponse: true,
        data: currentTabsWithExtensionOpened.get(message.data),
      });
    } else {
      sendResponse({ booleanresponse: false, data: null });
    }
  }

  if (message.type === "IS_TAB_IN_CACHE") {
    if (tabResponseCache.has(message.data)) {
      sendResponse({
        booleanresponse: true,
        data: tabResponseCache.get(message.data),
      });
    } else {
      sendResponse({ booleanresponse: false, data: null });
    }
    return true;
  }
}

const tabResponseCache: Map<number, Map<number, string>> = new Map();

const currentTabsWithExtensionOpened: Map<number, boolean> = new Map();

let currentTab: number;

// onConnect is how we know if the extension is open
chrome.runtime.onConnect.addListener(handleConnect);

chrome.tabs.onUpdated.addListener(
  async (tabId) => await handleOpenSidePanel(tabId)
);

chrome.tabs.onActivated.addListener(handleTabActivation);

chrome.tabs.onRemoved.addListener(handleTabRemoval);

chrome.runtime.onMessage.addListener(handleIncomingMessages);

chrome.windows.onFocusChanged.addListener(handleWindowFocusChange);

chrome.action.onClicked.addListener(handleExtensionButtonClick);

async function handleConnect(port: chrome.runtime.Port) {
  await (async () => {
    if (!chrome?.tabs?.query) {
      console.error("Chrome tabs API is not available");
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab.id) {
      currentTab = tab.id;
    }
  })();

  notifyExtensionOpened();

  port.onDisconnect.addListener(() => {
    if (currentTab) {
      currentTabsWithExtensionOpened.delete(currentTab);
    }
  });
}

// send extension open message to app.tsx
function notifyExtensionOpened() {
  chrome.runtime.sendMessage({ type: "EXTENSION_OPENED", tab : currentTab });

  currentTabsWithExtensionOpened.set(currentTab, true);
}

// this allows the toggle of the side panel when clicking on the extension button
async function handleOpenSidePanel(tabId: number) {
  await chrome.sidePanel.setOptions({
    tabId,
    path: "js/index.html",
    enabled: true,
  });
}

// this deactivates the side panel for the specific tab when swapping out of that tab
function handleTabActivation(activeInfo: chrome.tabs.TabActiveInfo) {
  currentTab = activeInfo.tabId;

  if (currentTab && currentTab !== activeInfo.tabId) {
    chrome.sidePanel.setOptions({
      tabId: currentTab,
      enabled: false,
    });
  }

  chrome.runtime.sendMessage({
    type: "IS_EXTENSION_OPEN_IN_CURRENT_TAB",
    data: currentTabsWithExtensionOpened.has(activeInfo.tabId),
  });
}

// if tab is deleted, response is removed from cache
function handleTabRemoval(tabId: number) {
  if (tabResponseCache.has(tabId)) {
    tabResponseCache.delete(tabId);
  }
  if (currentTabsWithExtensionOpened.has(tabId)) {
    currentTabsWithExtensionOpened.delete(tabId);
  }
}

// handle when user switches to a different Chrome window
function handleWindowFocusChange(windowId: number) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // no window is focused, do nothing
    return;
  }

  chrome.tabs.query({ active: true, windowId }, (tabs) => {
    if (tabs.length === 0 || !tabs[0].id) return;

    const newActiveTabId = tabs[0].id;

    // check if the new active tab is in the current window
    if (currentTabsWithExtensionOpened.has(currentTab) && newActiveTabId !== currentTab) {
      // close the extension
      chrome.sidePanel.setOptions({
        tabId: currentTab,
        enabled: false,
      });

      // remove from tracking
      currentTabsWithExtensionOpened.delete(currentTab);
    }
  });
}

// handle when the extension button is clicked
async function handleExtensionButtonClick(tab: chrome.tabs.Tab) {
  if (!tab.id) return;

  // if the extension is not open, open it
  if (!currentTabsWithExtensionOpened.has(tab.id)) {
    await handleOpenSidePanel(tab.id);
    currentTabsWithExtensionOpened.set(tab.id, true);
  }
}

function handleIncomingMessages(
  message: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
): true | undefined {
  
  // if we're sending a message to send the DOM content, and the tab we're requesting isn't already in our cache

 try{
 
  if (message.type === "DOM_CONTENT") {

   
    const domContent = message.payload;
    

    
    

 



          
    
   
//http://3.129.21.98/
    fetch("http://localhost:3000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domContent , length: message.length+100 }),
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

              if (!tabResponseCache.has(currentTab)) {
                tabResponseCache.set(currentTab, new Map());
              }
       
tabResponseCache.get(currentTab)!.set(message.length, fullText);

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
} catch(error) {
  console.log(error)
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

 
    if (tabResponseCache.get(message.data)?.has(message.length)) {
    
      sendResponse({
        booleanresponse: true,
        data: tabResponseCache.get(message.data)?.get(message.length),
      });
    } else {
     
      sendResponse({ booleanresponse: false, data: null });
    }
    return true;
  }

  if (message.type === "DELETE_TAB_IN_CACHE") {
    if (tabResponseCache.has(message.data)) {
     tabResponseCache.delete(message.data)


    }



  }

  





}
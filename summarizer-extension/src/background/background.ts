import { tabResponseCache } from "./tabResponsesCache";

const currentTabsWithExtensionOpened: Map<number, boolean> = new Map();



let currentTab: number;
// let currentPanelTabId: number;

// get the very first tab the user loads into with fresh chrome window
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
   

    currentTab = tab.id;
  }
})();


//onconnect is how we know if the extension is open

chrome.runtime.onConnect.addListener((port) => {
 
//send extension open message to app.tsx
  chrome.runtime.sendMessage({ type: "EXTENSION_OPENED" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError.message);
    } else {

      if (currentTab) {
        
        currentTab = parseInt(response.message)
        currentTabsWithExtensionOpened.set(currentTab, true)
     
      }
      
     


     
     
    }
  });


 //extension close listener
  port.onDisconnect.addListener(() => {
    if (currentTab) {
      
      currentTabsWithExtensionOpened.delete(currentTab)
    
    }
    
   
  });
});


//this allows the toggle of sidepanel when clicking on extension button
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
 
  
    await chrome.sidePanel.setOptions({
      tabId,
      path: "js/index.html",
      enabled: true,
    
    })
});

//this deactivates side panel for the specific tab when swapping out of that tab

chrome.tabs.onActivated.addListener((activeInfo) => {
 
    currentTab = activeInfo.tabId;

    if (currentTab && currentTab !== activeInfo.tabId) {
      
      chrome.sidePanel.setOptions({
        tabId: currentTab,
        enabled: false,
      });
    }


    
      chrome.runtime.sendMessage({ type: "IS_EXTENSION_OPEN_IN_CURRENT_TAB", data:currentTabsWithExtensionOpened.has(activeInfo.tabId) }, 
        (response) => {})
        console.log('is extension opened in this tab', currentTabsWithExtensionOpened.has(activeInfo.tabId))
     
      
   
    

});


//if tab is deleted, response is removed from cache
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabResponseCache.has(tabId)) {
    tabResponseCache.delete(tabId);

  }
  if (currentTabsWithExtensionOpened.has(tabId)){
    currentTabsWithExtensionOpened.delete(tabId)
    
  }
  })




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
            chrome.runtime.sendMessage({
              type: "STREAM_CHUNK",
              data: chunkText,
            });

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

  if (message.type === "TAB_IN_CACHE") {
    console.log('checking cache')
    console.log(tabResponseCache)
    console.log(message.data)
    console.log(currentTab)
    if (tabResponseCache.has(message.data)) {
   console.log('is in cache')
      sendResponse({
        booleanresponse: true,
        data: tabResponseCache.get(message.data),
      });
    } else {
      sendResponse({ booleanresponse: false, data: null });
      console.log('is not in  cache')
    }
    return true;
  }
});

import { tabResponseCache } from "./tabResponsesCache";


let currentTab:number;
let currentPanelTabId:number| null ;

// get the very first tab the user loads into
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
    console.log(tab.id);
    console.log('work')
   
    currentTab = tab.id
  }
})()



chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabResponseCache.has(tabId)){
    tabResponseCache.delete(tabId)
    
  }
 
});




chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // Enables the side panel on google.com
  if (url.origin) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'js/index.html',
      enabled: true
    });
  } else {
    // Disables the side panel on all other sites
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});











//listen for tab changes

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
   currentTab = activeInfo.tabId

   if (currentPanelTabId && currentPanelTabId !== activeInfo.tabId) {
    // Close the side panel in the previous tab
    chrome.sidePanel.setOptions({
      tabId: currentPanelTabId,
      enabled: false,
    });

    // Update the tracked tab ID
    currentPanelTabId = null;
   

  };


  })


});



chrome.runtime.onConnect.addListener((port) => {
  console.log(`Connected: ${port.name}`);
  
  chrome.runtime.sendMessage({ type: "EXTENSION_OPENED" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Error:", chrome.runtime.lastError.message);
    } else {
      currentPanelTabId= response.message
      console.log("Response received:", response);
      
    }
  });



  // Handle disconnect event
  port.onDisconnect.addListener(() => {
      console.log(`Disconnected: ${port.name}`);
      // Perform cleanup or other actions here
  });
});








chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //if we're sending a message to send the dom content, and the tab we're requesting
  //isn't already in our cache

 

  if (message.type === "DOM_CONTENT" && !tabResponseCache.has(currentTab)) {
    console.log('sending DOM')
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
        let fullText:string = "";

        const readStream: any = () => {
          return reader.read().then(({ done, value }) => {
            if (done) {
              chrome.runtime.sendMessage({
                type: "STREAM_COMPLETE",
                data:fullText
              });
              
              tabResponseCache.set(currentTab, fullText)
              console.log(tabResponseCache)
              
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




if (message.type === "TAB_IN_CACHE" ){
  console.log('is in cache: ',tabResponseCache.has(message.data) )
   if (tabResponseCache.has(message.data)) {
    sendResponse({booleanresponse: true, data: tabResponseCache.get(message.data)})
   } else {
  
  sendResponse({booleanresponse:false, data:null})
}
return true; 

}





});

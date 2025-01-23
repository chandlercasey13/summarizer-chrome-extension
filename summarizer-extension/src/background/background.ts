import { tabResponseCache } from "./tabResponsesCache";


let currentTab:number;


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
    currentTab = tab.id
  }
})()



chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabResponseCache.has(tabId)){
    tabResponseCache.delete(tabId)
    
  }
 
});



//listen for tab changes

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
   currentTab = activeInfo.tabId
   

  });
});



chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id as number, "toggle");
});







chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //if we're sending a message to send the dom content, and the tab we're requesting
  //isn't already in our cache
  if (message.type === "DOM_CONTENT" && !tabResponseCache.has(currentTab)) {
    
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
  
   if (tabResponseCache.has(message.data)) {
    sendResponse({booleanresponse: true, data: tabResponseCache.get(message.data)})
   } else {
  
  sendResponse({booleanresponse:false, data:null})
}
return true; 

}





});

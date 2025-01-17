chrome.action.onClicked.addListener(function(tab){
  chrome.tabs.sendMessage(tab.id as number,"toggle");
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DOM_CONTENT") {
    const domContent = message.payload;

    console.log("Received DOM content from content script:", domContent);

    //  
    // fetch("https://your-backend-url.com/process-dom", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ domContent }),
    // })
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log("Backend response:", data);
    //     sendResponse({ status: "Success", data });
    //   })
    //   .catch((error) => {
    //     console.error("Error sending DOM to backend:", error);
    //     sendResponse({ status: "Error", error: error.message });
    //   });

   
    return true;
  }
});

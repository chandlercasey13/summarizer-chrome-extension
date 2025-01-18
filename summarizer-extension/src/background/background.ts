chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id as number, "toggle");
  
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "DOM_CONTENT") {
    const domContent = message.payload;

   // console.log("Received DOM content from content script:", domContent);

    fetch("http://localhost:3000", {
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
        let fullText = "";

        const readStream: any = () => {
          return reader.read().then(({ done, value }) => {
            if (done) {
             // console.log("Streaming complete:", fullText);
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
});

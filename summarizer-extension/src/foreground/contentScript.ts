
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_DOM") {
    const domContent = document.documentElement.innerText;


    const countWords = (text: string): number => {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };
  
  // Example usage
  const wordCount = countWords(domContent);



    if (domContent && domContent.trim() !== "") {
     console.log('bongus')
      chrome.runtime.sendMessage({ type: "DOM_CONTENT", length:
        message.length, payload: domContent , domLength:wordCount});
      sendResponse({ data: wordCount });
    }
  }

  return true;
});


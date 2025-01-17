chrome.runtime.onMessage.addListener(function(msg, sender){
    if(msg == "toggle"){
        toggle();
    }
});

const iframe = document.createElement('iframe'); 

iframe.style.height = "100%";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.transition = "width 0.5s ease";
iframe.src = chrome.runtime.getURL("js/index.html")
iframe.style.overflow = "hidden";
document.body.appendChild(iframe);

function toggle(){
    if(iframe.style.width == "0px"){
        iframe.style.width="400px";
    }
    else{
        iframe.style.width="0px";
    }
}




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "SEND_DOM") {
    
      const domContent = document.documentElement.innerText;
  
      
      chrome.runtime.sendMessage(
        { type: "DOM_CONTENT", payload: domContent },
        (response) => {
          console.log("Response from background script:", response);
        }
      );
  
     
      sendResponse({ status: "DOM sent to background script" });
  
      
      return true;
    }
  });
  
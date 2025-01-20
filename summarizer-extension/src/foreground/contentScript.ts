chrome.runtime.onMessage.addListener(function (msg, sender) {
  if (msg == "toggle") {
    toggle();
    chrome.runtime.sendMessage({ type: "EXTENSION_OPENED" });
  }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_DOM") {
    const domContent = document.documentElement.innerText;

    chrome.runtime.sendMessage({ type: "DOM_CONTENT", payload: domContent });

    sendResponse({ status: "DOM sent to background script" });

    return true;
  }
});



const iframe = document.createElement("iframe");

iframe.style.borderRadius = "10px";
iframe.style.height = "40vh";
iframe.style.width = "0px";
iframe.style.position = "fixed";
iframe.style.top = "0px";
iframe.style.right = "0px";
iframe.style.zIndex = "9000000000000000000";
iframe.style.transition = "width 0.25s ease";
iframe.src = chrome.runtime.getURL("js/index.html");
iframe.style.overflow = "visible";

iframe.style.borderColor = "tranparent";
document.body.appendChild(iframe);

function toggle() {
  if (iframe.style.width == "0px") {
    iframe.style.width = "350px";
  } else {
    iframe.style.width = "0px";
  }
}

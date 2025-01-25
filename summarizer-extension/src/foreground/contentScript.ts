// chrome.runtime.onMessage.addListener(function (msg, sender) {
//   console.log(msg)
//   if (msg == "toggle") {
//     toggle();
   
//   }
// });


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
 console.log(message.payload)

  if (message.type === "SEND_DOM") {
    const domContent = document.documentElement.innerText;

    chrome.runtime.sendMessage({ type: "DOM_CONTENT", payload: domContent });

    sendResponse({ status: "DOM sent to background script" });

    return true;
  }
});




// chrome.sidePanel.onChanged.addListener((info) => {
//   console.log("Side panel state changed:", info);
// });



// const iframe = document.createElement("iframe");

// iframe.setAttribute("allowtransparency", "true");
// iframe.style.borderRadius = "5px";
// iframe.style.height = "100vh";
// iframe.style.width = "0px";
// iframe.style.position = "fixed";
// iframe.style.top = "0px";
// iframe.style.right = "0px";
// iframe.style.zIndex = "9999";
// iframe.style.transition = "width 0.25s ease";
// iframe.src = chrome.runtime.getURL("js/index.html");
// iframe.style.overflow = "visible";
// // iframe.style.background = "rgba(255, 255, 255, 0.1)"; // Light translucent white
// // iframe.style.backdropFilter = "blur(10px)"; // Blur effect
// iframe.style.setProperty("color-scheme", "normal", "important");



// iframe.style.background = "none"

// iframe.style.border = "none";

// document.body.appendChild(iframe);

// function toggle() {
//   if (iframe.style.width == "0px") {
//     iframe.style.width = "350px";
//   } else {
//     iframe.style.width = "0px";
//   }
// }

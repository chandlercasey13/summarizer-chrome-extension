chrome.action.onClicked.addListener(function(tab){
  chrome.tabs.sendMessage(tab.id as number,"toggle");
});
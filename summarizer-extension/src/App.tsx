import { useState } from "react";
import { lineWobble } from "ldrs";
import { IoCrop } from "react-icons/io5";
lineWobble.register();

import "./styles/App.css";
import "./styles/index.css";







function App() {
  const [output, setOutput] = useState("");









  
  const handleButtonClick = async () => {
    if (!chrome?.tabs?.query) {
      console.error("Chrome tabs API is not available");
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab?.id) {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "SEND_DOM", payload: "Request to fetch DOM" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
          } else {
            console.log("Response from content script:", response);
          }
        }
      );
    } else {
      console.error("No active tab or tab ID found.");
    }
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "STREAM_CHUNK") {
      setOutput((prevOutput) => {
        if (prevOutput.includes(message.data)) {
        
          return prevOutput;
        }
        return prevOutput + message.data;
      });
    } else if (message.type === "STREAM_COMPLETE") {
      console.log("Streaming complete:", message.data);
    } else if (message.type === "ERROR") {
      console.error("Error received from background:", message.error);
    }
  });

  return (
    <>
      <div className="flex flex-col justify-start items-center  h-full overflow-hidden pointer-events-auto">
        {/* <l-line-wobble
        size="80"
        stroke="5"
        bg-opacity="0.1"
        speed="1.75" 
        color="white" 
      ></l-line-wobble> */}
        <div className="flex justify-center items-center mb-5 ">
          <IoCrop className="w-[10rem] h-20" color="white" />
        </div>
        <button
          className="bg-white px-2  rounded-xl font-semibold mb-3 pointer-events-auto z-50"
          onClick={handleButtonClick}
        >
          Summarize
        </button>

        <div className="text-white w-3/4">{output}</div>
      </div>
    </>
  );
}

export default App;

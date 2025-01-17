import { useState, useEffect } from "react";
import { lineWobble } from "ldrs";
import { IoCrop } from "react-icons/io5";
lineWobble.register();

import "../styles/index.css";
import "../styles/App.css";
import TypingAnimation from "../components/ui/typing-animation";
import { motion } from "motion/react";

function App() {
  const [output, setOutput] = useState("");
  const [extensionOpened, setExtensionOpened] = useState(false);
  const [animationPlayedOnce, setAnimationPlayedOnce] = useState(false);
  const [currentActiveTabId, setCurrentActiveTabId] = useState(0);

  useEffect(() => {
    //get currentTab that user is in
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
        setCurrentActiveTabId(tab.id);
      }
    })();

    const messageListener = (message: any) => {
      if (message.type === "EXTENSION_OPENED" && !extensionOpened) {
        console.log("logoMoved");
        setAnimationPlayedOnce(true);
        setExtensionOpened((prev) => !prev);
      } else if (message.type === "STREAM_COMPLETE") {
        setOutput(message.data);

        console.log("AI Response Finished");

        //when done with ai response, set cache with tab id and response
      } else if (message.type === "ERROR") {
        console.error("Error received from background:", message.error);
      }
    };

    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      setCurrentActiveTabId(activeInfo.tabId);

      //if we switch tabs, we want the output state to be the previously cached response
      chrome.runtime.sendMessage(
        { type: "TAB_IN_CACHE", data: activeInfo.tabId },
        (response) => {
          console.log(response.data);
          console.log("response tabChange");
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
          } else {
            //if not, send the DOM and get a response
            if (response.booleanresponse === false) {
              console.log("trying to send");
              chrome.tabs.sendMessage(
                currentActiveTabId,
                { type: "SEND_DOM", payload: "Request to fetch DOM" },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error("Error:", chrome.runtime.lastError.message);
                  }
                }
              );
            } else {
              console.log("resdata", response.data);
              setOutput(response.data);
            }
          }
        }
      );
    };

    chrome.runtime.onMessage.addListener(messageListener);
    chrome.tabs.onActivated.addListener(handleTabActivated);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      chrome.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, []);

  useEffect(() => {

    //if we press the chrome extension
    if (extensionOpened) {
      //do we have the tab's response cached in the background.ts?
      chrome.runtime.sendMessage(
        { type: "TAB_IN_CACHE", data: currentActiveTabId },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
          } else {
          
            //if not, send the DOM and get a response
            if (response.booleanresponse === false) {
              chrome.tabs.sendMessage(
                currentActiveTabId,
                { type: "SEND_DOM", payload: "Request to fetch DOM" },
                (response) => {
                  if (chrome.runtime.lastError) {
                    console.error("Error:", chrome.runtime.lastError.message);
                  } 
                }
              );
            } else {
              setOutput(response.data);
            }
          }
        }
      );
    }
  }, [extensionOpened]);

  return (
    <>
      <motion.div
        className="relative flex flex-col justify-center items-center "
        initial={false}
        animate={{
          minHeight: animationPlayedOnce ? "20vh" : "100vh",

  
        }}
        transition={{
          delay: 1,
          duration: 1,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className="absolute top-0 h-full w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto pointer-events-auto "
          style={{
            margin: "0 auto",
          }}
          initial={false}
          animate={{
            scale: animationPlayedOnce ? 0.4 : 1,
            left: animationPlayedOnce ? -120 : 0,
          
          }}
          transition={{
            delay: 1,
            duration: 1,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="flex w-[10rem] h-[4rem]  justify-center items-center  "
            initial={false}
            animate={{
              marginBottom: animationPlayedOnce ? "0rem" : ".5rem",
              width: animationPlayedOnce ? "6rem" : "10rem",
              height: animationPlayedOnce ? "4.5rem" : "6rem",
            }}
            transition={{
              delay: 1,
              duration: 1,
              ease: "easeInOut",
            }}
          >
            <IoCrop className="w-full h-full" color="white" />
          </motion.div>
  
        </motion.div>

        {extensionOpened && (
          <motion.div
            className="absolute right-12 opacity-0"
            animate={{ opacity: 100 }}
            transition={{
              delay: 0.5,
              duration: 1,
              ease: "easeInOut",
            }}
          >
          
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className=" scrollbar-container mx-1 flex flex-col justify-start items-center overflow-y-auto"
        initial={false}
        animate={{
          minWidth: "100vw",
          minHeight: animationPlayedOnce ? "80vh" : "0",
          height: animationPlayedOnce ? "80vh" : "0",
          
        }}
        transition={{
          delay: 0,
          duration: 1,
          ease: "easeInOut",
        }}
      >
        <TypingAnimation
          startOnView={false}
          duration={0.3}
          className=" text-white w-5/6 text-md font-normal pb-4"
        >
          {output}
        </TypingAnimation>
      </motion.div>
    </>
  );
}

export default App;

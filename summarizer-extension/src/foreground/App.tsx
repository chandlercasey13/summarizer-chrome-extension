import { useState, useEffect } from "react";
import { lineWobble } from "ldrs";
import { IoCrop } from "react-icons/io5";
import { Slider } from "../components/ui/slider";
import CopyButton from "../components/ui/copy-button";

lineWobble.register();

import { quantum } from "ldrs";

quantum.register();

// Default values shown

import { ring } from "ldrs";

ring.register();

import "../styles/index.css";
import "../styles/App.css";
import TypingAnimation from "../components/ui/typing-animation";
import { motion } from "motion/react";
import { TbCopy } from "react-icons/tb";

function App() {
  const [output, setOutput] = useState("");
  const [extensionOpened, setExtensionOpened] = useState(false);
  const [isExtensionOpenedInCurrentTab, setIsExtensionOpenedInCurrentTab] =
    useState(false);
  const [animationPlayedOnce, setAnimationPlayedOnce] = useState(false);
  const [currentActiveTabId, setCurrentActiveTabId] = useState(0);

  const [hasTextAnimated, setHasTextAnimated] = useState(false);

  useEffect(() => {
    //connect the sidepanel actions to the background
    chrome.runtime.connect({ name: "sidebar" });

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
        setCurrentActiveTabId(tab.id);
      }
    })();

    const messageListener = (
      message: any,
      sender: chrome.runtime.MessageSender
    ) => {
      //when press button, toggle extension open, send the current tab back to backgroun
      if (message.type === "EXTENSION_OPENED" && !extensionOpened) {
        setAnimationPlayedOnce(true);
        setExtensionOpened((prev) => !prev);

        //this is for telling the background what tab the extension is being opened in
      } else if (message.type === "STREAM_COMPLETE") {
        setOutput(message.data);

        //when done with ai response, set cache with tab id and response
      } else if (message.type === "IS_EXTENSION_OPEN_IN_CURRENT_TAB") {
        setIsExtensionOpenedInCurrentTab(message.data);
      }
    };

    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      setCurrentActiveTabId(activeInfo.tabId);
      setOutput("");

      //if we switch tabs, we want the output state to be the previously cached response

      //need a place that stores where all extensions are opened
    };

    chrome.runtime.onMessage.addListener(messageListener);
    chrome.tabs.onActivated.addListener(handleTabActivated);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
      chrome.tabs.onActivated.removeListener(handleTabActivated);
    };
  }, []);

  //everytime extension is opened or closed

  let timeoutId: any;


  useEffect(() => {
    //this function allows for extra time when the extension is open,
    //and the webpage is still loading
    const sendDomWithRetries = (tabId: number, retries = 3) => {
      chrome.tabs.sendMessage(
        tabId,
        { type: "SEND_DOM", payload: "Request to fetch DOM" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
          }
        }
      );
    };

    //if we pressed the chrome extension
    //do we have the tab's response cached in the background.ts?

    //need something to ask : is there an extension in this tab im in right NOW?




  clearTimeout(timeoutId)
  setOutput('')
  





  timeoutId = setTimeout(()=> {


    chrome.runtime.sendMessage(
      { type: "IS_EXTENSION_OPEN_IN_CURRENT_TAB", data: currentActiveTabId },
      (response) => {
        if (chrome.runtime.lastError) {
        } else {
          if (response.booleanresponse === false) {
            return;
          } else {
            chrome.runtime.sendMessage(
              { type: "IS_TAB_IN_CACHE", data: currentActiveTabId },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error("Error:", chrome.runtime.lastError.message);
                } else {
                  //if not, send the DOM and get a response
                  if (response.booleanresponse === false) {
                    sendDomWithRetries(currentActiveTabId);
                  } else {
                    //ensures text only animates when the response is NOT in cache
                    setHasTextAnimated(true);
                    //setOutput(`${isExtensionOpenedInCurrentTab}`)
                    setOutput(response.data);
                  }
                }
              }
            );
          }
        }
      }
    );

  }, 500)





  }, [currentActiveTabId, extensionOpened]);

  return (
    <>
      <motion.div
        className="relative flex flex-col justify-center items-center bg-black w-full px-[1.6rem]"
        initial={false}
        animate={{
          minHeight: animationPlayedOnce ? "15vh" : "100vh",
          
         
        }}
        transition={{
          delay: 1,
          duration: 1,
          ease: "easeInOut",
        }}
      >
        <motion.div
          className=" bg-transparent absolute -top-3  h-full w-full  flex justify-center items-center   overflow-x-hidden overflow-y-hidden  "
          style={{
            margin: "0 auto",
          }}
          initial={false}
          animate={{
            scale: animationPlayedOnce ? 1 : 1,
            left: animationPlayedOnce ? -25 : 0,
            
          }}
          transition={{
            delay: 1,
            duration: 1,
            ease: "easeInOut",
          }}
        >
          //w-10rem
          <motion.div
            className=" relative flex w-1/2 h-full bg-transparent justify-start items-center  "
            initial={false}
            animate={{
              marginBottom: animationPlayedOnce ? "0rem" : ".5rem",
              width: animationPlayedOnce ? "50%" : "auto",
              minWidth: "4rem"
              // height: animationPlayedOnce ? "3rem" : "6rem",
            }}
            transition={{
              delay: 1,
              duration: 1,
              ease: "easeInOut",
            }}
          >
          <motion.div className=" absolute left-0 w-[3rem] h-[4rem] overflow-hidden"
           initial={false}
           animate={{
             width: animationPlayedOnce ? "3rem" : "6rem",
             height: animationPlayedOnce ? "4rem" : "6rem",
           }}
           transition={{
             delay: 1,
             duration: 1,
             ease: "easeInOut",
           }}>

            <IoCrop className="w-full h-full overflow-hidden" color="white" />
          
          </motion.div>
          </motion.div>


          //w-4.5rem 
          <motion.div
            className=" relative flex w-1/2 h-[2.5rem]  text-md  text-white justify-end items-center overflow-hidden rounded-md p-1    "
            initial={false}
            animate={{
              opacity: animationPlayedOnce ? 1 : 0,
              width: animationPlayedOnce ? "50%" : "0%",
            }}
            transition={{
              delay: 1,
              duration: 1,
              ease: "easeInOut",
            }}
          >
           <CopyButton textToCopy={output}/>
          
            
          </motion.div>

        </motion.div>

        <motion.div
          className=" bg-transparent absolute -top-3 h-full w-full flex  justify-end items-center overflow-x-hidden overflow-y-auto  "
          style={{
            margin: "0 auto",
          }}
          initial={false}
         
          transition={{
            delay: 1,
            duration: 1,
            ease: "easeInOut",
          }}
        >







        </motion.div>

        <motion.div
          className=" text-white font-extralight absolute bottom-1 px-[1.6rem] w-full flex flex-col items-center justify-center  "
          initial={false}
          animate={{
            opacity: animationPlayedOnce ? 1 : 0,
          }}
          transition={{
            delay: 2,
            duration: 0.5,
            ease: "easeInOut",
          }}
        >
          <div className="min-w-full flex justify-between items-center">
            <p className=" font-[Inter] w-1/2 flex justify-start items-center">
              shorter
            </p>
            <p className=" font-[Inter] w-1/2 flex justify-end items-center">
              longer
            </p>
          </div>

          <Slider
            className="  w-full rounded-lg mt-2"
            defaultValue={[100]}
            max={300}
            step={100}
          />
        </motion.div>

        {/* {extensionOpened && (
          <motion.div
            className="absolute right-12 opacity-0 bg-black"
            animate={{ opacity: 100 }}
            transition={{
              delay: 0.5,
              duration: 1,
              ease: "easeInOut",
            }}
          ></motion.div>
        )} */}
      </motion.div>

      <motion.div
        className=" scrollbar-container overflow-hidden bg-transparent pb-4  px-[1.6rem] flex flex-col justify-start items-center overflow-y-auto"
        initial={false}
        animate={{
          minWidth: "100%",
          minHeight: animationPlayedOnce ? "85vh" : "0",
          height: animationPlayedOnce ? "85vh" : "0",
        }}
        transition={{
          delay: 0,
          duration: 1,
          ease: "easeInOut",
        }}
      >
        {!hasTextAnimated ? (
          output ? (
            <div className=" rounded-br-sm overflow-hidden rounded-bl-sm w-full flex justify-center items-center bg-transparent pb-4">
              <TypingAnimation
                startOnView={false}
                duration={5}
                className="font-[Inter]  text-white w-full min-h-10  text-[.85rem] font-light pt-5 pb-4 bg-transparent"
              >
                {output}
              </TypingAnimation>
            </div>
          ) : (
            <div className="h-[80%] w-full  flex justify-center items-center">
              <l-quantum size="60" speed="1.75" color="white"></l-quantum>
            </div>
          )
        ) : output ? (
          <div className="rounded-br-sm overflow-hidden rounded-bl-sm w-full flex justify-center items-center bg-transparent pb-4">
            <div className="font-[Inter]  text-white w-full min-h-10  text-[.85rem] font-light pt-5 pb-4 bg-transparent">
              {output}
            </div>
          </div>
        ) : (
          <div className="h-[80%] w-full  flex justify-center items-center">
            <l-quantum size="60" speed="1.75" color="white"></l-quantum>
          </div>
        )}

        {/* {output && (
          <motion.div
            className="h-2 w-5/6 border-[1px] border-white/30 border-l-0 border-r-0 border-b-0  "
            initial={false}
            animate={{
              opacity: output ? 1 : 0,
            }}
            transition={{
              delay: 0,
              duration: 2,
              ease: "easeInOut",
            }}
          >
            <p className=" text-center text-white/30 mt-1 font-light ">
              This summary is 50% shorter than the original text
            </p>
          </motion.div>
        )} */}
      </motion.div>
    </>
  );
}

export default App;

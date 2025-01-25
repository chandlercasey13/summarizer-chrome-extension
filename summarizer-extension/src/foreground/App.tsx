import { useState, useEffect } from "react";
import { lineWobble } from "ldrs";
import { IoCrop } from "react-icons/io5";
import { Slider } from "../components/ui/slider"

lineWobble.register();

import "../styles/index.css";
import "../styles/App.css";
import TypingAnimation from "../components/ui/typing-animation";
import { motion } from "motion/react";
import { TbCopy } from "react-icons/tb";

function App() {
  const [output, setOutput] = useState("");
  const [extensionOpened, setExtensionOpened] = useState(false);
  const [animationPlayedOnce, setAnimationPlayedOnce] = useState(false);
  const [currentActiveTabId, setCurrentActiveTabId] = useState(0);
  const [hasTextAnimated, setHasTextAnimated]=useState(false);

  useEffect(() => {

    const port = chrome.runtime.connect({ name: "sidebar" });

    // Optionally, listen for messages from the background
    port.onMessage.addListener((message) => {
        console.log("Message from background:", message);
    });
    
    // Send a message to the background script
    port.postMessage({ greeting: "Hello from the sidebar!" });



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

    const messageListener = (message: any) => {
      if (message.type === "EXTENSION_OPENED" && !extensionOpened) {
        setAnimationPlayedOnce(true);
       
        setExtensionOpened((prev) => !prev);
      } else if (message.type === "STREAM_COMPLETE") {
        setOutput(message.data);


        //when done with ai response, set cache with tab id and response
      } else if (message.type === "ERROR") {
        console.error("Error received from background:", message.error);
      }
    };

    const handleTabActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
      
      setCurrentActiveTabId(activeInfo.tabId);
      setOutput('')

      //if we switch tabs, we want the output state to be the previously cached response
    
      chrome.runtime.sendMessage(
        { type: "TAB_IN_CACHE", data: activeInfo.tabId },
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
            
              //ensures text only animates when the response is NOT in cache
              setHasTextAnimated(true)
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

//everytime extension is opened or closed
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
               //ensures text only animates when the response is NOT in cache
              setHasTextAnimated(true)
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
        className="relative flex flex-col justify-center items-center bg-black"
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
          className=" bg-transparent absolute -top-2  h-full w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto pointer-events-auto "
          style={{
            margin: "0 auto",
          }}
          initial={false}
          animate={{
            scale: animationPlayedOnce ? 0.4 : 1,
            left: animationPlayedOnce ? -125 : 0,
          
          }}
          transition={{
            delay: 1,
            duration: 1,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="flex w-[10rem] h-[4rem] bg-transparent  justify-center items-center overflow-hidden  "
            initial={false}
            animate={{
              marginBottom: animationPlayedOnce ? "0rem" : ".5rem",
              width: animationPlayedOnce ? "10rem" : "10rem",
              height: animationPlayedOnce ? "10rem" : "6rem",
            }}
            transition={{
              delay: 1,
              duration: 1,
              ease: "easeInOut",
            }}
          >
            <IoCrop className="w-full h-full overflow-hidden" color="white" />
            
          </motion.div>
          </motion.div>








          <motion.div
          className=" bg-transparent absolute -top-2 h-full w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto pointer-events-auto "
          style={{
            margin: "0 auto",
          }}
          initial={false}
          animate={{
            scale: animationPlayedOnce ? 1 : 1,
            right:  -110
          
          }}
          transition={{
            delay: 1,
            duration: 1,
            ease: "easeInOut",
          }}
        >
  <motion.div  
   className="flex w-[4.5rem] h-[1.75rem]  text-md bg-transparent text-white justify-center items-center overflow-hidden rounded-md p-1 pr-2  hover:bg-white/50   "
   initial={false}
   animate={{
    opacity :animationPlayedOnce ? 1 : 0,
    
    
   }}
   transition={{
     delay: 2,
     duration: .5,
     ease: "easeInOut",
   }} >
    <button className=" font-[Inter] flex justify-center items-center text-white font-light w-full h-full ">
<TbCopy className="flex items-center w-full h-full" color="white"> 
  </TbCopy>
  Copy
  </button>
</motion.div>
        </motion.div>
        
        
        
        
        
        
        
        <motion.div  className=" text-white font-extralight absolute bottom-1 w-5/6 flex flex-col items-center justify-center  "
   initial={false}
   animate={{
    opacity :animationPlayedOnce ? 1 : 0,
    
    
   }}
   transition={{
     delay: 2,
     duration: .5,
     ease: "easeInOut",
   }} >
    <div className="min-w-full flex justify-between items-center">
      <p className=" font-[Inter] w-1/2 flex justify-start items-center">shorter</p>
      <p className=" font-[Inter] w-1/2 flex justify-end items-center">longer</p>
     
     </div>  
       
        <Slider className="  w-full rounded-lg mt-2" defaultValue={[200]} max={400} step={100}/>
        
        </motion.div>







        {extensionOpened && (
          <motion.div
            className="absolute right-12 opacity-0 bg-black"
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
        className=" scrollbar-container overflow-hidden bg-black pb-4 flex flex-col justify-start items-center overflow-y-auto"
        initial={false}
        animate={{
          minWidth: "100vw",
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
  <div className=" rounded-br-sm overflow-hidden rounded-bl-sm w-full flex justify-center items-center bg-black pb-4">
 <TypingAnimation
 startOnView={false}
 duration={5}
 className="font-[Inter] leading-[6rem] text-white w-5/6 text-[.85rem] font-light pt-4 pb-4 bg-black"
>
 {output}
</TypingAnimation>
</div>
) 
:
(
  <div className="w-full flex justify-center items-center overflow-hidden bg-black rounded-sm">
<div  className="font-[Inter] leading-[6rem] text-white w-5/6 text-[.85rem] font-light pb-4 bg-black"
>{output}</div>
</div>

)}




<motion.div
 className="h-2 w-5/6 border-[1px] border-white/30 border-l-0 border-r-0 border-b-0  "
 initial={false}
 animate={{
  opacity :animationPlayedOnce ? 1 : 0,
   
 }}
 transition={{
   delay: 2,
   duration: .5,
   ease: "easeInOut",
 }}>


</motion.div>
       
      </motion.div>
      
    </>
  );
}

export default App;

import { useState, useEffect, useRef, useCallback } from "react";

import { IoCrop } from "react-icons/io5";
import { Slider } from "../components/ui/slider";
import CopyButton from "../components/ui/utility-buttons";
import { TextAnimate } from "../components/ui/text-animate";
import { quantum } from "ldrs";

quantum.register();


import "../styles/index.css";
import "../styles/App.css";
import TypingAnimation from "../components/ui/typing-animation";
import { motion } from "motion/react";
import { SlidersVertical } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
function App() {
  const [output, setOutput] = useState("");
  const [extensionToggle, setExtensionToggle] = useState(false);
 
  const [animationPlayedOnce, setAnimationPlayedOnce] = useState(false);
  const [currentActiveTabId, setCurrentActiveTabId] = useState(0);
  const [sliderValue, setSliderValue] = useState([100]); // Store the slider value

  
  const [hasTextAnimated, setHasTextAnimated] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete]=useState(false)

  const [domWordCount , setDomWordCount]=useState(0)


  const hasCompleted = useRef(false);




const handleResetSummary= function() {
setHasTextAnimated(false)
setOutput('')

//delete entry in cache
chrome.runtime.sendMessage(
  { type: "DELETE_TAB_IN_CACHE", data: currentActiveTabId, length:sliderValue[0]},
 
);

setExtensionToggle((prev)=> !prev)




}





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
      if (message.type === "EXTENSION_OPENED") {
        setAnimationPlayedOnce(true);
        setCurrentActiveTabId(message.tab)

        //this is for telling the background what tab the extension is being opened in
      } else if (message.type === "STREAM_COMPLETE") {
        
        setOutput(message.data);


        //when done with ai response, set cache with tab id and response
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


  const sendDomWithRetries = (tabId: number, length:number, retries = 3) => {
    chrome.tabs.sendMessage(
      tabId,
      { type: "SEND_DOM", length:length },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error:", chrome.runtime.lastError.message);
        }
       
        setDomWordCount(response.data)
      }
    );
  };




useEffect(()=> {


  chrome.runtime.sendMessage(
    { type: "IS_TAB_IN_CACHE", data: currentActiveTabId, length:sliderValue[0]},
    (response) => {
      
      if (chrome.runtime.lastError) {
        console.error("Error:", chrome.runtime.lastError.message);
       
      } else {
        //if not, send the DOM and get a response
        if (response.booleanresponse === false) {
         
          sendDomWithRetries(currentActiveTabId, sliderValue[0]);
        } else {
          //ensures text only animates when the response is NOT in cache
          setHasTextAnimated(true);
          setTextAnimationComplete(true)
          setDomWordCount(response.tabDomContentLength)
      
          setOutput(response.data);
        }
      }
    }
  );

}, [extensionToggle])

  useEffect(() => {
    setTextAnimationComplete(false)
  clearTimeout(timeoutId)
  setOutput(``)
  
  timeoutId = setTimeout(()=> {


    chrome.runtime.sendMessage(
      { type: "IS_EXTENSION_OPEN_IN_CURRENT_TAB", data: currentActiveTabId },
      (response) => {
        if (chrome.runtime.lastError) {
        } else {
          if (response.booleanresponse === false) {
            return;
          } else {
            setExtensionToggle((prev) => !prev);

          }
        }
      }
    );

  }, 500)

  return () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
  };

  }, [currentActiveTabId, sliderValue]);




  const onAnimationComplete=  
    useCallback(()=> {
      setTextAnimationComplete(true)
                      },[])
                    
  



  //set current active within that useeffect, IF extension is open in tab , then set state of extension opened, 
  // that will set another useeffect that then retrieve

  return (
    <>
    
      <motion.div
        className="relative flex flex-col justify-center items-center bg-black w-full px-[1.3rem]"
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
            className=" relative flex w-full h-full bg-transparent justify-start items-center  "
            initial={false}
            animate={{
              marginBottom: animationPlayedOnce ? "0rem" : ".5rem",
              width: animationPlayedOnce ? "50%" : "auto",
              minWidth: "4rem"
             
            }}
            transition={{
              delay: 1,
              duration: 1,
              ease: "easeInOut",
            }}
          >
          <motion.div className=" absolute flex justify-center items-center  w-[3rem] h-[4rem] overflow-hidden"
           initial={false}
           animate={{
             width: animationPlayedOnce ? "3rem" : "8rem",
             height: animationPlayedOnce ? "4rem" : "6rem",
             left: animationPlayedOnce ? "none" : "-3rem",
           }}
           transition={{
             delay: 1,
             duration: 1,
             ease: "easeInOut",
           }}>

            <IoCrop className=" relative w-full h-full overflow-hidden" color="white" />
          
          </motion.div>
          </motion.div>


        
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
           <CopyButton textToCopy={output} handleResetSummary={handleResetSummary}/>
          
            
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
          className=" text-white font-extralight absolute bottom-1 px-[1.3rem] w-full flex flex-col items-center justify-center  "
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
            value = {sliderValue}
            onValueChange={setSliderValue}
          />
        </motion.div>

      
      </motion.div>

      <motion.div
        className=" scrollbar-container overflow-auto bg-transparent pb-4  px-[1.3rem] flex flex-col justify-start items-center overflow-y-auto"
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
            <div className=" scrollbar-container rounded-br-sm orounded-bl-sm w-full flex flex-col justify-start items-center bg-transparent  pb-4">
             


             {/* "fadeIn"
  | "blurIn"
  | "blurInUp"
  | "blurInDown"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleUp"
  | "scaleDown" */}




              <ReactMarkdown className="font-[Inter] overflow-hidden text-white w-full min-h-10  text-[.85rem] font-light pt-5 pb-2 bg-transparent"
               remarkPlugins={[remarkGfm]}
               components={{
                
                 h1: ({ children }) => <h1 className="text-xl font-black mb-2 mt-2">{children}</h1>,
                 h2: ({ children }) => <h2 className="text-base font-bold mt-4 mb-2 ">{children}</h2>,
                 strong: ({ children }) => <p className=" text-sm font-medium mt-4 mb-1 ">{children}</p>,
               
               }}
              >
      {output}
      </ReactMarkdown>
 


{/* 
              <TypingAnimation
                startOnView={false}
                duration={5}
                className="font-[Inter]  text-white w-full min-h-10  text-[.85rem] font-light pt-5 pb-4 bg-transparent"
              >
                {output}
              </TypingAnimation> */}
            </div>
          ) : (
            <div className="h-[80%] w-full  flex justify-center items-center">
              <l-quantum size="60" speed="1.75" color="white"></l-quantum>
            </div>
          )
        ) : output ? (
          <div className=" scrollbar-container rounded-br-sm  rounded-bl-sm w-full flex flex-col  justify-start items-center bg-transparent pb-4">
            <div className="font-[Inter]  text-white w-full min-h-10  text-[.85rem] font-light pt-5 pb-4 bg-transparent">
              {output}
            </div>
          </div>
        ) : (
          <div className="h-[80%] w-full  flex justify-center items-center">
            <l-quantum size="60" speed="1.75" color="white"></l-quantum>
          </div>
        )}

      {textAnimationComplete && ( <motion.div
            className="h-2 w-full border-[1px] border-white/30 border-l-0 border-r-0 border-b-0 pb-8  "
            initial={{ opacity: 0 }}
            animate={{
              opacity: textAnimationComplete? 1:0,
            }}
            transition={{
              delay: 0,
              duration: 1,
              ease: "easeInOut",
            }}
          >
            <p className=" text-center text-white/30 mt-1 font-light ">
            
              This summary is {domWordCount > 0 
  ? Math.floor((1 - ((sliderValue[0] + 100) / domWordCount)) * 100) 
  : 0}% shorter than the original text
            </p>
          </motion.div>)}
         
   
      </motion.div>
    </>
  );
}

export default App;

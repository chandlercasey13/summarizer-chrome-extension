import { useState, useEffect } from "react";
import { lineWobble } from "ldrs";
import { IoCrop } from "react-icons/io5";
lineWobble.register();
import { TextAnimate } from "./components/ui/text-animate";
import "./styles/App.css";
import "./styles/index.css";
import TypingAnimation from "./components/ui/typing-animation";
import { motion } from "motion/react"
import { MonitorStopIcon } from "lucide-react";
import  DiscreteSlider from "./components/ui/slider"
import { ShimmerButton } from "./components/ui/shimmer-button";


function App() {
  const [output, setOutput] = useState("");
  const [logoMoved, setLogoMoved] =useState(false)



  const handleButtonClick = async () => {
    setLogoMoved(true)








    if (!chrome?.tabs?.query) {
      console.error("Chrome tabs API is not available");
      return;
    }
   
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (tab?.id) {
     
      chrome.tabs.sendMessage(
        tab.id,
        { type: "SEND_DOM", payload: "Request to fetch DOM" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
          } else {
           // console.log("Response from content script:", response);
          }
        }
      );
    } else {
      console.error("No active tab or tab ID found.");
    }
  };

  useEffect(() => {
    const messageListener = (message: any) => {
      if (message.type === "CHANGE_LOGOMOVED" && !logoMoved) {
        console.log("call");
        setLogoMoved(true);
      }
  
      if (message.type === "STREAM_CHUNK") {
        setOutput((prevOutput) => {
          if (prevOutput.includes(message.data)) {
            return prevOutput;
          }
          return prevOutput + message.data;
        });
      } else if (message.type === "STREAM_COMPLETE") {
        // console.log("Streaming complete:", message.data);
      } else if (message.type === "ERROR") {
        console.error("Error received from background:", message.error);
      }
    };
  
    chrome.runtime.onMessage.addListener(messageListener);
  
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  return (
    <>
 
    
      


<motion.div className="relative flex flex-col justify-center items-center "
 initial={false}
 animate={{
  
  minHeight: logoMoved ? "20vh": "100vh",
 
  // x: logoMoved ? -100 : 0,
  // y: logoMoved ? -100 : 0, 
 // Move the div horizontally when isMoved is true
}}
transition={{
  delay:1,
  duration: 1, 
  ease: "easeInOut", 
}}>
      <motion.div  className="absolute top-0 h-full w-full flex flex-col justify-center items-center overflow-x-hidden overflow-y-auto pointer-events-auto "
       style={{
        
          margin: "0 auto",
        }}
        initial={false}
        animate={{
       
         scale: logoMoved? .4: 1,
         left: logoMoved ? -120 : 0,
         //top: logoMoved? 0: 10,
          // y: logoMoved ? -100 : 0, 
         
        }}
        transition={{
          delay:1,
          duration: 1,
          ease: "easeInOut", 
        }}
      
      >
        <motion.div className="flex w-[10rem] h-[4rem]  justify-center items-center  "
          
          initial={false}
          animate={{
            marginBottom: logoMoved? "0rem" : ".5rem",
width: logoMoved? '6rem': '10rem',
height: logoMoved? '4.5rem': '6rem',
          }}
          transition={{
            delay:1,
            duration: 1,
            ease: "easeInOut", 
          }}>
          <IoCrop className="w-full h-full" color="white" />




        </motion.div>
        {/* {!logoMoved && (<ShimmerButton
          className="bg-white px-2 py-1  rounded-xl font-bold font-md  mb-3 pointer-events-auto z-50"
          onClick={handleButtonClick}
         
          shimmerSize=".05em"
        >
          Summarize
        </ShimmerButton>)} */}
        
      





      </motion.div>


{logoMoved && (
  <motion.div className="absolute right-12 opacity-0"
  animate={{opacity:100 }}

  transition={{
    delay:0.5,
    duration: 1, 
    ease: "easeInOut", 
  }}


  
  >
  {/* <DiscreteSlider /> */}
  </motion.div>
  )}      

</motion.div>



<motion.div 
className=" scrollbar-container mx-1 flex flex-col justify-start items-center overflow-y-auto"
initial={false}
animate={{
  
  minWidth: "100vw",
  minHeight: logoMoved ? "80vh": "0",
  height : logoMoved ? "80vh" : "0",
  // x: logoMoved ? -100 : 0,
  // y: logoMoved ? -100 : 0, 
 
}}
transition={{
  delay:0,
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

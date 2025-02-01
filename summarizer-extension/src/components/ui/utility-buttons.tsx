import React, {useState} from "react";
import { TbCopy } from "react-icons/tb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"

import { MdOutlineRestartAlt } from "react-icons/md";


interface CopyButtonProps {
  textToCopy: string; 
  handleResetSummary: () => void;
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, handleResetSummary }) => {
  const [copyMessage, setCopyMessage] =useState('Copy')
  const handleCopy = () => {
setCopyMessage('Copied!')

setTimeout(()=>{
  setCopyMessage('Copy')
},2000)
    navigator.clipboard
      .writeText(textToCopy)
     
  };

  return (
    <div className="absolute h-full w-full right-0 flex justify-end items-center ">
      <TooltipProvider>
    <button
      onClick={handleCopy}
      className="font-[Inter] bg-transparent  flex justify-center items-center h-8 w-8 z-50 text-white font-light p-2 mr-2 rounded-lg hover:bg-white/50"
    >
      
  <Tooltip>
    <TooltipTrigger> 
      
      
      
      <TbCopy className="w-[1.25rem] h-[1.25rem] " color="white" />
    
    
  
    
    </TooltipTrigger>
    <TooltipContent>
      <p>Copy</p>
    </TooltipContent>
  </Tooltip>

     
    
      
    </button>


    <button
    onClick={handleResetSummary}
    className="font-[Inter] bg-transparent flex  justify-center  items-center h-8 w-8 text-white font-light z-50    rounded-lg hover:bg-white/50"> 
      
      <Tooltip>
    <TooltipTrigger> 
      
      
       <MdOutlineRestartAlt className="w-[1.25rem] h-[1.25rem] "/>
      
       </TooltipTrigger>
    <TooltipContent>
      <p>Reset Summary</p>
    </TooltipContent>
  </Tooltip>



       </button>
      </TooltipProvider>
    </div>
  );
};

export default CopyButton;
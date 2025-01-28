import React, {useState} from "react";
import { TbCopy } from "react-icons/tb";


import { MdOutlineRestartAlt } from "react-icons/md";


interface CopyButtonProps {
  textToCopy: string; 
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
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
    <button
      onClick={handleCopy}
      className="font-[Inter] bg-transparent  flex justify-center items-center h-full w-10 z-50 text-white font-light p-2 mr-2 rounded-lg hover:bg-white/50"
    >
      <TbCopy className="w-[1.25rem] h-[1.25rem] " color="white" />
    
      
    </button>
    <button className="font-[Inter] bg-transparent flex  justify-center  items-center h-full w-10 text-white font-light z-50    rounded-lg hover:bg-white/50"> 
       <MdOutlineRestartAlt className="w-[1.25rem] h-[1.25rem] "/>
       </button>
    </div>
  );
};

export default CopyButton;
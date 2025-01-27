import React, {useState} from "react";
import { TbCopy } from "react-icons/tb";




interface CopyButtonProps {
  textToCopy: string; 
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy }) => {
  const [copyMessage, setCopyMessage] =useState('Copy')
  const handleCopy = () => {
setCopyMessage('Copied')
    navigator.clipboard
      .writeText(textToCopy)
     
  };

  return (
    <button
      onClick={handleCopy}
      className="font-[Inter] flex justify-center items-center text-white font-light w-full h-full"
    >
      <TbCopy className="flex items-center w-full h-full" color="white" />
      {copyMessage}
    </button>
  );
};

export default CopyButton;
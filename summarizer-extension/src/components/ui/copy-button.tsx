import { useState, useCallback } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "./button"

interface AnimatedCopyButtonProps {
  textToCopy: string
}

export function AnimatedCopyButton({ textToCopy }: AnimatedCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
  }, [textToCopy])

  return (
    <Button
      onClick={copyToClipboard}
      variant="outline"
      size="icon"
      className={`relative transition-all duration-200 ease-in-out bg-black border-black ${isCopied ? "bg-green-100 text-green-600" : ""}`}
      aria-label={isCopied ? "Copied" : "Copy to clipboard"}
    >
      <span className={` flex items-center w-full justify-center transition-opacity  duration-200 ${isCopied ? "opacity-0" : "opacity-100"}`}>
        <Copy className="h-4 w-4" />
        <p className="w-4"> Copy</p>
       
      </span>
      <span
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
          isCopied ? "opacity-100" : "opacity-0"
        }`}
      >
        <Check className="h-4 w-4" />
      </span>
    </Button>
  )
}
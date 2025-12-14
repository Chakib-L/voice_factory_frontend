"use client"

import { useState } from "react"
import { Mic, Wifi, Bot, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function FactoryVoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [operatorMessage, setOperatorMessage] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMicClick = () => {
    setIsListening(!isListening)
    // Simulate voice capture
    if (!isListening) {
      setOperatorMessage("")
      setAiResponse("")
      setIsProcessing(true)
      setTimeout(() => {
        setOperatorMessage("What is the current operating temperature of Conveyor Belt 3?")
        setIsProcessing(false)
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1425] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-teal-400">Factory Voice Assistant</h1>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm text-teal-400">
              <Wifi className="h-4 w-4" />
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-teal-400">
              <Bot className="h-4 w-4" />
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-73px)]">
        {/* Left Panel - Operator Message */}
        <div className="border-r border-gray-800 p-6 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-200">Operator Message</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${isListening ? "bg-red-500" : "bg-green-500"}`} />
                  <span className="text-sm text-gray-400">{isListening ? "Listening" : "Ready"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Microphone Button */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <Button
              onClick={handleMicClick}
              className={`w-32 h-32 rounded-full transition-all duration-300 ${
                isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-teal-500 hover:bg-teal-600"
              }`}
            >
              <Mic className="h-12 w-12 text-gray-900" />
            </Button>
            <p className="text-sm text-gray-400 mt-6">{isListening ? "Listening..." : "Click to speak"}</p>

            {/* Question Display */}
            <Card className="w-full max-w-md mt-8 bg-gray-900/50 border-gray-800 p-6">
              <p className="text-sm text-gray-500 italic font-mono">
                {operatorMessage || "Your question will appear here..."}
              </p>
            </Card>
          </div>
        </div>

        {/* Right Panel - AI Response */}
        <div className="p-6 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-teal-400">AI Response</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${isProcessing ? "bg-yellow-500 animate-pulse" : "bg-gray-600"}`}
                  />
                  <span className="text-sm text-gray-400">{isProcessing ? "Waiting" : "Idle"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Response Content */}
          <Card className="flex-1 bg-gray-900/30 border-gray-800 p-6 mb-6">
            <p className="text-sm text-gray-500 italic font-mono">{aiResponse || "AI response will appear here..."}</p>
          </Card>

          {/* Visual Output Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-teal-400">
              <BarChart3 className="w-5 h-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Visual Output</h3>
            </div>
            <Card className="bg-gray-900/30 border-gray-800 p-8 h-64 flex items-center justify-center">
              <p className="text-sm text-gray-600 text-center">Data visualizations will appear here</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

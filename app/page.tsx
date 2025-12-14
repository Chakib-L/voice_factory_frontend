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
  const [showVisual, setShowVisual] = useState(false)

  const handleMicClick = () => {
    if (!isListening) {
      // Start listening
      setIsListening(true)
      setOperatorMessage("")
      setAiResponse("")
      setShowVisual(false)
      setIsProcessing(false)

      // Simulate streaming text as user speaks
      const fullQuestion = "What is the temperature evolution on Pressure Machine 1?"
      let currentIndex = 0

      const streamInterval = setInterval(() => {
        if (currentIndex < fullQuestion.length) {
          setOperatorMessage(fullQuestion.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(streamInterval)
          setIsListening(false)
          setIsProcessing(true)

          // Show AI response after processing
          setTimeout(() => {
            setAiResponse(
              "The temperature on Pressure Machine 1 has shown an upward trend over the last 8 hours, starting at 65°C at 06:00 and reaching 85°C at 14:00. The increase is consistent with normal operating conditions during peak production hours.",
            )
            setIsProcessing(false)
            setShowVisual(true)
          }, 1500)
        }
      }, 50) // Adjust speed of text appearance
    } else {
      // Stop listening
      setIsListening(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1425] text-gray-100 w-full h-full">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 xl:px-12 xl:py-6">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          <h1 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold text-teal-400">Factory Voice Assistant</h1>
          <div className="flex items-center gap-6 xl:gap-8">
            <div className="flex items-center gap-2 text-sm xl:text-base 2xl:text-lg text-teal-400">
              <Wifi className="h-4 w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6" />
              <span>Connected</span>
            </div>
            <div className="flex items-center gap-2 text-sm xl:text-base 2xl:text-lg text-teal-400">
              <Bot className="h-4 w-4 xl:h-5 xl:w-5 2xl:h-6 2xl:w-6" />
              <span>AI Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-73px)] lg:h-[calc(100vh-73px)] xl:h-[calc(100vh-85px)] 2xl:h-[calc(100vh-97px)] max-w-[1920px] mx-auto">
        {/* Left Panel - Operator Message */}
        <div className="border-b lg:border-b-0 lg:border-r border-gray-800 p-6 xl:p-8 2xl:p-12 flex flex-col bg-[#0a1425] min-h-[50vh] lg:min-h-0">
          <div className="mb-6 xl:mb-8 2xl:mb-10">
            <div className="flex items-center gap-3 xl:gap-4 mb-2 xl:mb-3">
              <div className="w-8 h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <svg className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg xl:text-xl 2xl:text-2xl font-medium text-gray-200">Operator Message</h2>
                <div className="flex items-center gap-2 xl:gap-3 mt-1 xl:mt-2">
                  <div className={`w-2 h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 rounded-full ${isListening ? "bg-red-500" : "bg-green-500"}`} />
                  <span className="text-sm xl:text-base 2xl:text-lg text-gray-400">{isListening ? "Listening" : "Ready"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Microphone Button */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <button
              onClick={handleMicClick}
              className={`w-32 h-32 xl:w-40 xl:h-40 2xl:w-48 2xl:h-48 rounded-full transition-all duration-300 p-0 flex items-center justify-center ${
                isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-teal-500 hover:bg-teal-600"
              }`}
            >
              <Mic className="!h-20 !w-20 xl:!h-24 xl:!w-24 2xl:!h-32 2xl:!w-32 text-gray-900" strokeWidth={2.5} />
            </button>
            <p className="text-sm xl:text-base 2xl:text-lg text-gray-400 mt-6 xl:mt-8 2xl:mt-10">{isListening ? "Listening..." : "Click to speak"}</p>

            {/* Question Display */}
            <Card className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl mt-8 xl:mt-10 2xl:mt-12 !bg-gray-900/50 border-gray-800 p-6 xl:p-8 2xl:p-10">
              <p className="text-sm xl:text-base 2xl:text-lg text-gray-500 italic font-mono">
                {operatorMessage || "Your question will appear here..."}
              </p>
            </Card>
          </div>
        </div>

        {/* Right Panel - AI Response */}
        <div className="p-6 xl:p-8 2xl:p-12 flex flex-col bg-[#0a1425] min-h-[50vh] lg:min-h-0">
          <div className="mb-6 xl:mb-8 2xl:mb-10">
            <div className="flex items-center gap-3 xl:gap-4 mb-2 xl:mb-3">
              <div className="w-8 h-8 xl:w-10 xl:h-10 2xl:w-12 2xl:h-12 rounded-full bg-teal-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 xl:w-5 xl:h-5 2xl:w-6 2xl:h-6 text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg xl:text-xl 2xl:text-2xl font-medium text-teal-400">AI Response</h2>
                <div className="flex items-center gap-2 xl:gap-3 mt-1 xl:mt-2">
                  <div
                    className={`w-2 h-2 xl:w-2.5 xl:h-2.5 2xl:w-3 2xl:h-3 rounded-full ${isProcessing ? "bg-yellow-500 animate-pulse" : "bg-gray-600"}`}
                  />
                  <span className="text-sm xl:text-base 2xl:text-lg text-gray-400">{isProcessing ? "Waiting" : "Idle"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Response Content */}
          <Card className="!bg-gray-900/30 border-gray-800 p-5 xl:p-7 2xl:p-9 mb-4 xl:mb-6 2xl:mb-8 max-h-48 xl:max-h-56 2xl:max-h-64 overflow-y-auto">
            <p className="text-sm xl:text-base 2xl:text-lg text-gray-400 italic font-mono">{aiResponse || "AI response will appear here..."}</p>
          </Card>

          {/* Visual Output Section */}
          <div className="space-y-4 xl:space-y-6 2xl:space-y-8">
            <div className="flex items-center gap-2 xl:gap-3 text-teal-400">
              <BarChart3 className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" />
              <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold uppercase tracking-wider">Visual Output</h3>
            </div>
            <Card className="!bg-gray-900/30 border-gray-800 p-8 xl:p-10 2xl:p-12 h-64 xl:h-80 2xl:h-96 flex items-center justify-center">
              {showVisual ? (
                <div className="w-full h-full flex flex-col">
                  <div className="text-xs xl:text-sm 2xl:text-base text-gray-400 mb-2 xl:mb-3 2xl:mb-4">Temperature Evolution - Pressure Machine 1</div>
                  <svg viewBox="0 0 400 180" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="40" y1="20" x2="40" y2="160" stroke="#374151" strokeWidth="2" />
                    <line x1="40" y1="160" x2="380" y2="160" stroke="#374151" strokeWidth="2" />

                    {/* Y-axis labels */}
                    <text x="25" y="25" fill="#9CA3AF" fontSize="12" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
                      90°C
                    </text>
                    <text x="25" y="95" fill="#9CA3AF" fontSize="12" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
                      75°C
                    </text>
                    <text x="25" y="165" fill="#9CA3AF" fontSize="12" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
                      60°C
                    </text>

                    {/* X-axis labels */}
                    <text x="35" y="175" fill="#9CA3AF" fontSize="12" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
                      06:00
                    </text>
                    <text x="150" y="175" fill="#9CA3AF" fontSize="12" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
                      10:00
                    </text>
                    <text x="270" y="175" fill="#9CA3AF" fontSize="12" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
                      12:00
                    </text>
                    <text x="350" y="175" fill="#9CA3AF" fontSize="12" style={{ fontSize: 'clamp(10px, 1.2vw, 14px)' }}>
                      14:00
                    </text>

                    {/* Temperature line (increasing trend) */}
                    <path
                      d="M 40 145 L 100 135 L 160 120 L 220 100 L 280 75 L 340 50 L 380 35"
                      stroke="#14B8A6"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                      style={{ strokeWidth: 'clamp(3px, 0.4vw, 4.5px)' }}
                    />

                    {/* Gradient fill under line */}
                    <defs>
                      <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#14B8A6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 40 145 L 100 135 L 160 120 L 220 100 L 280 75 L 340 50 L 380 35 L 380 160 L 40 160 Z"
                      fill="url(#tempGradient)"
                    />

                    {/* Data points */}
                    <circle cx="40" cy="145" r="5" fill="#14B8A6" />
                    <circle cx="100" cy="135" r="5" fill="#14B8A6" />
                    <circle cx="160" cy="120" r="5" fill="#14B8A6" />
                    <circle cx="220" cy="100" r="5" fill="#14B8A6" />
                    <circle cx="280" cy="75" r="5" fill="#14B8A6" />
                    <circle cx="340" cy="50" r="5" fill="#14B8A6" />
                    <circle cx="380" cy="35" r="5" fill="#14B8A6" />
                  </svg>
                </div>
              ) : (
                <p className="text-sm xl:text-base 2xl:text-lg text-gray-600 text-center">Data visualizations will appear here</p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

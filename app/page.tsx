"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Mic, Wifi, Bot, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

// Some environments (or editor tooling) may not include Node typings.
declare const process: { env: Record<string, string | undefined> }

export default function FactoryVoiceAssistant() {
  const [isListening, setIsListening] = useState(false)
  const [operatorMessage, setOperatorMessage] = useState("")
  const [recognizedQuestion, setRecognizedQuestion] = useState<string | null>(null)
  const [aiResponse, setAiResponse] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [pipelineStatus, setPipelineStatus] = useState<string | null>(null)
  const [backendOk, setBackendOk] = useState<boolean | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [visualizationSrc, setVisualizationSrc] = useState<string | null>(null)
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [typedQuestion, setTypedQuestion] = useState("")

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const backendBaseUrl = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"
    return raw.replace(/\/+$/, "")
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch(`${backendBaseUrl}/health`, { cache: "no-store" })
        if (!cancelled) setBackendOk(r.ok)
      } catch {
        if (!cancelled) setBackendOk(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [backendBaseUrl])

  const decodeApiError = async (r: Response) => {
    try {
      const data = await r.json()
      if (typeof data?.detail === "string") return data.detail
      return JSON.stringify(data)
    } catch {
      return await r.text()
    }
  }

  const applyBackendResponse = (data: any) => {
    setAiResponse(typeof data?.answer_text === "string" ? data.answer_text : "")
    setRecognizedQuestion(typeof data?.question_text === "string" ? data.question_text : null)
    if (typeof data?.question_text === "string" && data.question_text.trim()) {
      setOperatorMessage(data.question_text.trim())
    }

    const viz = data?.visualization
    if (viz?.image_base64) {
      const mime = viz?.mime_type || "image/png"
      setVisualizationSrc(`data:${mime};base64,${viz.image_base64}`)
    } else {
      setVisualizationSrc(null)
    }

    const aud = data?.audio
    if (aud?.audio_base64) {
      const mime = aud?.mime_type || "audio/wav"
      setAudioSrc(`data:${mime};base64,${aud.audio_base64}`)
    } else {
      setAudioSrc(null)
    }
  }

  useEffect(() => {
    if (!audioSrc) return
    // Best-effort autoplay; browsers may block depending on user gesture policy.
    const el = audioRef.current
    if (!el) return
    try {
      el.currentTime = 0
      const p = el.play()
      if (p && typeof (p as any).catch === "function") (p as any).catch(() => {})
    } catch {}
  }, [audioSrc])

  const sendTextToBackend = async (text: string) => {
    const r = await fetch(`${backendBaseUrl}/v1/voice-factory/answer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, include_audio: true }),
    })
    if (!r.ok) throw new Error(await decodeApiError(r))
    return await r.json()
  }

  const sendAudioToBackend = async (audioBlob: Blob) => {
    const form = new FormData()
    form.append("transcript_level", "turn")
    form.append("audio", new File([audioBlob], "question.webm", { type: audioBlob.type || "audio/webm" }))

    const r = await fetch(`${backendBaseUrl}/v1/voice-factory/stt`, {
      method: "POST",
      body: form,
    })
    if (!r.ok) throw new Error(await decodeApiError(r))
    return await r.json()
  }

  const handleSendTypedQuestion = async () => {
    const q = typedQuestion.trim()
    if (!q || isProcessing) return

    setErrorMessage(null)
    setOperatorMessage(q)
    setRecognizedQuestion(null)
    setAiResponse("")
    setVisualizationSrc(null)
    setAudioSrc(null)
    setIsProcessing(true)
    setPipelineStatus("Generating answer…")

    try {
      const data = await sendTextToBackend(q)
      applyBackendResponse(data)
    } catch (e: any) {
      setErrorMessage(e?.message || "Request failed")
    } finally {
      setIsProcessing(false)
      setPipelineStatus(null)
    }
  }

  const handleMicClick = async () => {
    if (isProcessing) return

    if (!isListening) {
      setErrorMessage(null)
      setOperatorMessage("")
      setRecognizedQuestion(null)
      setAiResponse("")
      setVisualizationSrc(null)
      setAudioSrc(null)
      setPipelineStatus("Recording…")

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaStreamRef.current = stream

        const recorder = new MediaRecorder(stream)
        chunksRef.current = []

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data)
        }

        recorder.onstop = async () => {
          try {
            setIsProcessing(true)
            setPipelineStatus("Audio received. Transcribing…")

            const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" })
            const stt = await sendAudioToBackend(blob)
            const q = typeof stt?.question_text === "string" ? stt.question_text : ""
            setOperatorMessage(q || "STT returned empty text.")
            setRecognizedQuestion(q || null)

            if (!q) throw new Error("STT returned empty text.")

            // Force a paint so the user sees the transcript immediately,
            // before starting the heavier Text2SQL/TTS request.
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))

            setPipelineStatus("Generating answer…")
            const data = await sendTextToBackend(q)
            applyBackendResponse(data)
          } catch (e: any) {
            setErrorMessage(e?.message || "Audio request failed")
          } finally {
            setIsProcessing(false)
            setPipelineStatus(null)
            // Stop tracks so the mic is released
            try {
              mediaStreamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop())
            } catch {}
            mediaStreamRef.current = null
            mediaRecorderRef.current = null
            chunksRef.current = []
          }
        }

        mediaRecorderRef.current = recorder
        recorder.start()
        setIsListening(true)
      } catch (e: any) {
        setErrorMessage(e?.message || "Microphone permission denied")
        setIsListening(false)
      }
    } else {
      // Stop recording -> triggers onstop -> sends to backend
      setIsListening(false)
      try {
        mediaRecorderRef.current?.stop()
      } catch (e: any) {
        setErrorMessage(e?.message || "Failed to stop recording")
      }
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
              <span className={backendOk === false ? "text-red-400" : ""}>
                {backendOk === null ? "Checking…" : backendOk ? "Connected" : "Disconnected"}
              </span>
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

          {/* Typed input (optional) */}
          <div className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl mx-auto mb-6 xl:mb-8 2xl:mb-10 space-y-3">
            <div className="flex gap-3">
              <Input
                value={typedQuestion}
                onChange={(e: any) => setTypedQuestion(e.target.value)}
                placeholder="Type a question (or use the mic)…"
                className="bg-gray-900/50 border-gray-800 text-gray-200 placeholder:text-gray-500"
                onKeyDown={(e: any) => {
                  if (e.key === "Enter") handleSendTypedQuestion()
                }}
                disabled={isProcessing}
              />
              <Button onClick={handleSendTypedQuestion} disabled={isProcessing || !typedQuestion.trim()}>
                Send
              </Button>
            </div>
            <p className="text-xs xl:text-sm 2xl:text-base text-gray-500">
              Backend: <span className="font-mono">{backendBaseUrl}</span>
            </p>
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
              {pipelineStatus ? (
                <p className="text-xs xl:text-sm 2xl:text-base text-gray-400 mt-3">{pipelineStatus}</p>
              ) : null}
            </Card>

            {errorMessage ? (
              <Card className="w-full max-w-md xl:max-w-lg 2xl:max-w-xl mt-4 !bg-red-900/20 border-red-900/40 p-4">
                <p className="text-sm xl:text-base 2xl:text-lg text-red-200 font-mono">{errorMessage}</p>
              </Card>
            ) : null}
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

          {audioSrc ? (
            <Card className="!bg-gray-900/30 border-gray-800 p-4 xl:p-6 2xl:p-8 mb-4 xl:mb-6 2xl:mb-8">
              <div className="text-xs xl:text-sm 2xl:text-base text-gray-400 mb-2">Answer audio</div>
              <audio ref={audioRef} controls autoPlay playsInline src={audioSrc} className="w-full" />
            </Card>
          ) : null}

          {/* Visual Output Section */}
          <div className="space-y-4 xl:space-y-6 2xl:space-y-8">
            <div className="flex items-center gap-2 xl:gap-3 text-teal-400">
              <BarChart3 className="w-5 h-5 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7" />
              <h3 className="text-sm xl:text-base 2xl:text-lg font-semibold uppercase tracking-wider">Visual Output</h3>
            </div>
            <Card className="!bg-gray-900/30 border-gray-800 p-8 xl:p-10 2xl:p-12 h-64 xl:h-80 2xl:h-96 flex items-center justify-center">
              {visualizationSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={visualizationSrc} alt="Visualization" className="w-full h-full object-contain" />
              ) : (
                <p className="text-sm xl:text-base 2xl:text-lg text-gray-600 text-center">
                  Data visualizations will appear here
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

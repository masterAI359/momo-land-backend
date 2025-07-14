"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Mic, MicOff, Play, Pause, Send, Trash2, Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onVoiceMessageSent: (voiceMessage: any) => void
  roomId?: string
}

export default function VoiceRecorder({ onVoiceMessageSent, roomId }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const { toast } = useToast()

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm;codecs=opus" })
        setRecordedBlob(blob)

        const url = URL.createObjectURL(blob)
        setAudioUrl(url)

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "録音エラー",
        description: "マイクへのアクセスが拒否されました。",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const deleteRecording = () => {
    setRecordedBlob(null)
    setRecordingTime(0)
    setIsPlaying(false)

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
  }

  const sendVoiceMessage = async () => {
    if (!recordedBlob) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("voice", recordedBlob, "voice-message.webm")
      formData.append("duration", recordingTime.toString())
      if (roomId) {
        formData.append("roomId", roomId)
      }

      const response = await fetch("/api/media/voice", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        onVoiceMessageSent(data.voiceMessage)

        toast({
          title: "ボイスメッセージを送信しました！",
          description: "相手に届きました💕",
        })

        deleteRecording()
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Voice message upload error:", error)
      toast({
        title: "送信エラー",
        description: "ボイスメッセージの送信に失敗しました。",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Recording Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              }`}
            >
              {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </Button>
          </motion.div>

          {/* Recording Info */}
          <div className="flex-1">
            {isRecording ? (
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  className="w-3 h-3 bg-red-500 rounded-full"
                />
                <span className="text-red-600 font-medium">録音中... {formatTime(recordingTime)}</span>
              </div>
            ) : recordedBlob ? (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={playRecording}
                  className="border-pink-300 text-pink-600 hover:bg-pink-50 bg-transparent"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{formatTime(recordingTime)}</span>
                </div>

                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deleteRecording}
                    className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    onClick={sendVoiceMessage}
                    disabled={uploading}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    {uploading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                <p className="font-medium">ボイスメッセージを録音</p>
                <p className="text-sm">マイクボタンを押して録音開始</p>
              </div>
            )}
          </div>
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="hidden" />}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, Video, Music, File, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  type: "IMAGE" | "VIDEO" | "AUDIO"
  size: number
  mimeType: string
}

interface MediaUploadProps {
  onFilesUploaded: (files: MediaFile[]) => void
  maxFiles?: number
  acceptedTypes?: string[]
}

export default function MediaUpload({ onFilesUploaded, maxFiles = 10, acceptedTypes }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const defaultAcceptedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/mov",
    "video/avi",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",
    "audio/m4a",
  ]

  const allowedTypes = acceptedTypes || defaultAcceptedTypes

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)

    // Validate file types
    const invalidFiles = fileArray.filter((file) => !allowedTypes.includes(file.type))
    if (invalidFiles.length > 0) {
      toast({
        title: "無効なファイル形式",
        description: "サポートされていないファイル形式が含まれています。",
        variant: "destructive",
      })
      return
    }

    // Check file count limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      toast({
        title: "ファイル数制限",
        description: `最大${maxFiles}個までのファイルをアップロードできます。`,
        variant: "destructive",
      })
      return
    }

    uploadFiles(fileArray)
  }

  const uploadFiles = async (files: File[]) => {
    setUploading(true)

    try {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/media/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const newFiles = data.files
        setUploadedFiles((prev) => [...prev, ...newFiles])
        onFilesUploaded([...uploadedFiles, ...newFiles])

        toast({
          title: "アップロード完了",
          description: `${files.length}個のファイルをアップロードしました。`,
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "アップロードエラー",
        description: "ファイルのアップロードに失敗しました。",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.id !== fileId)
    setUploadedFiles(updatedFiles)
    onFilesUploaded(updatedFiles)
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return ImageIcon
    if (type.startsWith("video/")) return Video
    if (type.startsWith("audio/")) return Music
    return File
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-200 ${
          dragOver ? "border-pink-400 bg-pink-50" : "border-gray-300 hover:border-pink-300 hover:bg-pink-50/50"
        }`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragOver(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFileSelect(e.dataTransfer.files)
        }}
      >
        <CardContent className="p-8 text-center">
          <motion.div animate={{ scale: dragOver ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-pink-600" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ファイルをアップロード</h3>
                <p className="text-gray-600 mb-4">画像、動画、音声ファイルをドラッグ&ドロップまたはクリックして選択</p>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  {uploading ? "アップロード中..." : "ファイルを選択"}
                </Button>
              </div>

              <div className="text-sm text-gray-500">最大{maxFiles}個まで • 最大100MB</div>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(",")}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Uploaded Files Preview */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            <Label className="text-sm font-medium text-gray-700">
              アップロード済みファイル ({uploadedFiles.length})
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {uploadedFiles.map((file, index) => {
                const IconComponent = getFileIcon(file.mimeType)
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative group"
                  >
                    <Card className="overflow-hidden bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          {file.type === "IMAGE" ? (
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={file.url || "/placeholder.svg"}
                                alt={file.originalName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 flex items-center justify-center">
                              <IconComponent className="w-6 h-6 text-pink-600" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{file.originalName}</div>
                            <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFile(file.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

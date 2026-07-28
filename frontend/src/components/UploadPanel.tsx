import { useState } from "react"
import axios from "axios"

interface Props {
  onUploadSuccess: (filename: string) => void
}

export default function UploadPanel({ onUploadSuccess }: Props) {
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle")
  const [filename, setFilename] = useState("")

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus("uploading")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await axios.post(
        "http://localhost:8000/upload",
        formData
      )
      setFilename(response.data.filename)
      setStatus("done")
      onUploadSuccess(response.data.filename)
    } catch (err) {
      setStatus("error")
    }
  }

  return (
    <div style={{ padding: "1rem", borderRight: "1px solid #eee", width: "280px" }}>
      <h2>Upload PDF</h2>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        disabled={status === "uploading"}
      />
      {status === "uploading" && <p>Uploading and processing...</p>}
      {status === "done" && <p>✅ {filename} ready!</p>}
      {status === "error" && <p>❌ Upload failed. Try again.</p>}
    </div>
  )
}
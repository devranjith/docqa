import { useState } from "react"
import UploadPanel from "./components/UploadPanel"
import ChatWindow from "./components/ChatWindow"

export default function App() {
  const [isReady, setIsReady] = useState(false)

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "sans-serif" }}>
      <UploadPanel onUploadSuccess={() => setIsReady(true)} />
      <ChatWindow isReady={isReady} />
    </div>
  )
}
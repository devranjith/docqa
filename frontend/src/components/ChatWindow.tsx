import { useState } from "react"
import axios from "axios"

interface Message {
  role: "user" | "assistant"
  content: string
  sources?: string[]
}

interface Props {
  isReady: boolean
}

export default function ChatWindow({ isReady }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    if (!input.trim() || !isReady || loading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await axios.post("http://localhost:8000/query", {
        question: input
      })

      const assistantMessage: Message = {
        role: "assistant",
        content: response.data.answer,
        sources: response.data.sources
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Something went wrong. Please try again."
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSend()
  }

  return (
    <div style={{ flex: 1, padding: "1rem", display: "flex", flexDirection: "column" }}>
      <h2>Ask a Question</h2>

      {!isReady && (
        <p style={{ color: "#999" }}>Upload a PDF first to start chatting.</p>
      )}

      <div style={{ flex: 1, overflowY: "auto", marginBottom: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: "1rem",
            textAlign: msg.role === "user" ? "right" : "left"
          }}>
            <div style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "12px",
              background: msg.role === "user" ? "#0070f3" : "#f1f1f1",
              color: msg.role === "user" ? "white" : "black",
              maxWidth: "80%"
            }}>
              {msg.content}
            </div>

            {msg.sources && (
              <div style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
                Sources: {msg.sources.length} chunks used
              </div>
            )}
          </div>
        ))}
        {loading && <p style={{ color: "#999" }}>Thinking...</p>}
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask something about your PDF..."
          disabled={!isReady || loading}
          style={{ flex: 1, padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }}
        />
        <button
          onClick={handleSend}
          disabled={!isReady || loading}
          style={{ padding: "8px 16px", background: "#0070f3", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
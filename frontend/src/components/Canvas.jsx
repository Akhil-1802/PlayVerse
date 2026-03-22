import React, { useEffect, useRef, useState } from 'react'
import { socket } from '../utils/socket'

function Canvas({ words, setWords, room_id, isDrawer, gameState, choosingWord }) {
  const canvasRef = useRef(null)
  const [color, setColor] = useState("#ffffff")
  const [tool, setTool] = useState("pen")
  const [eraserSize, setEraserSize] = useState(10)

  const colors = [
    { value: "#ffffff", label: "White" },
    { value: "#f87171", label: "Red" },
    { value: "#60a5fa", label: "Blue" },
    { value: "#4ade80", label: "Green" },
    { value: "#facc15", label: "Yellow" },
    { value: "#c084fc", label: "Purple" },
    { value: "#fb923c", label: "Orange" },
    { value: "#000000", label: "Black" },
  ]

  function drawLine(x1, y1, x2, y2, ctx, color, tool, eraserSize) {
    ctx.beginPath()
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"
      ctx.lineWidth = eraserSize
    } else {
      ctx.globalCompositeOperation = "source-over"
      ctx.strokeStyle = color
      ctx.lineWidth = 2
    }
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  useEffect(() => {
    if (!isDrawer) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    let prevX = 0, prevY = 0
    const isDrawingRef = { current: false }

    const startDrawing = (e) => {
      isDrawingRef.current = true
      prevX = e.offsetX
      prevY = e.offsetY
    }
    const draw = (e) => {
      if (!isDrawingRef.current || gameState !== "drawing") return
      const x = e.offsetX, y = e.offsetY
      drawLine(prevX, prevY, x, y, ctx, color, tool, eraserSize)
      socket.emit("draw", { room_id, prevX, prevY, x, y, color, tool, eraserSize })
      prevX = x
      prevY = y
    }
    const stopDrawing = () => { isDrawingRef.current = false }

    canvas.addEventListener("mousedown", startDrawing)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDrawing)
    canvas.addEventListener("mouseleave", stopDrawing)

    return () => {
      canvas.removeEventListener("mousedown", startDrawing)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDrawing)
      canvas.removeEventListener("mouseleave", stopDrawing)
    }
  }, [isDrawer, gameState, color, tool, eraserSize])

  useEffect(() => {
    if (isDrawer) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    socket.on("draw", ({ prevX, prevY, x, y, color, tool, eraserSize }) => {
      drawLine(prevX, prevY, x, y, ctx, color, tool, eraserSize)
    })
    return () => { socket.off("draw") }
  }, [isDrawer, color, tool])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    socket.on("clear_canvas", () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    })
    return () => { socket.off("clear_canvas") }
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center gap-3">

      {/* Word choice buttons */}
      {words.length > 0 && (
        <div className="flex gap-3">
          {words.map((w, index) => (
            <button
              key={index}
              onClick={() => { socket.emit("word_chosen", { room_id, word: w, socket_id: socket.id }); setWords([]) }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 shadow-lg shadow-purple-500/30 transition-all duration-200 hover:-translate-y-0.5"
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar — only for drawer */}
      {isDrawer && (
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5">
          {/* Color swatches */}
          <div className="flex items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => { setColor(c.value); setTool("pen") }}
                className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110
                  ${tool === "pen" && color === c.value ? "border-purple-400 scale-125" : "border-white/20"}`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Eraser */}
          <button
            onClick={() => setTool("eraser")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all
              ${tool === "eraser"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                : "text-white/40 hover:text-white"
              }`}
          >
            Eraser
          </button>

          {/* Eraser size */}
          {tool === "eraser" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">Size</span>
              <input
                type="range" min={5} max={50} value={eraserSize}
                onChange={(e) => setEraserSize(Number(e.target.value))}
                className="w-20 accent-purple-500"
              />
              <span className="text-xs text-white/40">{eraserSize}px</span>
            </div>
          )}

          <div className="w-px h-5 bg-white/10" />

          {/* Clear */}
          <button
            onClick={() => {
              const canvas = canvasRef.current
              const ctx = canvas.getContext("2d")
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              socket.emit("clear_canvas", { room_id })
            }}
            className="text-xs text-white/40 hover:text-red-400 font-bold transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Canvas */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-br from-purple-500/30 to-pink-500/30">
        {choosingWord && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d0d0f]/80 rounded-2xl z-10 backdrop-blur-sm">
            <p className="text-white/60 font-bold text-sm animate-pulse tracking-widest uppercase">
              ✏ Drawer is choosing a word...
            </p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          height={420}
          width={780}
          className="rounded-2xl bg-[#1a1a1f] block"
        />
      </div>

    </div>
  )
}

export default Canvas

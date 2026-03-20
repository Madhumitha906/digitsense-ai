// src/components/DrawingCanvas.jsx
// A touch/mouse drawing canvas so users can draw digits directly in the browser
import { useRef, useState, useEffect, useCallback } from 'react'

export default function DrawingCanvas({ onImageReady }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const lastPos = useRef(null)

  // Initialize canvas with black background
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 18
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  const startDraw = useCallback((e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const pos = getPos(e, canvas)
    setIsDrawing(true)
    setHasDrawn(true)
    lastPos.current = pos

    // Draw a dot on click/tap
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
  }, [])

  const draw = useCallback((e) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e, canvas)

    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPos.current = pos
  }, [isDrawing])

  const stopDraw = useCallback(() => {
    setIsDrawing(false)
    lastPos.current = null
  }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
    onImageReady(null)
  }

  const handleUseDrawing = () => {
    const canvas = canvasRef.current
    canvas.toBlob((blob) => {
      const file = new File([blob], 'drawn_digit.png', { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      onImageReady({ file, url })
    }, 'image/png')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      <p className="text-gray-400 text-xs text-center">
        Draw a digit (0–9) below — white on black, large strokes work best
      </p>

      {/* Canvas */}
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
          style={{
            borderRadius: '12px',
            border: '2px solid rgba(108, 99, 255, 0.3)',
            cursor: 'crosshair',
            touchAction: 'none',
            display: 'block',
            width: '100%',
            maxWidth: '280px',
          }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={clearCanvas}
          className="flex-1 py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-200 text-sm font-medium"
        >
          🗑️ Clear
        </button>
        <button
          onClick={handleUseDrawing}
          disabled={!hasDrawn}
          className="flex-1 btn-primary py-2.5 text-sm"
        >
          ✅ Use This Drawing
        </button>
      </div>
    </div>
  )
}

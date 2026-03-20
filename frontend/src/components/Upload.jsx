// src/components/Upload.jsx - Image upload panel with drag-and-drop + drawing canvas
import { useState, useRef, useCallback } from 'react'
import DrawingCanvas from './DrawingCanvas'

const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export default function Upload({ onPrediction }) {
  const [mode, setMode] = useState('upload')      // 'upload' | 'draw'
  const [image, setImage] = useState(null)        // { url, file }
  const [isDragging, setIsDragging] = useState(false)
  const [isPredicting, setIsPredicting] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp', 'image/gif', 'image/webp']

  const handleFile = (file) => {
    if (!file) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a PNG, JPG, BMP, or WebP image.')
      return
    }
    setError(null)
    onPrediction(null)
    const url = URL.createObjectURL(file)
    setImage({ url, file })
  }

  const handleFileInput = (e) => {
    handleFile(e.target.files[0])
    e.target.value = ''
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = () => setIsDragging(false)

  // Called by DrawingCanvas when user clicks "Use This Drawing"
  const handleCanvasImage = (imgData) => {
    setError(null)
    onPrediction(null)
    setImage(imgData)
  }

  const handlePredict = async () => {
    if (!image?.file) return
    setIsPredicting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', image.file)
      const res = await fetch(`${API_BASE}/predict`, { method: 'POST', body: formData })
      if (!res.ok) {
        const err = await res.json()
        if (err.status === 'error' && err.message) {
           onPrediction(null, err.message)
           return
        }
        throw new Error(err.detail || 'Prediction failed')
      }
      const data = await res.json()
      onPrediction(data, null)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsPredicting(false)
    }
  }

  const handleClear = () => {
    setImage(null)
    setError(null)
    onPrediction(null)
  }

  const switchMode = (m) => {
    setMode(m)
    setImage(null)
    setError(null)
    onPrediction(null)
  }

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      {/* Card Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-lg">📤</div>
        <div>
          <h3 className="font-bold text-white text-base">Input</h3>
          <p className="text-gray-500 text-xs">Upload or draw a handwritten digit</p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-purple-500/20 bg-black/20">
        <button
          onClick={() => switchMode('upload')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === 'upload'
              ? 'bg-purple-600/30 text-purple-300 border-r border-purple-500/20'
              : 'text-gray-500 hover:text-gray-300 border-r border-purple-500/20'
          }`}
        >
          📁 Upload Image
        </button>
        <button
          onClick={() => switchMode('draw')}
          className={`flex-1 py-2.5 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            mode === 'draw'
              ? 'bg-purple-600/30 text-purple-300'
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          ✏️ Draw Digit
        </button>
      </div>

      {/* ─── UPLOAD MODE ─── */}
      {mode === 'upload' && (
        <>
          {/* Warning Banner */}
          <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
            <span className="text-amber-400 text-sm mt-0.5 shrink-0">⚠️</span>
            <p className="text-amber-300 text-xs leading-relaxed">
              <strong>For best results:</strong> Upload black and white handwritten digits on a plain background. 
              Dark ink on white paper works best. Avoid colored or noisy backgrounds.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            className={`drop-zone min-h-44 flex flex-col items-center justify-center p-6 relative overflow-hidden
              ${isDragging ? 'drag-over' : ''}
            `}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !image && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {image ? (
              <div className="flex flex-col items-center gap-4 w-full">
                <div className="relative group">
                  <img
                    src={image.url}
                    alt="Uploaded digit preview"
                    className="w-36 h-36 object-contain rounded-2xl border-2 border-purple-500/30 bg-black/40"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                      className="text-white text-sm font-medium bg-purple-600 px-3 py-1.5 rounded-lg"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 text-xs truncate max-w-[200px]">{image.file.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-3xl">
                  🖼️
                </div>
                <div>
                  <p className="text-white font-medium text-sm">
                    Drop your image here
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    or click to browse files · PNG, JPG, BMP, WebP
                  </p>
                </div>
                {isDragging && (
                  <div className="absolute inset-0 rounded-[18px] border-2 border-purple-400 pointer-events-none shimmer" />
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── DRAW MODE ─── */}
      {mode === 'draw' && (
        <>
          <DrawingCanvas onImageReady={handleCanvasImage} />
          {image && (
            <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-400 text-sm">
              <span>✅</span>
              <span>Drawing captured — click "Predict Digit" below</span>
            </div>
          )}
        </>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Tips (upload mode only) */}
      {mode === 'upload' && (
        <div className="rounded-xl bg-purple-500/5 border border-purple-500/10 p-4">
          <p className="text-purple-400 font-semibold text-xs mb-2">📌 Tips for best results:</p>
          <ul className="text-gray-500 text-xs space-y-1">
            <li>• Write the digit clearly on white paper with dark ink</li>
            <li>• Center the digit, make it large and bold</li>
            <li>• Avoid shadows, smudges, or colored backgrounds</li>
            <li>• Or use the ✏️ Draw Digit tab to draw directly!</li>
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {image && (
          <button
            onClick={handleClear}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300 transition-all duration-200 text-sm font-medium"
          >
            Clear
          </button>
        )}
        <button
          onClick={handlePredict}
          disabled={!image || isPredicting}
          className="flex-1 btn-primary py-3 text-sm"
        >
          {isPredicting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin-custom w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Analyzing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">🔍 Predict Digit</span>
          )}
        </button>
      </div>
    </div>
  )
}

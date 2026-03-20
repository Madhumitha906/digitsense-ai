// src/components/Result.jsx - Prediction result display panel (CNN version)
import { useEffect, useState } from 'react'
import ConfusionMatrix from './ConfusionMatrix'

const DIGIT_EMOJIS = {
  0: '0️⃣', 1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣',
  5: '5️⃣', 6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣',
}

export default function Result({ prediction }) {
  const [animKey, setAnimKey] = useState(0)

  useEffect(() => {
    if (prediction) setAnimKey(k => k + 1)
  }, [prediction])

  const getConfidenceColor = (c) =>
    c >= 0.9 ? 'text-emerald-400' : c >= 0.7 ? 'text-amber-400' : 'text-red-400'

  const getConfidenceLabel = (c) =>
    c >= 0.9 ? 'High Confidence' : c >= 0.7 ? 'Medium Confidence' : 'Low Confidence'

  return (
    <div className="glass-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center text-lg">🎯</div>
        <div>
          <h3 className="font-bold text-white text-base">Prediction Result</h3>
          <p className="text-gray-500 text-xs">CNN model output</p>
        </div>
      </div>

      {prediction ? (
        <>
          {/* Low-confidence warning */}
          {prediction.low_confidence && (
            <div className="flex items-start gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 animate-slide-up">
              <span className="text-amber-400 text-sm shrink-0">⚠️</span>
              <p className="text-amber-300 text-xs leading-relaxed">
                <strong>Low confidence prediction.</strong> The model is uncertain — please upload a
                clearer image or try drawing the digit on the canvas.
              </p>
            </div>
          )}

          {/* Predicted Digit Hero */}
          <div key={animKey} className="animate-scale-in flex flex-col items-center py-4 gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500/30 blur-xl scale-150"></div>
              <div
                className="relative w-28 h-28 rounded-full bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center shadow-2xl shadow-purple-500/50"
                style={{ animation: 'pulseRing 2s infinite' }}
              >
                <span className="text-5xl font-black text-white font-mono">
                  {prediction.predicted_digit}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Predicted Digit</p>
              <p className="gradient-text font-bold text-xl">
                {DIGIT_EMOJIS[prediction.predicted_digit]} Digit {prediction.predicted_digit}
              </p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-gray-500 text-xs mb-1">Confidence</p>
              <p className={`text-2xl font-bold font-mono ${getConfidenceColor(prediction.confidence)}`}>
                {(prediction.confidence * 100).toFixed(1)}%
              </p>
              <p className="text-gray-600 text-xs mt-1">{getConfidenceLabel(prediction.confidence)}</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
              <p className="text-gray-500 text-xs mb-1">Model Accuracy</p>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {(prediction.accuracy * 100).toFixed(1)}%
              </p>
              <p className="text-gray-600 text-xs mt-1">on MNIST test set</p>
            </div>
          </div>

          {/* 28×28 Processed Image Preview */}
          {prediction.processed_image && (
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
                🔬 Preprocessed Input (28×28)
              </p>
              <div className="flex items-center gap-4">
                <img
                  src={`data:image/png;base64,${prediction.processed_image}`}
                  alt="28x28 preprocessed digit"
                  style={{ imageRendering: 'pixelated', width: '84px', height: '84px' }}
                  className="rounded-lg border border-purple-500/30 bg-black"
                />
                <div className="text-xs text-gray-500 leading-relaxed">
                  <p>This is what the model <strong className="text-gray-400">actually sees</strong> after preprocessing.</p>
                  <p className="mt-1">Grayscale · 28×28 px · White digit on black bg</p>
                  <p className="mt-1 text-purple-400">If this looks wrong, the prediction may be inaccurate.</p>
                </div>
              </div>
            </div>
          )}

          {/* Probability Bars */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-gray-400 text-xs font-semibold mb-3 uppercase tracking-wider">
              Class Probabilities
            </p>
            <div className="space-y-2">
              {prediction.probabilities.map((prob, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs w-4 text-center font-mono font-bold">{idx}</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="prob-bar-fill" style={{ width: `${prob * 100}%` }} />
                  </div>
                  <span className={`text-xs font-mono w-10 text-right ${
                    idx === prediction.predicted_digit ? 'text-purple-400 font-bold' : 'text-gray-600'
                  }`}>
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl opacity-50">
            🔍
          </div>
          <div>
            <p className="text-gray-400 font-medium">
              No prediction yet
            </p>
            <p className="text-gray-600 text-sm mt-1">
              Upload an image or draw a digit, then click "Predict"
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2 mt-4 opacity-20">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg font-bold text-gray-400">
                {i}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

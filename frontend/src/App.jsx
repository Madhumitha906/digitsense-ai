// src/App.jsx - Root application component
import { useState } from 'react'
import Upload from './components/Upload'
import Result from './components/Result'
import './index.css'

export default function App() {
  const [prediction, setPrediction] = useState(null)
  const [globalError, setGlobalError] = useState(null)

  const handlePrediction = (result, errorMsg) => {
    if (errorMsg) {
      setGlobalError(errorMsg)
      setPrediction(null)
    } else {
      setGlobalError(null)
      setPrediction(result)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-animated">
      {/* Header */}
      <header className="border-b border-purple-500/20 bg-black/30 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-violet-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/30">
              🔢
            </div>
            <div>
              <h1 className="font-bold text-white text-lg leading-none">DigitSense AI</h1>
              <p className="text-purple-400 text-xs font-medium">Handwritten Digit Recognition</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              Model Accuracy: ~99% (trained on MNIST)
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
            <span>✨</span>
            <span>Powered by CNN · TensorFlow/Keras · MNIST + Augmented Data</span>
          </div>
          <h2 className="text-5xl font-black text-white mb-4 leading-tight">
            Recognize Any{' '}
            <span className="gradient-text">Handwritten Digit</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A full-stack AI web application that recognizes handwritten digits (0–9) using a trained CNN.
            Achieved ~99% accuracy on 70,000+ augmented MNIST samples.
          </p>
        </div>

        {/* Global Error Banner */}
        {globalError && (
          <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-start gap-3 shadow-lg shadow-red-500/5">
            <span className="text-xl">⚠️</span>
            <div>
              <h3 className="font-bold text-sm">Prediction Error</h3>
              <p className="text-sm mt-1">{globalError}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 line-up-animation">
          {/* Upload Panel */}
          <Upload onPrediction={handlePrediction} />

          {/* Result Panel */}
          <Result prediction={prediction} />
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pb-6 text-gray-600 text-sm">
          <p>DigitSense AI · Built with FastAPI + TensorFlow + React</p>
        </footer>
      </main>
    </div>
  )
}

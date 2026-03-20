// src/components/ConfusionMatrix.jsx
// Renders a 10x10 confusion matrix as a color-coded heatmap grid

export default function ConfusionMatrix({ matrix }) {
  if (!matrix || matrix.length === 0) return null

  // Find the max value for color normalization (excluding diagonal to be fair)
  const allValues = matrix.flat()
  const maxVal = Math.max(...allValues)

  const getCellStyle = (row, col, value) => {
    const intensity = maxVal > 0 ? value / maxVal : 0
    const isDiagonal = row === col

    if (isDiagonal) {
      // Diagonal (correct predictions) = green scale
      return {
        backgroundColor: `rgba(16, 185, 129, ${0.1 + intensity * 0.7})`,
        color: intensity > 0.3 ? '#fff' : '#6ee7b7',
      }
    } else if (value > 0) {
      // Off-diagonal (misclassifications) = red scale
      return {
        backgroundColor: `rgba(239, 68, 68, ${0.05 + intensity * 0.5})`,
        color: intensity > 0.3 ? '#fff' : '#fca5a5',
      }
    }
    return {
      backgroundColor: 'rgba(255,255,255,0.03)',
      color: '#374151',
    }
  }

  return (
    <div className="glass-card p-6 mt-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg">📊</div>
        <div>
          <h3 className="font-bold text-white text-base">Confusion Matrix</h3>
          <p className="text-gray-500 text-xs">10×10 grid — True vs Predicted labels on MNIST test set</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mb-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/60"></div>
          <span className="text-gray-400">Correct predictions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/60"></div>
          <span className="text-gray-400">Misclassifications</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center" style={{ borderSpacing: '2px', borderCollapse: 'separate' }}>
          <thead>
            <tr>
              <th className="text-gray-600 text-xs p-1 w-8">↓ True / Pred →</th>
              {Array.from({ length: 10 }, (_, i) => (
                <th key={i} className="text-gray-500 text-xs p-1 w-10 font-mono">{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td className="text-gray-500 text-xs font-mono font-bold p-1">{rowIdx}</td>
                {row.map((val, colIdx) => (
                  <td
                    key={colIdx}
                    title={`True: ${rowIdx}, Predicted: ${colIdx}, Count: ${val}`}
                    style={{
                      ...getCellStyle(rowIdx, colIdx, val),
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'JetBrains Mono, monospace',
                      height: '36px',
                      width: '36px',
                      transition: 'all 0.2s ease',
                      cursor: 'default',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'scale(1.3)'
                      e.currentTarget.style.zIndex = '10'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'scale(1)'
                      e.currentTarget.style.zIndex = '1'
                    }}
                  >
                    {val > 0 ? val : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-emerald-400 font-bold text-lg font-mono">
            {matrix.reduce((sum, row, i) => sum + row[i], 0).toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs">Correct</p>
        </div>
        <div>
          <p className="text-red-400 font-bold text-lg font-mono">
            {(matrix.flat().reduce((s, v) => s + v, 0) -
              matrix.reduce((sum, row, i) => sum + row[i], 0)).toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs">Misclassified</p>
        </div>
        <div>
          <p className="text-blue-400 font-bold text-lg font-mono">
            {matrix.flat().reduce((s, v) => s + v, 0).toLocaleString()}
          </p>
          <p className="text-gray-500 text-xs">Total Samples</p>
        </div>
      </div>
    </div>
  )
}

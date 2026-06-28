import { useState, useRef } from 'react'
import { Volume2, VolumeX, CheckSquare, AlertTriangle, Calendar, Building2, Tag, ChevronDown, ChevronUp, Play, Pause } from 'lucide-react'
import { DOC_CATEGORIES, URGENCY_LABELS, LANGUAGES } from '../utils/constants'

function UrgencyBadge({ level }) {
  const colors = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    HIGH: 'bg-orange-100 text-orange-700 border-orange-200',
    NORMAL: 'bg-blue-100 text-blue-700 border-blue-200',
    LOW: 'bg-green-100 text-green-700 border-green-200',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[level] || colors.NORMAL}`}>
      {URGENCY_LABELS[level] || level}
    </span>
  )
}

function AudioPlayer({ audioUrl }) {
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)

  const toggle = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play()
      setPlaying(true)
    }
  }

  if (!audioUrl) return null

  return (
    <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
      <audio ref={audioRef} src={audioUrl} onEnded={() => setPlaying(false)} />
      <button
        onClick={toggle}
        className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-sm transition-colors"
      >
        {playing ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <div>
        <p className="text-sm font-semibold text-indigo-800">🔊 Audio Explanation</p>
        <p className="text-xs text-indigo-500">Listen to the simplified explanation</p>
      </div>
    </div>
  )
}

export default function TranslationResult({ result, targetLanguage }) {
  const [showRaw, setShowRaw] = useState(false)

  if (!result) return null

  const category = DOC_CATEGORIES[result.documentCategory] || DOC_CATEGORIES.OTHER
  const lang = LANGUAGES.find(l => l.code === targetLanguage)
  let actionSteps = []
  try {
    actionSteps = typeof result.actionSteps === 'string'
      ? JSON.parse(result.actionSteps)
      : (result.actionSteps || [])
  } catch {}

  let keyPoints = result.keyPoints || []
  if (typeof keyPoints === 'string') {
    try { keyPoints = JSON.parse(keyPoints) } catch { keyPoints = [] }
  }

  return (
    <div className="space-y-5 animate-slide-up">
      {/* Header */}
      <div className="card">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{category.icon}</div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide mb-1">Document Type</p>
              <p className="text-xl font-bold text-slate-800">{category.label}</p>
              {lang && (
                <p className="text-sm text-slate-500 mt-0.5">
                  Translated to <span className="font-semibold text-brand-600">{lang.nativeName}</span>
                </p>
              )}
            </div>
          </div>
          <UrgencyBadge level={result.urgencyLevel} />
        </div>

        {result.deadlineDate && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <Calendar size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">
              Deadline: <strong>{new Date(result.deadlineDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </span>
          </div>
        )}

        {result.officialOffice && (
          <div className="mt-2 flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <Building2 size={16} className="text-blue-500 flex-shrink-0" />
            <span className="text-sm text-blue-700 font-medium">{result.officialOffice}</span>
          </div>
        )}
      </div>

      {/* Warning */}
      {result.warningMessage && result.warningMessage !== 'null' && (
        <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 text-sm mb-1">⚠️ Important Warning</p>
            <p className="text-amber-700 text-sm lang-text">{result.warningMessage}</p>
          </div>
        </div>
      )}

      {/* Simplified Explanation */}
      <div className="card">
        <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
          <span className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600 text-sm">📖</span>
          What This Document Says
        </h3>
        <p className="text-slate-700 leading-relaxed lang-text text-base">
          {result.simplifiedExplanation || result.simplifiedText}
        </p>
      </div>

      {/* Audio */}
      {result.audioUrl && <AudioPlayer audioUrl={result.audioUrl} />}

      {/* Key Points */}
      {keyPoints.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
            <span className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center text-sm">🔑</span>
            Key Points
          </h3>
          <ul className="space-y-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700 lang-text">
                <span className="w-5 h-5 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Steps */}
      {actionSteps.length > 0 && (
        <div className="card border-l-4 border-l-green-500">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <CheckSquare size={18} className="text-green-600" />
            What You Need To Do
          </h3>
          <div className="space-y-4">
            {actionSteps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {step.stepNumber || i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-800 font-medium text-sm lang-text">{step.action}</p>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    {step.deadline && (
                      <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full border border-red-100">
                        📅 {step.deadline}
                      </span>
                    )}
                    {step.where && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
                        📍 {step.where}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

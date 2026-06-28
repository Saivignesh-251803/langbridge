import { useState, useEffect } from 'react'
import { documentApi } from '../services/api'
import { DOC_CATEGORIES, URGENCY_LABELS, LANGUAGES } from '../utils/constants'
import TranslationResult from '../components/TranslationResult'
import { History, ChevronRight, Calendar, FileText, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function HistoryCard({ item, onClick }) {
  const category = DOC_CATEGORIES[item.documentCategory] || DOC_CATEGORIES.OTHER
  const lang = LANGUAGES.find(l => l.code === item.targetLanguage)
  const urgencyColors = {
    CRITICAL: 'border-red-200 bg-red-50',
    HIGH: 'border-orange-200 bg-orange-50',
    NORMAL: 'border-slate-100 bg-white',
    LOW: 'border-green-100 bg-green-50',
  }

  return (
    <button
      onClick={() => onClick(item)}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${urgencyColors[item.urgencyLevel] || 'border-slate-100 bg-white'}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{category.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-800 text-sm line-clamp-1">{item.filename}</p>
              <p className="text-xs text-slate-500 mt-0.5">{category.label}</p>
            </div>
            <ChevronRight size={16} className="text-slate-400 flex-shrink-0 mt-1" />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {lang && (
              <span className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">
                {lang.nativeName}
              </span>
            )}
            {item.deadlineDate && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full border border-red-200 flex items-center gap-1">
                <Calendar size={10} />
                {new Date(item.deadlineDate).toLocaleDateString('en-IN')}
              </span>
            )}
            <span className="text-xs text-slate-400">
              {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    documentApi.getHistory()
      .then(res => {
        if (res.data.success) setHistory(res.data.data)
      })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center space-y-3">
        <div className="animate-spin w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full mx-auto"/>
        <p className="text-slate-500 text-sm">Loading your documents...</p>
      </div>
    </div>
  )

  if (selected) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
      <button
        onClick={() => setSelected(null)}
        className="btn-secondary text-sm py-2 flex items-center gap-2"
      >
        ← Back to History
      </button>
      <div className="flex items-center gap-3">
        <FileText size={20} className="text-slate-500" />
        <h2 className="font-bold text-slate-800 line-clamp-1">{selected.filename}</h2>
      </div>
      <TranslationResult result={{
        ...selected,
        simplifiedExplanation: selected.simplifiedText,
      }} targetLanguage={selected.targetLanguage} />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
          <History size={20} className="text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Documents</h1>
          <p className="text-slate-500 text-sm">{history.length} document{history.length !== 1 ? 's' : ''} processed</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card text-center py-16 space-y-3">
          <div className="text-5xl">📭</div>
          <h3 className="font-bold text-slate-700">No Documents Yet</h3>
          <p className="text-slate-500 text-sm">Upload your first legal document to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(item => (
            <HistoryCard key={item.translationId} item={item} onClick={setSelected} />
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { documentApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import DocumentDropzone from '../components/DocumentDropzone'
import TranslationResult from '../components/TranslationResult'
import { LANGUAGES } from '../utils/constants'
import toast from 'react-hot-toast'
import { Sparkles, ChevronDown } from 'lucide-react'

export default function UploadPage() {
  const { user } = useAuth()
  const [file, setFile] = useState(null)
  const [targetLanguage, setTargetLanguage] = useState(user?.preferredLanguage || 'hi')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [stage, setStage] = useState('')

  const stages = [
    'Uploading document...',
    'Extracting text with AI...',
    'Analyzing legal content...',
    'Translating to your language...',
    'Generating audio...',
    'Finalizing results...'
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a document to upload')

    setLoading(true)
    setResult(null)
    setProgress(0)

    // Simulate stages for UX
    let stageIdx = 0
    const stageInterval = setInterval(() => {
      if (stageIdx < stages.length - 1) {
        setStage(stages[stageIdx])
        setProgress(Math.round((stageIdx / stages.length) * 85))
        stageIdx++
      }
    }, 2500)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('targetLanguage', targetLanguage)

      const res = await documentApi.upload(formData, (evt) => {
        if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 30))
      })

      clearInterval(stageInterval)
      setProgress(100)
      setStage('Complete!')

      if (res.data.success) {
        setResult(res.data.data)
        toast.success('Document translated successfully!')
      } else {
        toast.error(res.data.message || 'Processing failed')
      }
    } catch (err) {
      clearInterval(stageInterval)
      toast.error(err.response?.data?.message || 'Failed to process document. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setProgress(0)
    setStage('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Upload Document</h1>
        <p className="text-slate-500 mt-1">Upload any legal or government document to get an instant plain-language explanation</p>
      </div>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Language Selector */}
          <div className="card">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              🌐 Select Your Language
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setTargetLanguage(lang.code)}
                  className={`p-3 rounded-xl border-2 transition-all duration-150 text-left
                    ${targetLanguage === lang.code
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-100 hover:border-slate-300 bg-white'
                    }`}
                >
                  <div className="font-bold text-sm text-slate-800">{lang.nativeName}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File Upload */}
          <div className="card">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              📄 Upload Document
            </label>
            <DocumentDropzone onFileSelect={setFile} disabled={loading} />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!file || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Translate & Explain Document
              </>
            )}
          </button>

          {/* Progress */}
          {loading && (
            <div className="card space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium">{stage}</span>
                <span className="text-brand-600 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-brand-500 to-brand-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 text-center">
                Gemini AI is analyzing your document — this may take up to 30 seconds
              </p>
            </div>
          )}
        </form>
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Translation Result</h2>
            <button onClick={reset} className="btn-secondary text-sm py-2 px-4">
              ← Upload Another
            </button>
          </div>
          <TranslationResult result={result} targetLanguage={targetLanguage} />
        </div>
      )}
    </div>
  )
}

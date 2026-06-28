import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Upload, History, Scale, Shield, Globe, Volume2, ArrowRight } from 'lucide-react'
import { LANGUAGES } from '../utils/constants'

const features = [
  { icon: Upload, title: 'Upload Any Document', desc: 'Photo, PDF, DOCX, or image of any legal notice', color: 'blue' },
  { icon: Scale, title: 'AI Legal Simplifier', desc: 'Powered by Gemini AI — complex law made simple', color: 'purple' },
  { icon: Globe, title: '7 Indian Languages', desc: 'Hindi, Telugu, Tamil, Marathi, Bengali, Malayalam, English', color: 'green' },
  { icon: Volume2, title: 'Audio Explanation', desc: 'Listen to the summary — perfect for low-literacy users', color: 'orange' },
  { icon: Shield, title: 'Action Steps', desc: 'Clear steps: what to do, where to go, by when', color: 'red' },
]

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  purple: 'bg-purple-50 text-purple-600',
  green: 'bg-green-50 text-green-600',
  orange: 'bg-orange-50 text-orange-600',
  red: 'bg-red-50 text-red-600',
}

export default function DashboardPage() {
  const { user } = useAuth()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Hero greeting */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-900 rounded-3xl p-8 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-brand-300 text-sm font-medium">{greeting()},</p>
            <h1 className="text-3xl font-bold mt-1">{user?.name} 👋</h1>
            <p className="text-brand-200 mt-2 max-w-md">
              Upload any government document and get an instant plain-language explanation in your language.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/upload" className="flex items-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow">
                <Upload size={18} /> Upload Document
              </Link>
              <Link to="/history" className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                <History size={18} /> My Documents
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex w-24 h-24 bg-white/10 rounded-2xl items-center justify-center">
            <Scale size={48} className="text-white/70" />
          </div>
        </div>
      </div>

      {/* Supported Languages */}
      <div className="card">
        <h2 className="font-bold text-slate-800 mb-4">Supported Languages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {LANGUAGES.map(lang => (
            <div key={lang.code} className="flex flex-col items-center gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-colors cursor-default">
              <span className="text-xl">{lang.flag}</span>
              <span className="text-xs font-bold text-slate-700 text-center">{lang.nativeName}</span>
              <span className="text-[10px] text-slate-400">{lang.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="font-bold text-slate-800 mb-4 text-lg">How LangBridge Helps You</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colorMap[color]}`}>
                <Icon size={20} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
              <p className="text-slate-500 text-sm">{desc}</p>
            </div>
          ))}
          <Link to="/upload" className="card hover:shadow-md transition-shadow border-dashed border-brand-200 bg-brand-50 flex items-center justify-center flex-col gap-2 min-h-[120px]">
            <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
              <ArrowRight size={20} className="text-brand-600" />
            </div>
            <span className="font-bold text-brand-700">Get Started Now</span>
            <span className="text-brand-500 text-sm">Upload your first document</span>
          </Link>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="text-2xl">⚖️</div>
        <div>
          <h3 className="font-bold text-amber-800">Access to Justice is Your Right</h3>
          <p className="text-amber-700 text-sm mt-1">
            LangBridge translates complex legal language into simple, actionable information in your native language. 
            We serve farmers, daily wage workers, senior citizens, and rural communities across India.
          </p>
        </div>
      </div>
    </div>
  )
}

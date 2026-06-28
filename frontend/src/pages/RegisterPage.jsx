import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Scale, Eye, EyeOff } from 'lucide-react'
import { authApi } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { LANGUAGES } from '../utils/constants'
import toast from 'react-hot-toast'

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'
]

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '',
    preferredLanguage: 'hi', state: '', district: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.password) return toast.error('Please fill required fields')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')
    if (form.phone.length !== 10) return toast.error('Enter a valid 10-digit phone number')
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      const res = await authApi.register(payload)
      const { token, ...userData } = res.data.data
      login(token, userData)
      toast.success('Account created! Welcome to LangBridge.')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Scale size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">LangBridge</h1>
          <p className="text-brand-300 text-sm">Create your free account</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-5">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input className="input-field" placeholder="Your full name" value={form.name} onChange={set('name')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone <span className="text-red-500">*</span></label>
                <input className="input-field" type="tel" placeholder="10-digit number" value={form.phone} onChange={set('phone')} maxLength={10} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email (optional)</label>
                <input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input className="input-field pr-10" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password <span className="text-red-500">*</span></label>
                <input className="input-field" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Preferred Language</label>
                <select className="input-field" value={form.preferredLanguage} onChange={set('preferredLanguage')}>
                  {LANGUAGES.map(l => (
                    <option key={l.code} value={l.code}>{l.nativeName} — {l.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">State</label>
                <select className="input-field" value={form.state} onChange={set('state')}>
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">District</label>
                <input className="input-field" placeholder="Your district" value={form.district} onChange={set('district')} />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

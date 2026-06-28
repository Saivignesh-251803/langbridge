export const LANGUAGES = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🌐' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
]

export const DOC_CATEGORIES = {
  COURT_NOTICE: { label: 'Court Notice', icon: '⚖️', color: 'red' },
  TAX_NOTICE: { label: 'Tax Notice', icon: '📋', color: 'orange' },
  BANK_NOTICE: { label: 'Bank Notice', icon: '🏦', color: 'blue' },
  LAND_RECORD: { label: 'Land Record', icon: '🌾', color: 'green' },
  GOVERNMENT_ORDER: { label: 'Government Order', icon: '🏛️', color: 'purple' },
  LOAN_DOCUMENT: { label: 'Loan Document', icon: '💰', color: 'yellow' },
  RATION_CARD: { label: 'Ration Card', icon: '🃏', color: 'teal' },
  PENSION: { label: 'Pension Document', icon: '👴', color: 'indigo' },
  INSURANCE: { label: 'Insurance', icon: '🛡️', color: 'cyan' },
  OTHER: { label: 'Other Document', icon: '📄', color: 'slate' },
}

export const URGENCY_COLORS = {
  CRITICAL: 'urgency-critical',
  HIGH: 'urgency-high',
  NORMAL: 'urgency-normal',
  LOW: 'urgency-low',
}

export const URGENCY_LABELS = {
  CRITICAL: '🔴 Critical — Act Immediately',
  HIGH: '🟠 High Priority',
  NORMAL: '🔵 Normal',
  LOW: '🟢 Low Priority',
}

export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
}

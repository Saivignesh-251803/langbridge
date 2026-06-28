import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Image, FileType, X, AlertCircle } from 'lucide-react'
import { ACCEPTED_FILE_TYPES } from '../utils/constants'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

function FileIcon({ type }) {
  if (type?.startsWith('image/')) return <Image size={40} className="text-blue-400" />
  if (type === 'application/pdf') return <FileType size={40} className="text-red-400" />
  return <FileText size={40} className="text-slate-400" />
}

export default function DocumentDropzone({ onFileSelect, disabled }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted, rejected) => {
    setError('')
    if (rejected.length > 0) {
      const err = rejected[0].errors[0]
      if (err.code === 'file-too-large') setError('File is too large. Maximum size is 20MB.')
      else if (err.code === 'file-invalid-type') setError('Unsupported file type. Please use JPG, PNG, PDF, DOCX, or TXT.')
      else setError('Invalid file.')
      return
    }
    if (accepted.length > 0) {
      setSelectedFile(accepted[0])
      onFileSelect(accepted[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled,
  })

  const removeFile = (e) => {
    e.stopPropagation()
    setSelectedFile(null)
    onFileSelect(null)
    setError('')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragActive ? 'border-brand-400 bg-brand-50 scale-[1.01]' : 'border-slate-200 bg-slate-50 hover:border-brand-300 hover:bg-brand-50/50'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${selectedFile ? 'border-green-300 bg-green-50' : ''}
        `}
      >
        <input {...getInputProps()} />

        {selectedFile ? (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center border border-slate-100">
                <FileIcon type={selectedFile.type} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-slate-800 text-sm line-clamp-1">{selectedFile.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{formatSize(selectedFile.size)}</p>
                <p className="text-green-600 text-xs font-medium mt-1">✓ Ready to translate</p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="p-2 hover:bg-red-100 text-slate-400 hover:text-red-500 rounded-lg transition-colors flex-shrink-0"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto">
              <Upload size={28} className={isDragActive ? 'text-brand-500' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-slate-700 font-semibold text-base">
                {isDragActive ? 'Drop your document here' : 'Upload your document'}
              </p>
              <p className="text-slate-400 text-sm mt-1">
                Drag & drop or click to browse
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {['📸 JPG / PNG', '📄 PDF', '📝 DOCX', '📃 TXT'].map(t => (
                <span key={t} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500 font-medium">
                  {t}
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-xs">Maximum file size: 20MB</p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}

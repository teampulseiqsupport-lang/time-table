import React, { useState, useRef, useEffect } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Info, Download, Calendar } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AdminUpload() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [session, setSession] = useState('2025-26')
  const [dragOver, setDragOver] = useState(false)
  const [refFile, setRefFile] = useState(null)
  const [loadingRef, setLoadingRef] = useState(false)
  const fileRef = useRef()

  // Fetch reference file info on mount
  useEffect(() => {
    fetchReferenceFile()
  }, [])

  const fetchReferenceFile = async () => {
    setLoadingRef(true)
    try {
      const { data } = await api.get('/timetable/reference/info')
      if (data.success && data.refFile) {
        setRefFile(data.refFile)
      }
    } catch (err) {
      console.error('Error fetching reference:', err)
    } finally {
      setLoadingRef(false)
    }
  }

  const handleDownloadReference = () => {
    if (!refFile) return
    toast.success(`📥 Download initiated for: ${refFile.fileName}`)
    // Note: In production, implement actual download via API endpoint
    // const link = document.createElement('a')
    // link.href = `/public/reference-files/${refFile.fileName}`
    // link.click()
  }

  const handleFile = (f) => {
    if (f && (f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      setFile(f)
      setResult(null)
    } else {
      toast.error('Please upload a valid Excel file (.xlsx or .xls)')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return toast.error('Please select a file first')
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('session', '2025-26')
      const { data } = await api.post('/timetable/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(data)
      setFile(null)
      toast.success(`Upload successful: ${data.created} created, ${data.updated} updated`)
      // Refresh reference file info
      setTimeout(fetchReferenceFile, 500)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Upload size={20} className="text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Timetable</h1>
          <p className="text-slate-400 text-sm">Import from Excel spreadsheet</p>
        </div>
      </div>

      {/* Excel format guide */}
      <div className="glass-card p-5 border-cyan-500/20 bg-cyan-500/4">
        <div className="flex items-start gap-3">
          <Info size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium text-sm mb-2">Expected Excel Column Headers</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Section', 'Day', 'Subject', 'Code', 'Faculty', 'Room', 'Block', 'StartTime', 'EndTime', 'Type', 'Session', 'Year'].map(col => (
                <span key={col} className="font-mono text-xs bg-navy-800 text-cyan-400 px-2 py-1 rounded-lg border border-cyan-500/20">{col}</span>
              ))}
            </div>
            <p className="text-slate-400 text-xs mt-3">
              <strong className="text-slate-300">Section</strong> supports ranges: <span className="font-mono text-cyan-400">3A,3B,3C</span> or <span className="font-mono text-cyan-400">3A-3F</span> — entries are auto-created for each section.
              Missing sections are auto-created. Duplicate entries are updated, not duplicated.
            </p>
          </div>
        </div>
      </div>

      {/* Session selector - Locked to 2025-26 */}
      <div className="glass-card p-5">
        <label className="block text-sm font-medium text-slate-300 mb-2">Academic Session</label>
        <div className="input-field bg-slate-700/50 text-slate-300 font-medium cursor-not-allowed">
          2025-26
        </div>
        <p className="text-slate-500 text-xs mt-2">Session is locked to 2025-26 for all uploads</p>
      </div>

      {/* Current Reference File Status */}
      {loadingRef ? (
        <div className="glass-card p-5 animate-pulse">
          <div className="h-4 bg-slate-700/50 rounded w-1/4 mb-3"></div>
          <div className="h-10 bg-slate-700/50 rounded"></div>
        </div>
      ) : refFile ? (
        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-emerald-400" />
                <p className="font-semibold text-emerald-300">Current Reference Timetable</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <FileSpreadsheet size={14} className="text-cyan-400" />
                  <span><strong>File:</strong> {refFile.fileName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span><strong>Size:</strong> {refFile.fileSize}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar size={14} className="text-indigo-400" />
                  <span><strong>Uploaded:</strong> {new Date(refFile.uploadDate).toLocaleDateString('en-IN')} {new Date(refFile.uploadDate).toLocaleTimeString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <span><strong>Uploaded By:</strong> {refFile.uploadedBy}</span>
                </div>
                <p className="text-slate-400 text-xs italic mt-2">{refFile.description}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadReference}
              className="btn-secondary flex items-center gap-2 py-2 px-3 flex-shrink-0 whitespace-nowrap"
              title="Download the official reference timetable"
            >
              <Download size={16} />
              <span className="text-sm">Download</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-400" />
            <p className="text-amber-300">No reference timetable uploaded yet. Upload the first file to set the official reference.</p>
          </div>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`glass-card p-10 text-center cursor-pointer transition-all duration-300 ${
          dragOver ? 'border-indigo-500/60 bg-indigo-500/10 scale-[1.01]' : 'hover:border-indigo-500/30 hover:bg-indigo-500/5'
        }`}
      >
        <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={e => handleFile(e.target.files[0])} />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <FileSpreadsheet size={48} className="text-emerald-400" />
            <div>
              <p className="text-white font-semibold">{file.name}</p>
              <p className="text-slate-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null) }}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm transition-colors"
            >
              <X size={14} />
              Remove file
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border-2 border-dashed border-indigo-500/30 flex items-center justify-center">
              <Upload size={28} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-white font-semibold">Drop your Excel file here</p>
              <p className="text-slate-400 text-sm mt-1">or click to browse</p>
              <p className="text-slate-600 text-xs mt-2">.xlsx or .xls, max 10MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <>
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Processing Excel...
          </>
        ) : (
          <>
            <Upload size={18} />
            Upload & Process
          </>
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle size={20} className="text-emerald-400" />
            <p className="font-semibold text-emerald-300">Upload Complete</p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-emerald-500/10 rounded-xl">
              <p className="text-2xl font-bold text-emerald-400">{result.created}</p>
              <p className="text-slate-400 text-xs mt-0.5">Created</p>
            </div>
            <div className="text-center p-3 bg-cyan-500/10 rounded-xl">
              <p className="text-2xl font-bold text-cyan-400">{result.updated}</p>
              <p className="text-slate-400 text-xs mt-0.5">Updated</p>
            </div>
            <div className="text-center p-3 bg-indigo-500/10 rounded-xl">
              <p className="text-2xl font-bold text-indigo-400">{result.sections?.length || 0}</p>
              <p className="text-slate-400 text-xs mt-0.5">Sections</p>
            </div>
          </div>

          {result.sections?.length > 0 && (
            <div>
              <p className="text-slate-400 text-xs mb-2">Sections processed:</p>
              <div className="flex flex-wrap gap-2">
                {result.sections.map(s => (
                  <span key={s} className="badge badge-theory">{s}</span>
                ))}
              </div>
            </div>
          )}

          {result.errors?.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertCircle size={14} className="text-red-400" />
                <p className="text-red-400 text-xs font-medium">{result.errors.length} row errors</p>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <p key={i} className="text-red-300/70 text-xs font-mono">{err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

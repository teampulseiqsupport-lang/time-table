import React, { useState, useEffect } from 'react'
import { FileSpreadsheet, Download, AlertCircle, Calendar, User, Eye, X } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function TimetableReference() {
  const [refFile, setRefFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    fetchReferenceFile()
  }, [])

  const fetchReferenceFile = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/timetable/reference/info')
      if (data.success && data.refFile) {
        setRefFile(data.refFile)
      }
    } catch (err) {
      console.error('Error fetching reference:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!refFile) return
    setDownloadLoading(true)
    try {
      const response = await api.get(refFile.downloadUrl || `/timetable/reference/${refFile._id}/download`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', refFile.fileName || 'timetable-reference.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Reference file downloaded successfully')
    } catch (err) {
      console.error('Download error:', err)
      toast.error('Failed to download file. Please contact admin.')
    } finally {
      setDownloadLoading(false)
    }
  }

  const handlePreview = async () => {
    if (!refFile) return
    setPreviewLoading(true)
    try {
      const { data } = await api.get(refFile.previewUrl || `/timetable/reference/${refFile._id}/preview`)
      setPreview(data)
    } catch (err) {
      console.error('Preview error:', err)
      toast.error('Failed to open reference file preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="glass-card p-5 animate-pulse">
        <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-3"></div>
        <div className="h-20 bg-slate-700/50 rounded"></div>
      </div>
    )
  }

  if (!refFile) {
    return (
      <div className="glass-card p-5 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-300 font-medium">📋 Timetable Reference</p>
            <p className="text-slate-400 text-sm mt-1">No official reference timetable has been uploaded yet. Your actual timetable will be displayed once the admin uploads the reference file.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 border-emerald-500/20 bg-emerald-500/5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <FileSpreadsheet size={20} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-emerald-300 font-semibold">📋 Official Timetable Reference</p>
            <p className="text-slate-400 text-xs mt-0.5">Authorized source - Your timetable is set according to this file</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <FileSpreadsheet size={14} className="text-cyan-400 flex-shrink-0" />
          <span><strong>File:</strong> {refFile.fileName}</span>
        </div>
        
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <span><strong>Size:</strong> {refFile.fileSize}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <Calendar size={14} className="text-indigo-400 flex-shrink-0" />
          <span><strong>Last Updated:</strong> {new Date(refFile.uploadDate).toLocaleDateString('en-IN')} at {new Date(refFile.uploadDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <User size={14} className="text-purple-400 flex-shrink-0" />
          <span><strong>Uploaded By:</strong> {refFile.uploadedBy || 'Administrator'}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-700/50">
        <p className="text-slate-400 text-xs mb-3">
          ✅ <strong>This is the authorized timetable reference.</strong> All your class timings, rooms, and schedules are set according to this official file. If you have any discrepancies in your timetable, refer to this document.
        </p>
        
        <div className="grid sm:grid-cols-2 gap-2">
          <button
            onClick={handlePreview}
            disabled={previewLoading}
            className="btn-secondary w-full flex items-center justify-center gap-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye size={16} />
            {previewLoading ? 'Opening...' : 'View Reference'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloadLoading}
            className="btn-secondary w-full flex items-center justify-center gap-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            {downloadLoading ? 'Downloading...' : 'Download File'}
          </button>
        </div>
      </div>

      {preview && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="w-full max-w-6xl max-h-[90vh] glass-card overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700/70 flex items-center justify-between gap-3">
              <div>
                <p className="text-white font-semibold">{preview.fileName}</p>
                <p className="text-slate-500 text-xs">Showing first 100 rows per sheet</p>
              </div>
              <button onClick={() => setPreview(null)} className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-300">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-auto p-4 space-y-5">
              {preview.sheets?.map(sheet => (
                <div key={sheet.sheetName}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-cyan-300 font-semibold">{sheet.sheetName}</h3>
                    <span className="text-xs text-slate-500">{sheet.totalRows} rows</span>
                  </div>
                  <div className="overflow-auto rounded-xl border border-slate-700/70">
                    <table className="data-table min-w-max">
                      <thead>
                        <tr>
                          {(sheet.headers?.length ? sheet.headers : ['Column']).map((header, index) => (
                            <th key={`${sheet.sheetName}-h-${index}`}>{header || `Column ${index + 1}`}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.rows?.map((row, rowIndex) => (
                          <tr key={`${sheet.sheetName}-r-${rowIndex}`}>
                            {(sheet.headers?.length ? sheet.headers : row).map((_, cellIndex) => (
                              <td key={`${sheet.sheetName}-${rowIndex}-${cellIndex}`}>{row[cellIndex] || ''}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


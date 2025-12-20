import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { connectWS, getWS, addMessageListener, removeMessageListener } from '../ws';

interface FingerprintUploadModalProps {
  section: string;
  course: string;
  onClose: () => void;
  onSuccess?: (selectedWeek: string) => void;
}

interface UploadResult {
  filename: string;
  matched: boolean;
  student_id?: string;
  name?: string;
  error?: string;
}

export const FingerprintUploadModal: React.FC<FingerprintUploadModalProps> = ({
  section,
  course,
  onClose,
  onSuccess
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<string>('5.1');
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [uploadStats, setUploadStats] = useState<{ matched: number; total: number } | null>(null);

  const weeks = Array.from({ length: 15 }, (_, i) => {
    const week = i + 1;
    return { id: `${week}.1`, label: `Week ${week} - Session 1` };
  }).concat(
    Array.from({ length: 15 }, (_, i) => {
      const week = i + 1;
      return { id: `${week}.2`, label: `Week ${week} - Session 2` };
    })
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files).filter((f: File) =>
        f.type === 'image/bmp' || f.name.toLowerCase().endsWith('.bmp')
      ));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !selectedWeek) {
      alert('Please select files and a week');
      return;
    }

    setUploading(true);
    setUploadResults([]);
    setShowResults(false);

    try {
      // Convert files to base64
      const fingerprints = await Promise.all(
        selectedFiles.map(file => {
          return new Promise<{ name: string; base64: string }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;
              resolve({ name: file.name, base64 });
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );

      // Send to server
      connectWS('127.0.0.1');

      const requestId = `${Date.now()}-${Math.floor(Math.random()*10000)}`;

      const listener = (ev: MessageEvent) => {
        try {
          const msg = JSON.parse(ev.data) as any;
          if (msg && msg.type === 'fingerprint_attendance_response' && (msg.request_id === undefined || msg.request_id === requestId)) {
            console.log('Fingerprint attendance response:', msg);
            setUploadResults(msg.results || []);
            setUploadStats({
              matched: msg.matched_count || 0,
              total: msg.total_students || 0
            });
            setShowResults(true);
            removeMessageListener(listener);
            setUploading(false);
            console.log('Upload complete, results shown. User must click Done to close.');
          }
        } catch (e) {
          console.error('Invalid response', e);
        }
      };

      addMessageListener(listener);

      // Send upload request with retry
      const payload = {
        type: 'upload_fingerprint_attendance',
        section,
        week: selectedWeek,
        course,
        fingerprints,
        request_id: requestId
      };

      let attempts = 0;
      const maxAttempts = 40;
      const interval = setInterval(() => {
        const ws = getWS();
        if (ws && ws.readyState === WebSocket.OPEN) {
          try {
            console.log('Sending fingerprint attendance upload...');
            ws.send(JSON.stringify(payload));
            clearInterval(interval);
          } catch (e) {
            console.error('Failed to send upload', e);
            clearInterval(interval);
            setUploading(false);
          }
        } else {
          attempts += 1;
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            alert('WebSocket not available');
            setUploading(false);
            removeMessageListener(listener);
          }
        }
      }, 250);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error processing files');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-black sticky top-0 bg-white">
          <h2 className="text-2xl font-bold">Upload Fingerprints for Attendance</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={24} />
          </button>
        </div>

        {!showResults ? (
          <div className="p-6 space-y-6">
            {/* Section & Course Info */}
            <div className="bg-gray-50 p-4 rounded border-2 border-gray-200">
              <p className="text-sm text-gray-600">Section: <span className="font-bold">{section}</span></p>
              <p className="text-sm text-gray-600">Course: <span className="font-bold">{course}</span></p>
            </div>

            {/* Week Selection */}
            <div>
              <label className="block text-sm font-bold mb-2">Select Week & Session</label>
              <select
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-full p-3 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {weeks.map(week => (
                  <option key={week.id} value={week.id}>
                    {week.label}
                  </option>
                ))}
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-bold mb-2">Select BMP Files</label>
              <div className="border-4 border-dashed border-black rounded-lg p-8 text-center hover:bg-gray-50 transition cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".bmp,image/bmp"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="fingerprint-upload"
                />
                <label htmlFor="fingerprint-upload" className="cursor-pointer">
                  <Upload className="mx-auto mb-3 text-black" size={32} />
                  <p className="font-bold text-lg">Click to select BMP files</p>
                  <p className="text-sm text-gray-600">or drag & drop</p>
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-bold mb-2">{selectedFiles.length} file(s) selected:</p>
                  <div className="max-h-48 overflow-y-auto bg-gray-50 p-3 rounded border border-gray-300">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="text-sm text-gray-700 py-1">
                        ✓ {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className={`w-full font-bold py-3 px-4 rounded border-2 border-black transition-all
                ${uploading || selectedFiles.length === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white active:translate-y-1'
                }`}
            >
              {uploading ? 'Processing...' : 'Upload & Process'}
            </button>
          </div>
        ) : (
          // Results View
          <div className="p-6 space-y-6">
            {uploadStats && (
              <div className="bg-blue-50 p-4 rounded border-2 border-blue-300">
                <p className="text-lg font-bold text-blue-900">
                  ✓ Matched: {uploadStats.matched} / {uploadStats.total} students
                </p>
              </div>
            )}

            {uploadResults.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3">Upload Results</h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {uploadResults.map((result, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded border-l-4 flex items-start gap-3
                        ${result.matched ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}
                    >
                      {result.matched ? (
                        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                      ) : (
                        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{result.filename}</p>
                        {result.matched ? (
                          <p className="text-sm text-gray-700">
                            Matched to {result.student_id} - {result.name}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-700">
                            {result.error || 'No matching fingerprint found'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowResults(false);
                  setSelectedFiles([]);
                  setUploadResults([]);
                  setUploadStats(null);
                }}
                className="flex-1 font-bold py-3 px-4 rounded border-2 border-black bg-white hover:bg-gray-100 transition"
              >
                Upload More
              </button>
              <button
                onClick={() => {
                  onClose();
                  if (onSuccess) {
                    setTimeout(() => onSuccess(selectedWeek), 500);
                  }
                }}
                className="flex-1 font-bold py-3 px-4 rounded border-2 border-black bg-green-500 hover:bg-green-600 text-white transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

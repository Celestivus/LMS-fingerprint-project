import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { getWS, addMessageListener, removeMessageListener } from '../ws';

interface MedicalCertificationModalProps {
    studentId: string;
    courseName: string;
    sessionLabel: string;
    onClose: () => void;
    onSuccess: () => void;
}

export const MedicalCertificationModal: React.FC<MedicalCertificationModalProps> = ({
    studentId,
    courseName,
    sessionLabel,
    onClose,
    onSuccess,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                setMessage({ type: 'error', text: 'File size must be less than 10MB' });
                return;
            }
            setSelectedFile(file);
            setMessage(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage({ type: 'error', text: 'Please select a file' });
            return;
        }

        setIsUploading(true);
        setMessage(null);

        try {
            // Read file as base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileData = event.target?.result as string;
                
                const listener = (ev: MessageEvent) => {
                    try {
                        const msg = JSON.parse(ev.data);
                        if (msg && msg.type === 'medical_certification_response') {
                            if (msg.success) {
                                setMessage({ type: 'success', text: 'Certification uploaded successfully!' });
                                setTimeout(() => {
                                    removeMessageListener(listener);
                                    onSuccess();
                                    onClose();
                                }, 1500);
                            } else {
                                setMessage({ type: 'error', text: msg.message || 'Upload failed' });
                                removeMessageListener(listener);
                                setIsUploading(false);
                            }
                        }
                    } catch (e) {
                        console.error('Error parsing response', e);
                        removeMessageListener(listener);
                        setIsUploading(false);
                    }
                };

                addMessageListener(listener);

                const payload = {
                    type: 'upload_medical_certification',
                    student_id: studentId,
                    course_name: courseName,
                    session_label: sessionLabel,
                    file_name: selectedFile.name,
                    file_data: fileData,
                };

                const ws = getWS();
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify(payload));
                } else {
                    setMessage({ type: 'error', text: 'Connection lost' });
                    setIsUploading(false);
                    removeMessageListener(listener);
                }
            };
            reader.readAsDataURL(selectedFile);
        } catch (e) {
            console.error('Error uploading file', e);
            setMessage({ type: 'error', text: 'Error uploading file' });
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Medical Certification</h2>
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-4">
                        Upload your medical certificate for <strong>{courseName}</strong> - Week <strong>{sessionLabel}</strong>
                    </p>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                        <input
                            type="file"
                            id="file-input"
                            onChange={handleFileSelect}
                            disabled={isUploading}
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="hidden"
                        />
                        <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
                            <Upload size={32} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">
                                {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                            </span>
                            <span className="text-xs text-gray-500">PDF, JPG, PNG, DOC (max 10MB)</span>
                        </label>
                    </div>
                </div>

                {message && (
                    <div
                        className={`p-3 rounded mb-6 text-sm font-medium ${
                            message.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isUploading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
};

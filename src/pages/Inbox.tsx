import React, { useEffect, useState } from 'react';
import { Email, User } from '../types';
import { Mail, Trash2, Star, Check, X } from 'lucide-react';
import { getWS, connectWS, addMessageListener, removeMessageListener } from '../ws';

interface MedicalCertification {
  id: number;
  student_id: string;
  course_name: string;
  session_label: string;
  file_name: string;
  uploaded_at: string;
  status: string;
}

interface InboxProps {
  user: User;
}

const MOCK_EMAILS: Email[] = [
  { id: '1', sender: 'System', subject: 'Welcome to the system', preview: 'You have pending medical certifications to review', content: 'Check your certifications inbox.', date: 'Mon', time: '8:40', isRead: false, folder: 'inbox' },
  { id: '2', sender: 'SALIH ABDULLOYEV', subject: 'The previous week', preview: 'Let down and hanging around crushed like a bug in the ground', content: 'Hello,\n\nI noticed you missed the lab last week. Please ensure you submit the makeup assignment by Tuesday.\n\nBest,\nProf. Salih', date: 'Mon', time: '8:40', isRead: true, folder: 'inbox' },
  { id: '3', sender: 'Student Affairs', subject: 'Scholarship Update', preview: 'Regarding your application for the Fall semester...', content: 'We are pleased to inform you that your scholarship application has been reviewed.', date: 'Mon', time: '8:40', isRead: true, folder: 'inbox' },
  ];

export const Inbox: React.FC<InboxProps> = ({ user }) => {

  const [selectedFolder, setSelectedFolder] = useState<'inbox'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [certifications, setCertifications] = useState<MedicalCertification[]>([]);
  const [selectedCert, setSelectedCert] = useState<MedicalCertification | null>(null);
  const [certNotes, setCertNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredEmails = MOCK_EMAILS.filter(e => e.folder === selectedFolder);

  useEffect(() => {
    connectWS('192.168.16.217');

    const listener = (ev: MessageEvent) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg && msg.type === 'pending_certifications_list') {
          setCertifications(msg.certifications || []);
          console.log('Loaded certifications:', msg.certifications);
        } else if (msg && (msg.type === 'certification_approval_response' || msg.type === 'certification_rejection_response')) {
          if (msg.success) {
            setMessage({ type: 'success', text: msg.message });
            setTimeout(() => {
              setCertifications(certifications.filter(c => c.id !== selectedCert?.id));
              setSelectedCert(null);
              setCertNotes('');
              setMessage(null);
              setIsProcessing(false);
            }, 1500);
          } else {
            setMessage({ type: 'error', text: msg.message });
            setIsProcessing(false);
          }
        }
      } catch (e) {
        console.error('Error parsing message', e);
      }
    };

    addMessageListener(listener);

    // REQUEST CERTIFICATIONS
    const payload = { type: 'get_pending_certifications' };
    let attempts = 0;
    const maxAttempts = 40;
    const interval = setInterval(() => {
      const ws = getWS();
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(payload));
          clearInterval(interval);
        } catch (e) {
          console.error('Failed to send request', e);
          clearInterval(interval);
        }
      } else {
        attempts += 1;
        if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }
    }, 250);

    return () => {
      removeMessageListener(listener);
      clearInterval(interval);
    };
  }, []);

  const handleApproveCert = () => {
    if (!selectedCert) return;
    setIsProcessing(true);

    // Approve button selected
    const payload = {
      type: 'approve_certification',
      certification_id: selectedCert.id,
      professor_id: user.id,
      notes: certNotes,
    };

    const ws = getWS();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  };

  const handleDeclineCert = () => {
    if (!selectedCert) return;
    setIsProcessing(true);

    // Reject button selected
    const payload = {
      type: 'reject_certification',
      certification_id: selectedCert.id,
      professor_id: user.id,
      notes: certNotes,
    };

    const ws = getWS();
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  };

  const renderEmailContent = (email: Email) => {
    if (email.sender === 'System' && selectedCert) {
        return (
            <div className="w-full h-full flex flex-col bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b-2 border-black bg-gray-50 grid grid-cols-2 gap-x-8 gap-y-2 text-sm font-bold">
                    <div>Student ID: <span className="font-normal ml-2">{selectedCert.student_id}</span></div>
                    <div>Course: <span className="font-normal ml-2">{selectedCert.course_name}</span></div>
                    <div>Week: <span className="font-normal ml-2">{selectedCert.session_label}</span></div>
                    <div>Uploaded: <span className="font-normal ml-2">{new Date(selectedCert.uploaded_at).toLocaleDateString()}</span></div>
                    <div>File: <span className="font-normal ml-2 text-xs">{selectedCert.file_name}</span></div>
                </div>

                <div className="flex-1 p-8 flex flex-col overflow-y-auto">
                    <div className="w-full max-w-2xl bg-white shadow-lg border border-gray-300 p-8 mb-8 mx-auto relative">
                        <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center">
                        </div>
                        <h1 className="text-center font-serif text-3xl mb-8 tracking-widest text-gray-700">MEDICAL CERTIFICATE</h1>
                        <div className="mt-4 text-center text-sm text-gray-600">
                            <p>Student: <strong>{selectedCert.student_id}</strong></p>
                            <p>Course: <strong>{selectedCert.course_name}</strong></p>
                            <p>Week: <strong>{selectedCert.session_label}</strong></p>
                        </div>
                    </div>

                    <div className="w-full max-w-2xl mx-auto mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Your Notes
                        </label>
                        <textarea
                            value={certNotes}
                            onChange={(e) => setCertNotes(e.target.value)}
                            disabled={isProcessing}
                            placeholder="Add notes for your decision..."
                            className="w-full h-20 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"/>
                    </div>

                    {message && (
                        <div className={`w-full max-w-2xl mx-auto mb-4 p-3 rounded text-sm font-medium ${
                            message.type === 'success'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>)}

                    <div className="w-full max-w-2xl mx-auto flex gap-8">
                        <button 
                            onClick={handleApproveCert}
                            disabled={isProcessing}
                            className="flex-1 bg-[#10b981] hover:bg-[#059669] disabled:bg-gray-400 text-white py-3 rounded font-bold shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2">
                            <Check size={20} /> {isProcessing ? 'Processing...' : 'Approve'}
                        </button>
                        <button 
                            onClick={handleDeclineCert}
                            disabled={isProcessing}
                            className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] disabled:bg-gray-400 text-white py-3 rounded font-bold shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2">
                            <X size={20} /> {isProcessing ? 'Processing...' : 'Decline'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col bg-white border border-gray-200 shadow-sm p-6 max-w-3xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold mb-1">{email.subject}</h1>
                    <p className="text-sm text-gray-500">From: <span className="font-bold text-black">{email.sender}</span></p>
                </div>
                <div className="flex gap-2 text-gray-400">
                    <Star size={20} className="hover:text-yellow-400 cursor-pointer"/>
                    <Trash2 size={20} className="hover:text-red-500 cursor-pointer"/>
                </div>
            </div>
            
            <div className="flex-1 whitespace-pre-wrap font-sans text-gray-800 leading-relaxed">
                {email.content}
            </div>
        </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-180px)] border-t-2 border-black">
      <div className="w-64 border-r-2 border-black bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto">
            <div className="mt-4">
                <div onClick={() => setSelectedFolder('inbox')}
                    className={`px-4 py-2 cursor-pointer font-bold flex items-center gap-2 hover:bg-slate-100 ${selectedFolder === 'inbox' ? 'bg-slate-200' : ''}`}>
                    <span className="flex-1">Incoming</span>
                    {MOCK_EMAILS.filter(e => e.folder === 'inbox' && !e.isRead).length > 0 && (
                        <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                            {MOCK_EMAILS.filter(e => e.folder === 'inbox' && !e.isRead).length}
                        </span>
                    )}
                </div>
                <div onClick={() => setSelectedFolder('drafts')} className={`px-4 py-2 cursor-pointer font-medium flex items-center gap-2 hover:bg-slate-100 ${selectedFolder === 'drafts' ? 'bg-slate-200' : ''}`}>Drafts</div>
                <div onClick={() => setSelectedFolder('sent')} className={`px-4 py-2 cursor-pointer font-medium flex items-center gap-2 hover:bg-slate-100 ${selectedFolder === 'sent' ? 'bg-slate-200' : ''}`}>Sent</div>
            </div>
        </div>
      </div>

      {/*  Email List */}
      <div className="w-96 border-r-2 border-black bg-white overflow-y-auto scrollbar-hide flex flex-col">
        <div className="flex border-b-2 border-black sticky top-0 bg-white z-10">
          <button
            onClick={() => {
              setSelectedEmail(filteredEmails[0] || null);
              setSelectedCert(null);
            }}
            className={`flex-1 p-3 font-bold border-b-2 ${selectedEmail && !selectedCert ? 'border-blue-500 text-blue-600' : 'border-transparent'}`}>
            Emails
          </button>
          {user.role !== 'student' && (
            <button
              onClick={() => {
                setSelectedEmail(null);
                setSelectedCert(certifications[0] || null);
              }}
              className={`flex-1 p-3 font-bold border-b-2 relative ${selectedCert ? 'border-blue-500 text-blue-600' : 'border-transparent'}`}>
              Certifications {certifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {certifications.length}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Email List */}
        {!selectedCert && (
          <>
            <div className="p-3 border-b-2 border-black bg-gray-50 sticky top-12">
              <h2 className="font-bold text-xl underline decoration-2 underline-offset-4">Incoming</h2>
            </div>
            {filteredEmails.map(email => (
              <div 
                key={email.id}
                onClick={() => { setSelectedEmail(email); }}
                className={`p-4 border-b border-gray-300 cursor-pointer hover:bg-blue-50 transition-colors ${selectedEmail?.id === email.id ? 'bg-blue-100' : ''}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className={`font-bold text-sm ${!email.isRead ? 'text-black' : 'text-gray-700'}`}>{email.sender}</span>
                  <div className="text-xs text-right leading-tight">
                    <div className="font-bold">{email.date}</div>
                    <div className="text-gray-500">{email.time}</div>
                  </div>
                </div>
                <div className={`text-sm mb-1 ${!email.isRead ? 'font-bold' : ''}`}>{email.subject}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{email.preview}</div>
              </div>
            ))}
          </>
        )}

        {/* Certification List*/}
        {user.role !== 'student' && selectedCert !== null && (
          <>
            <div className="p-3 border-b-2 border-black bg-blue-50 sticky top-12">
              <h2 className="font-bold text-xl underline decoration-2 underline-offset-4">Pending Certifications</h2>
            </div>
            {certifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No pending certifications</div>
            ) : (
              certifications.map(cert => (
                <button
                  key={cert.id}
                  onClick={() => setSelectedCert(cert)}
                  className={`w-full p-4 border-b border-gray-300 text-left hover:bg-blue-50 transition-colors ${
                    selectedCert?.id === cert.id ? 'bg-blue-100' : ''
                  }`}>
                  <div className="font-bold text-sm text-gray-800">{cert.student_id}</div>
                  <div className="text-xs text-gray-600">{cert.course_name}</div>
                  <div className="text-xs text-gray-600">Week {cert.session_label}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {new Date(cert.uploaded_at).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </>
        )}
      </div>

      <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {selectedEmail ? renderEmailContent(selectedEmail) : selectedCert && user.role !== 'student' ? renderEmailContent(MOCK_EMAILS[0]) : (
            <div className="text-center opacity-40">
                <Mail size={80} className="mx-auto mb-4 stroke-1"/>
                <h1 className="text-3xl font-bold text-black mb-2">Click on a message to review it.</h1>
                {user.role === 'student' && <p className="text-gray-500 mt-4">Upload medical certifications in the Attendance page.</p>}
            </div>)}
      </div>
    </div>
  );
};
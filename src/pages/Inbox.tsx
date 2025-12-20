import React, { useEffect, useState } from 'react';
import { Email } from '../types';
import { Mail, Trash2, Star, ChevronDown, Check, X } from 'lucide-react';
import { getWS } from '../ws';

const MOCK_EMAILS: Email[] = [
  { id: '1', sender: 'Medical certification', subject: 'Day before', preview: 'Let down and hanging around crushed like a bug in the ground', content: 'See attached.', date: 'Mon', time: '8:40', isRead: false, folder: 'inbox' },
  { id: '2', sender: 'SALIH ABDULLOYEV', subject: 'The previous week', preview: 'Let down and hanging around crushed like a bug in the ground', content: 'Hello,\n\nI noticed you missed the lab last week. Please ensure you submit the makeup assignment by Tuesday.\n\nBest,\nProf. Salih', date: 'Mon', time: '8:40', isRead: true, folder: 'inbox' },
  { id: '3', sender: 'Student Affairs', subject: 'Scholarship Update', preview: 'Regarding your application for the Fall semester...', content: 'We are pleased to inform you that your scholarship application has been reviewed.', date: 'Mon', time: '8:40', isRead: true, folder: 'inbox' },
  ];

export const Inbox: React.FC = () => {
  const ws = getWS();

  const [selectedFolder, setSelectedFolder] = useState<'inbox'>('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const filteredEmails = MOCK_EMAILS.filter(e => e.folder === selectedFolder);
  useEffect(() => {
        if (!ws) return;

        ws.onmessage = (event) => {
            console.log("Received:", event.data);

            let data;
            try {
                data = JSON.parse(event.data); 
            } catch {
                data = event.data;
            }

        };

        return () => ws.close();
    }, [ws]);

  const renderEmailContent = (email: Email) => {
    if (email.sender === 'Medical certification') {
        return (
            <div className="w-full h-full flex flex-col bg-white border border-gray-200 shadow-sm overflow-hidden">
                {/* Custom Header for Medical Cert */}
                <div className="p-4 border-b-2 border-black bg-gray-50 grid grid-cols-2 gap-x-8 gap-y-2 text-sm font-bold">
                    <div>Name: <span className="font-normal ml-2">Magomed Indus</span></div>
                    <div>Course: <span className="font-normal ml-2">Operating System</span></div>
                    <div>ID: <span className="font-normal ml-2">U2310000</span></div>
                    <div>Absence day: <span className="font-normal ml-2">12/03/2024</span></div>
                    <div>Group: <span className="font-normal ml-2">CSE 23-01</span></div>
                </div>

                <div className="flex-1 p-8 flex flex-col items-center overflow-y-auto">
                    {/* Mock Certificate Image */}
                    <div className="w-full max-w-2xl bg-white shadow-lg border border-gray-300 p-8 mb-8 relative">
                        <div className="absolute top-4 left-4 w-16 h-16 rounded-full border-4 border-blue-200 flex items-center justify-center">
                        </div>
                        <h1 className="text-center font-serif text-3xl mb-8 tracking-widest text-gray-700">MEDICAL CERTIFICATE</h1>
                        <div className="mt-16 flex justify-end">
                            <div className="text-center">
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-8 w-full max-w-xl">
                        <button className="flex-1 bg-[#10b981] hover:bg-[#059669] text-white py-3 rounded font-bold shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2">
                            <Check size={20} /> Approve
                        </button>
                        <button className="flex-1 bg-[#ef4444] hover:bg-[#dc2626] text-white py-3 rounded font-bold shadow-md active:translate-y-1 transition-all flex items-center justify-center gap-2">
                            <X size={20} /> Decline
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Default Email View
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
      {/* Left Sidebar - Folders */}
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

      {/* Middle Column - Email List */}
      <div className="w-96 border-r-2 border-black bg-white overflow-y-auto scrollbar-hide">
        <div className="p-3 border-b-2 border-black flex justify-between items-center bg-gray-50 sticky top-0">
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
      </div>

      {/* Right Column - Reading Pane */}
      <div className="flex-1 bg-gray-50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
        {selectedEmail ? renderEmailContent(selectedEmail) : (
            <div className="text-center opacity-40">
                <Mail size={80} className="mx-auto mb-4 stroke-1"/>
                <h1 className="text-3xl font-bold text-black mb-2">Click on the</h1>
                <h1 className="text-3xl font-bold text-black">message to read it.</h1>
            </div>)}
      </div>
    </div>
  );
};
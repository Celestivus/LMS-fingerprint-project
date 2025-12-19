import React, { useState, useRef } from 'react';

interface FingerprintScannerProps {
    onComplete: () => void;
}

export const FingerprintScanner: React.FC<FingerprintScannerProps> = ({ onComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileCount, setFileCount] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFileCount(e.target.files.length);
            setIsProcessing(true);
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans border-[12px] border-black box-border animate-in fade-in duration-200">
             <div className="flex w-full h-32 border-b-[6px] border-black shrink-0">
                <div className="flex-1 flex items-center justify-center border-r-[6px] border-black">
                     <h1 className="text-4xl font-bold text-black text-center">Fingerprint verification page</h1>
                </div>
                <div className="flex-1 flex items-center justify-center">
                     <h1 className="text-4xl font-bold text-black text-center">Inha University in Tashkent</h1>
                </div>
             </div>

             <div className="flex-1 flex flex-col items-center justify-center">
                  <div className={`mb-12 transition-all duration-500 ${isProcessing ? 'scale-110 opacity-80' : 'scale-100'}`}>
                      <svg width="250" height="300" viewBox="0 0 100 120" className={isProcessing ? "animate-pulse" : ""}>
                        <defs>
                            <linearGradient id="rainbow" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ef4444" />
                                <stop offset="20%" stopColor="#f97316" />
                                <stop offset="40%" stopColor="#eab308" />
                                <stop offset="60%" stopColor="#22c55e" />
                                <stop offset="80%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#a855f7" />
                            </linearGradient>
                        </defs>
                         <path d="M50 110 C20 110 10 70 10 50 C10 25 25 10 50 10 C75 10 90 25 90 50 C90 70 80 110 50 110" fill="none" stroke="url(#rainbow)" strokeWidth="3" strokeLinecap="round"/>
                         <path d="M50 100 C30 100 20 70 20 50 C20 30 30 20 50 20 C70 20 80 30 80 50 C80 70 70 100 50 100" fill="none" stroke="url(#rainbow)" strokeWidth="3" strokeLinecap="round" strokeDasharray="0"/>
                         <path d="M50 90 C40 90 30 70 30 50 C30 38 38 30 50 30 C62 30 70 38 70 50 C70 70 60 90 50 90" fill="none" stroke="url(#rainbow)" strokeWidth="3" strokeLinecap="round"/>
                         <path d="M50 80 C45 80 40 70 40 50 C40 44 44 40 50 40 C56 40 60 44 60 50 C60 70 55 80 50 80" fill="none" stroke="url(#rainbow)" strokeWidth="3" strokeLinecap="round"/>
                         <path d="M50 70 V50" stroke="url(#rainbow)" strokeWidth="3" strokeLinecap="round" />
                         <path d="M50 60 C48 60 46 55 46 50" stroke="url(#rainbow)" strokeWidth="3" strokeLinecap="round" />
                         <path d="M50 60 C52 60 54 55 54 50" stroke="url(#rainbow)" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                  </div>

                  <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*"
                      multiple />

                  <button
                    onClick={handleUploadClick}
                    disabled={isProcessing}
                    className="bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-12 rounded shadow-sm text-lg transition-colors min-w-[300px]" >
                    {isProcessing ? `Verifying ${fileCount} scan...` : 'Upload fingerprint'}
                  </button>
             </div>
        </div>
    )
}

import React, { useState, useEffect } from 'react';

// Define the electron type for window.require usage
declare global {
  interface Window {
    require: any;
  }
}

interface FingerprintScannerProps {
    onComplete: () => void;
}

export const FingerprintScanner: React.FC<FingerprintScannerProps> = ({ onComplete }) => {
  const [status, setStatus] = useState<'IDLE' | 'INITIALIZING' | 'WAITING_FOR_FINGER' | 'PROCESSING' | 'DONE'>('IDLE');
  const [deviceLog, setDeviceLog] = useState<string>('Ready to connect...');

  // Hook into Electron IPC
  useEffect(() => {
    let ipcRenderer: any;
    try {
        // Attempt to load electron ipcRenderer (only works in Electron context)
        if (window.require) {
            const electron = window.require('electron');
            ipcRenderer = electron.ipcRenderer;
            
            // Listen for status updates from main process
            ipcRenderer.on('biolink:status', (_event: any, hwStatus: string) => {
                if (hwStatus === 'DEVICE_READY') {
                    setStatus('WAITING_FOR_FINGER');
                    setDeviceLog('BioLink UM-MB3.5 Connected. Place finger on sensor.');
                } else if (hwStatus === 'FINGER_DETECTED') {
                    setStatus('PROCESSING');
                    setDeviceLog('Scanning fingerprint...');
                }
            });

            // Listen for success
            ipcRenderer.on('biolink:success', (_event: any, data: any) => {
                setDeviceLog(`Scan Complete. Quality: ${data.quality}%`);
                setStatus('DONE');
            });
        }
    } catch (e) {
        console.warn("Not running in Electron or IPC failed", e);
        setDeviceLog("Hardware driver not found (Web Mode)");
    }

    // Cleanup listeners
    return () => {
        if (ipcRenderer) {
            ipcRenderer.removeAllListeners('biolink:status');
            ipcRenderer.removeAllListeners('biolink:success');
        }
    };
  }, []);

  const handleStartScan = () => {
    setStatus('INITIALIZING');
    setDeviceLog('Initializing USB Driver...');
    
    try {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('biolink:start-scan');
        } else {
            // Web Fallback if testing outside Electron
            setTimeout(() => {
                setStatus('WAITING_FOR_FINGER');
                setDeviceLog('Web Sim: Place finger...');
                setTimeout(() => {
                    setStatus('PROCESSING');
                    setTimeout(() => setStatus('DONE'), 1000);
                }, 1500);
            }, 500);
        }
    } catch (e) {
        console.error("IPC Send Failed", e);
    }
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col items-center justify-center animate-in fade-in duration-300">
        {/* Header */}
        <div className="w-full absolute top-0 border-b-4 border-black flex items-center bg-white h-24">
            <div className="w-1/2 flex items-center justify-center border-r-4 border-black h-full">
                <h1 className="text-4xl font-bold">Fingerprint verification page</h1>
            </div>
            <div className="w-1/2 flex items-center justify-center h-full">
                <h1 className="text-4xl font-bold">Inha University in Tashkent</h1>
            </div>
        </div>

        {/* Content */}
        <div className="flex flex-col items-center mt-20">
            {/* BioLink Device Info */}
            <div className="mb-4 text-center">
                 <div className="text-xs font-mono text-gray-500 mb-1">TARGET DEVICE</div>
                 <div className="font-bold border px-2 py-1 bg-gray-100 rounded">BIOLINK U-MATCH UM-MB3.5</div>
            </div>

            {/* Rainbow Fingerprint SVG */}
            <div className="mb-8 relative">
                <svg width="200" height="240" viewBox="0 0 100 120" className={status === 'PROCESSING' ? 'animate-pulse' : ''}>
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
                    
                    {/* Visual feedback based on status */}
                    <path 
                        d="M50 110 C20 110 10 70 10 50 C10 25 25 10 50 10 C75 10 90 25 90 50 C90 70 80 110 50 110" 
                        fill={status === 'WAITING_FOR_FINGER' ? 'rgba(16, 185, 129, 0.1)' : 'none'}
                        stroke={status === 'DONE' ? '#10b981' : "url(#rainbow)"}
                        strokeWidth="3" 
                        strokeLinecap="round"
                    />
                    
                    {/* Inner Loops */}
                    {status !== 'IDLE' && (
                        <>
                            <path d="M50 100 C30 100 20 70 20 50 C20 30 30 20 50 20 C70 20 80 30 80 50 C80 70 70 100 50 100" fill="none" stroke={status === 'DONE' ? '#10b981' : "url(#rainbow)"} strokeWidth="3" strokeLinecap="round" strokeDasharray={status === 'WAITING_FOR_FINGER' ? "5 2" : "0"}/>
                            <path d="M50 90 C40 90 30 70 30 50 C30 38 38 30 50 30 C62 30 70 38 70 50 C70 70 60 90 50 90" fill="none" stroke={status === 'DONE' ? '#10b981' : "url(#rainbow)"} strokeWidth="3" strokeLinecap="round"/>
                            <path d="M50 80 C45 80 40 70 40 50 C40 44 44 40 50 40 C56 40 60 44 60 50 C60 70 55 80 50 80" fill="none" stroke={status === 'DONE' ? '#10b981' : "url(#rainbow)"} strokeWidth="3" strokeLinecap="round"/>
                        </>
                    )}
                </svg>
            </div>

            {/* Status Log */}
            <div className="h-8 mb-8 font-mono text-sm text-gray-600">
                {deviceLog}
            </div>

            {/* Buttons Row */}
            <div className="flex gap-6">
                <button 
                    onClick={handleStartScan}
                    disabled={status !== 'IDLE'}
                    className={`w-40 py-3 rounded-lg font-bold text-white transition-all shadow-md
                        ${status === 'IDLE' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#10b981]/50 cursor-not-allowed'}`}>
                    Start
                </button>

                <button 
                    disabled
                    className={`w-40 py-3 rounded-lg font-bold text-white transition-all shadow-md
                         ${['INITIALIZING', 'WAITING_FOR_FINGER', 'PROCESSING'].includes(status) ? 'bg-[#10b981] animate-pulse' : 'bg-[#10b981]/50 cursor-not-allowed'}`}
                >
                    {status === 'WAITING_FOR_FINGER' ? 'Scan Finger...' : 'Processing...'}
                </button>

                <button 
                    onClick={onComplete}
                    disabled={status !== 'DONE'}
                    className={`w-40 py-3 rounded-lg font-bold text-white transition-all shadow-md
                         ${status === 'DONE' ? 'bg-[#10b981] hover:bg-[#059669]' : 'bg-[#10b981]/50 cursor-not-allowed'}`}>
                    Done
                </button>
            </div>
        </div>
    </div>
  );
};
import React from 'react';
import { Database } from 'lucide-react';

export const SysAdmin: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-500 font-mono items-center justify-center">
        <div className="text-center">
            <Database size={64} className="mx-auto mb-6 opacity-20" />
            <h1 className="text-2xl font-bold mb-2">SQL DATABASE VIEW</h1>
            <p className="text-sm border-t border-gray-800 pt-4 mt-2">
                [ EMPTY_CONNECTION_POOL ]<br/>
                Waiting for implementation...
            </p>
        </div>
    </div>
  );
};
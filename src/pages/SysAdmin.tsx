import React, { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { getWS, addMessageListener, removeMessageListener } from '../ws';

interface TableData {
  columns: string[];
  rows: Record<string, any>[];
  row_count: number;
  error?: string;
}

export const SysAdmin: React.FC = () => {
  const [tables, setTables] = useState<Record<string, TableData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    const handleTablesResponse = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        console.log("Received database_tables_response:", data);
        if (data.type === "database_tables_response") {
          if (data.success && data.data) {
            setTables(data.data);
            setError(null);
            const tableNames = Object.keys(data.data);
            if (tableNames.length > 0) {
              setSelectedTable(tableNames[0]);
            }
          } else {
            setError(data.error || "Failed to fetch database tables");
          }
          setLoading(false);
        }
      } catch (e) {
        console.error("Error parsing response:", e);
      }
    };

    // Request to tables
    const ws = getWS();
    if (ws) {
      addMessageListener(handleTablesResponse);
      ws.send(
        JSON.stringify({
          type: "get_database_tables",
        })
      );

      return () => {
        removeMessageListener(handleTablesResponse);
      };
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-900 text-gray-500 font-mono items-center justify-center">
        <Database size={64} className="mx-auto mb-6 opacity-20 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2">Loading database tables...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gray-900 text-red-400 font-mono p-6">
        <h1 className="text-2xl font-bold mb-4">Error Loading Database</h1>
        <p>{error}</p>
      </div>
    );
  }

  const tableNames = Object.keys(tables);

  return (
    <div className="flex h-full bg-gray-900 text-gray-300 font-mono">
      <div className="w-48 border-r border-green-700 overflow-y-auto bg-gray-950">
        <div className="p-4 border-b border-green-700">
          <h2 className="text-green-400 text-sm font-bold">TABLES ({tableNames.length})</h2>
        </div>
        <div className="p-2">
          {tableNames.map((tableName) => (
            <button
              key={tableName}
              onClick={() => setSelectedTable(tableName)}
              className={`w-full text-left px-3 py-2 mb-1 rounded text-xs font-mono transition-colors ${
                selectedTable === tableName
                  ? 'bg-green-700 text-black font-bold'
                  : 'hover:bg-gray-800 text-green-400'
              }`}
            >
              {tableName}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {selectedTable && tables[selectedTable] && (
          <TableViewer
            tableName={selectedTable}
            tableData={tables[selectedTable]}
          />
        )}
      </div>
    </div>
  );
};

interface TableViewerProps {
  tableName: string;
  tableData: TableData;
}

function TableViewer({ tableName, tableData }: TableViewerProps) {
  if (tableData.error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-red-400">
          <h2 className="text-xl font-bold mb-2">{tableName}</h2>
          <p>Error: {tableData.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-green-700 bg-gray-950">
        <h2 className="text-green-400 text-lg font-bold">{tableName}</h2>
        <p className="text-xs text-green-600">Sample rows: {tableData.row_count}</p>
      </div>

      {tableData.row_count === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">No data in this table.</p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 bg-gray-800 border-b border-green-700">
              <tr>
                {tableData.columns.map((col) => (
                  <th
                    key={col}
                    className="px-4 py-2 text-left text-green-400 font-bold border-r border-green-700 last:border-r-0 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.rows.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-green-900 ${
                    idx % 2 === 0 ? 'bg-gray-950' : 'bg-gray-900'
                  } hover:bg-gray-800`}>
                  {tableData.columns.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-2 border-r border-green-900 last:border-r-0 break-words max-w-xs">
                      {formatCellValue(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formatCellValue(value: any): string {
  if (value === null) return 'NULL';
  if (value === undefined) return 'undefined';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'object') {
    if (value instanceof Uint8Array || Array.isArray(value)) {
      return `[Binary: ${value.length} bytes]`;
    }
    return JSON.stringify(value);
  }
  const str = String(value);
  return str.length > 100 ? str.substring(0, 100) + '...' : str;
}
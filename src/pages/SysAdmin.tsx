import React, { useEffect, useRef, useState } from "react";
import { Database } from "lucide-react";

export const SysAdmin: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [table, setTable] = useState("students");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("SysAdmin WebSocket connected");
      ws.send(JSON.stringify({ type: "get_table_data", table }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        console.log("Received message:", msg);

        if (msg.type === "table_data") {
          if (msg.success) {
            setRows(msg.rows);
            setError(null);
          } else {
            setError(msg.error || "Unknown error");
            setRows([]);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error("Parse error:", err);
        setError("Failed to parse server response");
        setLoading(false);
      }
    };

    ws.onerror = (e) => {
      console.error("WebSocket error:", e);
      setError("Connection error");
      setLoading(false);
    };

    ws.onclose = () => {
      console.log("SysAdmin WS closed");
      setError("Connection closed");
      setLoading(false);
    };

    return () => ws.close();
  }, []);

  useEffect(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "get_table_data", table }));
      setLoading(true);
      setError(null);
      setRows([]);
    }
  }, [table]);

  return (
    <div className="p-6 bg-gray-900 text-gray-200 font-mono min-h-screen">
      <div className="flex items-center mb-6">
        <Database className="mr-3 opacity-60" size={28} />
        <h1 className="text-2xl font-bold">SYSADMIN DATABASE VIEW</h1>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <label className="text-lg">Table:</label>
        <select
          value={table}
          onChange={(e) => setTable(e.target.value)}
          className="bg-gray-800 border border-gray-700 p-3 rounded text-lg">
          <option value="students">Students</option>
          <option value="professors">Professors</option>
          <option value="attendance">Attendance</option>
        </select>
      </div>

      {loading && (
        <div className="text-center text-xl mt-20">Loading table data...</div>
      )}

      {error && (
        <div className="text-center text-red-500 text-xl mt-20">
          Error: {error}
          <br />
          <small>Check server logs and browser console</small>
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700 text-sm">
            <thead className="bg-gray-800 sticky top-0">
              <tr>
                {Object.keys(rows[0]).map((col) => (
                  <th key={col} className="p-3 border border-gray-700 text-left">
                    {col.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-800 transition-colors">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="p-3 border border-gray-700">
                      {String(val)}
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
};
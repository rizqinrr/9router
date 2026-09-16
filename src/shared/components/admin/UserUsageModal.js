"use client";

import { useState, useEffect } from "react";

export default function UserUsageModal({ user, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch(`/api/admin/users/${user.id}/usage`);
        if (!res.ok) throw new Error("Failed to fetch usage");
        const result = await res.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsage();
  }, [user.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Usage: {user.username}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {loading && <div className="text-center py-8">Loading...</div>}
        {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

        {data && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Total Requests</div>
                <div className="text-2xl font-bold">{data.stats.totalRequests}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Total Cost</div>
                <div className="text-2xl font-bold">${data.stats.totalCost.toFixed(4)}</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Prompt Tokens</div>
                <div className="text-2xl font-bold">{data.stats.totalPromptTokens.toLocaleString()}</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600">Completion Tokens</div>
                <div className="text-2xl font-bold">{data.stats.totalCompletionTokens.toLocaleString()}</div>
              </div>
            </div>

            {/* By Model */}
            <div>
              <h3 className="font-medium mb-2">Usage by Model</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Model</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Requests</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cost</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Tokens</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(data.stats.byModel).map(([model, stats]) => (
                      <tr key={model}>
                        <td className="px-4 py-2 text-sm">{model}</td>
                        <td className="px-4 py-2 text-sm text-right">{stats.requests}</td>
                        <td className="px-4 py-2 text-sm text-right">${stats.cost.toFixed(4)}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          {(stats.promptTokens + stats.completionTokens).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Usage */}
            <div>
              <h3 className="font-medium mb-2">Recent Activity</h3>
              <div className="border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Model</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Provider</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {data.recentUsage.map((u, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-sm">{new Date(u.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2 text-sm">{u.model}</td>
                        <td className="px-4 py-2 text-sm">{u.provider}</td>
                        <td className="px-4 py-2 text-sm text-right">${(u.cost || 0).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

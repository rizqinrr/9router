"use client";

import { useState } from "react";

export default function UsersTable({ users, onEdit, onViewUsage, onAddDays, onResetPin, onDelete, onImpersonate }) {
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");

  const sortedUsers = [...users].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusBadge = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      grace: "bg-yellow-100 text-yellow-800",
      expired: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.active}`}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${role === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => { setSortField("username"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>
              Username {sortField === "username" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer" onClick={() => { setSortField("daysRemaining"); setSortDir(sortDir === "asc" ? "desc" : "asc"); }}>
              Days Left {sortField === "daysRemaining" && (sortDir === "asc" ? "↑" : "↓")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedUsers.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap font-medium">{user.username}</td>
              <td className="px-4 py-3 whitespace-nowrap">{getRoleBadge(user.role)}</td>
              <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(user.status)}</td>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className={user.daysRemaining <= 7 ? "text-red-600 font-bold" : ""}>
                  {user.daysRemaining}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.expiresAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm space-x-2">
                <button
                  onClick={() => onViewUsage(user)}
                  className="text-blue-600 hover:text-blue-800"
                  title="View Usage"
                >
                  Usage
                </button>
                <button
                  onClick={() => onEdit(user)}
                  className="text-indigo-600 hover:text-indigo-800"
                  title="Edit"
                >
                  Edit
                </button>
                <button
                  onClick={() => onImpersonate(user.id)}
                  className="text-green-600 hover:text-green-800"
                  title="Login as this user"
                >
                  Login
                </button>
                {user.role !== "admin" && (
                  <button
                    onClick={() => onDelete(user.id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {sortedUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">No users found</div>
      )}
    </div>
  );
}

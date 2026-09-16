"use client";

import { useState } from "react";

export default function EditUserModal({ user, onClose, onAddDays, onResetPin, onDelete }) {
  const [daysToAdd, setDaysToAdd] = useState(30);
  const [newPin, setNewPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAddDays = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await onAddDays(user.id, daysToAdd);
      setSuccess(`Added ${daysToAdd} days successfully`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPin = async () => {
    if (!newPin || newPin.length < 4) {
      setError("PIN must be at least 4 characters");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await onResetPin(user.id, newPin);
      setSuccess("PIN reset successfully");
      setNewPin("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit User: {user.username}</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Current Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Status: <span className="font-medium">{user.status}</span></div>
              <div>Role: <span className="font-medium">{user.role}</span></div>
              <div>Days Left: <span className="font-medium">{user.daysRemaining}</span></div>
              <div>Expires: <span className="font-medium">{new Date(user.expiresAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          {/* Add Days */}
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">Add Days</h3>
            <div className="flex gap-2">
              <input
                type="number"
                value={daysToAdd}
                onChange={(e) => setDaysToAdd(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border rounded-lg"
                min="1"
              />
              <button
                onClick={handleAddDays}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Add or subtract days from expiration</p>
          </div>

          {/* Reset PIN */}
          <div className="border p-4 rounded-lg">
            <h3 className="font-medium mb-2">Reset PIN</h3>
            <div className="flex gap-2">
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="New PIN"
                className="flex-1 px-3 py-2 border rounded-lg"
                minLength={4}
              />
              <button
                onClick={handleResetPin}
                disabled={loading || !newPin}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          {user.role !== "admin" && (
            <div className="border border-red-200 p-4 rounded-lg bg-red-50">
              <h3 className="font-medium mb-2 text-red-800">Danger Zone</h3>
              <button
                onClick={() => {
                  if (confirm("Are you sure? This will permanently delete the user and all their data.")) {
                    onDelete(user.id);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

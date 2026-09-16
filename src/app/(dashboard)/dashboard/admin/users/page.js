"use client";

import { Suspense, useState, useEffect } from "react";
import { CardSkeleton, SegmentedControl } from "@/shared/components";
import UsersTable from "@/shared/components/admin/UsersTable";
import CreateUserModal from "@/shared/components/admin/CreateUserModal";
import EditUserModal from "@/shared/components/admin/EditUserModal";
import UserUsageModal from "@/shared/components/admin/UserUsageModal";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<CardSkeleton />}>
      <AdminUsersContent />
    </Suspense>
  );
}

function AdminUsersContent() {
  const [users, setUsers] = useState([]);
  const [activeCount, setActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUsageUser, setViewingUsageUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users || []);
      setActiveCount(data.activeCount || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!cancelled) await fetchUsers();
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const handleCreateUser = async (userData) => {
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create user");
    }
    await fetchUsers();
    setShowCreateModal(false);
  };

  const handleAddDays = async (userId, days) => {
    const res = await fetch(`/api/admin/users/${userId}/add-days`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to add days");
    }
    await fetchUsers();
  };

  const handleResetPin = async (userId, pin) => {
    const res = await fetch(`/api/admin/users/${userId}/reset-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to reset PIN");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to delete user");
    }
    await fetchUsers();
  };

  const handleImpersonate = async (userId) => {
    const res = await fetch("/api/admin/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to impersonate");
    }
    const data = await res.json();
    // Redirect to user's dashboard
    window.location.href = `/dashboard/${data.impersonating.username}`;
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6 px-1 sm:px-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-gray-500">
            {activeCount} active user(s) • {users.length} total
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create User
        </button>
      </div>

      {loading ? (
        <CardSkeleton />
      ) : (
        <UsersTable
          users={users}
          onEdit={setEditingUser}
          onViewUsage={setViewingUsageUser}
          onAddDays={handleAddDays}
          onResetPin={handleResetPin}
          onDelete={handleDeleteUser}
          onImpersonate={handleImpersonate}
        />
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onAddDays={handleAddDays}
          onResetPin={handleResetPin}
          onDelete={handleDeleteUser}
        />
      )}

      {viewingUsageUser && (
        <UserUsageModal
          user={viewingUsageUser}
          onClose={() => setViewingUsageUser(null)}
        />
      )}
    </div>
  );
}

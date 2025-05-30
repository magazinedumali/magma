import React, { useState, useEffect } from "react";
import UserModal from "./UserModal";
import { supabase } from '@/lib/supabaseClient';

const PAGE_SIZE = 5;

const UsersPage = () => {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [success, setSuccess] = useState<string|null>(null);

  // Fetch users from Supabase Auth
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
      if (error) throw error;
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchUsers(); }, [page]);

  // Recherche
  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.user_metadata?.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.user_metadata?.role?.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(0, PAGE_SIZE); // API paginée côté serveur

  // Ajout (invitation)
  const handleInvite = async (user) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(user.email);
      if (error) throw error;
      setSuccess("Invitation envoyée ! L'utilisateur pourra être édité (nom/rôle) après inscription.");
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'invitation.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditUser(null);
    }
  };

  // Edition (rôle)
  const handleSave = async (user) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, name: user.name, role: user.role } });
      if (error) throw error;
      setSuccess('Utilisateur modifié !');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la modification.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditUser(null);
    }
  };

  // Suppression
  const handleDelete = async (user) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      setSuccess('Utilisateur supprimé !');
      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la suppression.");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Utilisateurs</h2>
        <button
          style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 500, fontFamily: 'Jost, sans-serif', cursor: 'pointer', fontSize: 16 }}
          onClick={() => { setEditUser(null); setModalOpen(true); }}
        >
          + Ajouter un utilisateur
        </button>
      </div>
      <input
        type="text"
        placeholder="Rechercher un utilisateur..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', width: 320, marginBottom: 24, fontFamily: 'Jost, sans-serif' }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <thead>
          <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Nom</th>
            <th style={{ padding: 12 }}>Email</th>
            <th style={{ padding: 12 }}>Rôle</th>
            <th style={{ padding: 12, width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>Aucun utilisateur trouvé.</td></tr>
          ) : (
            paginated.map(user => (
              <tr key={user.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: 12 }}>{user.user_metadata?.name}</td>
                <td style={{ padding: 12 }}>{user.email}</td>
                <td style={{ padding: 12 }}>{user.user_metadata?.role}</td>
                <td style={{ padding: 12 }}>
                  <button
                    style={{ background: '#e5e9f2', border: 'none', borderRadius: 6, padding: '6px 12px', marginRight: 8, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
                    onClick={() => { setEditUser(user); setModalOpen(true); }}
                  >
                    Éditer
                  </button>
                  <button
                    style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
                    onClick={() => setConfirmDelete(user)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Pagination */}
      {pageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 8 }}>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              style={{
                background: page === i + 1 ? '#4f8cff' : '#e5e9f2',
                color: page === i + 1 ? '#fff' : '#23272f',
                border: 'none',
                borderRadius: 6,
                padding: '6px 14px',
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'Jost, sans-serif'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
      {/* Modale ajout/édition */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialData={editUser}
      />
      {/* Confirmation suppression */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 8px #0002' }}>
            <div style={{ fontSize: 18, marginBottom: 18 }}>Supprimer l'utilisateur "{confirmDelete.user_metadata?.name}" ?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage; 
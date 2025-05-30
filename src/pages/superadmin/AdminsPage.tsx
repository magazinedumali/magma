import React, { useState } from "react";
import UserModal from "./UserModal";

const DUMMY_ADMINS = [
  { id: 1, name: "Alice Martin", email: "alice@email.com", role: "admin" },
  { id: 2, name: "Fanny Morel", email: "fanny@email.com", role: "admin" },
];

const PAGE_SIZE = 5;

const AdminsPage = () => {
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState(DUMMY_ADMINS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = admins.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = (admin) => {
    if (admin.id) {
      setAdmins(us => us.map(u => u.id === admin.id ? admin : u));
    } else {
      const newId = Math.max(0, ...admins.map(u => u.id)) + 1;
      setAdmins(us => [{ ...admin, id: newId, role: "admin" }, ...us]);
    }
  };

  const handleDelete = (id) => {
    setAdmins(us => us.filter(u => u.id !== id));
    setConfirmDelete(null);
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Jost, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>Administrateurs</h2>
        <button
          style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 500, fontFamily: 'Jost, sans-serif', cursor: 'pointer', fontSize: 16 }}
          onClick={() => { setEditAdmin(null); setModalOpen(true); }}
        >
          + Ajouter un administrateur
        </button>
      </div>
      <input
        type="text"
        placeholder="Rechercher un administrateur..."
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', width: 320, marginBottom: 24, fontFamily: 'Jost, sans-serif' }}
      />
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001' }}>
        <thead>
          <tr style={{ background: '#f5f7fa', textAlign: 'left' }}>
            <th style={{ padding: 12 }}>Nom</th>
            <th style={{ padding: 12 }}>Email</th>
            <th style={{ padding: 12, width: 120 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.length === 0 ? (
            <tr><td colSpan={3} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>Aucun administrateur trouvé.</td></tr>
          ) : (
            paginated.map(admin => (
              <tr key={admin.id} style={{ borderTop: '1px solid #f0f0f0' }}>
                <td style={{ padding: 12 }}>{admin.name}</td>
                <td style={{ padding: 12 }}>{admin.email}</td>
                <td style={{ padding: 12 }}>
                  <button
                    style={{ background: '#e5e9f2', border: 'none', borderRadius: 6, padding: '6px 12px', marginRight: 8, cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
                    onClick={() => { setEditAdmin(admin); setModalOpen(true); }}
                  >
                    Éditer
                  </button>
                  <button
                    style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontFamily: 'Jost, sans-serif' }}
                    onClick={() => setConfirmDelete(admin)}
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
        initialData={editAdmin}
      />
      {/* Confirmation suppression */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 8px #0002' }}>
            <div style={{ fontSize: 18, marginBottom: 18 }}>Supprimer l'administrateur "{confirmDelete.name}" ?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => handleDelete(confirmDelete.id)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminsPage; 
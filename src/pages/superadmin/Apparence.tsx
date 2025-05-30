import React, { useState } from "react";
import ApparenceModal from "./ApparenceModal";

const FIXED_BANNERS = [
  {
    key: "accueil",
    label: "Bannière Accueil",
    description: "S'affiche en haut de la page d'accueil (carrousel ou top banner)",
  },
  {
    key: "sidebar-accueil",
    label: "Sidebar Accueil",
    description: "S'affiche dans la colonne latérale de la page d'accueil",
  },
  {
    key: "sidebar-article",
    label: "Sidebar Article",
    description: "S'affiche dans la colonne latérale de la page de détail d'un article",
  },
  {
    key: "footer",
    label: "Bannière Footer",
    description: "S'affiche en bas de toutes les pages (footer)",
  },
  {
    key: "header",
    label: "Bannière Header",
    description: "S'affiche tout en haut du site (header global)",
  },
  {
    key: "sous-article",
    label: "Bannière sous l'article",
    description: "S'affiche juste sous l'article, avant les commentaires",
  },
];

const defaultBanners = {
  "accueil": {
    title: "Bannière Accueil",
    image: "",
    link: "",
    status: "actif",
    position: "accueil",
  },
  "sidebar-accueil": {
    title: "Sidebar Accueil",
    image: "",
    link: "",
    status: "actif",
    position: "sidebar-accueil",
  },
  "sidebar-article": {
    title: "Sidebar Article",
    image: "",
    link: "",
    status: "actif",
    position: "sidebar-article",
  },
  "footer": {
    title: "Bannière Footer",
    image: "",
    link: "",
    status: "actif",
    position: "footer",
  },
  "header": {
    title: "Bannière Header",
    image: "",
    link: "",
    status: "actif",
    position: "header",
  },
  "sous-article": {
    title: "Bannière sous l'article",
    image: "",
    link: "",
    status: "actif",
    position: "sous-article",
  },
};

export default function Apparence() {
  const [banners, setBanners] = useState(defaultBanners);
  const [editKey, setEditKey] = useState(null);

  const handleEdit = (key) => setEditKey(key);

  const handleSave = (data) => {
    setBanners(prev => ({
      ...prev,
      [data.position]: { ...prev[data.position], ...data }
    }));
    setEditKey(null);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 32 }}>Gestion des bannières</h2>
      <div style={{
        display: "flex",
        gap: 32,
        flexWrap: "wrap",
        justifyContent: "flex-start"
      }}>
        {FIXED_BANNERS.map(b => (
          <div
            key={b.key}
            style={{
              width: 340,
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 16,
              position: "relative"
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 18 }}>{b.label}</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>{b.description}</div>
            <div>
              {banners[b.key].image
                ? <img src={banners[b.key].image} alt="" style={{ width: 260, height: 60, objectFit: "cover", borderRadius: 8, border: "1px solid #eee" }} />
                : <div style={{
                    width: 260,
                    height: 60,
                    background: "#f5f5f5",
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#bbb",
                    fontSize: 18,
                    border: "1px solid #eee"
                  }}>Aucune image</div>
              }
            </div>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: "#888" }}>Lien :</span>{" "}
              <span style={{ color: "#4f8cff" }}>{banners[b.key].link || "—"}</span>
            </div>
            <div style={{ fontSize: 13 }}>
              <span style={{ color: "#888" }}>Statut :</span>{" "}
              <span style={{ color: banners[b.key].status === "actif" ? "#2ecc40" : "#ff4136" }}>
                {banners[b.key].status}
              </span>
            </div>
            <button
              onClick={() => handleEdit(b.key)}
              style={{
                background: "#4f8cff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                cursor: "pointer",
                alignSelf: "flex-end",
                marginTop: 8
              }}
            >
              Modifier
            </button>
          </div>
        ))}
      </div>

      {editKey && (
        <ApparenceModal
          open={!!editKey}
          onClose={() => setEditKey(null)}
          onSave={handleSave}
          initialData={{ ...banners[editKey], position: editKey }}
        />
      )}
    </div>
  );
} 
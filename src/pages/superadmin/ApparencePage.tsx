import React, { useState, useEffect } from "react";
import ApparenceModal from "./ApparenceModal";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const ImagePlaceholder = () => (
  <div style={{
    width: 100,
    height: 40,
    background: "#f5f6fa",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e9f2"
  }}>
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <rect x="1" y="1" width="30" height="22" rx="4" fill="#e5e9f2" />
      <circle cx="9" cy="9" r="3" fill="#cfd8dc" />
      <rect x="14" y="13" width="12" height="6" rx="2" fill="#cfd8dc" />
    </svg>
  </div>
);

const FIXED_BANNERS = [
  { key: "accueil", label: "Bannière Accueil", description: "S'affiche en haut de la page d'accueil" },
  { key: "accueil-sous-slider", label: "Bannière sous le slider (Accueil)", description: "S'affiche juste sous le slider sur la page d'accueil" },
  { key: "accueil-sous-votes", label: "Bannière sous la section votes", description: "S'affiche sous la section des votes sur la page d'accueil" },
  { key: "sidebar-categorie", label: "Sidebar Catégorie", description: "S'affiche dans la colonne latérale de la page de catégories de sujets" },
  { key: "sidebar-article", label: "Sidebar Article", description: "S'affiche dans la colonne latérale de la page de détail d'un article" },
  { key: "sous-article", label: "Bannière sous l'article", description: "S'affiche juste sous l'article, avant les commentaires" }
];

const defaultBanners = {
  "accueil": {
    title: "Bannière été",
    image: "",
    link: "https://exemple.com/ete",
    status: "actif",
    position: "accueil",
  },
  "sidebar-accueil": {
    title: "Promo rentrée",
    image: "",
    link: "https://exemple.com/promo",
    status: "inactif",
    position: "sidebar-accueil",
  },
  "sidebar-article": {
    title: "Nouvelle collection",
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
  "accueil-sous-slider": {
    title: "Bannière sous le slider",
    image: "",
    link: "",
    status: "actif",
    position: "accueil-sous-slider",
  },
  "accueil-sous-votes": {
    title: "Bannière sous la section votes",
    image: "",
    link: "",
    status: "actif",
    position: "accueil-sous-votes",
  },
  "sidebar-categorie": {
    title: "Sidebar Catégorie",
    image: "",
    link: "",
    status: "actif",
    position: "sidebar-categorie",
  },
  "sous-article": {
    title: "Bannière sous l'article",
    image: "",
    link: "",
    status: "actif",
    position: "sous-article",
  }
};

export default function ApparencePage() {
  const [banners, setBanners] = useState({});
  const [editKey, setEditKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*");
      if (!error && data) {
        // On mappe par position pour accès rapide
        const mapped = {};
        data.forEach(b => {
          mapped[b.position] = b;
        });
        setBanners(mapped);
      }
      setLoading(false);
    };
    fetchBanners();
  }, []);

  const handleEdit = (key) => setEditKey(key);

  const handleSave = async (data) => {
    // Si la bannière existe déjà (update), sinon insert
    const existing = banners[data.position];
    if (existing && existing.id) {
      await supabase.from("banners").update({
        title: data.title,
        image_url: data.image,
        link: data.link,
        status: data.status,
        position: data.position,
      }).eq("id", existing.id);
    } else {
      await supabase.from("banners").insert({
        title: data.title,
        image_url: data.image,
        link: data.link,
        status: data.status,
        position: data.position,
      });
    }
    // Refresh
    const { data: newData } = await supabase.from("banners").select("*");
    const mapped = {};
    newData.forEach(b => {
      mapped[b.position] = b;
    });
    setBanners(mapped);
    setEditKey(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 32 }}>Gestion des bannières</h2>
      <div style={{
        background: "#fff",
        borderRadius: 14,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        padding: 24,
        overflowX: "auto"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7f8fa" }}>
              <th style={thStyle}>Titre</th>
              <th style={thStyle}>Image</th>
              <th style={thStyle}>Lien</th>
              <th style={thStyle}>Emplacement</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {FIXED_BANNERS.map(b => (
              <tr
                key={b.key}
                style={{
                  borderBottom: "1px solid #f0f0f0",
                  transition: "background 0.15s",
                  cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "#f7faff"}
                onMouseLeave={e => e.currentTarget.style.background = ""}
              >
                <td style={tdStyle}>{banners[b.key]?.title || ''}</td>
                <td style={{ ...tdStyle, minWidth: 120 }}>
                  <div
                    style={{
                      width: 100,
                      height: 40,
                      borderRadius: 6,
                      overflow: "hidden",
                      boxShadow: banners[b.key]?.image_url ? "0 2px 8px #0001" : "none",
                      background: "#f5f6fa",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "box-shadow 0.2s"
                    }}
                  >
                    {banners[b.key]?.image_url
                      ? (
                        <img
                          src={banners[b.key]?.image_url}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                            transition: "opacity 0.2s"
                          }}
                        />
                      )
                      : <ImagePlaceholder />
                    }
                  </div>
                </td>
                <td style={tdStyle}>
                  {banners[b.key]?.link
                    ? <a href={banners[b.key]?.link} target="_blank" rel="noopener noreferrer" style={{ color: "#4f8cff" }}>{banners[b.key]?.link}</a>
                    : <span style={{ color: "#bbb" }}>-</span>
                  }
                </td>
                <td style={tdStyle}>{b.label}</td>
                <td style={tdStyle}>
                  <span style={{
                    color: banners[b.key]?.status === "actif" ? "#2ecc40" : "#bbb",
                    fontWeight: 500
                  }}>
                    {banners[b.key]?.status === "actif" ? "Actif" : "Inactif"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    onClick={() => navigate(`/superadmin/banniere/${b.key}`)}
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
                    Éditer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editKey && (
        <ApparenceModal
          open={!!editKey}
          onClose={() => setEditKey(null)}
          onSave={handleSave}
          initialData={{
            ...(banners[editKey] || {
              title: "",
              image: "",
              link: "",
              status: "actif",
              position: editKey
            })
          }}
        />
      )}
    </div>
  );
}

const thStyle = {
  textAlign: "left" as const,
  padding: "12px 8px",
  fontWeight: 600,
  fontSize: 16,
  color: "#222",
  background: "#f7f8fa"
};

const tdStyle = {
  padding: "12px 8px",
  fontSize: 15,
  color: "#222",
  verticalAlign: "middle"
}; 
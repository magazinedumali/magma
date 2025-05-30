import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";

const positionLabels = {
  "accueil": "Bannière Accueil",
  "accueil-sous-slider": "Bannière sous le slider (Accueil)",
  "accueil-sous-votes": "Bannière sous la section votes",
  "sidebar-categorie": "Sidebar Catégorie",
  "sidebar-article": "Sidebar Article",
  "sous-article": "Bannière sous l'article"
};

export default function EditBannerPage() {
  const { position } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [banner, setBanner] = useState({
    title: "",
    image: "",
    link: "",
    status: "actif",
    position: position || ""
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    const fetchBanner = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", position)
        .single();
      if (!error && data) {
        setBanner({
          title: data.title || "",
          image: data.image_url || "",
          link: data.link || "",
          status: data.status || "actif",
          position: data.position
        });
        setPreview(data.image_url || null);
      }
      setLoading(false);
    };
    if (position) fetchBanner();
  }, [position]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      setError("");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('banners').upload(fileName, file, { upsert: true });
      if (error) {
        setError('Erreur upload image');
        setUploading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage.from('banners').getPublicUrl(fileName);
      setBanner(b => ({ ...b, image: publicUrlData.publicUrl }));
      setPreview(publicUrlData.publicUrl);
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBanner(b => ({ ...b, [name]: value }));
    if (name === "image") setPreview(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!banner.title.trim()) {
      setError("Le titre est requis.");
      return;
    }
    if (!banner.image.trim()) {
      setError("L'image est requise.");
      return;
    }
    setLoading(true);
    // Vérifie si la bannière existe déjà
    const { data: existing } = await supabase
      .from("banners")
      .select("id")
      .eq("position", position)
      .single();
    if (existing) {
      const { error: updateError } = await supabase.from("banners").update({
        title: banner.title,
        image_url: banner.image,
        link: banner.link,
        status: banner.status,
        position: banner.position
      }).eq("id", existing.id);
      if (updateError) {
        setError("Erreur lors de la mise à jour : " + updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("banners").insert({
        title: banner.title,
        image_url: banner.image,
        link: banner.link,
        status: banner.status,
        position: banner.position
      });
      if (insertError) {
        setError("Erreur lors de l'enregistrement : " + insertError.message);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate("/superadmin/apparence");
    }, 1200);
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    setLoading(true);
    await supabase.from("banners").delete().eq("position", position);
    setLoading(false);
    navigate("/superadmin/apparence");
  };

  if (!positionLabels[position || ""]) {
    return <div style={{ padding: 32 }}>Emplacement de bannière inconnu.</div>;
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", background: "#fff", borderRadius: 12, boxShadow: "0 2px 12px #0001", padding: 32, position: 'relative' }}>
      {/* Bouton retour */}
      <button onClick={() => navigate("/superadmin/apparence")} style={{ position: 'absolute', left: 24, top: 24, background: 'none', border: 'none', color: '#4f8cff', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>&larr; Retour</button>
      <h2 style={{ fontWeight: 600, fontSize: 22, marginBottom: 24, textAlign: 'center' }}><span style={{ color: '#4f8cff' }}>{positionLabels[position || ""]}</span></h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 32 }}>
        <input required name="title" placeholder="Titre" value={banner.title} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ fontSize: 14, fontWeight: 500 }}>Image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
          {uploading && <span style={{ color: 'orange', fontSize: 12 }}>Upload en cours...</span>}
          {preview && (
            <div style={{ marginTop: 8 }}>
              <img
                src={preview}
                alt="Prévisualisation"
                style={{ width: zoom ? 400 : 180, height: zoom ? 140 : 60, objectFit: 'cover', borderRadius: 6, cursor: 'zoom-in', boxShadow: zoom ? '0 4px 24px #0003' : undefined, transition: 'all 0.2s' }}
                onClick={() => setZoom(z => !z)}
                title={zoom ? 'Réduire' : 'Agrandir'}
              />
              <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{zoom ? 'Cliquez pour réduire' : 'Cliquez pour agrandir'}</div>
            </div>
          )}
          <input name="image" placeholder="URL de l'image (optionnel)" value={banner.image} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }} />
        </div>
        <input name="link" placeholder="Lien (optionnel)" value={banner.link} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }} />
        <select name="status" value={banner.status} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: '1px solid #e5e9f2', fontFamily: 'Jost, sans-serif' }}>
          <option value="actif">Actif</option>
          <option value="inactif">Inactif</option>
        </select>
        {error && <div style={{ color: 'red', fontSize: 14 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 8 }}>
          <button type="button" onClick={() => setShowDeleteConfirm(true)} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Supprimer la bannière</button>
          <button type="submit" disabled={loading || uploading} style={{ background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
        {success && <div style={{ color: 'green', fontSize: 15, textAlign: 'center', marginTop: 8 }}>Bannière enregistrée avec succès !</div>}
      </form>
      {/* Confirmation suppression */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 320, boxShadow: '0 2px 8px #0002' }}>
            <div style={{ fontSize: 18, marginBottom: 18 }}>Supprimer la bannière pour cet emplacement ?</div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ background: '#eee', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Annuler</button>
              <button onClick={handleDelete} style={{ background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
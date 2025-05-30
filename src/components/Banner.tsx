import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type BannerProps = {
  position: "accueil" | "accueil-sous-slider" | "accueil-sous-votes" | "sidebar-categorie" | "sidebar-accueil" | "sidebar-article" | "sous-article" | "footer" | "header";
  width?: number;
  height?: number;
};

type BannerData = {
  id: string;
  title: string;
  image_url: string;
  link: string;
  status: string;
  position: string;
};

const Banner: React.FC<BannerProps> = ({ position, width = 320, height = 80 }) => {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("position", position)
        .eq("status", "actif")
        .single();
      if (!error && data) {
        setBanner(data);
      } else {
        setBanner(null);
      }
      setLoading(false);
    };
    fetchBanner();
  }, [position]);

  if (loading) {
    return <div style={{ width, height, background: "#f5f6fa", borderRadius: 8 }} />;
  }

  if (!banner || !banner.image_url) {
    return (
      <div style={{
        width: "100%",
        aspectRatio: width && height ? `${width} / ${height}` : "6 / 5",
        background: "#f5f6fa",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#bbb",
        fontSize: 16,
        border: "1px solid #e5e9f2"
      }}>
        Aucune bannière
      </div>
    );
  }

  return (
    <a href={banner.link || "#"} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none" }}>
      <div
        style={{
          width: "100%",
          aspectRatio: width && height ? `${width} / ${height}` : "6 / 5",
          background: "#f5f6fa",
          borderRadius: 8,
          boxShadow: "0 2px 8px #0001",
          border: "1px solid #e5e9f2",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <img
          src={banner.image_url}
          alt={banner.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block"
          }}
        />
      </div>
    </a>
  );
};

export default Banner; 
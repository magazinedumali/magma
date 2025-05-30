import React from "react";
import Banner from "../components/Banner";

export default function ExempleBannieresSite() {
  return (
    <div style={{ fontFamily: 'Jost, sans-serif', background: '#f7f8fa', minHeight: '100vh', padding: 32 }}>
      <h1 style={{ marginBottom: 32 }}>Exemple d'intégration des bannières sur le site</h1>
      <div style={{ marginBottom: 32 }}>
        <h2>Header</h2>
        <Banner position="header" width={900} height={90} />
      </div>
      <div style={{ marginBottom: 32 }}>
        <h2>Accueil (Top Banner)</h2>
        <Banner position="accueil" width={900} height={120} />
      </div>
      <div style={{ display: 'flex', gap: 40, marginBottom: 32 }}>
        <div style={{ flex: 1 }}>
          <h2>Sidebar Accueil</h2>
          <Banner position="sidebar-accueil" width={300} height={250} />
        </div>
        <div style={{ flex: 1 }}>
          <h2>Sidebar Article</h2>
          <Banner position="sidebar-article" width={300} height={250} />
        </div>
      </div>
      <div style={{ marginBottom: 32 }}>
        <h2>Footer</h2>
        <Banner position="footer" width={900} height={90} />
      </div>
    </div>
  );
} 
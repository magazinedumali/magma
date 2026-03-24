import handler from './api/cron-news.js';
import dotenv from 'dotenv';

// Charge les variables d'environnement
dotenv.config();

console.log("🚀 Démarrage du moteur d'Intelligence Artificielle de Magma...");

// Simulation d'une requête envoyée par Vercel Cron
const mockReq = { 
  headers: {
    // Si la clé est configurée, c'est comme si Vercel appelait cette API
    authorization: process.env.CRON_SECRET ? `Bearer ${process.env.CRON_SECRET}` : undefined
  } 
};

// Simulation de la réponse de l'API
const mockRes = {
  status: (code) => ({
    json: (data) => {
      if (code === 200) {
        console.log(`\n✅ SUCCÈS [${code}] :`, data.message);
        if (data.titre) console.log(`📌 Titre : ${data.titre}`);
        process.exit(0);
      } else {
        console.error(`\n❌ ERREUR [${code}] :`, data);
        process.exit(1);
      }
    }
  })
};

// Lancement de la génération
handler(mockReq, mockRes).then(() => {
  console.log("\nProcessus terminé en attente de réponse...");
}).catch((err) => {
  console.error("Erreur fatale:", err);
  process.exit(1);
});

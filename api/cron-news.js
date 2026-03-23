import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const parser = new Parser();

const TOPICS = [
  { query: 'Mali (géopolitique OR relations internationales OR diplomatie)', category: 'Géopolitique' },
  { query: 'Mali (économie OR business OR finance)', category: 'Économie' },
  { query: 'Mali (culture OR musique OR art OR festival)', category: 'Culture' },
  { query: 'Mali (sport OR football OR aigles)', category: 'Sport' }
];

export default async function handler(req, res) {
  if (
    process.env.CRON_SECRET &&
    req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` &&
    req.headers['x-vercel-cron'] !== '1'
  ) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  let ai = null;
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  } else {
    return res.status(500).json({ error: 'GEMINI_API_KEY manquante' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
     return res.status(500).json({ error: 'Identifiants Supabase manquants' });
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const rssFeedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(randomTopic.query)}&hl=fr&gl=ML&ceid=ML:fr`;

    const feed = await parser.parseURL(rssFeedUrl);
    const topArticles = feed.items.slice(0, 3);
    
    if (topArticles.length === 0) {
      return res.status(200).json({ success: true, message: 'Aucune nouveauté récente.' });
    }

    // Extraction du contexte avec tentatives de capture d'images pour chaque article
    let newsContext = topArticles.map((item, index) => {
      const possibleImage = item.enclosure?.url || (item.content?.match(/src="([^"]+)"/) || [])[1] || 'Aucune';
      return `Source ${index + 1}:
Titre: ${item.title}
Image potentielle: ${possibleImage}
Lien: ${item.link}
Date: ${item.pubDate}
`;
    }).join('\n');

    const prompt = `
Tu es un journaliste web malien expert pour le magazine "Magma" ET un expert en SEO mondial et Réseaux Sociaux.
Ta mission est de rédiger un article d'analyse objectif, critique et approfondi sur le thème "${randomTopic.category}".

Voici une série de dépêches récentes concernant ce domaine, issues de différentes sources :
${newsContext}

Règles strictes pour la rédaction :
1. Analyse minutieusement le contenu. Compare activement ces différentes sources. Mets en évidence les contradictions, les omissions ou les divergences de traitement.
2. Garde un esprit critique : distingue les faits des partis pris éditoriaux ou des biais d'influence, et conserve une perspective souveraine centrée sur le Mali.
3. Rédige le contenu en code HTML propre (avec <h2>, <p>, <strong>), sans balises <html> externes.
4. Analyse les "Images potentielles" listées et choisis la plus appropriée, ou renvoie "null".
5. EXPERT SEO : Génère un "meta_title" ultra-optimisé (max 60 caractères), une "meta_description" (max 160 caractères) incitative au clic, et un tableau de 5 "tags" (mots-clés stratégiques).
6. EXPERT SOCIAL : Rédige le texte de la publication Facebook ("facebook_post") idéale pour accompagner le partage exclusif de cet article (inclut une phrase d'accroche posant une question à la communauté, un résumé choc, des emojis, et des hashtags pertinents comme #Mali #Actualité).

Tu dois répondre EXCLUSIVEMENT sous la forme d'un objet JSON pur, sans texte ajouté :
{
  "titre": "Ton titre d'article accrocheur ici",
  "contenu": "Ton code HTML ici",
  "image_choisie": "URL de l'image ou null",
  "meta_title": "Titre SEO très optimisé",
  "meta_description": "Description SEO engageante",
  "tags": ["mot1", "mot2", "mot3", "mot4", "mot5"],
  "facebook_post": "Contenu du post Facebook prêt à être publié"
}
`;

    // 4. Appel de l'IA (en lui demandant de livrer le JSON avec SEO et Facebook post)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const articleText = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    let iaData;
    
    try {
      iaData = JSON.parse(articleText);
    } catch (err) {
      console.error("Erreur de formatage JSON depuis Gemini :", articleText);
      return res.status(500).json({ error: 'L\'IA a généré un format invalide.' });
    }

    // Backups au cas où l'IA renvoie null pour l'image
    const defaultImages = {
      'Géopolitique': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1500&auto=format&fit=crop',
      'Économie': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1500&auto=format&fit=crop',
      'Culture': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1500&auto=format&fit=crop',
      'Sport': 'https://images.unsplash.com/photo-1518605368461-1e1e38ce8058?q=80&w=1500&auto=format&fit=crop'
    };
    
    const vedetteImage = iaData.image_choisie !== "null" && iaData.image_choisie 
      ? iaData.image_choisie 
      : defaultImages[randomTopic.category];

    // Générer un slug unique et SEO-friendly
    const baseSlug = iaData.titre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    // 5. Inserer dans Supabase (Stocke tout le SEO et le texte Facebook !)
    const { data, error } = await supabase
      .from('articles')
      .insert([
        { 
          titre: iaData.titre,
          slug: uniqueSlug,
          contenu: iaData.contenu,
          categorie: randomTopic.category, 
          auteur: 'Agent IA "Magma"',
          statut: 'brouillon', 
          date_publication: new Date().toISOString(),
          image_url: vedetteImage,
          
          // SEO PUISSANT
          meta_title: iaData.meta_title,
          meta_description: iaData.meta_description,
          tags: iaData.tags,
          
          // PUBLICATION FACEBOOK PRETE
          share_description: iaData.facebook_post,
          share_image_url: vedetteImage
        }
      ]);

    if (error) {
      console.error("Erreur Supabase:", error);
      return res.status(500).json({ error: 'Erreur lors de l\'insertion en base' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Article généré avec SEO complet et brouillon de publication Facebook.',
      titre: iaData.titre
    });

  } catch (error) {
    console.error('Erreur CRON :', error);
    return res.status(500).json({ error: 'Erreur interne de traitement' });
  }
}

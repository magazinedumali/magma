import Parser from 'rss-parser';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Charge les variables d'environnement depuis le fichier .env
dotenv.config();

// Configuration du parseur RSS
const parser = new Parser();

// URL de flux RSS pour l'actualité du Mali et internationale (Google News en français)
const RSS_FEED_URL = 'https://news.google.com/rss/search?q=Mali+économie+OR+géopolitique&hl=fr&gl=ML&ceid=ML:fr';

// Initialisation de l'API Gemini seulement si la clé est présente
let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// (Optionnel) Initialisation Supabase pour publier l'article
// Note: createClient nécessite une vraie structure de domaine
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://votre_url_supabase.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'votre_clé_supabase';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchNews() {
  console.log('🔄 Étape 1: Récupération des dernières dépêches...');
  try {
    const feed = await parser.parseURL(RSS_FEED_URL);
    // On ne garde que les 3 articles les plus récents pour l'analyse
    const topArticles = feed.items.slice(0, 3);
    
    console.log(`✅ ${topArticles.length} articles récupérés avec succès.\n`);
    
    let newsContext = '';
    topArticles.forEach((item, index) => {
      console.log(`- Source ${index + 1}: ${item.title}`);
      newsContext += `Source ${index + 1}:\nTitre: ${item.title}\nLien: ${item.link}\nDate: ${item.pubDate}\n\n`;
    });
    
    return newsContext;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du flux RSS:', error);
    return null;
  }
}

async function analyzeAndWriteArticle(newsContext) {
  console.log('\n🤖 Étape 2: Analyse et rédaction par l\'IA (Google Gemini)...');
  
  const prompt = `
Tu es un journaliste géopolitique et économique expert, écrivant pour le média Malien "Magma".
Voici un résumé des dernières nouvelles concernant le Mali et la région :

${newsContext}

Rédige un article d'analyse professionnel et captivant de 400 mots maximum.
L'article doit :
1. Avoir un titre accrocheur.
2. Synthétiser ces informations pour en dégager les conséquences géopolitiques ou économiques pour le Mali.
3. Rester objectif et informatif.
4. Être formaté en HTML simple (<h1> pour le titre, <p> pour les paragraphes, <h2> pour les sous-titres) afin de pouvoir être publié directement sur notre site.

Génère UNIQUEMENT le code HTML de l'article, sans balises markdown ni commentaires supplémentaires.
`;

  try {
    if (!process.env.GEMINI_API_KEY) {
       console.log('\n⚠️ Le fichier .env ne contient pas de clé GEMINI_API_KEY.');
       console.log('Voici ce que le prompt demanderait à l\'IA :\n');
       console.log(prompt);
       return null;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const articleHTML = response.text;
    console.log('✅ Article rédigé avec succès !\n');
    console.log('--- DÉBUT DE L\'ARTICLE ---');
    console.log(articleHTML);
    console.log('--- FIN DE L\'ARTICLE ---\n');
    
    return articleHTML;
  } catch (error) {
    console.error('❌ Erreur lors de la génération avec l\'IA:', error);
    return null;
  }
}

async function publishArticle(articleHTML) {
  if (!articleHTML) return;
  
  console.log('📤 Étape 3: Publication sur la plateforme...');
  console.log('Démonstration : L\'article serait ici enregistré dans la table "articles" ou "pages" de Supabase.');
  
  // Exemple de code pour sauvegarder dans Supabase :
  /*
  const { data, error } = await supabase
    .from('articles')
    .insert([
      { 
        title: 'Titre extrait de l\'article',
        content: articleHTML,
        category: 'Géopolitique',
        author: 'Magma IA',
        published_at: new Date().toISOString()
      }
    ]);
    
  if (error) console.error(error);
  else console.log('✅ Article publié en base de données !');
  */
}

async function runAutonomousPublisher() {
  console.log('🚀 DÉMARRAGE DU PIPELINE DE PUBLICATION AUTONOME 🚀\n');
  const context = await fetchNews();
  if (context) {
    const article = await analyzeAndWriteArticle(context);
    await publishArticle(article);
  }
}

// Lancement du script
runAutonomousPublisher();

import React from 'react';

interface ArticleDebugProps {
  article: any;
}

const ArticleDebug: React.FC<ArticleDebugProps> = ({ article }) => {
  if (!article) return null;

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px', 
      zIndex: 9999,
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <h3>Article Debug Info:</h3>
      <p><strong>ID:</strong> {article.id}</p>
      <p><strong>Slug:</strong> {article.slug}</p>
      <p><strong>Title:</strong> {article.title || article.titre}</p>
      <p><strong>Image URL:</strong> {article.image_url}</p>
      <p><strong>Image (mapped):</strong> {article.image}</p>
      <p><strong>Category:</strong> {article.category || article.categorie}</p>
      <p><strong>Author:</strong> {article.author || article.auteur}</p>
      <p><strong>Date:</strong> {article.date || article.date_publication}</p>
      <p><strong>Content length:</strong> {(article.content || article.contenu || '').length}</p>
      <p><strong>Excerpt:</strong> {article.excerpt}</p>
    </div>
  );
};

export default ArticleDebug;

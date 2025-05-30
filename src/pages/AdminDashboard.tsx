import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import ArticleList from '../admin/Articles/ArticleList';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord Administrateur</h1>
      <nav className="mb-8 flex gap-4">
        <Link to="articles" className="text-blue-600 hover:underline">Articles</Link>
        <Link to="articles/nouveau" className="text-blue-600 hover:underline">Ajouter un article</Link>
      </nav>
      <Routes>
        <Route path="articles" element={<ArticleList />} />
        <Route path="articles/nouveau" element={<div>Formulaire d'ajout d'article (à implémenter)</div>} />
        <Route path="articles/:id/editer" element={<div>Formulaire d'édition d'article (à implémenter)</div>} />
      </Routes>
    </div>
  );
};

export default AdminDashboard; 
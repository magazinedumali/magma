import React from 'react';
import ArticleForm from './ArticleForm';
import { useNavigate } from 'react-router-dom';

const ArticleCreatePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <ArticleForm
          onSuccess={() => navigate('/superadmin/articles')}
          onCancel={() => navigate('/superadmin/articles')}
        />
      </div>
    </div>
  );
};

export default ArticleCreatePage; 
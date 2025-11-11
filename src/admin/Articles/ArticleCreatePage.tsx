import React from 'react';
import ArticleForm from './ArticleForm';
import { useNavigate } from 'react-router-dom';
import { useAdminContext } from '@/hooks/use-admin-context';

const ArticleCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { getArticlesPath } = useAdminContext();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-6xl mx-auto">
        <ArticleForm
          onSuccess={() => navigate(getArticlesPath())}
          onCancel={() => navigate(getArticlesPath())}
        />
      </div>
    </div>
  );
};

export default ArticleCreatePage; 
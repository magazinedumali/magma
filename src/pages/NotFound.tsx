import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-gray-100">
      <div className="text-center px-4">
        <h1 className="text-5xl font-bold mb-2">404</h1>
        <p className="text-xl text-gray-300 mb-3">On dirait que cette page a pris un autre chemin.</p>
        <p className="text-sm text-gray-500 mb-6">L’URL que vous avez saisie ne correspond à aucun article ni rubrique connue.</p>
        <a href="/" className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#ff184e] text-white text-sm font-semibold hover:bg-[#ff184e]/85 transition-colors">
          Retourner à l’accueil
        </a>
      </div>
    </div>
  );
};

export default NotFound;

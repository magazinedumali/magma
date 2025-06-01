import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/components/admin-dashboard/useCategories';

interface ArticleFormProps {
  initialValues?: any;
  articleId?: string;
  onSuccess: (values?: any) => void;
  onCancel: () => void;
}

const categories = [
  'Actualités', 'International', 'Business', 'Éducation', 'Société', 'Santé', 'Sport', 'Culture', 'Tech', 'Voyage'
];

// Ajoute la fonction utilitaire pour générer un slug à partir du titre
function slugify(text: string) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const ArticleForm: React.FC<ArticleFormProps> = ({ initialValues = {}, articleId, onSuccess, onCancel }) => {
  const { register, handleSubmit, control, setValue, watch, reset } = useForm({
    defaultValues: {
      titre: initialValues.titre || '',
      contenu: initialValues.contenu || '',
      categorie: initialValues.categorie || '',
      auteur: initialValues.auteur || '',
      tags: initialValues.tags || [],
      image_url: initialValues.image_url || '',
      audio_url: initialValues.audio_url || '',
      gallery: initialValues.gallery || [],
      meta_title: initialValues.meta_title || '',
      meta_description: initialValues.meta_description || '',
      statut: initialValues.statut || 'brouillon',
      date_publication: (initialValues.date_publication || new Date().toISOString().slice(0, 10)).slice(0, 10),
    }
  });
  const [uploading, setUploading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [openBlock, setOpenBlock] = useState({
    publication: true,
    image: false,
    gallery: false,
    audio: false,
    seo: false,
    meta: false,
    tags: false,
  });
  const toggleBlock = (key: keyof typeof openBlock) => setOpenBlock(prev => ({ ...prev, [key]: !prev[key] }));
  const navigate = useNavigate();
  const { categories, loading: loadingCategories } = useCategories();

  // Drag & drop pour image
  const onDropImage = async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    setUploading(true);
    const file = acceptedFiles[0];
    const { data, error } = await supabase.storage.from('article-images').upload(`public/${Date.now()}-${file.name}`, file, { upsert: true });
    if (error) {
      toast.error("Erreur upload image");
    } else {
      const { data: publicUrlData } = supabase.storage.from('article-images').getPublicUrl(data.path);
      const url = publicUrlData.publicUrl;
      setValue('image_url', url);
      toast.success("Image uploadée");
    }
    setUploading(false);
  };
  const { getRootProps: getRootImageProps, getInputProps: getInputImageProps, isDragActive: isDragImageActive } = useDropzone({ onDrop: onDropImage, accept: { 'image/*': [] }, multiple: false });

  // Drag & drop pour audio
  const onDropAudio = async (acceptedFiles: File[]) => {
    if (!acceptedFiles[0]) return;
    setUploading(true);
    const file = acceptedFiles[0];
    const { data, error } = await supabase.storage.from('article-audios').upload(`public/${Date.now()}-${file.name}`, file, { upsert: true });
    if (error) {
      toast.error("Erreur upload audio");
    } else {
      const { data: publicUrlData } = supabase.storage.from('article-audios').getPublicUrl(data.path);
      const url = publicUrlData.publicUrl;
      setValue('audio_url', url);
      toast.success("Audio uploadé");
    }
    setUploading(false);
  };
  const { getRootProps: getRootAudioProps, getInputProps: getInputAudioProps, isDragActive: isDragAudioActive } = useDropzone({ onDrop: onDropAudio, accept: { 'audio/*': [] }, multiple: false });

  // Ajout dynamique de tags
  const tags = watch('tags');
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setValue('tags', [...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = (tag: string) => {
    setValue('tags', tags.filter((t: string) => t !== tag));
  };

  // Galerie d'images (multi-upload)
  const gallery = watch('gallery') || [];
  const onDropGallery = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    if (gallery.length + acceptedFiles.length > 5) {
      toast.error('Maximum 5 images dans la galerie');
      return;
    }
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of acceptedFiles) {
      const { data, error } = await supabase.storage.from('article-images').upload(`gallery/${Date.now()}-${file.name}`, file, { upsert: true });
      if (error) {
        toast.error('Erreur upload image galerie');
      } else {
        const { data: publicUrlData } = supabase.storage.from('article-images').getPublicUrl(data.path);
        newUrls.push(publicUrlData.publicUrl);
      }
    }
    setValue('gallery', [...gallery, ...newUrls]);
    setUploading(false);
  };
  const { getRootProps: getRootGalleryProps, getInputProps: getInputGalleryProps, isDragActive: isDragGalleryActive } = useDropzone({ onDrop: onDropGallery, accept: { 'image/*': [] }, multiple: true });
  const removeGalleryImage = (url: string) => {
    setValue('gallery', gallery.filter((img: string) => img !== url));
  };

  // Soumission du formulaire
  const onSubmit = async (values: any) => {
    setUploading(true);
    // Génère le slug à partir du titre
    const slug = slugify(values.titre);
    let valuesWithSlug = { ...values, slug };
    let res;
    if (articleId && articleId !== 'new') {
      // Ne pas forcer le statut, utiliser la valeur du formulaire
      res = await supabase.from('articles').update(valuesWithSlug).eq('id', articleId);
    } else {
      res = await supabase.from('articles').insert([valuesWithSlug]);
    }
    setUploading(false);
    if (res.error) {
      console.error('Erreur Supabase:', res.error);
      toast.error("Erreur lors de l'enregistrement : " + res.error.message);
    } else {
      if (articleId && articleId !== 'new') {
        toast.success("Article mis à jour!");
      } else {
        toast.success("Article créé!");
      }
      reset();
      if (typeof onSuccess === 'function') {
        onSuccess(valuesWithSlug);
      }
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        navigate('/superadmin/articles');
      }, 3000);
    }
  };

  // Chargement des données pour l'édition
  useEffect(() => {
    if (articleId && articleId !== 'new') {
      setLoadingArticle(true);
      (async () => {
        const { data, error } = await supabase.from('articles').select('*').eq('id', articleId).single();
        if (error) {
          toast.error("Erreur chargement article : " + error.message);
        } else if (data) {
          reset({
            ...data,
            date_publication: data.date_publication ? data.date_publication.slice(0, 10) : '',
            tags: Array.isArray(data.tags) ? data.tags : [],
            gallery: Array.isArray(data.gallery) ? data.gallery : [],
          });
        }
        setLoadingArticle(false);
      })();
    }
  }, [articleId, reset]);

  return (
    <div className="flex w-full min-h-screen bg-gray-50">
      {/* Loader central lors du chargement de l'article */}
      {loadingArticle && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/70 z-50">
          <div className="flex flex-col items-center gap-2">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
            <span className="text-blue-700 font-semibold">Chargement de l'article...</span>
          </div>
        </div>
      )}
      {/* Confirmation visuelle après enregistrement */}
      {showConfirmation && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fadeIn">
          ✅ {articleId && articleId !== 'new' ? 'Article mis à jour!' : 'Article créé!'}
        </div>
      )}
      {/* Zone centrale */}
      <form className="flex-1 max-w-5xl mx-auto w-full bg-white my-8 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('titre', { required: true })}
          className="w-full mb-4 px-3 py-2 border border-[#e5e9f2] rounded-[6px] font-sans text-lg focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-400"
          placeholder="Titre"
          disabled={uploading || loadingArticle}
        />
        <Controller
          name="contenu"
          control={control}
          defaultValue={initialValues.contenu || ''}
          render={({ field: { onChange, value } }) => (
            <Editor
              value={value}
              init={{
                height: 400,
                menubar: false,
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'print', 'preview', 'anchor',
                  'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'paste', 'help', 'wordcount'
                ],
                toolbar:
                  'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media | removeformat | help',
                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
                image_title: true,
                automatic_uploads: true,
                file_picker_types: 'image',
                media_live_embeds: true,
                file_picker_callback: async (callback, value, meta) => {
                  if (meta.filetype === 'image') {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.onchange = async function () {
                      const file = (input as HTMLInputElement).files?.[0];
                      if (!file) return;
                      // Upload to Supabase Storage
                      const filePath = `public/editor-${Date.now()}-${file.name}`;
                      const { data, error } = await supabase.storage.from('article-images').upload(filePath, file, { upsert: true });
                      if (error) {
                        toast.error('Erreur upload image');
                        return;
                      }
                      const { data: publicUrlData } = supabase.storage.from('article-images').getPublicUrl(filePath);
                      const url = publicUrlData.publicUrl;
                      console.log('Image URL:', url);
                      toast.success('Image URL: ' + url);
                      callback(url, { title: file.name });
                    };
                    input.click();
                  }
                },
              }}
              onEditorChange={onChange}
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
              disabled={uploading || loadingArticle}
            />
          )}
        />
        {/* BOUTON CREER/ENREGISTRER EN BAS DU FORM */}
        <div className="flex gap-4 justify-end mt-8">
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition" disabled={uploading || loadingArticle}>
            {uploading ? 'Enregistrement...' : (articleId ? 'Enregistrer' : 'Créer')}
          </button>
          <button type="button" className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition" onClick={() => navigate('/admin/articles')} disabled={uploading || loadingArticle}>
            Annuler
          </button>
        </div>
      </form>
      {/* Sidebar options à droite */}
      <aside className="w-72 flex-shrink-0 sticky top-8 ml-8 space-y-6 hidden lg:block">
        {/* Bloc sauvegarde/statut */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-none">
          <button type="button" onClick={() => toggleBlock('publication')} className="w-full flex items-center justify-between px-4 py-3 font-semibold focus:outline-none">
            <span>Publication</span>
            <span className={`transition-transform ${openBlock.publication ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openBlock.publication ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>
      <Controller
        control={control}
              name="statut"
        render={({ field }) => (
          <select {...field} className="input input-bordered w-full">
                  <option value="brouillon">Brouillon</option>
                  <option value="publie">Publié</option>
          </select>
        )}
      />
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Date de publication</label>
              <Controller
                control={control}
                name="date_publication"
                render={({ field }) => (
                  <input type="date" className="input input-bordered w-full" {...field} />
                )}
              />
            </div>
          </div>
        </div>
        {/* Bloc image principale */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-none">
          <button type="button" onClick={() => toggleBlock('image')} className="w-full flex items-center justify-between px-4 py-3 font-semibold focus:outline-none">
            <span>Image principale</span>
            <span className={`transition-transform ${openBlock.image ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openBlock.image ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>
      <div {...getRootImageProps()} className={`border-2 border-dashed rounded p-4 text-center cursor-pointer ${isDragImageActive ? 'bg-blue-50' : ''}`}>
        <input {...getInputImageProps()} />
        {watch('image_url') ? (
          <div className="relative inline-block mx-auto">
            <img src={watch('image_url')} alt="aperçu" className="h-32 object-contain rounded" />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
                  setValue('image_url', '');
                  toast.success("Image supprimée");
                }
              }}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700 transition z-10"
              title="Supprimer l'image"
              disabled={uploading || loadingArticle}
            >
              &#10006;
            </button>
          </div>
        ) : (
          <span>Glissez-déposez une image ou cliquez ici</span>
        )}
      </div>
          </div>
        </div>
        {/* Bloc galerie d'images */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-none">
          <button type="button" onClick={() => toggleBlock('gallery')} className="w-full flex items-center justify-between px-4 py-3 font-semibold focus:outline-none">
            <span>Galerie d'images</span>
            <span className={`transition-transform ${openBlock.gallery ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openBlock.gallery ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>
            <div {...getRootGalleryProps()} className={`border-2 border-dashed rounded p-4 text-center cursor-pointer ${isDragGalleryActive ? 'bg-blue-50' : ''}`}>
              <input {...getInputGalleryProps()} />
              {gallery.length > 0 ? (
                <div className="flex flex-wrap gap-3 justify-center">
                  {gallery.map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`galerie-${idx}`} className="h-16 w-16 object-cover rounded shadow" />
                      <button type="button" onClick={() => removeGalleryImage(img)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100 transition text-xs">&times;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <span>Glissez-déposez plusieurs images pour la galerie (max 5)</span>
              )}
            </div>
          </div>
        </div>
        {/* Bloc audio */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-none">
          <button type="button" onClick={() => toggleBlock('audio')} className="w-full flex items-center justify-between px-4 py-3 font-semibold focus:outline-none">
            <span>Fichier audio</span>
            <span className={`transition-transform ${openBlock.audio ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openBlock.audio ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>
      <div {...getRootAudioProps()} className={`border-2 border-dashed rounded p-4 text-center cursor-pointer ${isDragAudioActive ? 'bg-blue-50' : ''}`}>
        <input {...getInputAudioProps()} />
        {watch('audio_url') ? (
          <div className="relative inline-block w-full">
            <audio controls src={watch('audio_url')} className="mx-auto w-full mt-2 rounded" />
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer cet audio ?")) {
                  setValue('audio_url', '');
                  toast.success("Audio supprimé");
                }
              }}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700 transition z-10"
              title="Supprimer l'audio"
              disabled={uploading || loadingArticle}
            >
              &#10006;
            </button>
          </div>
        ) : (
          <span>Glissez-déposez un fichier audio ou cliquez ici</span>
        )}
      </div>
          </div>
        </div>
        {/* Bloc SEO */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-none">
          <button type="button" onClick={() => toggleBlock('seo')} className="w-full flex items-center justify-between px-4 py-3 font-semibold focus:outline-none">
            <span>SEO</span>
            <span className={`transition-transform ${openBlock.seo ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openBlock.seo ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>
            <input {...register('meta_title')} className="input input-bordered w-full" placeholder="Meta Title (SEO)" maxLength={60} />
            <textarea {...register('meta_description')} className="input input-bordered w-full min-h-[60px]" placeholder="Meta Description (SEO)" maxLength={160} />
          </div>
        </div>
        {/* Bloc catégorie et auteur */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-none">
          <button type="button" onClick={() => toggleBlock('meta')} className="w-full flex items-center justify-between px-4 py-3 font-semibold focus:outline-none">
            <span>Catégorie & Auteur</span>
            <span className={`transition-transform ${openBlock.meta ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openBlock.meta ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>  
            <label className="block text-gray-700 font-bold mb-2">Catégorie</label>
            {loadingCategories ? (
              <div className="text-gray-400">Chargement…</div>
            ) : (
              <select {...register('categorie')} className="input input-bordered w-full mb-4">
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            )}
            <input {...register('auteur', { required: true })} className="input input-bordered w-full" placeholder="Auteur" />
          </div>
        </div>
        {/* Bloc tags */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl shadow-none">
          <button type="button" onClick={() => toggleBlock('tags')} className="w-full flex items-center justify-between px-4 py-3 font-semibold focus:outline-none">
            <span>Tags</span>
            <span className={`transition-transform ${openBlock.tags ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${openBlock.tags ? 'max-h-96 p-4' : 'max-h-0 p-0'}`}>  
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), addTag()) : undefined}
            className="input input-bordered flex-1"
            placeholder="Ajouter un tag"
          />
          <button type="button" onClick={addTag} className="bg-blue-600 text-white px-3 py-1 rounded">Ajouter</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: string, idx: number) => (
            <span key={idx} className="bg-gray-200 px-2 py-1 rounded text-xs flex items-center gap-1">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-red-500 ml-1">&times;</button>
            </span>
          ))}
        </div>
      </div>
        </div>
      </aside>
      </div>
  );
};

export default ArticleForm; 
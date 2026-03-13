import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '@/lib/supabaseClient';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';
import { useCategories } from '@/components/admin-dashboard/useCategories';
import { useAdminContext } from '@/hooks/use-admin-context';
import { LoadingBar } from '@/components/ui/loading-bar';

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
  console.log('ArticleForm initialized with:', { initialValues, articleId });
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
      share_image_url: initialValues.share_image_url || '',
      share_description: initialValues.share_description || '',
      statut: initialValues.statut || 'brouillon',
      // Pour les brouillons, ne pas définir de date par défaut
      // Pour les articles publiés, utiliser la date existante ou laisser vide (sera définie automatiquement)
      date_publication: initialValues.date_publication 
        ? (typeof initialValues.date_publication === 'string' && initialValues.date_publication.length > 10 
            ? initialValues.date_publication.slice(0, 10) 
            : initialValues.date_publication.slice(0, 10))
        : '',
    }
  });
  const [uploading, setUploading] = useState(false);
  const [loadingArticle, setLoadingArticle] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [openBlock, setOpenBlock] = useState({
    publication: true,
    image: true, // Open image block by default for better UX
    gallery: false,
    audio: false,
    seo: false,
    meta: false,
    tags: false,
  });
  const toggleBlock = (key: keyof typeof openBlock) => setOpenBlock(prev => ({ ...prev, [key]: !prev[key] }));
  const navigate = useNavigate();
  const { categories, loading: loadingCategories } = useCategories();
  const { getArticlesPath } = useAdminContext();
  
  // Observer le changement de statut pour définir automatiquement la date si nécessaire
  const currentStatut = watch('statut');
  const currentDatePublication = watch('date_publication');
  
  useEffect(() => {
    // Si le statut passe à "publie" et qu'il n'y a pas de date de publication, définir la date actuelle silencieusement
    // Le toast sera affiché lors de la soumission pour éviter les notifications répétées
    if (currentStatut === 'publie' && (!currentDatePublication || String(currentDatePublication).trim() === '')) {
      const today = new Date().toISOString().slice(0, 10);
      setValue('date_publication', today, { shouldValidate: false });
    }
  }, [currentStatut, currentDatePublication, setValue]);

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
    
    // Si l'article est publié, s'assurer qu'une date de publication est définie
    let datePublication = values.date_publication;
    
    if (values.statut === 'publie') {
      // Si l'article est publié et qu'il n'y a pas de date de publication (vide, null, ou undefined)
      // ou si la date est invalide, utiliser la date actuelle
      const dateStr = datePublication ? String(datePublication).trim() : '';
      if (!datePublication || dateStr === '' || dateStr === 'undefined' || dateStr === 'null') {
        datePublication = new Date().toISOString();
        toast.success("Date de publication définie automatiquement à aujourd'hui");
      } else {
        // S'assurer que la date est au format ISO complet pour Supabase
        // Si c'est juste une date (YYYY-MM-DD), on peut la convertir en ISO
        const dateStr2 = String(datePublication);
        if (dateStr2.length === 10) {
          datePublication = new Date(dateStr2 + 'T00:00:00').toISOString();
        }
      }
    } else if (values.statut === 'brouillon') {
      // Pour les brouillons, on peut garder la date ou la vider
      // Si la date existe, on la garde (elle pourra servir si l'article est republié)
      // Sinon, on laisse null/undefined
      const dateStr = datePublication ? String(datePublication).trim() : '';
      if (!datePublication || dateStr === '') {
        datePublication = null;
      } else {
        // Garder la date même pour les brouillons (pour pouvoir republier avec la même date)
        const dateStr2 = String(datePublication);
        if (dateStr2.length === 10) {
          datePublication = new Date(dateStr2 + 'T00:00:00').toISOString();
        }
      }
    }
    
    const valuesWithSlug = { ...values, slug, date_publication: datePublication };
    const res =
      articleId && articleId !== "new"
        ? await supabase.from("articles").update(valuesWithSlug).eq("id", articleId)
        : await supabase.from("articles").insert([valuesWithSlug]);
    setUploading(false);
    if (res.error) {
      console.error('Erreur Supabase:', res.error);
      toast.error("Erreur lors de l'enregistrement : " + res.error.message);
    } else {
      if (articleId && articleId !== 'new') {
        if (values.statut === 'publie') {
          toast.success("Article publié avec succès!");
        } else {
          toast.success("Article mis à jour!");
        }
      } else {
        toast.success("Article créé!");
      }
      // Don't reset the form immediately - let the user see the success message
      // and navigate away naturally
      if (typeof onSuccess === 'function') {
        onSuccess(valuesWithSlug);
      }
      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        navigate(getArticlesPath());
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
          console.log('Loading article data for edit:', data);
          console.log('Article image_url:', data.image_url);
          console.log('Article statut:', data.statut);
          console.log('Article date_publication:', data.date_publication);
          
          // Préparer les données du formulaire
          const formData = {
            ...data,
            // Formater la date de publication pour l'input date (YYYY-MM-DD)
            date_publication: data.date_publication 
              ? (typeof data.date_publication === 'string' 
                  ? (data.date_publication.length > 10 
                      ? data.date_publication.slice(0, 10) 
                      : data.date_publication)
                  : new Date(data.date_publication).toISOString().slice(0, 10))
              : '',
            tags: Array.isArray(data.tags) ? data.tags : (typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : []),
            gallery: Array.isArray(data.gallery) ? data.gallery : [],
          };
          
          console.log('Resetting form with data:', formData);
          console.log('Form statut:', formData.statut);
          console.log('Form date_publication:', formData.date_publication);
          reset(formData);
          
          // Expand publication block if article is a draft (so admin can easily publish it)
          if (data.statut === 'brouillon') {
            setOpenBlock(prev => ({ ...prev, publication: true }));
          }
          
          // Expand image block if there's an existing image
          if (data.image_url) {
            console.log('Expanding image block for existing image');
            setOpenBlock(prev => ({ ...prev, image: true }));
          }
        }
        setLoadingArticle(false);
      })();
    }
  }, [articleId, reset]);

  return (
    <div className="flex w-full min-h-screen">
      {/* Loader central lors du chargement de l'article */}
      {loadingArticle && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md z-50 gap-4">
          <LoadingBar variant="full" />
          <LoadingBar variant="inline" className="w-64 mt-4" />
          <span className="text-[var(--text-primary)] font-semibold">Chargement de l'article...</span>
        </div>
      )}
      {/* Confirmation visuelle après enregistrement */}
      {showConfirmation && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-green-500/90 backdrop-blur-md border border-green-400 text-white px-6 py-3 rounded-xl shadow-[0_4px_24px_rgba(34,197,94,0.3)] z-50 animate-fadeIn font-medium">
          ✅ {articleId && articleId !== 'new' ? 'Article mis à jour!' : 'Article créé!'}
        </div>
      )}
      {/* Zone centrale */}
      <form className="flex-1 max-w-5xl mx-auto w-full my-8 flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('titre', { required: true })}
          className="w-full mb-6 px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-primary)] font-sans text-xl font-bold focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-colors placeholder-[var(--text-muted)]"
          placeholder="Titre de l'article"
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
          <button type="submit" className="bg-[var(--accent)] text-white px-8 py-3 rounded-xl hover:brightness-110 font-semibold transition-all shadow-[0_4px_16px_var(--accent-glow)] hover:-translate-y-0.5" disabled={uploading || loadingArticle}>
            {uploading ? 'Enregistrement...' : (articleId ? 'Enregistrer' : 'Créer')}
          </button>
          <button type="button" className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] px-8 py-3 rounded-xl hover:bg-white/10 font-semibold transition-all" onClick={() => navigate(getArticlesPath())} disabled={uploading || loadingArticle}>
            Annuler
          </button>
        </div>
      </form>
      {/* Sidebar options à droite */}
      <aside className="w-80 flex-shrink-0 sticky top-8 ml-8 space-y-6 hidden lg:block">
        {/* Bloc sauvegarde/statut */}
        <div className="dark-card !p-0 overflow-hidden shadow-lg border border-[var(--border)]">
          <button type="button" onClick={() => toggleBlock('publication')} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[var(--text-primary)] bg-black/20 hover:bg-black/30 transition-colors focus:outline-none">
            <span>Publication</span>
            <span className={`transition-transform ${openBlock.publication ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-[var(--bg-card)] ${openBlock.publication ? 'max-h-96 p-5 border-t border-[var(--border)]' : 'max-h-0 p-0'}`}>
            <Controller
              control={control}
              name="statut"
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Statut de l'article</label>
                  <select {...field} className="w-full px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors">
                    <option value="brouillon" className="bg-[var(--bg-main)]">Brouillon</option>
                    <option value="publie" className="bg-[var(--bg-main)]">Publié</option>
                  </select>
                  {field.value === 'publie' && (
                    <p className="text-xs text-[var(--text-muted)] mt-2 italic">
                      💡 Si aucune date n'est spécifiée, la date d'aujourd'hui sera utilisée automatiquement
                    </p>
                  )}
                </div>
              )}
            />
            <div className="mt-5">
              <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                Date de publication
                {watch('statut') === 'publie' && (
                  <span className="text-[var(--accent)] ml-1">*</span>
                )}
              </label>
              <Controller
                control={control}
                name="date_publication"
                render={({ field }) => (
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors" 
                    {...field}
                    value={field.value || ''}
                    placeholder={watch('statut') === 'publie' ? 'Date automatique si vide' : 'Optionnel pour les brouillons'}
                  />
                )}
              />
              {watch('statut') === 'publie' && !watch('date_publication') && (
                <p className="text-xs text-[var(--accent-blue)] mt-2">
                  ⏰ La date d'aujourd'hui sera utilisée lors de l'enregistrement
                </p>
              )}
            </div>
          </div>
        </div>
        {/* Bloc image principale */}
        <div className="dark-card !p-0 overflow-hidden shadow-lg border border-[var(--border)]">
          <button type="button" onClick={() => toggleBlock('image')} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[var(--text-primary)] bg-black/20 hover:bg-black/30 transition-colors focus:outline-none">
            <span>Image principale</span>
            <span className={`transition-transform text-[var(--text-muted)] ${openBlock.image ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-[var(--bg-card)] ${openBlock.image ? 'max-h-96 p-5 border-t border-[var(--border)]' : 'max-h-0 p-0'}`}>
            {/* Hidden input to ensure image_url is registered with the form */}
            <input type="hidden" {...register('image_url')} />
            <div {...getRootImageProps()} className={`border border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors rounded-xl p-6 text-center cursor-pointer bg-black/20 hover:bg-black/40 ${isDragImageActive ? 'border-[var(--accent)] bg-black/40' : ''}`}>
              <input {...getInputImageProps()} />
              {(() => {
                const imageUrl = watch('image_url');
                console.log('Form image_url value:', imageUrl);
                return imageUrl;
              })() ? (
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
        <div className="dark-card !p-0 overflow-hidden shadow-lg border border-[var(--border)]">
          <button type="button" onClick={() => toggleBlock('gallery')} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[var(--text-primary)] bg-black/20 hover:bg-black/30 transition-colors focus:outline-none">
            <span>Galerie d'images</span>
            <span className={`transition-transform text-[var(--text-muted)] ${openBlock.gallery ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-[var(--bg-card)] ${openBlock.gallery ? 'max-h-96 p-5 border-t border-[var(--border)]' : 'max-h-0 p-0'}`}>
            <div {...getRootGalleryProps()} className={`border border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors rounded-xl p-6 text-center cursor-pointer bg-black/20 hover:bg-black/40 ${isDragGalleryActive ? 'border-[var(--accent)] bg-black/40' : ''}`}>
              <input {...getInputGalleryProps()} />
              {gallery.length > 0 ? (
                <div className="flex flex-wrap gap-3 justify-center">
                  {gallery.map((img: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <img src={img} alt={`galerie-${idx}`} className="h-16 w-16 object-cover rounded-lg shadow-md border border-[var(--border)]" />
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeGalleryImage(img); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-80 group-hover:opacity-100 transition text-xs shadow-lg">&times;</button>
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-[var(--text-muted)] text-sm">Glissez-déposez plusieurs images pour la galerie (max 5)</span>
              )}
            </div>
          </div>
        </div>
        {/* Bloc audio */}
        <div className="dark-card !p-0 overflow-hidden shadow-lg border border-[var(--border)]">
          <button type="button" onClick={() => toggleBlock('audio')} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[var(--text-primary)] bg-black/20 hover:bg-black/30 transition-colors focus:outline-none">
            <span>Fichier audio</span>
            <span className={`transition-transform text-[var(--text-muted)] ${openBlock.audio ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-[var(--bg-card)] ${openBlock.audio ? 'max-h-96 p-5 border-t border-[var(--border)]' : 'max-h-0 p-0'}`}>
      <div {...getRootAudioProps()} className={`border border-dashed border-[var(--border)] hover:border-[var(--accent)] transition-colors rounded-xl p-6 text-center cursor-pointer bg-black/20 hover:bg-black/40 ${isDragAudioActive ? 'border-[var(--accent)] bg-black/40' : ''}`}>
        <input {...getInputAudioProps()} />
        {watch('audio_url') ? (
          <div className="relative inline-block w-full">
            <audio controls src={watch('audio_url')} className="mx-auto w-full mt-2 rounded-lg opacity-80" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm("Êtes-vous sûr de vouloir supprimer cet audio ?")) {
                  setValue('audio_url', '');
                  toast.success("Audio supprimé");
                }
              }}
              className="absolute -top-3 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-lg hover:bg-red-700 transition z-10"
              title="Supprimer l'audio"
              disabled={uploading || loadingArticle}
            >
              &#10006;
            </button>
          </div>
        ) : (
          <span className="text-[var(--text-muted)] text-sm">Glissez-déposez un fichier audio ou cliquez ici</span>
        )}
      </div>
          </div>
        </div>
        {/* Bloc SEO */}
        <div className="dark-card !p-0 overflow-hidden shadow-lg border border-[var(--border)]">
          <button type="button" onClick={() => toggleBlock('seo')} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[var(--text-primary)] bg-black/20 hover:bg-black/30 transition-colors focus:outline-none">
            <span>SEO</span>
            <span className={`transition-transform text-[var(--text-muted)] ${openBlock.seo ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-[var(--bg-card)] ${openBlock.seo ? 'max-h-96 p-5 border-t border-[var(--border)] flex flex-col gap-4' : 'max-h-0 p-0'}`}> 
            <input {...register('meta_title')} className="w-full px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" placeholder="Meta Title (SEO)" maxLength={60} />
            <textarea {...register('meta_description')} className="w-full px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)] min-h-[80px] resize-y" placeholder="Meta Description (SEO)" maxLength={160} />
            <input {...register('share_image_url')} className="w-full px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" placeholder="Image de partage (URL)" />
            <textarea {...register('share_description')} className="w-full px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)] min-h-[80px] resize-y" placeholder="Description de partage (pour réseaux sociaux)" maxLength={200} />
          </div>
        </div>
        {/* Bloc catégorie et auteur */}
        <div className="dark-card !p-0 overflow-hidden shadow-lg border border-[var(--border)]">
          <button type="button" onClick={() => toggleBlock('meta')} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[var(--text-primary)] bg-black/20 hover:bg-black/30 transition-colors focus:outline-none">
            <span>Catégorie & Auteur</span>
            <span className={`transition-transform text-[var(--text-muted)] ${openBlock.meta ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-[var(--bg-card)] ${openBlock.meta ? 'max-h-96 p-5 border-t border-[var(--border)]' : 'max-h-0 p-0'}`}>  
            <label className="block text-[var(--text-secondary)] font-medium mb-2 text-sm">Catégorie</label>
            {loadingCategories ? (
              <div className="text-[var(--text-muted)]">Chargement…</div>
            ) : (
              <select {...register('categorie')} className="w-full mb-4 px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors appearance-none">
                <option value="" className="bg-[var(--bg-main)]">Sélectionner une catégorie</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.name} className="bg-[var(--bg-main)]">{cat.name}</option>
                ))}
              </select>
            )}
            <label className="block text-[var(--text-secondary)] font-medium mb-2 text-sm mt-4">Auteur</label>
            <input {...register('auteur', { required: true })} className="w-full px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]" placeholder="Nom de l'auteur" />
          </div>
        </div>
        {/* Bloc tags */}
        <div className="dark-card !p-0 overflow-hidden shadow-lg border border-[var(--border)]">
          <button type="button" onClick={() => toggleBlock('tags')} className="w-full flex items-center justify-between px-5 py-4 font-semibold text-[var(--text-primary)] bg-black/20 hover:bg-black/30 transition-colors focus:outline-none">
            <span>Tags</span>
            <span className={`transition-transform text-[var(--text-muted)] ${openBlock.tags ? 'rotate-90' : ''}`}>▶</span>
          </button>
          <div className={`overflow-hidden transition-all duration-300 bg-[var(--bg-card)] ${openBlock.tags ? 'max-h-96 p-5 border-t border-[var(--border)]' : 'max-h-0 p-0'}`}>  
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' ? (e.preventDefault(), addTag()) : undefined}
            className="w-full flex-1 px-3 py-2 bg-black/30 border border-[var(--border)] rounded-lg text-white focus:outline-none focus:border-[var(--accent)] transition-colors placeholder-[var(--text-muted)]"
            placeholder="Nouveau tag"
          />
          <button type="button" onClick={addTag} className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg font-medium hover:brightness-110 shadow-[0_2px_8px_var(--accent-glow)] transition-all">Ajouter</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: string, idx: number) => (
            <span key={idx} className="bg-white/10 border border-white/5 px-2.5 py-1 rounded-md text-xs font-medium text-[var(--text-primary)] flex items-center gap-1.5 shadow-sm">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="text-[var(--accent)] hover:text-white transition-colors ml-0.5">&times;</button>
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
import type { User } from '@supabase/supabase-js';

function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Rôle « staff » depuis les métadonnées Supabase (inscription admin définit user_metadata.role). */
export function getStaffRole(user: User | null | undefined): string {
  if (!user) return '';
  const meta = user.user_metadata || {};
  if (meta.is_admin === true || meta.is_staff === true || meta.staff === true) {
    return 'admin';
  }
  const candidates = [
    meta.role,
    meta.admin_role,
    user.app_metadata?.role,
    Array.isArray(user.app_metadata?.roles) ? (user.app_metadata.roles as string[]).join(',') : null,
  ];
  for (const c of candidates) {
    if (c == null || c === undefined) continue;
    const s = fold(String(c));
    if (s) return s;
  }
  return '';
}

function isSuperAdminRole(r: string): boolean {
  return r === 'superadmin' || r === 'super_admin';
}

function isAdminPanelRole(r: string): boolean {
  return (
    isSuperAdminRole(r) ||
    r === 'admin' ||
    r === 'editor' ||
    r === 'editeur' ||
    r === 'redacteur' ||
    r === 'staff'
  );
}

/** Utilisateur autorisé à ouvrir l’éditeur d’articles (admin / superadmin / rôles éditoriaux). */
export function isStaffArticleEditor(user: User | null | undefined): boolean {
  const r = getStaffRole(user);
  return isAdminPanelRole(r);
}

/**
 * URL d’édition selon le rôle : superadmin → /superadmin/... sinon /admin/...
 *
 * Si aucun rôle n’est en métadonnées mais qu’une session existe, on renvoie quand même
 * `/admin/articles/edit/...` : c’est aligné avec RequireAdminAuth (session seule).
 */
export function getStaffArticleEditPath(
  user: User | null | undefined,
  articleId: string
): string | null {
  if (!user || !articleId) return null;
  const r = getStaffRole(user);
  if (isSuperAdminRole(r)) {
    return `/superadmin/articles/edit/${articleId}`;
  }
  return `/admin/articles/edit/${articleId}`;
}

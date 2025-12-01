# Configuration Supabase OAuth pour Google

## Problème de redirection vers localhost

Si vous rencontrez une redirection vers `localhost:3000` après la connexion Google, voici comment le résoudre :

## Configuration dans Supabase Dashboard

### 1. Configuration du Provider Google

1. Allez dans votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **Authentication** > **Providers**
3. Cliquez sur **Google** pour le configurer
4. Entrez vos credentials Google OAuth :
   - **Client ID** : Votre Google Client ID
   - **Client Secret** : Votre Google Client Secret

### 2. Configuration des URLs de redirection autorisées

**IMPORTANT** : Dans le dashboard Supabase, vous devez configurer les URLs de redirection autorisées.

#### Dans Google Cloud Console :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Allez dans **APIs & Services** > **Credentials**
4. Cliquez sur votre OAuth 2.0 Client ID
5. Dans **Authorized redirect URIs**, ajoutez :
   ```
   https://zwtdnfmwxddrmmmruaoc.supabase.co/auth/v1/callback
   https://lemagazinedumali.com/
   https://www.lemagazinedumali.com/
   ```
   (Pour le développement local, vous pouvez aussi ajouter `http://localhost:3000/`)

#### Dans Supabase Dashboard :

1. Allez dans **Authentication** > **URL Configuration**
2. Vérifiez que **Site URL** est configuré avec :
   ```
   https://lemagazinedumali.com
   ```
3. Dans **Redirect URLs**, ajoutez :
   ```
   https://lemagazinedumali.com/**
   https://www.lemagazinedumali.com/**
   ```
   (Pour le développement local : `http://localhost:3000/**`)

### 3. Variables d'environnement (Optionnel mais recommandé)

Pour une configuration plus robuste, vous pouvez définir l'URL de production dans vos variables d'environnement :

**Dans Vercel ou votre plateforme de déploiement :**
```env
VITE_SITE_URL=https://lemagazinedumali.com
```

**Ou dans un fichier `.env.production` :**
```env
VITE_SITE_URL=https://lemagazinedumali.com
```

## Vérification

Après avoir configuré :

1. Déployez votre application avec les changements
2. Testez la connexion Google depuis `https://lemagazinedumali.com/login`
3. Vérifiez que vous êtes redirigé vers `https://lemagazinedumali.com/` et non vers `localhost:3000`

## Dépannage

### Si vous êtes toujours redirigé vers localhost :

1. **Vérifiez la configuration Supabase** :
   - Allez dans **Authentication** > **URL Configuration**
   - Assurez-vous que **Site URL** est `https://lemagazinedumali.com`

2. **Vérifiez les cookies du navigateur** :
   - Les cookies peuvent contenir l'ancienne URL
   - Effacez les cookies pour `lemagazinedumali.com`

3. **Vérifiez le code** :
   - Le code utilise maintenant `getOAuthRedirectUrl()` qui détecte automatiquement l'environnement
   - En production, il utilisera `https://lemagazinedumali.com/`

4. **Vérifiez la console du navigateur** :
   - Ouvrez les DevTools (F12)
   - Regardez les erreurs dans la console
   - Vérifiez les requêtes réseau pour voir quelle URL est utilisée

## Code de l'application

Le code de l'application détecte automatiquement l'environnement :

- **Production** (`lemagazinedumali.com`) → `https://lemagazinedumali.com/`
- **Développement local** → `http://localhost:3000/` (ou le port utilisé)
- **Autres environnements** → Utilise `window.location.origin`

Cette détection se fait dans `src/lib/authHelpers.ts` via la fonction `getOAuthRedirectUrl()`.


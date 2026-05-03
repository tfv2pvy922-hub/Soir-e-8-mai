# CR3PSCL - version finale avec admin

Cette version utilise :

- Netlify pour heberger le site gratuitement
- Supabase pour stocker les reponses gratuitement
- un onglet Admin avec code configure dans `config.js`

Il n'y a plus de Netlify Functions ni de Netlify Forms.

## 1. Creer Supabase

1. Va sur https://supabase.com/
2. Cree un projet gratuit.
3. Ouvre `SQL Editor`.
4. Copie-colle le contenu de `supabase-setup.sql`.
5. Clique `Run`.

## 2. Recuperer les cles Supabase

Dans Supabase :

1. Va dans `Project Settings`.
2. Va dans `API`.
3. Copie :
   - `Project URL`
   - `anon public key`

## 3. Configurer le site

Ouvre `config.js` et remplis :

```js
window.CR3PSCL_CONFIG = {
  SUPABASE_URL: "https://TON-PROJET.supabase.co",
  SUPABASE_ANON_KEY: "TA_CLE_ANON_PUBLIC",
  ADMIN_CODE: "TON_CODE_ADMIN",
};
```

Pour une soiree entre potes, ce code admin suffit. Ce n'est pas une securite bancaire :
quelqu'un qui fouille le code peut le trouver.

## 4. Upload gratuit sur Netlify

Methode simple :

1. Va sur Netlify.
2. `Add new site` > `Deploy manually`.
3. Glisse-depose le dossier `VERSION_FINALE_ADMIN`.

Methode plus propre :

1. Cree un repo GitHub vide.
2. Upload tout le contenu de `VERSION_FINALE_ADMIN`.
3. Netlify > `Add new site` > `Import an existing project`.
4. Choisis le repo.
5. Build command : vide.
6. Publish directory : `.`
7. Deploy.

## 5. Test

1. Ouvre le site.
2. Ajoute une presence.
3. Propose un son.
4. Vote au sondage.
5. Recharge la page : les donnees doivent rester.
6. Ouvre l'onglet Admin et mets ton code.

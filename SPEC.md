# Relay — Spec V1

> Plateforme d'entraide flash entre étudiants sur campus. Mobile-first webapp, ouvrable dans un navigateur, pas d'AppStore.

---

## Concept

Un étudiant a besoin d'un coup de pouce maintenant (câble HDMI, avis Figma, bug React) : il poste une "demande flash" avec un timer. Les camarades disponibles sur le campus voient le feed en temps réel et cliquent "J'aide" — l'auteur est notifié instantanément.

---

## Stack technique

| Couche | Choix |
|---|---|
| Front | React (Vite) + TailwindCSS |
| Back | Supabase (Postgres + Realtime + Auth + Edge Functions) |
| Auth | Magic link email via Supabase Auth |
| Notifications | Email (Supabase + Resend) + Web Push API (service worker) |
| Hébergement | Vercel |

---

## Charte graphique

- **Couleurs** : Jaune crème `#F6F5AE`, Noir carbone `#181713`, Bone `#F0EEE9`, Paper `#FAFAF7`
- **Typographies** : Montserrat Alternates (titres, display), Geologica 300 (corps)
- **Style** : Formes très arrondies (border-radius 24–32px), esprit éditorial, vibe chaleureux/audacieux

---

## Vues à livrer

### Mobile (390px)

#### 1. Home — Feed éditorial (V2)
- Header jaune full-bleed avec badge "Live · Ynov Lyon" + cloche notification
- Titre dynamique : "X mains tendues." (compte réel)
- Feed de cartes alternées jaune/blanc, triées par urgence puis par date
- Chaque carte : catégorie + icône, titre display XL, auteur + filière, localisation, timer si urgent, bouton "J'aide"
- **État vide** : illustration + CTA "Sois le premier à poster"
- Cartes avec timer expiré : disparaissent automatiquement (Realtime subscription)

#### 2. Création — Demande flash
- Formulaire en 6 étapes scrollables :
  1. Titre (textarea display)
  2. Catégorie (grille d'icônes : câble, design, code, cours, test, autre)
  3. Filières ciblées (multi-select chips)
  4. Description (optionnelle)
  5. Localisation (texte libre)
  6. Urgence : toggle → révèle sélecteur de durée (5 / 10 / 15 / 30 / 60 min)
- Bouton "Lancer" actif dès que titre + catégorie + localisation remplis
- Après submit : toast de confirmation + retour au feed

#### 3. Profil & Disponibilité
- Carte identité (avatar généré, nom, email, filière)
- **Toggle disponibilité** (feature critique) : "Sur le campus" / "Hors-ligne" avec halo animé jaune
  - Chips de rayon : Bât. voisins / Tout le campus / Ma promo
- Stats : aides apportées, demandes lancées, temps de réponse moyen
- Compétences : tags + bouton "Ajouter"
- Historique des aides : liste chronologique

### Desktop (1280px+)

- **Sidebar gauche** : logo Relay, bouton "Demande flash" (FAB), nav (Home, Notifications, Profil), toggle disponibilité, mini-profil
- **Feed central** : grille 2 colonnes, cartes éditoriaux alternés jaune/blanc, barre de recherche + filtres par catégorie
- **Colonne droite** : carte campus stylisée, activité récente, stats globales

---

## Fonctionnalités clés

### Auth — Magic link
1. Première visite → modal "Rejoindre Relay" : email + prénom + filière
2. Supabase envoie un magic link
3. Après confirmation → profil créé, accès complet
4. Session persistée (localStorage via Supabase client)

### Demande flash — Lifecycle
```
ACTIVE → (timer expire) → EXPIRED (disparaît du feed)
ACTIVE → (quelqu'un clique "J'aide") → TAKEN
TAKEN  → (auteur confirme ou timer) → DONE
```

### "J'aide" — Flow
1. L'utilisateur clique "J'aide" sur une carte
2. Requête Supabase → `help_offers` table (avec `user_id`, `request_id`)
3. **Si premier** : statut demande → TAKEN, notifications envoyées à l'auteur
4. **Si déjà pris** : toast "Quelqu'un est déjà en route !" + card grisée
5. Notifications à l'auteur :
   - **Email** (Resend) : "X veut t'aider pour [titre]"
   - **Web Push** : même message, nécessite consentement au premier lancement

### Temps réel
- Le feed se met à jour via Supabase Realtime (INSERT/UPDATE/DELETE sur `requests`)
- Les cartes expirées disparaissent côté client via un interval + Realtime

---

## Modèle de données (Supabase)

### `profiles`
| Colonne | Type |
|---|---|
| id | uuid (FK auth.users) |
| name | text |
| email | text |
| filiere | text |
| skills | text[] |
| available | boolean |
| campus_radius | text |
| push_subscription | jsonb |

### `requests`
| Colonne | Type |
|---|---|
| id | uuid |
| author_id | uuid (FK profiles) |
| title | text |
| description | text |
| category | text |
| target_filieres | text[] |
| location | text |
| urgent | boolean |
| duration_min | integer |
| expires_at | timestamptz |
| status | enum: active / taken / done / expired |
| created_at | timestamptz |

### `help_offers`
| Colonne | Type |
|---|---|
| id | uuid |
| request_id | uuid (FK requests) |
| helper_id | uuid (FK profiles) |
| created_at | timestamptz |

---

## Edge cases couverts

| Cas | Comportement |
|---|---|
| Feed vide | Écran vide encourageant avec CTA "Poste la première demande" |
| Timer expiré | La carte disparaît du feed (Realtime + interval côté client) |
| Double clic "J'aide" | Premier arrivé = TAKEN, le suivant voit un toast d'information |
| Web Push refusé | Fallback email uniquement, pas de blocage |
| Pas connecté → "J'aide" | Redirige vers modal auth |

---

## Ce qui n'est PAS dans la V1
- Chat 1:1 après mise en relation
- Onboarding guidé (swipe tutorial)
- Carte campus interactive (géolocalisation GPS)
- Système de réputation / karma
- Notifications in-app (cloche avec badge)

---

## Critères de succès V1
- [ ] Un visiteur peut s'inscrire via magic link en < 30 secondes
- [ ] Une demande flash postée apparaît dans le feed en < 2 secondes
- [ ] "J'aide" envoie un email ET une Web Push à l'auteur
- [ ] Le feed se vide automatiquement quand un timer expire
- [ ] L'app est utilisable sur mobile Safari, Chrome Android, et desktop Chrome

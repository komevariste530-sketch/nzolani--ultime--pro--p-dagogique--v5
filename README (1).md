# NZOLANI ULTIME PRO+ PÉDAGOGIQUE V5 — Code source commercial

Ce dépôt est un **socle applicatif full-stack prêt à configurer et à faire auditer**, conçu pour évoluer vers le produit commercial NZOLANI. Il contient une PWA, une API Node.js/Express, Prisma/PostgreSQL, authentification, rôles, gestion des fiches, bibliothèque documentaire, notes de version, adaptateur IA côté serveur et configuration de conteneurs.

> Important : un dépôt de code ne constitue pas à lui seul un produit commercial certifié ou prêt à exploiter. Avant toute commercialisation, il faut configurer les services, fournir et vérifier les documents pédagogiques officiels, réaliser les audits de sécurité, les tests de charge et les tests juridiques/comptables, puis compiler et tester l'application Android.

## Fonctionnalités incluses dans ce socle

- Interface Web/PWA responsive en français.
- Classes CP1, CP2, CE1, CE2, CM1 et CM2.
- Catalogue initial de disciplines et sous-disciplines modifiable.
- Génération structurée de fiches individuelles ou par lot de 10.
- Prévisualisation et validation explicite par l'enseignant.
- Sauvegarde serveur des fiches et consultation locale hors connexion.
- Synchronisation simple des fiches locales vers l'API lorsque le réseau revient.
- Tchat via adaptateur IA côté serveur (clé API jamais exposée au navigateur).
- Mode hors ligne du tchat : réponses de secours limitées.
- Import documentaire, métadonnées, statuts de vérification, publication réservée à l'administrateur.
- Gestion des utilisateurs et rôles `TEACHER` / `ADMIN`.
- Notes de version et endpoint de mise à jour.
- Journal d'audit pour les actions administratives importantes.
- Export/Impression navigateur (PDF via « Imprimer > Enregistrer en PDF »).
- Docker Compose pour PostgreSQL et API.
- Configuration Capacitor pour préparer le conteneur Android.

## Prérequis

- Node.js 20 ou supérieur
- npm 10 ou supérieur
- Docker Desktop ou PostgreSQL 15+
- Un domaine HTTPS pour la production
- Un fournisseur IA compatible avec l'API configurée, si le tchat IA est activé

## Démarrage local

1. Copier `.env.example` vers `.env`.
2. Remplacer impérativement `JWT_SECRET` par une valeur aléatoire longue.
3. Lancer `docker compose up -d db`.
4. Installer les dépendances : `npm install`.
5. Générer Prisma : `npm run db:generate`.
6. Créer les tables : `npm run db:migrate`.
7. Créer un administrateur : `npm run seed:admin`.
8. Démarrer l'API : `npm run dev`.
9. Ouvrir `http://localhost:3000`.

L'API sert également les fichiers de `public/`.

## Premier administrateur

Définir `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `.env` avant `npm run seed:admin`. Le script refuse un mot de passe trop faible. Supprimer ou désactiver ces variables après le provisionnement initial et conserver les identifiants dans un gestionnaire de secrets.

## IA

Configurer `AI_BASE_URL`, `AI_API_KEY` et `AI_MODEL` dans l'environnement serveur. L'adaptateur utilise un format de type Chat Completions compatible. Vérifier la compatibilité du fournisseur choisi. Ne jamais placer la clé IA dans `public/`, le navigateur, une application Android ou un dépôt Git.

Si l'IA n'est pas configurée, le tchat indique clairement qu'il fonctionne en mode local limité.

## Documents officiels

Les documents importés sont privés par défaut. Un administrateur doit vérifier leur provenance, organisme émetteur, date, version et applicabilité avant de les publier. Le code ne certifie pas l'authenticité d'un document. Prévoir un contrôle humain et, en production, un antivirus et un stockage objet privé.

## Android

Depuis la racine, après installation et compilation de l'application Web :
- `npm run android:add` (une seule fois)
- `npm run android:sync`
- `npm run android:open`

Ces commandes préparent le projet Capacitor. La compilation APK/AAB doit être réalisée dans Android Studio avec le SDK Android installé, puis testée sur des appareils réels.

## Hors connexion

La PWA met en cache l'interface et conserve un brouillon local. Les fiches locales sont envoyées à l'API lorsque la connexion revient. Les fonctions serveur (IA distante, comptes, publication, paiements) ne sont pas disponibles hors connexion. Pour une vraie synchronisation multi-appareils robuste, prévoir une stratégie de résolution de conflits et des tests de coupure réseau.

## Paiements

Aucun paiement réel n'est simulé ou encaissé par ce dépôt. L'intégration Mobile Money/Airtel Money doit être réalisée avec un prestataire contractuellement autorisé au Congo, ses API officielles, webhooks signés, rapprochement et environnement de test. Ne jamais activer un abonnement sur la seule base d'un retour navigateur.

## Production — liste obligatoire avant ouverture au public

- [ ] Déployer derrière HTTPS et un reverse proxy.
- [ ] Configurer les secrets dans un gestionnaire de secrets.
- [ ] Désactiver l'inscription admin publique et activer MFA pour les administrateurs.
- [ ] Ajouter antivirus / contrôle de type réel / limite de taille aux fichiers importés.
- [ ] Utiliser un stockage objet privé et des URL signées.
- [ ] Ajouter sauvegardes PostgreSQL chiffrées et tester la restauration.
- [ ] Ajouter politique de confidentialité, conditions d'utilisation et durée de conservation.
- [ ] Faire auditer authentification, autorisations, injection, téléversement, IA et protection des données.
- [ ] Charger les textes pédagogiques authentifiés et vérifier les droits de reproduction.
- [ ] Réaliser les tests pédagogiques par classe et discipline avec des enseignants.
- [ ] Intégrer le prestataire de paiement et tester les webhooks.
- [ ] Tester la PWA et l'APK sur plusieurs appareils et navigateurs.
- [ ] Mettre en place surveillance, alertes, journalisation et procédure d'incident.

## Structure

- `server/` API et logique métier
- `prisma/` schéma PostgreSQL
- `public/` PWA
- `scripts/` provisionnement initial
- `capacitor.config.json` configuration Android

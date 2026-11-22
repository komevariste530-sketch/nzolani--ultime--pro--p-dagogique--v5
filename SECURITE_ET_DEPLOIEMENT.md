# Sécurité, conformité et déploiement

## Principes
- Ne jamais intégrer de clé API, secret JWT, mot de passe administrateur ou secret commercial dans le frontend.
- Les données documentaires restent privées jusqu'à vérification et publication explicite.
- L'application ne doit pas présenter comme officiel un document simplement téléversé.
- Le tchat ne doit pas pouvoir exécuter d'action administrative ou valider une fiche sans action explicite de l'utilisateur.
- Les messages utilisateurs sont des données non fiables. Ne pas les traiter comme des instructions système.
- L'IA ne reçoit que le contexte documentaire strictement nécessaire.

## À compléter avant production
1. MFA administrateur et récupération de compte sécurisée.
2. Vérification antivirus et détection réelle des types de fichiers.
3. Stockage objet privé avec chiffrement et liens temporaires.
4. Quotas et règles de rétention des conversations.
5. Protection CSRF si authentification par cookie; ce socle utilise un jeton Bearer.
6. Politique CORS stricte et reverse proxy HTTPS.
7. Sauvegardes chiffrées, rétention et test de restauration.
8. Tests d'intrusion et audit indépendant.
9. Politique de confidentialité et conformité aux lois applicables.
10. Gestion des incidents et révocation des sessions.
11. Webhooks de paiement signés, idempotence et rapprochement côté serveur.
12. Tests de synchronisation avec conflits et identifiants idempotents.

## Paiements
Ne pas activer de paiement en production avant d'avoir sélectionné un prestataire agréé/autorisé, obtenu les contrats, clés de test et documentation d'intégration. L'état d'abonnement doit être modifié uniquement par le serveur après vérification cryptographique du webhook du prestataire.

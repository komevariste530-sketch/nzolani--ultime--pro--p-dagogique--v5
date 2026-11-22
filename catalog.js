const catalog = {
  "Français": ["Grammaire","Orthographe","Conjugaison","Vocabulaire","Lecture compréhension","Rédaction","Expression orale","Écriture"],
  "Mathématiques": ["Numération","Calcul","Géométrie","Mesures","Problèmes"],
  "Histoire": ["Histoire du Congo","Histoire générale"],
  "Géographie": ["Géographie physique","Population","Économie"],
  "Sciences-SVT": ["Corps humain","Animaux","Plantes","Écosystème"],
  "Sciences physiques, chimie et technologie": ["Matière","Énergie","Technologie"],
  "ECMP": ["Éducation civique et morale"],
  "EDHC": ["Éducation aux droits humains et à la citoyenneté"],
  "Éducation musicale / Chant": ["Chant","Rythme","Écoute musicale"],
  "EPS": ["Activités motrices","Jeux collectifs"],
  "Dossier CE/CM": ["Dossier pédagogique"]
};
const steps = {
  "Français|Grammaire": ["Éveil et motivation","Situation de découverte","Observation et manipulation","Analyse et formulation","Application","Évaluation et remédiation"],
  "Français|Conjugaison": ["Mise en situation","Observation des formes verbales","Manipulation et comparaison","Construction de la règle","Entraînement","Évaluation"],
  "Français|Lecture compréhension": ["Prélecture","Lecture","Compréhension globale","Explication du vocabulaire","Questions de compréhension","Synthèse et évaluation"],
  "Mathématiques|Numération": ["Situation-problème","Manipulation / observation","Recherche et verbalisation","Institutionnalisation","Exercices d'application","Évaluation"],
  "default": ["Mise en situation","Observation / recherche","Échanges et structuration","Synthèse","Application","Évaluation et remédiation"]
};
module.exports = { catalog, steps };

# pente-garage

Calculateur de Pente d'Allée de Garage - Une application web interactive pour calculer les pentes optimales d'une allée de garage en fonction de la distance, du dénivelé et des caractéristiques du véhicule.

## Description

Cette application permet de calculer et de visualiser les pentes nécessaires pour construire une allée de garage entre deux points A et B. Elle génère des spécifications précises pour le maçon et vérifie que le véhicule peut passer sans toucher le sol.

L'application prend en compte :

- **Paramètres du trajet** : distance directe A-B, dénivelé (positif ou négatif), et nombre de sections de pente (1, 2 ou 3)
- **Caractéristiques du véhicule** : longueur totale, empattement, et garde au sol

## Fonctionnalités

- 📊 Visualisation graphique de l'allée avec les pentes calculées
- 🔄 Calcul automatique des pentes optimales réparties équitablement
- ⚠️ Vérification de la garde au sol pendant tout le parcours
- 📐 Spécifications détaillées pour la construction (longueurs, hauteurs, angles, pourcentages)
- 📋 Instructions étape par étape pour le maçon
- 🎛️ Options pour 1, 2 ou 3 sections de pente
- 💾 Sauvegarde automatique des données dans le localStorage
- 📱 Interface responsive et simple

## Valeurs par Défaut

L'application utilise les valeurs suivantes par défaut :

- **Distance A-B**: 530 cm (5.30 m)
- **Dénivelé**: -75 cm (descente de 0.75 m)
- **Longueur du véhicule**: 420 cm
- **Empattement**: 268.5 cm
- **Garde au sol**: 13.5 cm
- **Nombre de sections**: 3 pentes

## Utilisation

1. Ajustez les paramètres du trajet (distance et dénivelé)
2. Sélectionnez le nombre de sections de pente (1, 2 ou 3)
3. Entrez les caractéristiques de votre véhicule
4. L'application calcule automatiquement :
   - Les longueurs et hauteurs de chaque section
   - Les angles et pourcentages de pente
   - La compatibilité avec votre véhicule
   - Les instructions précises pour la construction

## Installation et Utilisation

### Utilisation locale

Ouvrez simplement le fichier `index.html` dans votre navigateur web. Aucune installation ou serveur n'est nécessaire !

### Déploiement sur GitHub Pages

1. Activez GitHub Pages dans les paramètres de votre dépôt
2. Sélectionnez la branche principale comme source
3. L'application sera automatiquement publiée

L'application est entièrement statique et ne nécessite aucun serveur ou processus de build.

## Technologies utilisées

- **Vanilla JavaScript** - Pas de framework, code léger et performant
- **HTML5 Canvas** - Pour la visualisation graphique
- **CSS3** - Styling moderne et responsive
- **LocalStorage API** - Persistance des données

## Structure du projet

```
pente-garage/
└── index.html          # Application complète (HTML, CSS, et JavaScript)
```

## Licence

Voir le fichier [LICENSE](LICENSE) pour plus de détails.
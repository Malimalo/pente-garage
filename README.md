# pente-garage

Calculateur de Pente de Garage - Une application web interactive pour vérifier la compatibilité d'un véhicule avec une pente de garage.

## Description

Cette application permet de visualiser et de calculer si un véhicule peut entrer et sortir d'un garage avec une pente sans toucher le sol. Elle prend en compte :

- **Paramètres du garage** : longueur, hauteur totale, et 3 sections de pente (début, milieu, fin)
- **Caractéristiques du véhicule** : longueur totale, empattement, et garde au sol

## Fonctionnalités

- 📊 Visualisation graphique de la pente du garage et du véhicule
- 🔄 Calcul automatique en temps réel de la garde au sol
- ⚠️ Détection des collisions potentielles lors de l'entrée/sortie
- 💾 Sauvegarde automatique des données dans le localStorage
- 📱 Interface responsive et simple

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
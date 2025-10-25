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

### Prérequis

- Node.js (version 14 ou supérieure)
- npm

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173/`

### Build de production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`

### Prévisualisation de la production

```bash
npm run preview
```

## Technologies utilisées

- **Vite.js** - Build tool et dev server
- **Vanilla JavaScript** - Pas de framework, code léger et performant
- **HTML5 Canvas** - Pour la visualisation graphique
- **CSS3** - Styling moderne et responsive
- **LocalStorage API** - Persistance des données

## Structure du projet

```
pente-garage/
├── index.html          # Page HTML principale
├── src/
│   ├── main.js        # Logique de l'application
│   └── style.css      # Styles CSS
├── public/
│   └── vite.svg       # Logo Vite
└── package.json       # Dépendances et scripts
```

## Licence

Voir le fichier [LICENSE](LICENSE) pour plus de détails.
# Factory Voice Assistant - Frontend

Application web Next.js pour un assistant vocal intelligent destiné aux opérateurs d'usine. Cette interface permet aux utilisateurs d'interagir avec un système d'IA via la voix ou le texte pour obtenir des réponses et des visualisations de données en temps réel.

## 🚀 Fonctionnalités

- **Reconnaissance vocale** : Enregistrement audio via le microphone du navigateur
- **Reconnaissance vocale (STT)** : Transcription automatique de la parole en texte
- **Synthese vocale (TTS)** : Réponses audio générées par l'IA
- **Interface conversationnelle** : Interaction naturelle avec l'IA pour poser des questions
- **Visualisations interactives** : Graphiques Plotly dynamiques pour représenter les données
- **Interface responsive** : Design adaptatif pour tous les écrans (mobile, tablette, desktop)
- **Saisie texte alternative** : Possibilité de saisir des questions manuellement
- **Statut du backend** : Indicateur de connexion en temps réel

## 🛠️ Technologies

- **Framework** : Next.js 16
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4
- **UI Components** : Radix UI
- **Visualisation** : Plotly.js
- **Icons** : Lucide React
- **Build** : Docker (multi-stage)

## 📋 Prérequis

- Node.js 20 ou supérieur
- npm ou pnpm
- Backend API accessible (voir configuration)

## 🔧 Installation

### Installation locale

1. Clonez le repository :
```bash
git clone <repository-url>
cd voice_factory_frontend
```

2. Installez les dépendances :
```bash
npm install
# ou
pnpm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env.local` à la racine du projet :
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

4. Lancez le serveur de développement :
```bash
npm run dev
# ou
pnpm dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Variables d'environnement

- `NEXT_PUBLIC_BACKEND_URL` : URL du backend API (défaut: `http://localhost:8000`)

### Structure de l'interface

L'interface est divisée en deux panneaux :
- **Panneau gauche (1/3)** : Operator Message
  - Bouton microphone pour l'enregistrement vocal
  - Champ de saisie texte alternatif
  - Affichage de la question reconnue
  - Statut de l'enregistrement

- **Panneau droit (2/3)** : AI Response
  - Réponse textuelle de l'IA
  - Lecteur audio pour la réponse vocale
  - Visualisations Plotly interactives

## 📜 Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run start` : Lance le serveur de production
- `npm run lint` : Exécute le linter ESLint

## 🐳 Déploiement avec Docker

### Build de l'image

```bash
docker build -t voice-factory-frontend .
```

### Exécution du conteneur

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_BACKEND_URL=http://your-backend-url:8000 \
  voice-factory-frontend
```

## 🏗️ Structure du projet

```
voice_factory_frontend/
├── app/
│   ├── globals.css          # Styles globaux
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Page principale de l'application
├── components/
│   └── ui/                  # Composants UI réutilisables (Radix UI)
├── hooks/                   # Hooks React personnalisés
├── lib/
│   └── utils.ts             # Utilitaires
├── public/                  # Assets statiques
├── styles/                  # Fichiers de style
├── Dockerfile               # Configuration Docker
├── next.config.mjs          # Configuration Next.js
├── package.json             # Dépendances et scripts
└── tsconfig.json            # Configuration TypeScript
```

## 🎨 Fonctionnalités de l'interface

### Nettoyage du texte

L'application nettoie automatiquement le texte reçu du backend :
- Suppression des préfixes `SPEAKER_XX:`
- Suppression des timestamps `[00:00:00]` ou `(00:00:00)`
- Normalisation des espaces

### Responsive Design

L'interface s'adapte automatiquement à différentes tailles d'écran :
- **Mobile** : Layout en colonne unique
- **Tablette/Desktop** : Layout en deux colonnes (1/3 - 2/3)
- **Grands écrans** : Éléments agrandis pour une meilleure lisibilité

### Gestion des erreurs

- Affichage des erreurs dans une carte dédiée
- Indicateur de statut du backend (Connected/Disconnected)
- Messages d'erreur clairs pour l'utilisateur

## 🔌 API Backend

L'application communique avec le backend via les endpoints suivants :

- `GET /health` : Vérification de l'état du backend
- `POST /v1/voice-factory/stt` : Transcription audio (Speech-to-Text)
- `POST /v1/voice-factory/answer` : Génération de réponse à partir du texte

### Format des requêtes

**STT (Speech-to-Text)** :
```javascript
FormData {
  transcript_level: "turn",
  audio: File
}
```

**Answer** :
```json
{
  "text": "question text",
  "include_audio": true
}
```

### Format des réponses

```json
{
  "question_text": "What is the temperature evolution?",
  "answer_text": "The temperature has shown...",
  "visualization": {
    "type": "plotly",
    "figure": { ... }
  },
  "audio": {
    "mime_type": "audio/wav",
    "audio_base64": "..."
  }
}
```

## 🐛 Dépannage

### Problèmes de microphone

- Vérifiez que les permissions du navigateur sont accordées
- Utilisez HTTPS en production (requis pour l'API MediaRecorder)
- Testez dans différents navigateurs (Chrome, Firefox, Edge)

### Problèmes de connexion backend

- Vérifiez que `NEXT_PUBLIC_BACKEND_URL` est correctement configuré
- Vérifiez que le backend est accessible et répond sur `/health`
- Consultez la console du navigateur pour les erreurs CORS

### Problèmes de build

- Assurez-vous d'utiliser Node.js 20+
- Supprimez `node_modules` et `package-lock.json`, puis réinstallez
- Vérifiez que toutes les dépendances sont installées

## 📝 Notes de développement

- Le projet utilise TypeScript strict
- Les erreurs de build TypeScript sont ignorées dans `next.config.mjs` (à ajuster en production)
- L'application utilise le mode standalone de Next.js pour Docker
- Les visualisations Plotly sont chargées dynamiquement (pas de SSR)

## 📄 Licence

[À compléter selon votre licence]

## 👥 Contribution

[À compléter selon vos guidelines de contribution]

## 📞 Support

Pour toute question ou problème, veuillez ouvrir une issue sur le repository.


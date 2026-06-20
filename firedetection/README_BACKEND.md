# 🔥 FireGuard Forest — Backend Django

API REST pour la détection d'incendie de forêt avec EfficientNet-B1.

---

## 📁 Structure du projet

```
fireguard/
├── backend/                    ← Configuration Django
│   ├── settings.py             ← Paramètres (CORS, modèle, DB...)
│   ├── urls.py                 ← URLs principales
│   └── wsgi.py
├── predictions/                ← App Django principale
│   ├── ml/
│   │   └── model_loader.py     ← ⭐ Chargement et inférence PyTorch
│   ├── models.py               ← Modèle Prediction (base de données)
│   ├── serializers.py          ← Sérialiseurs DRF
│   ├── views.py                ← Vues API (predict, history, stats)
│   ├── urls.py                 ← URLs de l'app
│   ├── apps.py                 ← Chargement du modèle au démarrage
│   └── admin.py                ← Interface admin Django
├── ml_models/                  ← ⭐ PLACEZ VOTRE .pth ICI
│   └── efficientnet_b1_deepfire.pth
├── media/                      ← Images uploadées (créé automatiquement)
├── manage.py
├── requirements.txt
└── .env.example
```

---

## 🚀 Installation et démarrage

### 1. Récupérer le fichier modèle

Téléchargez `efficientnet_b1_deepfire.pth` depuis votre Google Drive
et placez-le dans le dossier `ml_models/` :

```bash
mkdir -p ml_models
# Copiez le fichier .pth ici
```

### 2. Créer un environnement virtuel Python

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate
```

### 3. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 4. Configurer l'environnement

```bash
cp .env.example .env
# Editez .env si nécessaire
```

### 5. Préparer la base de données

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # (optionnel — pour l'interface admin)
```

### 6. Lancer le serveur

```bash
python manage.py runserver
```

Le serveur démarre sur **http://localhost:8000**

---

## 🔌 API Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| `GET`  | `/api/health/`         | Statut de l'API et du modèle |
| `POST` | `/api/predict/`        | Analyser une image |
| `GET`  | `/api/history/`        | Historique des analyses |
| `GET`  | `/api/history/<id>/`   | Détail d'une analyse |
| `DELETE` | `/api/history/<id>/` | Supprimer une analyse |
| `GET`  | `/api/stats/`          | Statistiques pour le dashboard |
| `GET`  | `/admin/`              | Interface d'administration |

---

## 🧪 Tester l'API

### Vérifier la santé
```bash
curl http://localhost:8000/api/health/
```

### Analyser une image
```bash
curl -X POST http://localhost:8000/api/predict/ \
  -F "image=@photo_foret.jpg" \
  -F "wilaya=05" \
  -F "location_note=Forêt de Batna"
```

### Réponse JSON exemple
```json
{
  "id": 1,
  "image_url": "http://localhost:8000/media/predictions/2024/01/01/photo.jpg",
  "label": "fire",
  "label_fr": "Incendie détecté",
  "confidence": 0.9916,
  "confidence_percent": 99.2,
  "prob_fire": 0.9916,
  "prob_nofire": 0.0084,
  "threshold": 0.5653,
  "alert": true,
  "wilaya": "05",
  "wilaya_name": "Batna",
  "location_note": "Forêt de Batna",
  "created_at": "2024-01-01T10:30:00Z"
}
```

---

## ⚙️ Paramètres du modèle

Extraits directement du notebook d'entraînement :

| Paramètre | Valeur |
|-----------|--------|
| Architecture | EfficientNet-B1 |
| Taille d'entrée | 240×240 px |
| Normalisation | ImageNet (mean/std) |
| Seuil optimal | 0.5653 (Youden) |
| Accuracy (test) | 100% |
| Framework | PyTorch 2.x |

---

## 📝 Notes importantes

- Le modèle se charge **une seule fois** au démarrage du serveur (Singleton)
- Les images uploadées sont stockées dans `media/predictions/YYYY/MM/DD/`
- La base de données SQLite est suffisante pour le développement
- Pour la production, utilisez PostgreSQL et un vrai serveur web (Gunicorn + Nginx)

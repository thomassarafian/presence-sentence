# 🚀 Installation et Configuration Sécurisée

## 📦 1. Installer les Dépendances

```bash
cd server
npm install hpp
```

## 🔧 2. Configuration des Variables d'Environnement

```bash
# Copier le fichier exemple
cp .env.example .env

# Éditer le fichier .env avec vos vraies valeurs
nano .env
```

### Variables OBLIGATOIRES :
- `NODE_ENV` : `development` ou `production`
- `PORT` : Port du serveur (ex: 4000)
- `MONGO_URI` : URI de connexion MongoDB

### Variables RECOMMANDÉES :
- `ALLOWED_ORIGINS` : Domaines autorisés (séparés par virgules)
- `API_URL` : URL de votre API pour CSP

## ⚡ 3. Démarrer le Serveur

```bash
# Développement
npm run dev

# Production
npm start
```

## ✅ 4. Vérifier la Sécurité

### A. Vérifier les Headers de Sécurité

```bash
curl -I http://localhost:4000/health
```

Vous devriez voir :
- ✅ `Content-Security-Policy`
- ✅ `Strict-Transport-Security`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: no-referrer`

### B. Tester Rate Limiting

```bash
# Envoyer 150 requêtes rapidement
for i in {1..150}; do curl http://localhost:4000/api/quotes; done
```

Après 100 requêtes, vous devriez recevoir :
```json
{
  "success": false,
  "message": "Trop de requêtes, réessayez dans 15 minutes"
}
```

### C. Tester MongoDB Sanitization

```bash
# Tentative d'injection NoSQL
curl -X GET 'http://localhost:4000/api/quotes?author[$ne]=null'
```

Les opérateurs `$ne` devraient être **supprimés automatiquement**.

### D. Tester XSS Protection

```bash
# Tentative d'injection de script
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"text":"<script>alert(1)</script>","author":"Hacker"}'
```

Le script devrait être :
1. ✅ **Échappé** par express-validator
2. ✅ **Bloqué** par CSP si affiché dans le navigateur

## 🔍 5. Audit de Sécurité

```bash
# Vérifier les vulnérabilités dans les dépendances
npm audit

# Corriger automatiquement (si possible)
npm audit fix

# Forcer les corrections (peut casser des choses)
npm audit fix --force
```

## 🧪 6. Tester Avec des Outils Professionnels

### A. Tester les Headers (en ligne)
1. Déployer en production
2. Aller sur : https://securityheaders.com/
3. Entrer votre URL
4. Viser un score **A** ou **A+**

### B. Tester CSP (en ligne)
1. Aller sur : https://csp-evaluator.withgoogle.com/
2. Copier-coller votre CSP
3. Vérifier qu'il n'y a **aucune erreur**

### C. Scan de Vulnérabilités
```bash
# Installer OWASP ZAP ou Burp Suite
# Faire un scan de votre API
```

## 📚 7. Checklist de Production

Avant de déployer en production, vérifiez :

- [ ] `.env` contient les vraies valeurs (pas `.env.example`)
- [ ] `.env` est dans `.gitignore` (JAMAIS commité !)
- [ ] `NODE_ENV=production`
- [ ] `ALLOWED_ORIGINS` contient vos vrais domaines
- [ ] MongoDB a un mot de passe FORT
- [ ] HTTPS est activé (certificat SSL)
- [ ] `npm audit` ne montre aucune vulnérabilité critique
- [ ] Les logs sont configurés
- [ ] Tester tous les endpoints avec Postman/Insomnia

## 🆘 Troubleshooting

### Erreur : "Variables d'environnement manquantes"
→ Créer le fichier `.env` avec les variables requises

### Erreur : "Rate limit exceeded"
→ Normal si vous faites trop de requêtes. Attendez 15 minutes ou redémarrez le serveur en dev.

### Erreur : CSP bloque des ressources
→ Vérifier la console du navigateur
→ Ajouter le domaine dans `connectSrc`, `scriptSrc`, etc. dans `config/security.js`

### Le client ne peut pas se connecter
→ Vérifier que le domaine du client est dans `ALLOWED_ORIGINS`
→ Vérifier que CORS est bien configuré

## 📖 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

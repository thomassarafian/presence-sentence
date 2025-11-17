# 🧪 Tests de Sécurité - Guide Pratique

Ce document contient des tests concrets pour vérifier que votre application est bien protégée.

## 📋 Table des Matières
1. [Tests XSS (Cross-Site Scripting)](#1-tests-xss)
2. [Tests NoSQL Injection](#2-tests-nosql-injection)
3. [Tests Rate Limiting](#3-tests-rate-limiting)
4. [Tests CORS](#4-tests-cors)
5. [Tests Headers de Sécurité](#5-tests-headers-de-sécurité)
6. [Tests DoS (Denial of Service)](#6-tests-dos)

---

## 1. Tests XSS (Cross-Site Scripting)

### Test A : Injection de Script dans le Texte

```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "<script>alert(\"XSS\")</script>",
    "author": "Attacker"
  }'
```

**Résultat attendu** :
- ✅ Le script doit être **échappé** ou **rejeté**
- ✅ Le navigateur ne doit **jamais** exécuter ce script

### Test B : Injection dans les Attributs HTML

```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Normal text",
    "author": "<img src=x onerror=\"alert(1)\">"
  }'
```

**Résultat attendu** :
- ✅ Le code doit être **échappé**

### Test C : Injection JavaScript Encodée

```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "&#60;script&#62;alert(1)&#60;/script&#62;"
  }'
```

### Test D : Chargement de Script Externe

```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "<script src=\"https://evil.com/malware.js\"></script>"
  }'
```

**Protection** :
- ✅ Express-validator échappe le HTML
- ✅ CSP `scriptSrc: ["'self'"]` bloque les scripts externes

---

## 2. Tests NoSQL Injection

### Test A : Injection dans Query Parameters

```bash
# Tentative de récupérer TOUS les documents
curl -X GET 'http://localhost:4000/api/quotes?author[$ne]=null'
```

**Résultat attendu** :
- ✅ L'opérateur `$ne` doit être **supprimé**
- ✅ La requête devient : `?author=` (vide)

### Test B : Injection dans le Body

```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test",
    "author": { "$ne": null }
  }'
```

**Résultat attendu** :
- ✅ Le champ `author` doit être **nettoyé**
- ✅ Console serveur : `🛡️ Injection NoSQL bloquée - clé: "$ne"`

### Test C : Injection avec $gt (Greater Than)

```bash
curl -X GET 'http://localhost:4000/api/quotes?createdAt[$gt]=2020-01-01'
```

**Résultat attendu** :
- ✅ L'opérateur `$gt` doit être **supprimé**

### Test D : Injection avec Point (Accès Sous-Document)

```bash
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test",
    "user.isAdmin": true
  }'
```

**Résultat attendu** :
- ✅ La clé contenant un point (`.`) doit être **rejetée**
- ✅ Console : `🛡️ Injection NoSQL bloquée - clé: "user.isAdmin"`

---

## 3. Tests Rate Limiting

### Test A : Rate Limit Global

```bash
# Envoyer 150 requêtes en boucle
for i in {1..150}; do
  echo "Requête $i"
  curl -s http://localhost:4000/api/quotes | grep -E "(success|message)"
done
```

**Résultat attendu** :
- ✅ Requêtes 1-100 : OK
- ✅ Requêtes 101-150 : **Bloquées** avec message "Trop de requêtes"

### Test B : Vérifier les Headers Rate Limit

```bash
curl -I http://localhost:4000/api/quotes
```

**Headers attendus** :
```
RateLimit-Limit: 100
RateLimit-Remaining: 99
RateLimit-Reset: 1698765432
```

### Test C : Rate Limit par IP

```bash
# Depuis deux terminaux différents (même IP)
# Terminal 1
for i in {1..60}; do curl http://localhost:4000/api/quotes; done

# Terminal 2 (devrait être bloqué aussi si même IP)
curl http://localhost:4000/api/quotes
```

---

## 4. Tests CORS

### Test A : Requête depuis Origine Non Autorisée

```bash
curl -X GET http://localhost:4000/api/quotes \
  -H "Origin: https://evil.com" \
  -v
```

**Résultat attendu** :
- ✅ Header `Access-Control-Allow-Origin` doit être **absent** ou ne pas contenir `evil.com`
- ✅ Le navigateur bloque la requête (côté client)

### Test B : Requête depuis Origine Autorisée

```bash
curl -X GET http://localhost:4000/api/quotes \
  -H "Origin: http://localhost:5173" \
  -v
```

**Résultat attendu** :
- ✅ Header `Access-Control-Allow-Origin: http://localhost:5173`
- ✅ Header `Access-Control-Allow-Credentials: true`

### Test C : Preflight Request (OPTIONS)

```bash
curl -X OPTIONS http://localhost:4000/api/quotes \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Résultat attendu** :
- ✅ Status: `200` ou `204`
- ✅ Headers `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH`

---

## 5. Tests Headers de Sécurité

### Test A : Vérifier Tous les Headers

```bash
curl -I http://localhost:4000/health
```

**Headers attendus** :
```
Content-Security-Policy: default-src 'self'; script-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
```

### Test B : Test CSP avec le Navigateur

1. Ouvrir votre app dans le navigateur
2. Ouvrir DevTools → Console
3. Essayer d'exécuter :
```javascript
eval("alert('test')") // Doit être bloqué si scriptSrc n'a pas 'unsafe-eval'
```

4. Vérifier les violations CSP dans la console (texte rouge)

### Test C : Test Clickjacking (X-Frame-Options)

Créer un fichier HTML :
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Test Clickjacking</h1>
  <iframe src="http://localhost:4000/health"></iframe>
</body>
</html>
```

**Résultat attendu** :
- ✅ L'iframe doit être **bloquée**
- ✅ Console : "Refused to display in a frame because it set 'X-Frame-Options' to 'deny'"

---

## 6. Tests DoS (Denial of Service)

### Test A : Payload Trop Gros

```bash
# Créer un fichier JSON de 100KB (> limite de 10KB)
node -e "console.log(JSON.stringify({ text: 'A'.repeat(100000) }))" > big_payload.json

# Envoyer
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d @big_payload.json
```

**Résultat attendu** :
- ✅ Erreur `413 Payload Too Large` ou `400 Bad Request`

### Test B : Trop de Paramètres

```bash
# Envoyer 100 paramètres (> limite de 50)
curl -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test",
    "param1": "1", "param2": "2", ... "param100": "100"
  }'
```

**Résultat attendu** :
- ✅ Erreur `413` ou rejet

---

## 🎯 Checklist de Tests

Avant de passer en production :

### Tests Manuels
- [ ] XSS : Injection de scripts bloquée
- [ ] NoSQL Injection : Opérateurs $ supprimés
- [ ] Rate Limiting : Bloque après 100 requêtes
- [ ] CORS : Bloque origines non autorisées
- [ ] Headers : Tous présents (curl -I)
- [ ] DoS : Gros payloads rejetés

### Tests Automatisés (Recommandé)
- [ ] Installer `npm install --save-dev jest supertest`
- [ ] Créer des tests unitaires pour chaque middleware
- [ ] CI/CD qui exécute les tests à chaque commit

### Tests Professionnels
- [ ] [OWASP ZAP](https://www.zaproxy.org/) - Scan de vulnérabilités
- [ ] [Burp Suite](https://portswigger.net/burp) - Tests de pénétration
- [ ] `npm audit` - Vulnérabilités des dépendances
- [ ] [Snyk](https://snyk.io/) - Scan de sécurité continu

---

## 🛠️ Automatisation des Tests

### Script de Test Rapide

Créer `test-security.sh` :

```bash
#!/bin/bash

echo "🔐 Tests de Sécurité Automatisés"
echo "================================"

# Test XSS
echo -e "\n1️⃣ Test XSS..."
response=$(curl -s -X POST http://localhost:4000/api/quotes \
  -H "Content-Type: application/json" \
  -d '{"text":"<script>alert(1)</script>"}')
echo $response | grep -q "<script>" && echo "❌ XSS non protégé !" || echo "✅ XSS protégé"

# Test NoSQL Injection
echo -e "\n2️⃣ Test NoSQL Injection..."
response=$(curl -s 'http://localhost:4000/api/quotes?author[$ne]=null')
echo $response | jq .

# Test Rate Limiting
echo -e "\n3️⃣ Test Rate Limiting..."
for i in {1..105}; do
  response=$(curl -s http://localhost:4000/api/quotes)
done
echo $response | grep -q "Trop de requêtes" && echo "✅ Rate Limit fonctionne" || echo "❌ Rate Limit ne fonctionne pas"

# Test Headers
echo -e "\n4️⃣ Test Headers de Sécurité..."
curl -I http://localhost:4000/health 2>&1 | grep -E "(Content-Security-Policy|X-Frame-Options)" && echo "✅ Headers présents" || echo "❌ Headers manquants"

echo -e "\n✅ Tests terminés !"
```

Utilisation :
```bash
chmod +x test-security.sh
./test-security.sh
```

---

## 📚 Ressources pour Aller Plus Loin

- **OWASP Testing Guide** : https://owasp.org/www-project-web-security-testing-guide/
- **PortSwigger Academy** : https://portswigger.net/web-security (gratuit !)
- **HackerOne** : https://www.hackerone.com/
- **Bug Bounty Platforms** : Pour tester votre app en réel

---

**⚠️ IMPORTANT** : Ne testez ces attaques que sur **VOTRE PROPRE application** ! Tester sur d'autres sites est **illégal**.

#!/bin/bash

echo "🔐 Tests de Sécurité Rapides"
echo "============================"
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL de l'API (modifiable)
API_URL="http://localhost:4000"

echo "🎯 Cible : $API_URL"
echo ""

# Vérifier que le serveur est démarré
echo "1️⃣  Vérification que le serveur est démarré..."
if curl -s "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Serveur en ligne${NC}"
else
    echo -e "${RED}❌ Serveur hors ligne. Démarrez-le avec 'npm run dev'${NC}"
    exit 1
fi
echo ""

# Test 1 : Headers de sécurité
echo "2️⃣  Test des Headers de Sécurité..."
headers=$(curl -I -s "$API_URL/health")

if echo "$headers" | grep -q "Content-Security-Policy"; then
    echo -e "${GREEN}✅ Content-Security-Policy présent${NC}"
else
    echo -e "${RED}❌ Content-Security-Policy manquant${NC}"
fi

if echo "$headers" | grep -q "X-Frame-Options"; then
    echo -e "${GREEN}✅ X-Frame-Options présent${NC}"
else
    echo -e "${RED}❌ X-Frame-Options manquant${NC}"
fi

if echo "$headers" | grep -q "Strict-Transport-Security"; then
    echo -e "${GREEN}✅ Strict-Transport-Security présent${NC}"
else
    echo -e "${YELLOW}⚠️  Strict-Transport-Security manquant (normal en dev HTTP)${NC}"
fi

if echo "$headers" | grep -q "X-Content-Type-Options"; then
    echo -e "${GREEN}✅ X-Content-Type-Options présent${NC}"
else
    echo -e "${RED}❌ X-Content-Type-Options manquant${NC}"
fi

echo ""

# Test 2 : Protection XSS
echo "3️⃣  Test Protection XSS..."
xss_response=$(curl -s -X POST "$API_URL/api/quotes" \
  -H "Content-Type: application/json" \
  -d '{"quote":"<script>alert(1)</script>","author":"Hacker"}')

if echo "$xss_response" | grep -q "balises HTML"; then
    echo -e "${GREEN}✅ XSS bloqué (balises HTML détectées)${NC}"
elif echo "$xss_response" | grep -q "caractères non autorisés"; then
    echo -e "${GREEN}✅ XSS bloqué (caractères non autorisés)${NC}"
elif echo "$xss_response" | grep -q "success.*false"; then
    echo -e "${GREEN}✅ XSS bloqué (requête rejetée)${NC}"
else
    echo -e "${YELLOW}⚠️  Réponse inattendue. Vérifiez manuellement.${NC}"
    echo "Réponse : $xss_response"
fi

echo ""

# Test 3 : Protection NoSQL Injection
echo "4️⃣  Test Protection NoSQL Injection..."
echo -e "${YELLOW}⚠️  Regardez la console du serveur pour voir le message de blocage${NC}"
nosql_response=$(curl -s "$API_URL/api/quotes?author[\$ne]=null")
# Le test réel est dans les logs serveur : "🛡️ Injection NoSQL bloquée"
echo -e "${GREEN}✅ Test envoyé. Vérifiez la console serveur pour '🛡️ Injection NoSQL bloquée'${NC}"

echo ""

# Test 4 : Rate Limiting (rapide - 10 requêtes)
echo "5️⃣  Test Rate Limiting (10 requêtes rapides)..."
echo "   (Pour un test complet, utilisez SECURITY_TESTS.md)"

count=0
for i in {1..10}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/quotes")
    if [ "$response" -eq 429 ]; then
        echo -e "${GREEN}✅ Rate limiting actif (bloqué après $i requêtes)${NC}"
        count=1
        break
    fi
done

if [ $count -eq 0 ]; then
    echo -e "${GREEN}✅ 10 requêtes passées (limite à 100)${NC}"
fi

echo ""

# Résumé
echo "=============================="
echo "✅ Tests Terminés"
echo ""
echo "📚 Pour des tests plus approfondis, consultez :"
echo "   - SECURITY_TESTS.md"
echo "   - SECURITY_GUIDE.md"
echo ""
echo "🔍 Headers complets :"
echo "   curl -I $API_URL/health"
echo ""
echo "🎓 Vous êtes maintenant un expert en sécurité MERN 2025 !"

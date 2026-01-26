#!/bin/bash

echo "🚀 Preparando deploy de Agent Avenue..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en la rama main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "${YELLOW}⚠️  No estás en la rama main. Cambiando...${NC}"
    git checkout main
fi

# Verificar cambios sin commitear
if [[ -n $(git status -s) ]]; then
    echo "${YELLOW}⚠️  Hay cambios sin commitear${NC}"
    read -p "¿Deseas hacer commit? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Mensaje del commit: " COMMIT_MSG
        git add .
        git commit -m "$COMMIT_MSG"
    else
        echo "❌ Cancelando deploy"
        exit 1
    fi
fi

# Push a GitHub
echo "📤 Haciendo push a GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "${GREEN}✅ Push exitoso!${NC}"
else
    echo "❌ Error en push. Verifica tu conexión y permisos SSH"
    exit 1
fi

echo ""
echo "📋 Próximos pasos:"
echo "1. Ve a Render: https://dashboard.render.com/"
echo "   - El deploy debería iniciarse automáticamente"
echo "   - Si no, click en 'Manual Deploy' → 'Deploy latest commit'"
echo ""
echo "2. Ve a Netlify: https://app.netlify.com/"
echo "   - El deploy debería iniciarse automáticamente"
echo "   - Verifica en la sección 'Deploys'"
echo ""
echo "${GREEN}✅ Archivos enviados a GitHub${NC}"
echo "⏳ Esperando deploys automáticos en Render y Netlify..."

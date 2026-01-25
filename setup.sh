#!/bin/bash

# 🎮 Script de Configuración Inicial de Agent Avenue
# Este script te guiará a través de la configuración inicial

echo "🎮 ====================================="
echo "   Agent Avenue - Setup Inicial"
echo "====================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "README.md" ]; then
    echo -e "${RED}❌ Error: Ejecuta este script desde el directorio raíz de Agent_Avenue${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Paso 1: Instalando dependencias del servidor...${NC}"
cd server
if npm install; then
    echo -e "${GREEN}✅ Dependencias del servidor instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias del servidor${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${BLUE}📦 Paso 2: Instalando dependencias del cliente...${NC}"
cd client
if npm install; then
    echo -e "${GREEN}✅ Dependencias del cliente instaladas${NC}"
else
    echo -e "${RED}❌ Error instalando dependencias del cliente${NC}"
    exit 1
fi
cd ..

echo ""
echo -e "${YELLOW}⚙️  Paso 3: Configuración de MongoDB${NC}"
echo ""
echo "Para continuar necesitas una cuenta de MongoDB Atlas (gratis):"
echo "1. Ve a: https://www.mongodb.com/cloud/atlas/register"
echo "2. Crea una cuenta"
echo "3. Crea un cluster gratuito (M0)"
echo "4. Configura un usuario de base de datos"
echo "5. Añade 0.0.0.0/0 a las IPs permitidas"
echo "6. Obtén tu connection string"
echo ""
read -p "¿Ya tienes tu MongoDB URI? (s/n): " has_mongodb

if [ "$has_mongodb" = "s" ] || [ "$has_mongodb" = "S" ]; then
    echo ""
    read -p "Pega tu MongoDB URI aquí: " mongodb_uri
    
    # Actualizar el archivo .env del servidor
    sed -i.bak "s|MONGODB_URI=.*|MONGODB_URI=$mongodb_uri|" server/.env
    echo -e "${GREEN}✅ MongoDB URI configurado${NC}"
else
    echo -e "${YELLOW}⚠️  Recuerda configurar tu MongoDB URI en server/.env antes de ejecutar${NC}"
fi

echo ""
echo -e "${GREEN}✅ ====================================="
echo "   Configuración Completada"
echo "=====================================${NC}"
echo ""
echo "🚀 Para ejecutar el proyecto:"
echo ""
echo "Terminal 1 (Backend):"
echo -e "${BLUE}  cd server && npm run dev${NC}"
echo ""
echo "Terminal 2 (Frontend):"
echo -e "${BLUE}  cd client && npm run dev${NC}"
echo ""
echo "Luego abre: ${GREEN}http://localhost:3000${NC}"
echo ""
echo "📚 Para más información, consulta:"
echo "  - QUICKSTART.md (guía rápida)"
echo "  - README.md (documentación completa)"
echo "  - PROJECT_SUMMARY.md (resumen del proyecto)"
echo ""
echo "🎮 ¡Disfruta jugando Agent Avenue!"

#!/bin/bash

# Script para aplicar regras do Firestore
# Execute: bash APLICAR_REGRAS_AGORA.sh

echo "🔐 Passo 1: Fazendo login no Firebase..."
firebase login

echo ""
echo "📋 Passo 2: Verificando projeto..."
firebase projects:list

echo ""
echo "🚀 Passo 3: Aplicando regras do Firestore..."
firebase deploy --only firestore:rules

echo ""
echo "✅ Pronto! As regras foram aplicadas."
echo "🔄 Agora recarregue o site (Ctrl+Shift+R ou Cmd+Shift+R)"


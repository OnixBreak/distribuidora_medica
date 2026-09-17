#!/data/data/com.termux/files/usr/bin/bash

echo "================================"
echo "      DISTRIBUIDORA MÉDICA"
echo "================================"
echo ""
echo "iniciando mariaDB..."
mysqld_safe &

sleep 3
echo "Iniciando NodeJS..."
node app.js

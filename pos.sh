#!/data/data/com.termux/files/usr/bin/bash

echo "================================"
echo "      DISTRIBUIDORA MÉDICA"
echo "================================"
echo ""
#Evitamos que android suspenda termux
termux-wake-lock

#comprobamos mariaDB
if pgrep mariadb > /dev/null; then
    echo "MariaDB ya está activo"

 else
    echo "iniciando mariaDB..."
    mysqld_safe &
    fi
echo "Esperando MariaDB..."
for i in {1..10}; do
    if mariadb-admin ping -u onix -psystem15 --silent 2>/dev/null; then
    echo "MariaDB Ejecutandose"
    break;

    fi

    sleep 1;
    done
    
echo "Iniciando NodeJS..."
node app.js

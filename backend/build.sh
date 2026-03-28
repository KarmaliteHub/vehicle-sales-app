#!/usr/bin/env bash
# exit on error
set -o errexit

# Instalar dependencias de Python
pip install -r requirements.txt

# Instalar dependencias de Node (para cloudinary)
npm install

# Recopilar archivos estáticos
python manage.py collectstatic --no-input

# Ejecutar migraciones
python manage.py migrate

# Poblar configuraciones iniciales
python manage.py populate_initial_configs
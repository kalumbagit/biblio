from django.contrib import admin
from .models import User

# Register your models here.
admin.site.register(User)  # Enregistrer le modèle User pour qu'il soit gérable via l'admin Django
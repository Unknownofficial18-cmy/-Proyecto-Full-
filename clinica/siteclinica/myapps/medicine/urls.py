from django.urls import path
from myapps.medicine.views import home

urlpatterns = [
    path('inicio/', home, name= 'home'),
]
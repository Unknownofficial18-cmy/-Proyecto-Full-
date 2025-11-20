from django.urls import path
from myapps.diagnosis.views import home

urlpatterns = [
    path('inicio/', home, name= 'home'),
]
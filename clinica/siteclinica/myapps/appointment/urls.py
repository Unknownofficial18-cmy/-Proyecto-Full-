from django.urls import path
from myapps.appointment.views import home

urlpatterns = [
    path('inicio/', home, name= 'home'),
]
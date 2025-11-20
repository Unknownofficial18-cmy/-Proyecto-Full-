from django.urls import path
from myapps.pay.views import home

urlpatterns = [
    path('inicio/', home, name= 'home'),
]
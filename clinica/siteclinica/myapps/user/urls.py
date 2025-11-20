from django.urls import path
from myapps.user.views import home

urlpatterns = [
    path('inicio/', home, name= 'home'),
]
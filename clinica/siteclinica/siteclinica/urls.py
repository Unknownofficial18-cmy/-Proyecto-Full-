"""
URL configuration for siteclinica project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    #path('user/', include('myapps.user.urls')),
    #path('appointment/', include('myapps.appointment.urls')),
    #path('diagnosis/', include('myapps.diagnosis.urls')),
    #path('medicine/', include('myapps.medicine.urls')),
    #path('pay/', include('myapps.pay.urls')),
    # Para ViewSet:
    path('api/', include('myapps.user.urls_viewset')),
    path('api/', include('myapps.appointment.urls_viewset')),
    path('api/', include('myapps.diagnosis.urls_viewset')),
    path('api/', include('myapps.medicine.urls_viewset')),
    path('api/', include('myapps.pay.urls_viewset')),

]


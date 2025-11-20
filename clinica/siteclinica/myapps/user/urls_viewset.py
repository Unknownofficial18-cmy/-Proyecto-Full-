from rest_framework.routers import DefaultRouter
from .views_viewset import SpecialtyViewSet, DoctorViewSet, PatientViewSet

router = DefaultRouter()
router.register(r'specialties', SpecialtyViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'patients', PatientViewSet)

urlpatterns = router.urls
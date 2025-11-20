from rest_framework.routers import DefaultRouter
from .views_viewset import DiagnosisViewSet, MedicalProcedureViewSet

router = DefaultRouter()
router.register(r'diagnoses', DiagnosisViewSet)
router.register(r'medicalprocedures', MedicalProcedureViewSet)

urlpatterns = router.urls
from rest_framework.routers import DefaultRouter
from .views_viewset import MedicineViewSet, PrescriptionViewSet, RecipeDetailViewSet

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'recipedetails', RecipeDetailViewSet)

urlpatterns = router.urls
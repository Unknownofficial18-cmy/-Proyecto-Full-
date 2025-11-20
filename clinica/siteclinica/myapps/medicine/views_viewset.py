from rest_framework import viewsets
from .models import Medicine, Prescription, RecipeDetail
from .serializers import MedicineSerializer, PrescriptionSerializer, RecipeDetailSerializer

class MedicineViewSet(viewsets.ModelViewSet):
    queryset = Medicine.objects.all()
    serializer_class = MedicineSerializer

class PrescriptionViewSet(viewsets.ModelViewSet):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    
    def get_queryset(self):
        return Prescription.objects.select_related(
            'appointment_id',
            'appointment_id__patient_id',
            'appointment_id__doctor_id'
        ).prefetch_related(
            'recipedetail_set',
            'recipedetail_set__medicine_id'
        ).all()

class RecipeDetailViewSet(viewsets.ModelViewSet):
    queryset = RecipeDetail.objects.all()
    serializer_class = RecipeDetailSerializer
    
    def update(self, request, *args, **kwargs):
        print("=== DATOS RECIBIDOS EN UPDATE ===")
        print("URL:", request.build_absolute_uri())
        print("Método:", request.method)
        print("Datos:", request.data)
        print("Headers:", dict(request.headers))
        
        try:
            response = super().update(request, *args, **kwargs)
            print("✅ Update exitoso")
            return response
        except Exception as e:
            print("❌ Error en update:", str(e))
            raise
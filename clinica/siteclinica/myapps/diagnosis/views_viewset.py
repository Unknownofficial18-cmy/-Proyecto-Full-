from rest_framework import viewsets
from .models import Diagnosis, MedicalProcedure
from .serializers import DiagnosisSerializer, MedicalProcedureSerializer

class DiagnosisViewSet(viewsets.ModelViewSet):
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer


class MedicalProcedureViewSet(viewsets.ModelViewSet):
    queryset = MedicalProcedure.objects.all()
    serializer_class = MedicalProcedureSerializer
    
    def get_queryset(self):
        queryset = MedicalProcedure.objects.all()
        appointment_id = self.request.query_params.get('appointment_id')
        
        if appointment_id:
            queryset = queryset.filter(appointment_id=appointment_id)
        
        return queryset
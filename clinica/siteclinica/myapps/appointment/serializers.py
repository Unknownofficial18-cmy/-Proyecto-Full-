from rest_framework import serializers
from myapps.appointment.models import Appointment

class AppointmentSerializer(serializers.ModelSerializer):
    # Campos extras que no están en el modelo
    patient = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = '__all__'  # Incluye todos los campos del modelo
        extra_fields = ['patient', 'doctor']  # Y estos extras
    
    def get_patient(self, obj):
        from myapps.user.serializers import PatientSerializer
        return PatientSerializer(obj.patient_id).data
    
    def get_doctor(self, obj):
        from myapps.user.serializers import DoctorSerializer
        return DoctorSerializer(obj.doctor_id).data
    
    def get_field_names(self, declared_fields, info):
        expanded_fields = super().get_field_names(declared_fields, info)
        return expanded_fields + getattr(self.Meta, 'extra_fields', [])
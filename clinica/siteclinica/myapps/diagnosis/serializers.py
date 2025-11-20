from rest_framework import serializers
from .models import Diagnosis, MedicalProcedure

class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'

class MedicalProcedureSerializer(serializers.ModelSerializer):
    # Campos extras que no están en el modelo - MISMO PATRÓN
    appointment = serializers.SerializerMethodField()
    patient = serializers.SerializerMethodField()
    doctor = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalProcedure
        fields = '__all__'  # Incluye todos los campos del modelo
        extra_fields = ['appointment', 'patient', 'doctor']  # Y estos extras
    
    def get_appointment(self, obj):
        from myapps.appointment.serializers import AppointmentSerializer
        return AppointmentSerializer(obj.appointment_id).data
    
    def get_patient(self, obj):
        # Accede al paciente a través de la cita
        from myapps.user.serializers import PatientSerializer
        return PatientSerializer(obj.appointment_id.patient_id).data
    
    def get_doctor(self, obj):
        # Accede al doctor a través de la cita
        from myapps.user.serializers import DoctorSerializer
        return DoctorSerializer(obj.appointment_id.doctor_id).data
    
    def get_field_names(self, declared_fields, info):
        expanded_fields = super().get_field_names(declared_fields, info)
        return expanded_fields + getattr(self.Meta, 'extra_fields', [])
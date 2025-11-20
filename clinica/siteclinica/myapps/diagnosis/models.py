from django.db import models
from myapps.appointment.models import Appointment
class Diagnosis(models.Model):
    description = models.TextField(help_text="Ingrese la Descripcion del Diagnostico Realizado")
    appointment_id = models.ForeignKey(Appointment, on_delete=models.CASCADE, help_text="Seleccione la Cita Asociada al Diagnostico")
    
    def __str__(self):
        return f"Diagnostico de {self.appointment_id.patient_id} - {self.appointment_id.appointment_date}"
    
    class Meta:
        verbose_name = "diagnostico"
        verbose_name_plural = "diagnosticos"



class MedicalProcedure(models.Model):
    description = models.TextField(help_text="Ingrese la Descripcion del Procedimiemto Realizado")
    appointment_id = models.ForeignKey(Appointment, on_delete=models.CASCADE, help_text="Seleccione la Cita Asociada al Diagnostico")
    
    def __str__(self):
        return f"Procedimiento: {self.description}"
    
    class Meta:
        verbose_name = "Procedimiento Medico"
        verbose_name_plural = "Procedimientos Medicos"
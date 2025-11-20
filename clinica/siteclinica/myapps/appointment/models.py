from django.db import models
from django.core.exceptions import ValidationError
from django.db.models import CASCADE
from myapps.user.models import Patient
from myapps.user.models import Doctor
from django.utils import timezone

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('PENDIENTE', 'Pendiente'),
        ('ATENDIDA', 'Atendida'),
        ('CANCELADA', 'Cancelada'),
        ('REPROGRAMADA', 'Reprogramada'),
        ('NO ASISTIO', 'No Asistio'),
    ]
    
    appointment_date = models.DateTimeField(help_text="Ingrese la Fecha y Hora de la Cita")
    reason = models.CharField(max_length=200, help_text="Ingrese el Motivo de la Cita")
    patient_id = models.ForeignKey(Patient, on_delete=CASCADE, help_text="Seleccione el Paciente")
    doctor_id = models.ForeignKey(Doctor, on_delete=CASCADE, help_text="Seleccione el Doctor")
    status = models.CharField(
        max_length=13, 
        choices=STATUS_CHOICES, 
        default='PENDIENTE',
        help_text="Seleccione el Estado de la Cita"
    )

    def clean(self):
        """Validación para evitar conflictos de horarios"""
        if self.patient_id and self.doctor_id and self.appointment_date:
            # Verificar conflicto para paciente
            patient_conflict = Appointment.objects.filter(
                patient_id=self.patient_id,
                appointment_date=self.appointment_date,
            ).exclude(pk=getattr(self, 'pk', None))
            
            if patient_conflict.exists():
                raise ValidationError(
                    {'appointment_date': 'El paciente ya tiene una cita programada en esta fecha y hora.'}
                )
            
            # Verificar conflicto para doctor
            doctor_conflict = Appointment.objects.filter(
                doctor_id=self.doctor_id,
                appointment_date=self.appointment_date,
            ).exclude(pk=getattr(self, 'pk', None))
            
            if doctor_conflict.exists():
                raise ValidationError(
                    {'appointment_date': 'El doctor ya tiene una cita programada en esta fecha y hora.'}
                )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Cita {self.patient_id} con {self.doctor_id} - {self.appointment_date}"

    class Meta:
        verbose_name = "cita"
        verbose_name_plural = "citas"
        constraints = [
            models.UniqueConstraint(
                fields=['patient_id', 'appointment_date'],
                name='unique_patient_appointment_time'
            ),
            models.UniqueConstraint(
                fields=['doctor_id', 'appointment_date'],
                name='unique_doctor_appointment_time'
            ),  
        ]
        ordering = ['-appointment_date']
from django.db import models
from django.core.validators import MinValueValidator
from myapps.appointment.models import Appointment
class Medicine(models.Model):
    name = models.CharField(max_length=100, help_text="Ingrese el nombre del medicamento")
    presentation = models.CharField(max_length=100, help_text="Ingrese la presentación")
    dose = models.CharField(max_length=50, help_text="Ingrese la dosis")
    
    def __str__(self):
        return f"{self.name} - {self.presentation} - {self.dose}"
    
    class Meta:
        verbose_name = "medicamento"
        verbose_name_plural = "medicamentos"



class Prescription(models.Model):
    prescription_date = models.DateField(auto_now_add= True, help_text="Fecha de prescripción")
    appointment_id = models.ForeignKey(Appointment, on_delete=models.CASCADE, help_text="Seleccione la cita")
    
    def __str__(self):
        return f"Receta #{self.id} - {self.appointment_id.patient_id} - {self.prescription_date}"
    
    class Meta:
        verbose_name = "receta"
        verbose_name_plural = "recetas"

class RecipeDetail(models.Model):
    amount = models.IntegerField(help_text="Ingrese la cantidad", validators=[MinValueValidator(1)])
    indications = models.TextField(help_text="Ingrese las indicaciones")
    prescription_id = models.ForeignKey(Prescription, on_delete=models.CASCADE, help_text="Seleccione la receta")
    medicine_id = models.ForeignKey(Medicine, on_delete=models.CASCADE, help_text="Seleccione el medicamento")
    
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.prescription_id} - {self.medicine_id} x{self.amount}"

    class Meta:
        verbose_name = "detalle de receta"
        verbose_name_plural = "detalles de receta"
        constraints = [
            models.UniqueConstraint(
                fields=['prescription_id', 'medicine_id'],
                name='unique_prescription_medicine'
            )
        ]
from django.db import models
from myapps.appointment.models import Appointment

class Payment(models.Model):
    METODO_PAGO = [
        ('EFECTIVO', 'Efectivo'),
        ('TARJETA', 'Tarjeta'),
        ('TRANSFERENCIA_BANCARIA', 'Transferencia Bancaria'),
    ]
    
    ESTADO_PAGO = [
        ('PENDIENTE', 'Pendiente'),
        ('RECIBIDO', 'Recibido'),
        ('CANCELADO', 'Cancelado'),
        ('REEMBOLSADO', 'Reembolsado'),
    ]
    
    payment_method = models.CharField(
        max_length=25, 
        choices=METODO_PAGO, 
        default='EFECTIVO',
        help_text="Seleccione el Método de Pago"
    )
    
    payment_date = models.DateField(auto_now_add=True, help_text="Fecha de pago")
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Ingrese el monto")
    appointment_id = models.ForeignKey(Appointment, on_delete=models.CASCADE, help_text="Seleccione la cita")
    
    payment_status = models.CharField(
        max_length=12, 
        choices=ESTADO_PAGO, 
        default='PENDIENTE',  
        help_text="Seleccione el Estado del Pago"
    )
    
    def __str__(self):
        return f"Pago ${self.amount} - {self.appointment_id.patient_id} - {self.payment_date}"
    
    class Meta:
        verbose_name = "pago"
        verbose_name_plural = "pagos"
        ordering = ['-payment_date']  



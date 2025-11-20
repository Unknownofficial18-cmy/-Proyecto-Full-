from django.contrib import admin
from myapps.appointment.models import Appointment

class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment_date', 'patient_info', 'doctor_info', 'status')
    list_filter = ('status', 'appointment_date', 'doctor_id')
    search_fields = ('patient_id__name', 'patient_id__last_name', 'doctor_id__name', 'reason')
    list_editable = ('status',)  # ← Permitir editar el estado directamente
    list_per_page = 20  # ← Paginación
    ordering = ('-appointment_date',)  #mas recientes primero
    date_hierarchy = 'appointment_date'  #← Navegación por fechas
    
    fieldsets = (
        ('Información de la Cita', {
            'fields': ('patient_id', 'doctor_id', 'status')
        }),
        ('Detalles', {
            'fields': ('appointment_date', 'reason'),
            'classes': ('collapse',)  # ← Del ejemplo del profe
        }),
    )

    # Métodos para mostrar información relacionada
    def patient_info(self, obj):
        return f"{obj.patient_id.name} {obj.patient_id.last_name}"
    patient_info.short_description = 'Paciente'

    def doctor_info(self, obj):
        return f"Dr. {obj.doctor_id.name} {obj.doctor_id.last_name}"
    doctor_info.short_description = 'Doctor'

  
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('patient_id', 'doctor_id')

admin.site.register(Appointment, AppointmentAdmin)
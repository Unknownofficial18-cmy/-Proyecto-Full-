from django.contrib import admin
from myapps.diagnosis.models import Diagnosis, MedicalProcedure

class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment_info', 'short_description', 'created_date')
    list_filter = ('appointment_id__doctor_id', 'appointment_id__appointment_date')
    search_fields = ('description', 'appointment_id__patient_id__name')
    ordering = ('-appointment_id__appointment_date',)  

    
    fieldsets = (
        ('Información del Diagnóstico', {
            'fields': ('appointment_id', 'description')
        }),
    )

    def appointment_info(self, obj):
        return f"Cita #{obj.appointment_id.id} - {obj.appointment_id.patient_id}"
    appointment_info.short_description = 'Cita'

    def short_description(self, obj):
        return obj.description[:100] + "..." if len(obj.description) > 100 else obj.description
    short_description.short_description = 'Diagnóstico'

    def created_date(self, obj):
        return obj.appointment_id.appointment_date
    created_date.short_description = 'Fecha Cita'

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('appointment_id__patient_id', 'appointment_id__doctor_id')

admin.site.register(Diagnosis, DiagnosisAdmin)

class MedicalProcedureAdmin(admin.ModelAdmin):
    list_display = ('id', 'appointment_info', 'short_description')
    list_filter = ('appointment_id__doctor_id',)
    search_fields = ('description', 'appointment_id__patient_id__name')
    ordering = ('-appointment_id__appointment_date',)

    
    fieldsets = (
        ('Información del Procedimiento', {
            'fields': ('appointment_id', 'description')
        }),
    )

    def appointment_info(self, obj):
        return f"Cita #{obj.appointment_id.id} - {obj.appointment_id.patient_id}"
    appointment_info.short_description = 'Cita'

    def short_description(self, obj):
        return obj.description[:100] + "..." if len(obj.description) > 100 else obj.description
    short_description.short_description = 'Procedimiento'

    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('appointment_id__patient_id', 'appointment_id__doctor_id')

admin.site.register(MedicalProcedure, MedicalProcedureAdmin)

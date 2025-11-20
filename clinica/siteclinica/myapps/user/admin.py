from django.contrib import admin
from myapps.user.models import Specialty, Doctor, Patient

class SpecialtyAdmin(admin.ModelAdmin):
    list_display = ('id', 'specialtyname', 'doctors_count')
    search_fields = ('specialtyname',)
    ordering = ('specialtyname',)
    
    def doctors_count(self, obj):
        count = obj.doctor_set.count()
        return f"{count} doctores"
    doctors_count.short_description = 'Total Doctores'

admin.site.register(Specialty, SpecialtyAdmin)


class DoctorAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'last_name', 'specialty_id', 'telephone', 'email', 'appointments_count')
    list_filter = ('specialty_id', 'gender')
    search_fields = ('name', 'last_name', 'specialty_id__specialtyname')
    list_per_page = 20

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editando un doctor existente
            return ('email',)  # Email no editable una vez creado
        return ()
    
    def appointments_count(self, obj):
        from myapps.appointment.models import Appointment  # ← CORREGIDO
        return Appointment.objects.filter(doctor_id=obj).count()
    appointments_count.short_description = "Total Citas"

admin.site.register(Doctor, DoctorAdmin)


class PatientAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'last_name', 'type_document', 'documentnumber', 'telephone', 'total_citas')
    list_filter = ('type_document', 'gender')
    search_fields = ('name', 'last_name', 'documentnumber', 'telephone')
    ordering = ('name', 'last_name')
    
    fieldsets = (
        ('Información Personal', {
            'fields': (('name', 'last_name'), 'birth_date', 'gender')
        }),
        ('Contacto', {
            'fields': ('address', 'telephone')
        }),
        ('Documentación', {
            'fields': ('type_document', 'documentnumber'),
            'classes': ('collapse',)
        }),
    )

    def total_citas(self, obj):
        from myapps.appointment.models import Appointment  # ← TAMBIÉN CORREGIR AQUÍ
        return Appointment.objects.filter(patient_id=obj).count()
    total_citas.short_description = 'Total Citas'

admin.site.register(Patient, PatientAdmin)
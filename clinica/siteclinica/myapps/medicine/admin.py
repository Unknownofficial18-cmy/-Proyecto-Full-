from django.contrib import admin
from myapps.medicine.models import Medicine, Prescription, RecipeDetail

class RecipeDetailInline(admin.TabularInline):  
    model = RecipeDetail
    extra = 1  # ← Mostrar 1 formulario vacío
    fields = ('medicine_id', 'amount', 'indications')

class MedicineAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'presentation', 'dose', 'usage_count')
    search_fields = ('name', 'presentation')
    ordering = ('name',) 
    
    def usage_count(self, obj):
        return obj.recipedetail_set.count()
    usage_count.short_description = 'Veces Recetado'

admin.site.register(Medicine, MedicineAdmin)


class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'prescription_date', 'patient_info', 'doctor_info', 'medicines_count')
    list_filter = ('prescription_date', 'appointment_id__doctor_id') 
    search_fields = ('appointment_id__patient_id__name', 'appointment_id__doctor_id__name')
    ordering = ('-prescription_date',)  #mas recientes primero
    date_hierarchy = 'prescription_date' #← Navegación por fechas
    
    
    inlines = (RecipeDetailInline,)

    fieldsets = (  
        ('Información de la Receta', {
            'fields': ('appointment_id', 'prescription_date')
        }),
    )

    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'appointment_id__patient_id', 
            'appointment_id__doctor_id'
        )

    def patient_info(self, obj):
        return f"{obj.appointment_id.patient_id.name} {obj.appointment_id.patient_id.last_name}"
    patient_info.short_description = 'Paciente'
    patient_info.admin_order_field = 'appointment_id__patient_id__name'

    def doctor_info(self, obj):
        return f"Dr. {obj.appointment_id.doctor_id.name}"
    doctor_info.short_description = 'Doctor'

    def medicines_count(self, obj):
        return obj.recipedetail_set.count()
    medicines_count.short_description = 'Total Medicamentos'

admin.site.register(Prescription, PrescriptionAdmin)


class RecipeDetailAdmin(admin.ModelAdmin):
    list_display = ('id', 'prescription_info', 'medicine_info', 'amount', 'short_indications')
    list_filter = ('prescription_id__prescription_date', 'medicine_id')
    search_fields = ('medicine_id__name', 'prescription_id__appointment_id__patient_id__name')
    
    def prescription_info(self, obj):
        return f"Receta #{obj.prescription_id.id}"
    prescription_info.short_description = 'Receta'

    def medicine_info(self, obj):
        return f"{obj.medicine_id.name} - {obj.medicine_id.presentation}"
    medicine_info.short_description = 'Medicamento'

    def short_indications(self, obj):
        return obj.indications[:50] + "..." if obj.indications and len(obj.indications) > 50 else obj.indications
    short_indications.short_description = 'Indicaciones'

admin.site.register(RecipeDetail, RecipeDetailAdmin)
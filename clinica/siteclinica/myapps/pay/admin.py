from django.contrib import admin
from myapps.pay.models import Payment

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'payment_date', 'amount', 'payment_method', 'payment_status', 'appointment_info')
    list_filter = ('payment_method', 'payment_status', 'payment_date')
    list_editable = ('payment_status',)
    ordering = ('-payment_date',)
    date_hierarchy = 'payment_date'
    search_fields = ('appointment_id__patient_id__name', 'appointment_id__patient_id__last_name')
    
    fieldsets = (
        ('Información del Pago', {
            'fields': ('appointment_id', 'payment_status')
        }),
        ('Detalles del Pago', {
            'fields': ('amount', 'payment_method'),
            'classes': ('collapse',)
        }),
    )

    readonly_fields = ('payment_date',)

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('appointment_id__patient_id')

    def appointment_info(self, obj):
        return f"Cita {obj.appointment_id.id} - {obj.appointment_id.patient_id}"
    appointment_info.short_description = 'Cita/Paciente'

admin.site.register(Payment, PaymentAdmin)


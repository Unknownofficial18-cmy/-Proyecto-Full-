from rest_framework import serializers
from .models import Medicine, Prescription, RecipeDetail
from myapps.appointment.serializers import AppointmentSerializer

class MedicineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicine
        fields = '__all__'

class RecipeDetailSerializer(serializers.ModelSerializer):
    medicine = MedicineSerializer(source='medicine_id', read_only=True)
    class Meta:
        model = RecipeDetail
        fields = '__all__'

class PrescriptionSerializer(serializers.ModelSerializer):
    appointment = AppointmentSerializer(source='appointment_id', read_only=True)
    recipe_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = '__all__'
    
    def get_recipe_details(self, obj):
        from .serializers import RecipeDetailSerializer
        details = obj.recipedetail_set.all()
        return RecipeDetailSerializer(details, many=True).data
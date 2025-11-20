from django.db import models
from django.core.validators import RegexValidator


class Specialty(models.Model):
    specialtyname = models.CharField(max_length=100, help_text="Ingrese el Nombre de la Especialidad")

    def __str__(self):
        return self.specialtyname

    class Meta:
        verbose_name = "especialidad"
        verbose_name_plural = "especialidades"


class Doctor(models.Model):
    STATUS_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Others'),
    ]
    STATUS_CHOICES2 = [
        ('ACTIVE', 'Activo'),
        ('INACTIVE', 'Inactivo'),
    ]
    name = models.CharField(max_length=100, help_text="Ingrese el Nombre del Doctor")
    last_name = models.CharField(max_length=100, help_text="Ingrese el Apellido del Doctor")
    gender = models.CharField(
        max_length=1, 
        choices=STATUS_CHOICES, 
        default='M',
        help_text="Ingrese el Genero del Doctor"
    )
    telephone = models.CharField(max_length=10, help_text="Ingrese el Telefono del Doctor") 
    email = models.EmailField(help_text="Ingrese el Correo del Doctor")
    specialty_id = models.ForeignKey(Specialty, on_delete=models.CASCADE, help_text="Seleccione la Especialidad del Doctor")
    status = models.CharField(
        max_length=8, 
        choices=STATUS_CHOICES2, 
        default='ACTIVE',
        help_text="Ingrese el Estado del Doctor"
    )
    def __str__(self):
        return f"{self.name} {self.last_name}"
    
    class Meta:
        verbose_name = "doctor"
        verbose_name_plural = "doctores"


class Patient(models.Model):
    STATUS_CHOICES = [
        ('M', 'Masculino'),
        ('F', 'Femenino'),
        ('O', 'Others'),
    ]
    TYPE_DOCUMENT = [
        ('R.C', 'Registro Civil'),
        ('T.I', 'Tarjeta de Identidad'),
        ('C.C', 'Cedula de Ciudadania'),
        ('C.E','Cedula de Extranjeria'),
        ('PAS', 'Pasaporte'),
    ]
    STATUS_CHOICES2 = [
        ('ACTIVE', 'Activo'),
        ('INACTIVE', 'Inactivo'),
    ]
    name = models.CharField(max_length=100, help_text="Ingrese el Nombre del Paciente")
    last_name = models.CharField(max_length=100, help_text="Ingrese el Apellido del Paciente")
    gender = models.CharField(
        max_length=1, 
        choices=STATUS_CHOICES, 
        default='M',
        help_text="Ingrese el Genero del Paciente"
    )
    type_document = models.CharField(
        max_length=3, 
        choices=TYPE_DOCUMENT, 
        default='R.C',
        help_text="Ingrese el Tipo de Documento del Paciente"
    )
    documentnumber = models.CharField(
        max_length=10,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message='El número de documento debe tener solo dígitos (10 numeros(sin puntos, letras o comas)).'
            )
        ],  
        help_text="Ingrese el # de Documento del Paciente"
    )        
    birth_date = models.DateField(help_text="Ingrese la Fecha de Nacimiento del Paciente")
    address = models.CharField(max_length=100, help_text="Ingrese la Direccion del Paciente")
    telephone = models.CharField(max_length=10, help_text="Ingrese el Telefono del Paciente")
    status = models.CharField(
        max_length=8, 
        choices=STATUS_CHOICES2, 
        default='ACTIVE',
        help_text="Ingrese el Estado del Paciente"
    )
    
    def __str__(self):
        return f"{self.name} {self.last_name}"
    
    def save(self, *args, **kwargs):
        # función que valida el numero de documento y elimina puntos o espacios antes de guardar
        self.documentnumber = self.documentnumber.replace('.', '').replace(',', '').strip()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "paciente"
        verbose_name_plural = "pacientes"
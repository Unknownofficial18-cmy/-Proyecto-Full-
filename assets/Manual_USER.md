
# 📘 MANUAL DE USUARIO – Clínica La Pámpara

## 1. Introducción
Este manual explica de manera simple y sencilla, sobre cómo utilizar el sistema de gestión clínica **Clínica La Pámpara**, incluyendo la navegación general, el uso de los módulos y la administración de los registros médicos.

---


## 2. Menú Principal

![Interfaz Principal](image.png)

Explicacion breve sobre cada módulo que se creo para el proyecto:

Este sistema cuenta con 10 módulos principales, cada uno encargado de gestionar una parte específica del funcionamiento de la clínica. A continuación, se presenta una explicación breve de cada módulo:

## 2.1 Pacientes

Permite registrar, consultar, editar y eliminar información de los pacientes atendidos en la clínica.

## 2.2 Doctores

Administra la información del personal médico, como nombre, especialidad y datos de contacto.

## 2.3 Especialidades

Gestiona las diferentes áreas médicas de la clínica y permite asignarlas a los doctores.

## 2.4 Citas

Permite agendar, modificar, eliminar y visualizar citas entre pacientes y doctores.

## 2.5 Diagnósticos

Registra el diagnóstico realizado a un paciente luego de una cita médica, incluyendo síntomas u observaciones.

## 2.6 Medicamentos

Administra el listado de medicamentos disponibles o utilizados en la clínica.

## 2.7 Recetas (Prescriptions)

Genera recetas médicas que relacionan a un doctor, un paciente y uno o varios medicamentos.

## 2.8 DetalleReceta

Este módulo funciona como una tabla intermedia (tabla pivote) entre Recetas y Medicamentos.
Permite seleccionar qué medicamentos pertenecen a una receta, la cantidad, la dosis, la frecuencia y la duración del tratamiento.

En otras palabras:

Una receta puede tener muchos medicamentos

Un medicamento puede aparecer en muchas recetas

DetalleReceta conecta ambos con más información (dosis, indicaciones, etc.)

## 2.9 Pagos

Registra los pagos realizados por los pacientes, incluyendo fecha, monto y método de pago.

## 3.0 Procedimientos Médicos

Administra procedimientos adicionales que no son citas médicas normales, como exámenes, curaciones o intervenciones menores.

---

## 3.1 CRUD de Cada Módulo

### 3.2 Gestión de Paciente

**Crear Paciente**
![Crear Paciente](UsuarioNuevo.png)
**Ver Listado de Pacientes**
![Lista de Pacientes](ListaPacientes.png)
**Editar Paciente**
![Editar Paciente](EditarPaciente.png)
![Lista Actualizada](ListaActualizada1.png)
**Eliminar Paciente**
![Paciente Eliminado](PacienteEliminado.png)
![Lista Actualizada](ListaActualizada2.png)

### 3.3 Gestion de Especialidades

**Crear Especialidad**
![Crear Especialidad](CrearEspecialidad.png)
**Ver Listado de Especialidades**
![Lista de Especialidades](ListaEspecialidades.png)
**Editar Especialidad**
![Especialidad Editada](EspecialidadEditada.png)
![Lista Actualizada](ListaActualizada3.png)
**Eliminar Especialidad**
![Eliminar Especialidad](EspecialidadEliminada.png)
![Lista Actualizada](ListaActualizada4.png)
### 3.4 Gestión de Doctores

**Crear Doctor**
![Crear Doctor](DoctorNuevo.png)
**Ver Listado de Doctores**
![Lista de Doctores](ListaDoctores.png)
**Editar Doctor**
![Editar Doctor](EditarDoctor.png)
![Lista Actualizada](ListaActualizada5.png)
**Eliminar Doctor**
![Eliminar Doctor](DoctorEliminado.png)
![Lista Actualizada](ListaActualizada6.png)
### 3.5 Gestión de Citas

**Crear Cita**
![Crear Cita](CitaCreada.png)
**Ver Listado de Citas**
![Lista de Citas](ListaCitas.png)
**Editar Cita**
![Editar Cita](EditarCita.png)
![Lista Actualizada](ListaActualizada7.png)

**Eliminar Cita**
![Eliminar Cita](CitaEliminada.png)
![Lista Actualizada](ListaActualizada8.png)

### 3.6 Gestion de Medicamentos

**Crear Medicamento**
![Crear Medicamento](CrearMedicamento.png)
**Ver Listado de Medicamentos**
![Lista de Medicamentos](ListaMedicamentos.png)
**Editar Medicamento**
![Editar Medicamento](EditarMedicamento.png)
![Lista Actualizada](ListaActualizada9.png)

**Eliminar Medicamento**
![Eliminar Medicamento](EliminarMedicamento.png)
![Lista Actualizada](ListaActualizada10.png)
### 3.7 Gestión de Diagnósticos

**Crear Diagnostico**
![Crear Diagnostico](CrearDiagnostico.png)
**Ver Listado de Diagnosticos**
![Lista de Diagnosticos](ListaDiagnosticos.png)
**Editar Diagnostico**
![Editar Diagnostico](EditarDiagnostico.png)
![Lista Actualizada](ListaActualizada11.png)

**Eliminar Diagnostico**
![Eliminar Diagnostico](EliminarDiagnostico.png)
![Lista Actualizada](ListaActualizada12.png)
### 3.8 Gestión de Procedimientos Medicos

**Crear Procedimiento**
![Crear Procedimiento](CrearProcedimiento.png)
**Ver Listado de Procedimientos**
![Lista de Procedimientos](ListaProcedimiento.png)
**Editar Procedimiento**
![Editar Procedimiento](EditarProcedimiento.png)
![Lista Actualizada](ListaActualizada13.png)

**Eliminar Procedimiento**
![Eliminar Procedimiento](EliminarProcedimiento.png)
![Lista Actualizada](ListaActualizada14.png)

### 3.9 Gestión de Recetas y el DetalleRecetas

**Crear Receta**
![Crear Receta](CrearReceta.png)
**Agregar un Medicamento a la Receta**
![Agregar Medicamento a la Receta](AgregarMedicamento.png)
**Ver Listado de Recetas**
![Lista de Recetas](ListaRecetas.png)
**Editar Receta y Medicamento**
![Editar Receta](EditarReceta.png)
![Editar Medicamento en Receta](EditarMedicamentoReceta.png)
![Lista Actualizada](ListaActualizada15.png)

**Eliminar Receta**
![Eliminar Receta](EliminarReceta.png)
![Lista Actualizada](ListaActualizada16.png)

### 4. Gestión de Pagos

**Crear Pago**
![Crear Pago](CrearPago.png)
**Ver Listado de Pagos**
![Lista de Pagos](ListaPagos.png)
**Editar Pago**
![Editar Pagos](EditarPago.png)
![Lista Actualizada](ListaActualizada17.png)

**Eliminar Pago**
![Eliminar Pago](EliminarPago.png)
![Lista Actualizada](ListaActualizada18.png)

---


## 5. Mensajes de Éxito y/o Error

- Alertas positivas 
![Crear un Paciente Nuevo](PacienteCreadoExitoso.png) 
- Alertas de validación
![Actualizar los Datos del Paciente](ActualizacionExitosaPaciente.png)

---
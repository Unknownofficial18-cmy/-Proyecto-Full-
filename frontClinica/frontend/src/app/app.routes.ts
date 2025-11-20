import { Routes } from '@angular/router';

// Specialties components with aliases
import { Getall as  SpecialtyGetall } from './components/specialty/getall/getall';
import { Create as SpecialtyCreate } from './components/specialty/create/create';
import { Update as SpecialtyUpdate } from './components/specialty/update/update';
import { Delete as SpecialtyDelete } from './components/specialty/delete/delete';

// Doctors components with aliases
import { Getall as DoctorGetall } from './components/doctor/getall/getall';
import { Create as DoctorCreate } from './components/doctor/create/create';
import { Update as DoctorUpdate } from './components/doctor/update/update';
import { Delete as DoctorDelete } from './components/doctor/delete/delete';

// Patients components with aliases
import { Getall as PatientGetall } from './components/patient/getall/getall';
import { Create as PatientCreate } from './components/patient/create/create';
import { Update as PatientUpdate } from './components/patient/update/update';
import { Delete as PatientDelete } from './components/patient/delete/delete';

// Appointments components with aliases
import { Getall as AppointmentGetAll} from './components/appointment/getall/getall';
import { Create as AppointmentCreate} from './components/appointment/create/create';
import { Update as AppointmentUpdate} from './components/appointment/update/update';
import { Delete as AppointmentDelete} from './components/appointment/delete/delete';

//Medicines components with aliases
import { Getall as MedicineGetall } from './components/medicine/getall/getall';
import { Create as MedicineCreate } from './components/medicine/create/create';
import { Update as  MedicineUpdate} from './components/medicine/update/update';
import { Delete as MedicineDelete} from './components/medicine/delete/delete';

//Prescriptions Components with aliases
import { Getall as PrescriptionGetall } from './components/prescription/getall/getall';
import { Create as PrescriptionCreate } from './components/prescription/create/create';
import { Update as  PrescriptionUpdate} from './components/prescription/update/update';
import { Delete as PrescriptionDelete} from './components/prescription/delete/delete';

//RecipeDetails Components with aliases
import { Getall as RecipeDetailsGetall } from './components/recipedetail/getall/getall';
import { Create as RecipeDetailsCreate } from './components/recipedetail/create/create';
import { Update as  RecipeDetailsUpdate} from './components/recipedetail/update/update';
import { Delete as RecipeDetailsDelete} from './components/recipedetail/delete/delete';

//Diagnosis Components with aliases
import { Getall as DiagnosisGetall } from './components/diagnosis/getall/getall';
import { Create as DiagnosisCreate } from './components/diagnosis/create/create';
import { Update as  DiagnosisUpdate} from './components/diagnosis/update/update';
import { Delete as DiagnosisDelete} from './components/diagnosis/delete/delete';

//MedicalProcedure Components with aliases
import { Getall as MedicalProcedureGetall } from './components/medicalprocedure/getall/getall';
import { Create as MedicalProcedureCreate } from './components/medicalprocedure/create/create';
import { Update as  MedicalProcedureUpdate} from './components/medicalprocedure/update/update';
import { Delete as MedicalProcedureDelete} from './components/medicalprocedure/delete/delete';

//Payment Components with aliases
import { Getall as PaymentGetall } from './components/payment/getall/getall';
import { Create as PaymentCreate } from './components/payment/create/create';
import { Update as  PaymentUpdate} from './components/payment/update/update';
import { Delete as PaymentDelete} from './components/payment/delete/delete';

export const routes: Routes = [
    { 
        path: '', 
        redirectTo: '/', 
        pathMatch: 'full' 
    },
    {
        path: "specialties",
        component: SpecialtyGetall
    },
    {
        path: "specialties/new",
        component: SpecialtyCreate
    },
    {
        path: "specialties/edit/:id",
        component: SpecialtyUpdate
    },
    {
        path: "specialties/delete/:id",
        component: SpecialtyDelete
    },
    {
        path: "doctors",
        component: DoctorGetall
    },
    {
        path: "doctors/new",
        component: DoctorCreate
    },
    {
        path: "doctors/edit/:id",
        component: DoctorUpdate
    },
    {
        path: "doctors/delete/:id",
        component: DoctorDelete
    },
	{
        path: "patients",
        component: PatientGetall
    },
    {
        path: "patients/new",
        component: PatientCreate
    },
    {
        path: "patients/edit/:id",
        component: PatientUpdate
    },
    {
        path: "appointments/schedule",        
        component: AppointmentCreate
    },
    {
        path: "appointments/my-appointments",  
        component: AppointmentGetAll
    },
    {
        path: "appointments/edit/:id",        
        component: AppointmentUpdate
    },
    {
        path: "appointments/delete/:id",        
        component: AppointmentDelete
    },
    {
        path: "medicines",
        component: MedicineGetall
    },
    {
        path: "medicines/new",
        component: MedicineCreate
    },
    {   
        path: "medicines/edit/:id",
        component: MedicineUpdate
    },
    {
        path: "medicines/delete/:id",
        component: MedicineDelete
    },
    {
        path: "prescriptions",
        component: PrescriptionGetall
    },
    {   
        path: "prescriptions/new",
        component: PrescriptionCreate
    },
    {
        path: "prescriptions/edit/:id",
        component: PrescriptionUpdate
    },
    {   
        path: "prescriptions/delete/:id",
        component: PrescriptionDelete
    },
    {
        path: "recipedetails",
        component: RecipeDetailsGetall
    },
    {
        path: "recipedetails/new/:prescriptionId",
        component: RecipeDetailsCreate
    },
    {
        path: "recipedetails/edit/:id",
        component: RecipeDetailsUpdate
    },
    {
        path: "recipedetails/delete/:id",
        component: RecipeDetailsDelete
    },
    {
        path: "diagnosis",
        component: DiagnosisGetall
    },
    {
        path: "diagnosis/new",
        component: DiagnosisCreate
    },
    {
        path: "diagnosis/edit/:id",
        component: DiagnosisUpdate
    },
    {
        path: "diagnosis/delete/:id",
        component: DiagnosisDelete
    },
    {
        path: "medicalprocedures",
        component: MedicalProcedureGetall
    },
    {
        path: "medicalprocedures/new",
        component: MedicalProcedureCreate
    },
    {
        path: "medicalprocedures/edit/:id",
        component: MedicalProcedureUpdate
    },
    {
        path: "medicalprocedures/delete/:id",
        component: MedicalProcedureDelete
    },
    {
        path: "payments",
        component: PaymentGetall
    },
    {
        path: "payments/new",
        component: PaymentCreate
    },
    {
        path: "payments/edit/:id",
        component: PaymentUpdate
    },
    {
        path: "payments/delete/:id",
        component: PaymentDelete
    }
];
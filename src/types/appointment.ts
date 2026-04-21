export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type AppointmentType = 'PATIENT_BOOKED' | 'RECEPTIONIST_BOOKED'

export interface AppointmentSummary {
    appointmentId: number
    appointmentDate: string
    appointmentTime: string
    appointmentStatus: AppointmentStatus
    doctorId: number
    medicalServiceName: string
    isPaid: boolean
    receptionistId: number | null
    walkInPatientName: string | null
}

export interface PrescriptionResponse {
    id: number
    description: string
}

export interface AppointmentResponse {
    id: number
    doctorId: number
    doctorName: string
    medicalServiceId: number
    medicalServiceName: string
    appointmentDate: string
    appointmentTime: string
    status: AppointmentStatus
    type: AppointmentType
    reason: string | null
    price: number
    durationMinutes: number
    isPaid: boolean
    paymentMethod: string | null
    bookedAt: string
    prescriptionResponseDto: PrescriptionResponse | null
    patientId: number | null
    patientName: string | null
    receptionistId: number | null
    receptionistName: string | null
    walkInPatientName: string | null
    walkInPatientPhone: string | null
}

export type DoctorAppointmentSummary = AppointmentSummary & {
    patientName?: string | null
    receptionistName?: string | null
}

export type DatePreset = 'ALL' | 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'CUSTOM'
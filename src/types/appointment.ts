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
    reason: string
    price: number
    durationMinutes: number
    isPaid: boolean
    paymentMethod: string
    bookedAt: string
    prescriptionResponseDto: PrescriptionResponse | null
    patientId: number | null
    patientName: string | null
    receptionistId: number | null
    receptionistName: string | null
    walkInPatientName: string | null
    walkInPatientPhone: string | null
}

export interface PublicDoctor {
    id: number
    firstName: string
    lastName: string
    specialization: { id: number; name: string }[]
    yearsOfExperience: number
    licenseNumber: string
    doctorStatus: string
}

export interface PublicSchedule {
    id: number
    doctorId: number
    doctorName: string
    dayOfWeek: string
    startTime: string
    endTime: string
}
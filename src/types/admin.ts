export interface Specialization {
    id: number
    name: string
}

export type DoctorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'

export interface Doctor {
    id: number
    firstName: string
    lastName: string
    specialization: Specialization[]
    yearsOfExperience: number
    licenseNumber: string
    doctorStatus: DoctorStatus
}

export type ReceptionistStatus = 'ACTIVE' | 'INACTIVE'

export interface Receptionist {
    id: number
    firstName: string
    lastName: string
    phoneNumber: string
    status: ReceptionistStatus
}

export interface MedicalService {
    id: number
    name: string
    price: number
    durationMinutes: number
    description: string
    isActive: boolean
    specializationId: number
    specializationName: string
}

export interface Specialization {
    id: number
    name: string
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

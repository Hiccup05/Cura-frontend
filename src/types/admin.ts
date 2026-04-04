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
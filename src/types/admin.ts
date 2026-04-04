export interface Specialization {
    id: number
    name: string
}

export type DoctorStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'PENDING'

export interface Doctor {
    id: number
    firstName: string
    lastName: string
    specialization: Specialization[]
    yearsOfExperience: number
    licenseNumber: string
    doctorStatus: DoctorStatus
}
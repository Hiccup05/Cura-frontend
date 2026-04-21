export interface Specialization {
    id: number
    name: string
    /** Minutes per appointment slot for all services in this specialization. */
    slotDuration?: number
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
    /** From specialization; drives slot grid when present. */
    slotDuration?: number
    description: string
    isActive: boolean
    specializationId: number
    specializationName: string
    photoUrl?: string | null
}

export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface Schedule {
    id: number
    doctorId: number
    doctorName: string
    dayOfWeek: DayOfWeek
    startTime: string
    endTime: string
    maxAppointments: number
    isAvailable: boolean
}

export interface Leave {
    id: number
    startDate: string
    endDate: string
    reason: string
    DoctorId: number
}

export interface AdminProfile {
    id: number
    username: string
    email: string
    profilePictureUrl?: string | null
}

export interface AdminStats {
    totalDoctors: number
    totalPatients: number
    totalAppointments: number
    pendingDoctorApprovals: number
    totalRevenue: number
}
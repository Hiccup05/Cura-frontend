export interface DoctorProfile {
    id: number
    firstName: string
    lastName: string
    licenseNumber: string
    yearsOfExperience: number
    doctorStatus: string
    specialization: { id: number; name: string }[]
    profilePictureUrl?: string | null
}

export interface DoctorSchedule {
    id: number
    doctorId: number
    doctorName: string
    dayOfWeek: string
    startTime: string
    endTime: string
    maxAppointments: number
    isAvailable: boolean
}

export interface PublicDoctor {
    id: number
    firstName: string
    lastName: string
    licenseNumber: string
    yearsOfExperience: number
    doctorStatus: string
    specialization: { id: number; name: string }[]
    profilePictureUrl?: string | null
}

export interface PublicSchedule {
    id: number
    doctorId: number
    doctorName: string
    dayOfWeek: string
    startTime: string
    endTime: string
}
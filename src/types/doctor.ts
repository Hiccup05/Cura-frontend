export interface DoctorProfile {
    id: number
    firstName: string
    lastName: string
    licenseNumber: string
    yearsOfExperience: number
    doctorStatus: string
    specialization: { id: number; name: string }[]
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
    id: number;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    yearsOfExperience: number;
    doctorStatus: string; // e.g., 'ACTIVE', 'INACTIVE'
    specialization: { id: number; name: string }[]; // array of specializations
}
export interface LoginRequest {
    username: string
    password: string
}

export interface AdminProfile {
    id: number
    username: string
    email: string
}

export interface AdminStats {
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    pendingDoctorApprovals: number;
    totalRevenue: number;
}
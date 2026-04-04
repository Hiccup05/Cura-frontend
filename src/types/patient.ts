export type Gender = 'MALE' | 'FEMALE';

export type BloodGroup = 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' |
    'O_POSITIVE' | 'O_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE'

export interface PatientProfile {
    id: number
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: Gender
    phoneNumber: string
    address: string
    bloodGroup: BloodGroup
    allergies: string
    chronicConditions: string
    emergencyContactName: string
    emergencyContactPhone: string
}

interface PatientResponseDto {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phoneNumber: string;
    address: string;
    bloodGroup: string;
    allergies: string;
    chronicConditions: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
}
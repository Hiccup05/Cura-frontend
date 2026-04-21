export type ReceptionistStatus = 'ACTIVE' | 'INACTIVE'

export interface ReceptionistProfile {
    id: number
    firstName: string
    lastName: string
    phoneNumber?: string
    status: ReceptionistStatus | string
    profilePictureUrl?: string | null
}

export interface UpdateReceptionistDto {
    firstName: string
    lastName: string
    phoneNumber?: string
}

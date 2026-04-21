import type { MedicalService } from '../types/admin';

/** Minutes per booking slot; backend sets this from the service's specialization. */
export function serviceSlotDurationMinutes(service: MedicalService): number {
    return service.slotDuration ?? service.durationMinutes;
}

import api from '../services/api';
import { MedicalService } from '../types/admin';

type MedicalServiceLike = MedicalService & {
    imageUrl?: string | null;
    servicePhotoUrl?: string | null;
    photoURL?: string | null;
    imageURL?: string | null;
    photoPath?: string | null;
    imagePath?: string | null;
    photo?: string | null;
    image?: string | null;
};

const toAbsoluteUrl = (rawUrl: string): string => {
    const value = rawUrl.trim();
    if (!value) return '';
    if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;

    const base = api.defaults.baseURL ?? '';
    if (!base) return value;

    // Convert API base to origin so static file paths are also resolvable.
    const backendOrigin = base.replace(/\/api\/v\d+\/?$/, '');
    return `${backendOrigin.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
};

const resolveServicePhotoUrl = (service: MedicalServiceLike): string | null => {
    const candidates = [
        service.photoUrl,
        service.imageUrl,
        service.servicePhotoUrl,
        service.photoURL,
        service.imageURL,
        service.photoPath,
        service.imagePath,
        service.photo,
        service.image,
    ];

    const selected = candidates.find(
        (candidate): candidate is string =>
            typeof candidate === 'string' && candidate.trim().length > 0
    );

    return selected ? toAbsoluteUrl(selected) : null;
};

export const normalizeMedicalService = (service: MedicalServiceLike): MedicalService => ({
    ...service,
    photoUrl: resolveServicePhotoUrl(service),
});

export const normalizeMedicalServices = (services: MedicalServiceLike[]): MedicalService[] =>
    services.map(normalizeMedicalService);

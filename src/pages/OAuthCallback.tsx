import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const OAuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/auth/me')
            .then((response) => {
                const roles: string[] = response.data.role;

                if (roles.includes('ROLE_ADMIN')) navigate('/admin/overview');
                else if (roles.includes('ROLE_PATIENT')) navigate('/patient/profile');
                else if (roles.includes('ROLE_RECEPTIONIST')) navigate('/receptionist/home');
                else if (roles.includes('ROLE_DOCTOR')) navigate('/doctor/profile');
                else navigate('/login');
            })
            .catch(() => navigate('/login'));
    }, []);

    return <div>Redirecting...</div>;
};

export default OAuthCallback;
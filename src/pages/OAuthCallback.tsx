import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const OAuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/auth/me')
            .then((response) => {
                const roles: string[] = response.data.role;

                if (roles.includes('ROLE_ADMIN')) navigate('/admin/dashboard');
                else if (roles.includes('ROLE_DOCTOR')) navigate('/doctor/dashboard');
                else if (roles.includes('ROLE_PATIENT')) navigate('/patient/dashboard');
                else navigate('/login');
            })
            .catch(() => navigate('/login'));
    }, []);

    return <div>Redirecting...</div>;
};

export default OAuthCallback;
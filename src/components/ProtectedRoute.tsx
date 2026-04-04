import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Spin } from 'antd';
import api from '../services/api';

interface ProtectedRouteProps {
    allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const [status, setStatus] = useState<'checking' | 'ok' | 'fail'>('checking');

    useEffect(() => {
        api.get('/auth/me')
            .then((response) => {
                const roles: string[] = response.data.role;
                const hasAccess = roles.some(role => allowedRoles.includes(role));
                setStatus(hasAccess ? 'ok' : 'fail');
            })
            .catch(() => setStatus('fail'));
    }, []);

    if (status === 'checking') return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <Spin size="large" />
        </div>
    );

    if (status === 'fail') return <Navigate to="/login" replace />;

    // Outlet renders the child route that matched
    return <Outlet />;
};

export default ProtectedRoute;
import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { login } from '../services/authService';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const response = await login(values);
            localStorage.setItem('token', response.jwtToken);

            const decoded: any = jwtDecode(response.jwtToken);
            const role = decoded.authority[0].role;

            if (role === 'ROLE_ADMIN') navigate('/admin/overview');
            else if (role === 'ROLE_DOCTOR') navigate('/doctor/dashboard');
            else if (role === 'ROLE_PATIENT') navigate('/patient/dashboard');
            else navigate('/');

        } catch (error) {
            message.error('Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Card title="Cura - Login" style={{ width: 400 }}>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Login
                    </Button>
                    <Button
                        icon={<GoogleOutlined />}
                        onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                        block
                        style={{ marginTop: 8 }}
                    >
                        Login with Google
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
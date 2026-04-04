import { useState } from 'react';
import { Form, Input, Button, Card, Divider, message } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            await login(values);
            navigate('/admin/overview');
        } catch (error) {
            message.error('Invalid username or password');
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
                </Form>

                <Divider>or</Divider>

                <Button
                    icon={<GoogleOutlined />}
                    onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                    block
                >
                    Continue with Google
                </Button>
            </Card>
        </div>
    );
};

export default Login;
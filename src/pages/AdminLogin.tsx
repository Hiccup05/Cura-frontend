import { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const { Paragraph } = Typography;

const AdminLogin = () => {
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
            <Card title="Cura - Admin Login" style={{ width: 400 }}>
                <Paragraph type="secondary">
                    This endpoint is for administrators only.
                </Paragraph>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Login as Admin
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default AdminLogin;

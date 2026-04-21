import { Button, Card, Typography } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
const { Paragraph } = Typography;

const Login = () => {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Card title="Cura - User Login" style={{ width: 400 }}>
                <Paragraph type="secondary">
                    Continue with Google to access patient, doctor, or receptionist features.
                </Paragraph>
                <Button
                    type="primary"
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
import { Layout, Menu, Button, Typography } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { logout } from '../../services/authService'

const { Header, Content } = Layout
const { Title } = Typography

const PatientLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        { key: '/patient/profile', label: 'Profile' },
        { key: '/patient/appointments', label: 'My Appointments' },
        { key: '/patient/book', label: 'Book Appointment' },
    ]

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key)
    }

    const handleLogout = async () => {
        await logout()
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 24px'
            }}>
                {/* Logo */}
                <Title level={4} style={{ margin: 0, color: '#1677ff', whiteSpace: 'nowrap' }}>
                    🏥 Cura
                </Title>

                {/* Nav links — flex: 1 makes it take remaining space */}
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ flex: 1, border: 'none' }}
                />

                {/* Logout — pushed to right */}
                <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
                    Logout
                </Button>
            </Header>

            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
                <Outlet />
            </Content>
        </Layout>
    )
}

export default PatientLayout
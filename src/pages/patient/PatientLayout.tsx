import { Layout, Menu, Button, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { logout } from '../../services/authService'

const { Header, Content } = Layout
const { Title } = Typography

const PatientLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems: MenuProps['items'] = [
        { key: '/patient/home', label: 'Home' },
        { key: '/patient/profile', label: 'Profile' },
        { key: '/patient/appointments', label: 'My Appointments' },
        { key: '/patient/book', label: 'Book Appointment' },
    ]

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        navigate(e.key)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <Layout style={{ minHeight: '100vh', background: '#ffffff' }}>
            {/* Header */}
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#ffffff',
                    padding: '0 24px',
                    borderBottom: '1px solid #e6e6e6',
                }}
            >
                <Title level={4} style={{ margin: 0, color: '#056672' }}>
                    🏥 Cura
                </Title>

                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        flex: 1,
                        border: 'none',
                        fontWeight: 500,
                        color: '#333333',
                    }}
                />

                <Button
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{
                        background: '#F5222D',
                        color: 'white',
                        border: 'none',
                    }}
                >
                    Logout
                </Button>
            </Header>

            {/* Content */}
            <Content style={{ padding: '24px', background: '#FAFAFA' }}>
                <Outlet />
            </Content>
        </Layout>
    )
}

export default PatientLayout
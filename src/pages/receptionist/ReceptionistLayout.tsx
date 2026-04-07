import { Layout, Menu, Button, Typography } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { logout } from '../../services/authService'

const { Header, Content } = Layout
const { Title } = Typography

const ReceptionistLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        { key: '/receptionist/home', label: 'Home' },
        { key: '/receptionist/appointments', label: 'All Appointments' },
        { key: '/receptionist/book', label: 'Book Appointment' },
        { key: '/receptionist/profile', label: 'Profile' },
    ]

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
                <Title level={4} style={{ margin: 0, color: '#1677ff', whiteSpace: 'nowrap' }}>
                    🏥 Cura
                </Title>
                <Menu
                    mode="horizontal"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ flex: 1, border: 'none' }}
                />
                <Button icon={<LogoutOutlined />} onClick={logout} danger>
                    Logout
                </Button>
            </Header>
            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
                <Outlet />
            </Content>
        </Layout>
    )
}

export default ReceptionistLayout

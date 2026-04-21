import { Layout, Menu, Button, Avatar, Space } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { logout } from '../../services/authService'

const { Header, Content } = Layout
const ReceptionistLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems = [
        { key: '/receptionist/home', label: 'Home' },
        { key: '/receptionist/appointments', label: 'All Appointments' },
        { key: '/receptionist/book', label: 'Book Appointment' },
    ]
    const menuKeys = menuItems.map((item) => item.key)
    const selectedMenuKeys = menuKeys.includes(location.pathname) ? [location.pathname] : []

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Header style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                background: '#fff',
                borderBottom: '1px solid #f0f0f0',
                padding: '0 24px',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backdropFilter: 'saturate(160%) blur(10px)',
            }}>
                <img
                    src="https://res.cloudinary.com/docykoj1r/image/upload/v1776766564/logo.png"
                    alt="Cura"
                    style={{ height: 36, objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => navigate('/receptionist/home')}
                />
                <Menu
                    mode="horizontal"
                    selectedKeys={selectedMenuKeys}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    style={{ flex: 1, border: 'none' }}
                />
                <Space size={10}>
                    <Button
                        icon={
                            <Avatar
                                size="small"
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
                            />
                        }
                        onClick={() => navigate('/receptionist/profile')}
                    >
                        Profile
                    </Button>
                    <Button icon={<LogoutOutlined />} onClick={handleLogout} danger>
                        Logout
                    </Button>
                </Space>
            </Header>
            <Content style={{ padding: '24px', background: '#f0f2f5' }}>
                <Outlet />
            </Content>
        </Layout>
    )
}

export default ReceptionistLayout

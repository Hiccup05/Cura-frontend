import { Layout, Menu, Button, Avatar, Space } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { logout } from '../../services/authService'

const { Header, Content } = Layout

const PatientLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const menuItems: MenuProps['items'] = [
        { key: '/patient/home', label: 'Home' },
        { key: '/patient/appointments', label: 'My Appointments' },
        { key: '/patient/book', label: 'Book Appointment' },
    ]
    const menuKeys = menuItems.map((item) => item?.key as string)
    const selectedMenuKeys = menuKeys.includes(location.pathname) ? [location.pathname] : []

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
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backdropFilter: 'saturate(160%) blur(10px)',
                }}
            >
                <img
                    src="https://res.cloudinary.com/docykoj1r/image/upload/v1776766564/logo.png"
                    alt="Cura"
                    style={{ height: 36, objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => navigate('/patient/home')}
                />

                <Menu
                    mode="horizontal"
                    selectedKeys={selectedMenuKeys}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{
                        flex: 1,
                        border: 'none',
                        fontWeight: 500,
                        color: '#333333',
                    }}
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
                        onClick={() => navigate('/patient/profile')}
                    >
                        Profile
                    </Button>
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
                </Space>
            </Header>

            {/* Content */}
            <Content style={{ padding: '24px', background: '#FAFAFA' }}>
                <Outlet />
            </Content>
        </Layout>
    )
}

export default PatientLayout
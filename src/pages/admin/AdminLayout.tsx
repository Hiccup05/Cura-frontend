import { useState } from 'react'
import { Layout, Menu, Button } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
    DashboardOutlined,
    UserOutlined,
    TeamOutlined,
    LogoutOutlined,
    MedicineBoxOutlined,
    AppstoreOutlined,
    TagOutlined
} from '@ant-design/icons'
import { logout } from '../../services/authService'

const { Header, Sider, Content } = Layout

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false)

    const navigate = useNavigate()

    const location = useLocation()

    const menuItems = [
        {
            key: '/admin/overview',
            icon: <DashboardOutlined />,
            label: 'Overview'
        },
        {
            key: '/admin/doctors',
            icon: <MedicineBoxOutlined />,
            label: 'Doctors'
        },
        {
            key: '/admin/receptionists',
            icon: <TeamOutlined />,
            label: 'Receptionists'
        },
        {
            key: '/admin/services',
            icon: <AppstoreOutlined />,
            label: 'Medical Services'
        },
        {
            key: '/admin/specializations',
            icon: <TagOutlined />,
            label: 'Specializations'
        },
        {
            key: '/admin/profile',
            icon: <UserOutlined />,
            label: 'Profile'
        }
    ]

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key)
    }

    const handleLogout = async () => {
        await logout()
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>

            {/* SIDEBAR */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                style={{ background: '#fff' }}
            >
                {/* Logo area */}
                <div style={{
                    padding: '16px',
                    textAlign: 'center',
                    borderBottom: '1px solid #f0f0f0',
                    marginBottom: 8
                }}>
                    <img
                        src="https://res.cloudinary.com/docykoj1r/image/upload/v1776766564/logo.png"
                        alt="Cura Admin"
                        style={{
                            height: collapsed ? 28 : 36,
                            objectFit: 'contain',
                            transition: 'height 0.2s ease',
                        }}
                    />
                </div>

                {/* Navigation links */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0 }}
                />
            </Sider>

            <Layout>
                {/* HEADER */}
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    borderBottom: '1px solid #f0f0f0'
                }}>
                    <Button
                        icon={<LogoutOutlined />}
                        onClick={handleLogout}
                        danger
                    >
                        Logout
                    </Button>
                </Header>

                {/* CONTENT AREA — child routes render here */}
                <Content style={{
                    margin: '24px',
                    padding: '24px',
                    background: '#fff',
                    borderRadius: 8,
                    minHeight: 360
                }}>
                    <Outlet />
                </Content>
            </Layout>

        </Layout>
    )
}

export default AdminLayout
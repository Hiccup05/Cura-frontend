import { useState } from 'react'
import { Layout, Menu, Button, Typography } from 'antd'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import {
    DashboardOutlined,
    UserOutlined,
    TeamOutlined,
    LogoutOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons'
import { logout } from '../../services/authService'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const AdminLayout = () => {
    // controls whether sidebar is collapsed or expanded
    const [collapsed, setCollapsed] = useState(false)

    const navigate = useNavigate()

    // useLocation tells you what the current URL is
    // we use it to highlight the active sidebar item
    const location = useLocation()

    // each item has a key = the route it should go to
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
            key: '/admin/profile',
            icon: <UserOutlined />,
            label: 'Profile'
        }
    ]

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key) // clicking a menu item navigates to that route
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
                    {!collapsed && (
                        <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
                            Cura Admin
                        </Title>
                    )}
                </div>

                {/* Navigation links */}
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]} // highlights current page
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
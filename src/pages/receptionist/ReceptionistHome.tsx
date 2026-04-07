import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Button, Table, Tag, Typography, Space } from 'antd'
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PlusOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { AppointmentSummary, AppointmentStatus } from '../../types/appointment'

const { Title, Text } = Typography

const STATUS_COLOR: Record<AppointmentStatus, string> = {
    PENDING: 'orange',
    CONFIRMED: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
}

const ReceptionistHome = () => {
    const navigate = useNavigate()
    const [appointments, setAppointments] = useState<AppointmentSummary[]>([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState<string>('')

    useEffect(() => {
        // Fetch receptionist profile for greeting
        api.get('/receptionist/profile')
            .then(r => setName(r.data.firstName ?? ''))
            .catch(() => { })

        // Fetch all appointments
        api.get('/receptionist/appointments')
            .then(r => setAppointments(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    // Derived stats
    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.filter(a => a.appointmentDate === today)
    const pending = appointments.filter(a => a.appointmentStatus === 'PENDING').length
    const confirmed = appointments.filter(a => a.appointmentStatus === 'CONFIRMED').length
    const completed = appointments.filter(a => a.appointmentStatus === 'COMPLETED').length

    // Show 5 most recent for the quick-view table
    const recent = appointments.slice(0, 5)

    const columns = [
        {
            title: 'Date',
            dataIndex: 'appointmentDate',
            key: 'date',
            width: 110,
        },
        {
            title: 'Time',
            dataIndex: 'appointmentTime',
            key: 'time',
            width: 90,
            render: (t: string) => t?.slice(0, 5),
        },
        {
            title: 'Service',
            dataIndex: 'medicalServiceName',
            key: 'service',
        },
        {
            title: 'Status',
            dataIndex: 'appointmentStatus',
            key: 'status',
            width: 110,
            render: (s: AppointmentStatus) => (
                <Tag color={STATUS_COLOR[s]}>{s}</Tag>
            ),
        },
        {
            title: 'Paid',
            dataIndex: 'isPaid',
            key: 'paid',
            width: 70,
            render: (v: boolean) => (
                <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag>
            ),
        },
    ]

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>

            {/* Greeting */}
            <div>
                <Title level={3} style={{ margin: 0 }}>
                    Good {getTimeOfDay()}{name ? `, ${name}` : ''} 👋
                </Title>
                <Text type="secondary">Here's what's happening today.</Text>
            </div>

            {/* Stats */}
            <Row gutter={[16, 16]}>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Today's Appointments"
                            value={todayAppointments.length}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Pending"
                            value={pending}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Confirmed"
                            value={confirmed}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card>
                        <Statistic
                            title="Completed"
                            value={completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Quick actions */}
            <Card title="Quick Actions" size="small">
                <Space wrap>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/receptionist/book')}
                    >
                        Book Appointment
                    </Button>
                    <Button
                        icon={<CalendarOutlined />}
                        onClick={() => navigate('/receptionist/appointments')}
                    >
                        View All Appointments
                    </Button>
                    <Button
                        icon={<UserOutlined />}
                        onClick={() => navigate('/receptionist/profile')}
                    >
                        My Profile
                    </Button>
                </Space>
            </Card>

            {/* Recent appointments */}
            <Card
                title="Recent Appointments"
                extra={
                    <Button type="link" onClick={() => navigate('/receptionist/appointments')}>
                        View all
                    </Button>
                }
            >
                <Table
                    dataSource={recent}
                    columns={columns}
                    rowKey="appointmentId"
                    loading={loading}
                    pagination={false}
                    size="small"
                />
            </Card>

        </Space>
    )
}

const getTimeOfDay = () => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
}

export default ReceptionistHome

import { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Button, Table, Tag, Typography, Space } from 'antd'
import {
    CalendarOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    UserOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { AppointmentSummary, AppointmentStatus } from '../../types/appointment'
import DiscoveryHomeContent from '../../components/DiscoveryHomeContent'

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
        api.get('/receptionist/profile')
            .then((r) => setName(r.data.firstName ?? ''))
            .catch(() => { })

        api.get('/receptionist/appointment')
            .then((r) => setAppointments(r.data))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const today = new Date().toISOString().split('T')[0]
    const todayAppointments = appointments.filter((a) => a.appointmentDate === today)
    const confirmed = appointments.filter((a) => a.appointmentStatus === 'CONFIRMED').length
    const completed = appointments.filter((a) => a.appointmentStatus === 'COMPLETED').length
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
            render: (s: AppointmentStatus) => <Tag color={STATUS_COLOR[s]}>{s}</Tag>,
        },
        {
            title: 'Paid',
            dataIndex: 'isPaid',
            key: 'paid',
            width: 70,
            render: (v: boolean) => <Tag color={v ? 'green' : 'default'}>{v ? 'Yes' : 'No'}</Tag>,
        },
    ]

    const lead = (
        <div style={{ padding: '24px 20px 0', maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ marginBottom: 16 }}>
                <Title level={3} style={{ margin: 0 }}>
                    Good {getTimeOfDay()}
                    {name ? `, ${name}` : ''}
                </Title>
                <Text type="secondary">Today&apos;s snapshot and shortcuts — scroll for doctors and services.</Text>
            </div>

            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                <Col xs={12} sm={6}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Today's appointments"
                            value={todayAppointments.length}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Confirmed"
                            value={confirmed}
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#1677ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8}>
                    <Card style={{ borderRadius: 12 }}>
                        <Statistic
                            title="Completed"
                            value={completed}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title="Quick actions" size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
                <Space wrap>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/receptionist/book')}>
                        Book appointment
                    </Button>
                    <Button icon={<CalendarOutlined />} onClick={() => navigate('/receptionist/appointments')}>
                        All appointments
                    </Button>
                    <Button icon={<UserOutlined />} onClick={() => navigate('/receptionist/profile')}>
                        Profile
                    </Button>
                </Space>
            </Card>

            <Card
                title="Recent appointments"
                extra={
                    <Button type="link" onClick={() => navigate('/receptionist/appointments')}>
                        View all
                    </Button>
                }
                style={{ borderRadius: 12, marginBottom: 8 }}
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
        </div>
    )

    return (
        <DiscoveryHomeContent
            bookBasePath="/receptionist/book"
            lead={lead}
            heroTitle="Front desk, same great care"
            heroSubtitle="Jump to booking from a doctor or service below, or use Quick actions."
            heroPrimaryLabel="Book appointment"
        />
    )
}

const getTimeOfDay = () => {
    const h = new Date().getHours()
    if (h < 12) return 'morning'
    if (h < 17) return 'afternoon'
    return 'evening'
}

export default ReceptionistHome

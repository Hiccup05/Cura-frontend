import { useEffect, useState } from 'react';
import { Card, Tag, Typography, message, Table, Row, Col } from 'antd';
import api from '../../services/api';
import { DoctorProfile, DoctorSchedule } from '../../types/doctor';

const { Title, Text } = Typography;

const DoctorProfilePage = () => {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/doctors'),
            api.get('/doctors/schedule')
        ])
            .then(([profileRes, scheduleRes]) => {
                setProfile(profileRes.data);
                setSchedules(scheduleRes.data);
            })
            .catch(() => message.error('Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const scheduleColumns = [
        { title: 'Day', dataIndex: 'dayOfWeek' },
        { title: 'Start', dataIndex: 'startTime' },
        { title: 'End', dataIndex: 'endTime' },
        { title: 'Max Appointments', dataIndex: 'maxAppointments' },
        {
            title: 'Available',
            dataIndex: 'isAvailable',
            render: (val: boolean) => (
                <Tag color={val ? 'green' : 'red'}>{val ? 'Yes' : 'No'}</Tag>
            )
        }
    ];

    const fullName = `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim() || 'Doctor';

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card loading={loading} bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
                <Title level={3} style={{ margin: 0 }}>{fullName}</Title>
                <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                    <Tag color="blue">{profile?.doctorStatus}</Tag>
                </Text>
                <Row gutter={24}>
                    <Col xs={24} md={8}>
                        <Text type="secondary">License Number</Text>
                        <p><Text strong>{profile?.licenseNumber || '—'}</Text></p>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text type="secondary">Years of Experience</Text>
                        <p><Text strong>{profile?.yearsOfExperience} years</Text></p>
                    </Col>
                    <Col xs={24} md={8}>
                        <Text type="secondary">Specializations</Text>
                        <p>{profile?.specialization.map(s => <Tag key={s.id}>{s.name}</Tag>)}</p>
                    </Col>
                </Row>
            </Card>

            <Card title="My Schedules" bordered={false} style={{ borderRadius: 16 }}>
                <Table
                    rowKey="id"
                    dataSource={schedules}
                    columns={scheduleColumns}
                    pagination={false}
                    loading={loading}
                />
            </Card>
        </div>
    );
};

export default DoctorProfilePage;
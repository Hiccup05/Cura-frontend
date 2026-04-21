import { useEffect, useState } from 'react';
import { Card, Tag, Typography, message, Table, Row, Col, Avatar, Space, Button, Upload } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { DoctorProfile, DoctorSchedule } from '../../types/doctor';
import { resolveImageUrl } from '../../utils/imageUrl';

const { Title, Text } = Typography;

const DoctorProfilePage = () => {
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [schedules, setSchedules] = useState<DoctorSchedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

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
    const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const refreshProfile = () => api.get('/doctors').then((res) => setProfile(res.data));

    const uploadProfilePicture = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            message.error('Only image files are allowed');
            return false;
        }
        if (file.size > 2 * 1024 * 1024) {
            message.error('File size must be under 2MB');
            return false;
        }
        const formData = new FormData();
        formData.append('file', file);
        setUploadingPhoto(true);
        try {
            await api.post('/user/profile/picture', formData);
            await refreshProfile();
            message.success('Profile picture updated');
        } catch {
            message.error('Failed to upload profile picture');
        } finally {
            setUploadingPhoto(false);
        }
        return false;
    };

    const deleteProfilePicture = async () => {
        setUploadingPhoto(true);
        try {
            await api.delete('/user/profile/picture');
            await refreshProfile();
            message.success('Profile picture removed');
        } catch {
            message.error('Failed to remove profile picture');
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Card loading={loading} bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
                <Space size={16} align="center" style={{ marginBottom: 8 }}>
                    <Avatar
                        size={72}
                        src={resolveImageUrl(profile?.profilePictureUrl) || undefined}
                        style={{ backgroundColor: '#1677ff', fontSize: 24 }}
                    >
                        {initials || <UserOutlined />}
                    </Avatar>
                    <Title level={3} style={{ margin: 0 }}>{fullName}</Title>
                </Space>
                {profile?.id != null && (
                    <Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                        Your unique ID for clinic sharing: <Text copyable strong>{String(profile.id)}</Text>
                    </Text>
                )}
                <Space style={{ marginBottom: 16 }}>
                    <Upload accept="image/*" showUploadList={false} beforeUpload={uploadProfilePicture} customRequest={() => {}}>
                        <Button loading={uploadingPhoto}>Upload Photo</Button>
                    </Upload>
                    <Button
                        danger
                        disabled={!profile?.profilePictureUrl}
                        loading={uploadingPhoto}
                        onClick={deleteProfilePicture}
                    >
                        Remove Photo
                    </Button>
                </Space>
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
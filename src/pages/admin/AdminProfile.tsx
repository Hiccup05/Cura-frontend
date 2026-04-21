import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Avatar, Space, Button, Upload, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { AdminProfile as AdminProfileData } from '../../types/admin';
import { resolveImageUrl } from '../../utils/imageUrl';

const { Title } = Typography;

const AdminProfile: React.FC = () => {

    const [stats, setStats] = useState<AdminProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        api.get('/admin/profile')
            .then((response) => setStats(response.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const refreshProfile = () =>
        api.get('/admin/profile').then((response) => setStats(response.data));

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
        <div>
            <Title level={2}>Admin Profile</Title>
            {loading ? (
                <p>Loading...</p>
            ) : stats ? (
                <Card>
                    <Space size={16} align="center" style={{ marginBottom: 20 }}>
                        <Avatar
                            size={64}
                            src={resolveImageUrl(stats.profilePictureUrl) || undefined}
                            style={{ backgroundColor: '#1677ff', fontSize: 20 }}
                        >
                            {stats.username?.slice(0, 2).toUpperCase() || <UserOutlined />}
                        </Avatar>
                        <Space>
                            <Upload accept="image/*" showUploadList={false} beforeUpload={uploadProfilePicture} customRequest={() => {}}>
                                <Button size="small" loading={uploadingPhoto}>Upload Photo</Button>
                            </Upload>
                            <Button
                                size="small"
                                danger
                                disabled={!stats.profilePictureUrl}
                                loading={uploadingPhoto}
                                onClick={deleteProfilePicture}
                            >
                                Remove Photo
                            </Button>
                        </Space>
                    </Space>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Statistic title="Username" value={stats.username} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="Email" value={stats.email} />
                        </Col>
                        <Col span={8}>
                            <Statistic title="ID" value={stats.id} />
                        </Col>
                    </Row>
                </Card>
            ) : (
                <p>No profile data found.</p>
            )}
        </div>
    );
};

export default AdminProfile;
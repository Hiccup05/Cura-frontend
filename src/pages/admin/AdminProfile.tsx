import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import api from '../../services/api';
import { AdminProfile as AdminProfileData } from '../../types/auth';

const { Title } = Typography;

const AdminProfile: React.FC = () => {

    const [stats, setStats] = useState<AdminProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/profile')
            .then((response) => setStats(response.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <Title level={2}>Admin Profile</Title>
            {loading ? (
                <p>Loading...</p>
            ) : stats ? (
                <Card>
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
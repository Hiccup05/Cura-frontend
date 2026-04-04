import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography } from 'antd';
import {
    UserOutlined,
    MedicineBoxOutlined,
    CalendarOutlined,
    DollarOutlined
} from '@ant-design/icons';
import api from '../../services/api';

const { Title } = Typography;

// shape of what /admin/stats returns
interface AdminStats {
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    pendingDoctorApprovals: number;
    totalRevenue: number;
}

const AdminOverview = () => {
    // stats starts as null — nothing loaded yet
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    // runs once when component loads — fetches stats from backend
    useEffect(() => {
        api.get('/admin/stats')
            .then((response) => setStats(response.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>Overview</Title>

            {/* Row and Col are Ant Design's grid system */}
            {/* gutter = space between cards */}
            {/* xs=24 means full width on mobile, sm=12 means half width, lg=6 means quarter width */}
            <Row gutter={[16, 16]}>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Doctors"
                            value={stats?.totalDoctors}
                            prefix={<MedicineBoxOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Patients"
                            value={stats?.totalPatients}
                            prefix={<UserOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Appointments"
                            value={stats?.totalAppointments}
                            prefix={<CalendarOutlined />}
                            loading={loading}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Pending Approvals"
                            value={stats?.pendingDoctorApprovals}
                            prefix={<MedicineBoxOutlined />}
                            loading={loading}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Revenue"
                            value={stats?.totalRevenue}
                            prefix={<DollarOutlined />}
                            loading={loading}
                            valueStyle={{ color: '#3f8600' }}
                            suffix="NPR"
                        />
                    </Card>
                </Col>

            </Row>
        </div>
    );
};

export default AdminOverview;
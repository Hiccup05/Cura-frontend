import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Card, Col, Empty, Row, Space, Tag, Typography, message } from 'antd';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { PublicDoctor } from '../types/doctor';
import { MedicalService } from '../types/admin';
import { serviceSlotDurationMinutes } from '../utils/serviceSlotDuration';
import { normalizeMedicalServices } from '../utils/medicalService';
import { resolveImageUrl } from '../utils/imageUrl';

const { Title, Paragraph, Text } = Typography;

const SECTION_ANCHOR_OFFSET = 72;

const landingSectionStyle = {
    scrollMarginTop: SECTION_ANCHOR_OFFSET,
} as const;

const LandingPage = () => {
    const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
    const [services, setServices] = useState<MedicalService[]>([]);
    const [loadingDoctors, setLoadingDoctors] = useState(true);
    const [loadingServices, setLoadingServices] = useState(true);

    useEffect(() => {
        api.get('/public/doctors')
            .then((res) => setDoctors(res.data))
            .catch(() => message.error('Failed to load doctors'))
            .finally(() => setLoadingDoctors(false));
    }, []);

    const specializationIds = useMemo(() => {
        const ids = doctors.flatMap((d) => d.specialization.map((s) => s.id));
        return Array.from(new Set(ids));
    }, [doctors]);

    useEffect(() => {
        if (specializationIds.length === 0) {
            setServices([]);
            setLoadingServices(false);
            return;
        }

        setLoadingServices(true);
        Promise.all(specializationIds.map((id) => api.get(`/public/service/${id}`)))
            .then((responses) => {
                const allServices = responses.flatMap((r) => normalizeMedicalServices(r.data as MedicalService[]));
                const unique = allServices.filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
                setServices(unique);
            })
            .catch(() => message.error('Failed to load services'))
            .finally(() => setLoadingServices(false));
    }, [specializationIds]);

    return (
        <div style={{ minHeight: '100vh', background: '#f5f7fa' }}>
            <header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    borderBottom: '1px solid #e8ecf0',
                    background: 'rgba(255, 255, 255, 0.92)',
                    backdropFilter: 'saturate(160%) blur(10px)',
                }}
            >
                <div
                    style={{
                        maxWidth: 1200,
                        margin: '0 auto',
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    <img
                        src="https://res.cloudinary.com/docykoj1r/image/upload/v1776766564/logo.png"
                        alt="Cura Healthcare"
                        style={{ height: 36, objectFit: 'contain' }}
                    />
                    <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <a href="#top" style={{ padding: '6px 10px', color: '#434343' }}>
                            Home
                        </a>
                        <a href="#doctors" style={{ padding: '6px 10px', color: '#434343' }}>
                            Doctors
                        </a>
                        <a href="#services" style={{ padding: '6px 10px', color: '#434343' }}>
                            Services
                        </a>
                        <Link to="/about" style={{ padding: '6px 10px', color: '#434343' }}>
                            About
                        </Link>
                        <Link to="/login" style={{ marginLeft: 4 }}>
                            <Button type="primary">Login</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <section
                id="top"
                style={{
                    ...landingSectionStyle,
                    minHeight: 'calc(85vh - 56px)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '64px 20px 80px',
                    background:
                        'linear-gradient(165deg, #e6f4ff 0%, #f0f9ff 38%, #ffffff 100%)',
                    borderBottom: '1px solid rgba(22, 119, 255, 0.08)',
                }}
            >
                <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
                    <Title level={1} style={{ margin: '0 0 16px', fontSize: 'clamp(2rem, 5vw, 2.75rem)', lineHeight: 1.15 }}>
                        Care that fits your life
                    </Title>
                    <Paragraph style={{ margin: '0 auto 28px', fontSize: 18, color: '#595959', maxWidth: 520 }}>
                        Find doctors, browse services, and book appointments. Sign in for your personalized dashboard and
                        scheduling.
                    </Paragraph>
                    <Space size="middle" wrap style={{ justifyContent: 'center' }}>
                        <Link to="/login">
                            <Button type="primary" size="large">
                                Login
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button size="large">Book now</Button>
                        </Link>
                    </Space>
                </div>
            </section>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 20px 48px' }}>
                <section id="doctors" style={landingSectionStyle}>
                    <div style={{ marginBottom: 28 }}>
                        <Title level={2} style={{ margin: '0 0 8px' }}>
                            Our doctors
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Verified physicians across specializations.
                        </Text>
                    </div>

                    <Card loading={loadingDoctors} styles={{ body: { padding: 24 } }} style={{ borderRadius: 12 }}>
                        {doctors.length === 0 && !loadingDoctors ? (
                            <Empty description="No doctors available right now." />
                        ) : (
                            <Row gutter={[20, 20]}>
                                {doctors.map((doctor) => {
                                    const displayName =
                                        `${doctor.firstName ?? ''} ${doctor.lastName ?? ''}`.trim() || `Doctor ${doctor.id}`;
                                    const initials =
                                        `${doctor.firstName?.[0] ?? ''}${doctor.lastName?.[0] ?? ''}`.trim() || undefined;

                                    return (
                                        <Col xs={24} sm={12} lg={8} key={doctor.id}>
                                            <Card
                                                size="small"
                                                hoverable
                                                styles={{ body: { padding: 20 } }}
                                                style={{ borderRadius: 12, height: '100%' }}
                                            >
                                                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                                    <Avatar
                                                        size={112}
                                                        src={resolveImageUrl(doctor.profilePictureUrl) || undefined}
                                                        style={{ border: '3px solid #e6f4ff' }}
                                                    >
                                                        {initials}
                                                    </Avatar>
                                                </div>
                                                <Space direction="vertical" size={10} style={{ width: '100%', textAlign: 'center' }}>
                                                    <Text strong style={{ fontSize: 16 }}>
                                                        {displayName}
                                                    </Text>
                                                    <Text type="secondary">Experience: {doctor.yearsOfExperience} years</Text>
                                                    <div>
                                                        {doctor.specialization.map((sp) => (
                                                            <Tag key={sp.id} color="blue" style={{ marginBottom: 4 }}>
                                                                {sp.name}
                                                            </Tag>
                                                        ))}
                                                    </div>
                                                </Space>
                                            </Card>
                                        </Col>
                                    );
                                })}
                            </Row>
                        )}
                    </Card>
                </section>

                <section id="services" style={{ ...landingSectionStyle, marginTop: 56 }}>
                    <div style={{ marginBottom: 28 }}>
                        <Title level={2} style={{ margin: '0 0 8px' }}>
                            Medical services
                        </Title>
                        <Text type="secondary" style={{ fontSize: 16 }}>
                            Transparent pricing and slot lengths by service.
                        </Text>
                    </div>

                    <Card loading={loadingServices} styles={{ body: { padding: 24 } }} style={{ borderRadius: 12 }}>
                        {services.length === 0 && !loadingServices ? (
                            <Empty description="No services available right now." />
                        ) : (
                            <Row gutter={[20, 20]}>
                                {services.map((service) => (
                                    <Col xs={24} sm={12} lg={8} key={service.id}>
                                        <Card
                                            size="small"
                                            hoverable
                                            styles={{ body: { padding: 16 } }}
                                            style={{ borderRadius: 12, height: '100%', overflow: 'hidden' }}
                                            cover={
                                                service.photoUrl ? (
                                                    <img
                                                        src={service.photoUrl}
                                                        alt={service.name}
                                                        style={{
                                                            width: '100%',
                                                            height: 200,
                                                            objectFit: 'cover',
                                                        }}
                                                    />
                                                ) : (
                                                    <div
                                                        style={{
                                                            height: 200,
                                                            background:
                                                                'linear-gradient(135deg, #bae0ff 0%, #e6f4ff 100%)',
                                                        }}
                                                    />
                                                )
                                            }
                                        >
                                            <Space direction="vertical" size={8} style={{ width: '100%' }}>
                                                <Text strong style={{ fontSize: 16 }}>
                                                    {service.name}
                                                </Text>
                                                <Text>
                                                    NPR {service.price} · {serviceSlotDurationMinutes(service)} min slots
                                                </Text>
                                                <Text type="secondary">{service.specializationName}</Text>
                                                {service.description && (
                                                    <Paragraph
                                                        type="secondary"
                                                        style={{ margin: 0 }}
                                                        ellipsis={{ rows: 3 }}
                                                    >
                                                        {service.description}
                                                    </Paragraph>
                                                )}
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Card>
                </section>

                <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid #e8ecf0', textAlign: 'center' }}>
                    <Text type="secondary" style={{ display: 'block' }}>
                        Copyright {new Date().getFullYear()} Cura Healthcare. All rights reserved.
                    </Text>
                    <Text type="secondary" style={{ display: 'block', marginTop: 6 }}>
                        Built by Hiccup
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;

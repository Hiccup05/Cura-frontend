import { useEffect, useState } from "react";
import { Avatar, Card, Col, Row, Tag, Typography, Button, Spin, Divider } from "antd";
import { UserOutlined, EditOutlined } from "@ant-design/icons";
import api from "../services/api";
import { PatientResponseDto } from "../types/patient";

const { Title, Text } = Typography;


const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div style={{ marginBottom: 16 }}>
        <Text type="secondary" style={{ fontSize: 12, display: "block", marginBottom: 2 }}>
            {label}
        </Text>
        <Text strong>{value || "—"}</Text>
    </div>
);

const PatientDashboard = () => {
    const [patient, setPatient] = useState<PatientResponseDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/patients")
            .then((res) => setPatient(res.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 100 }}>
            <Spin size="large" />
        </div>
    );

    const fullName = `${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`.trim() || "Patient";
    const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div style={{ maxWidth: 900, margin: "40px auto", padding: "0 24px" }}>
            <Card bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                    <Avatar size={80} style={{ backgroundColor: "#1677ff", fontSize: 28 }}>
                        {initials || <UserOutlined />}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Title level={3} style={{ margin: 0 }}>{fullName}</Title>
                        <Text type="secondary">{patient?.gender} · {patient?.bloodGroup &&
                            <Tag color="red">{patient.bloodGroup}</Tag>}
                        </Text>
                    </div>
                    <Button icon={<EditOutlined />} type="default">
                        Edit Profile
                    </Button>
                </div>
            </Card>

            <Row gutter={24}>
                <Col xs={24} md={12}>
                    <Card title="Personal Information" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
                        <InfoRow label="Date of Birth" value={patient?.dateOfBirth} />
                        <InfoRow label="Phone Number" value={patient?.phoneNumber} />
                        <InfoRow label="Address" value={patient?.address} />
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="Medical Information" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
                        <InfoRow label="Blood Group" value={patient?.bloodGroup} />
                        <InfoRow label="Allergies" value={patient?.allergies} />
                        <InfoRow label="Chronic Conditions" value={patient?.chronicConditions} />
                    </Card>
                </Col>

                <Col xs={24}>
                    <Card title="Emergency Contact" bordered={false} style={{ borderRadius: 16 }}>
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <InfoRow label="Contact Name" value={patient?.emergencyContactName} />
                            </Col>
                            <Col xs={24} md={12}>
                                <InfoRow label="Contact Phone" value={patient?.emergencyContactPhone} />
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default PatientDashboard;
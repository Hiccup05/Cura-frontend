import { useEffect, useState } from "react";
import { Avatar, Card, Col, Row, Tag, Typography, Button, Spin, Form, Input, Select, DatePicker, message } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import api from "../services/api";
import { PatientProfile } from "../types/patient";
import dayjs from 'dayjs';

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
    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        api.get("/patients")
            .then((res) => setPatient(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = () => {
        form.setFieldsValue({
            firstName: patient?.firstName,
            lastName: patient?.lastName,
            dateOfBirth: patient?.dateOfBirth ? dayjs(patient.dateOfBirth) : null,
            gender: patient?.gender,
            phoneNumber: patient?.phoneNumber,
            address: patient?.address,
            bloodGroup: patient?.bloodGroup,
            allergies: patient?.allergies,
            chronicConditions: patient?.chronicConditions,
            emergencyContactName: patient?.emergencyContactName,
            emergencyContactPhone: patient?.emergencyContactPhone,
        });
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        form.resetFields();
    };

    const handleSave = (values: any) => {
        setSaving(true);
        api.patch('/patients', {
            ...values,
            dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD')
        })
            .then((response) => {
                setPatient(response.data);
                setIsEditing(false);
                message.success('Profile updated');
            })
            .catch(() => message.error('Failed to update profile'))
            .finally(() => setSaving(false));
    };

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
                    {!isEditing ? (
                        <Button icon={<EditOutlined />} onClick={handleEdit}>
                            Edit Profile
                        </Button>
                    ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Button
                                icon={<SaveOutlined />}
                                type="primary"
                                loading={saving}
                                onClick={() => form.submit()}
                            >
                                Save
                            </Button>
                            <Button icon={<CloseOutlined />} onClick={handleCancel}>
                                Cancel
                            </Button>
                        </div>
                    )}
                </div>
            </Card>

            {/* View Mode */}
            {!isEditing && (
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
            )}

            {/* Edit Mode */}
            {isEditing && (
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Card title="Personal Information" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
                                <Form.Item label="First Name" name="firstName">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Last Name" name="lastName">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Date of Birth" name="dateOfBirth">
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                                <Form.Item label="Gender" name="gender">
                                    <Select options={[
                                        { label: 'Male', value: 'MALE' },
                                        { label: 'Female', value: 'FEMALE' },
                                        { label: 'Other', value: 'OTHER' }
                                    ]} />
                                </Form.Item>
                                <Form.Item label="Phone Number" name="phoneNumber">
                                    <Input />
                                </Form.Item>
                                <Form.Item label="Address" name="address">
                                    <Input />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card title="Medical Information" bordered={false} style={{ borderRadius: 16, marginBottom: 24 }}>
                                <Form.Item label="Blood Group" name="bloodGroup">
                                    <Select options={[
                                        { label: 'A+', value: 'A_POSITIVE' },
                                        { label: 'A-', value: 'A_NEGATIVE' },
                                        { label: 'B+', value: 'B_POSITIVE' },
                                        { label: 'B-', value: 'B_NEGATIVE' },
                                        { label: 'O+', value: 'O_POSITIVE' },
                                        { label: 'O-', value: 'O_NEGATIVE' },
                                        { label: 'AB+', value: 'AB_POSITIVE' },
                                        { label: 'AB-', value: 'AB_NEGATIVE' },
                                    ]} />
                                </Form.Item>
                                <Form.Item label="Allergies" name="allergies">
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                                <Form.Item label="Chronic Conditions" name="chronicConditions">
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col xs={24}>
                            <Card title="Emergency Contact" bordered={false} style={{ borderRadius: 16 }}>
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Contact Name" name="emergencyContactName">
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Contact Phone" name="emergencyContactPhone">
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    </Row>
                </Form>
            )}
        </div>
    );
};

export default PatientDashboard;
import { useEffect, useState } from "react";
import {
    Avatar,
    Card,
    Col,
    Row,
    Tag,
    Typography,
    Button,
    Spin,
    Form,
    Input,
    Select,
    DatePicker,
    message,
    Divider,
    Upload,
} from "antd";
import {
    UserOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
} from "@ant-design/icons";
import api from "../../services/api";
import { PatientProfile } from "../../types/patient";
import dayjs from "dayjs";
import { resolveImageUrl } from "../../utils/imageUrl";

const { Title, Text } = Typography;

const PRIMARY = "#056672";
const CARD_BG = "#ffffff";
const TEXT_COLOR = "#1f2937";

const InfoRow = ({ label, value }: { label: string; value?: string }) => (
    <div style={{ marginBottom: 12 }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
            {label}
        </Text>
        <br />
        <Text strong>{value || "—"}</Text>
    </div>
);

const PatientDashboard = () => {
    const [patient, setPatient] = useState<PatientProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form] = Form.useForm();
    const [uploadingPhoto, setUploadingPhoto] = useState(false);

    useEffect(() => {
        api.get("/patients")
            .then((res) => setPatient(res.data))
            .finally(() => setLoading(false));
    }, []);

    const handleEdit = () => {
        form.setFieldsValue({
            firstName: patient?.firstName,
            lastName: patient?.lastName,
            dateOfBirth: patient?.dateOfBirth
                ? dayjs(patient.dateOfBirth)
                : null,
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
        api.patch("/patients", {
            ...values,
            dateOfBirth: values.dateOfBirth?.format("YYYY-MM-DD"),
        })
            .then((response) => {
                setPatient(response.data);
                setIsEditing(false);
                message.success("Profile updated");
            })
            .catch(() => message.error("Failed to update profile"))
            .finally(() => setSaving(false));
    };

    if (loading)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: 100,
                }}
            >
                <Spin size="large" />
            </div>
        );

    const fullName = `${patient?.firstName ?? ""} ${patient?.lastName ?? ""
        }`.trim();
    const initials = fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

        const uploadProfilePicture = async (file: File) => {
            if (!file.type.startsWith("image/")) {
                message.error("Only image files are allowed");
                return Upload.LIST_IGNORE;
            }
        
            const formData = new FormData();
            formData.append("file", file);
        
            setUploadingPhoto(true);
            try {
                await api.post("/user/profile/picture", formData);
    
                const refreshed = await api.get("/patients");
                setPatient(refreshed.data);
                message.success("Profile picture updated");
            } catch (error: any) {
                message.error("Upload failed");
            } finally {
                setUploadingPhoto(false);
            }
        
            return false;
        };

    const deleteProfilePicture = async () => {
        setUploadingPhoto(true);
        try {
            await api.delete("/user/profile/picture");
            const refreshed = await api.get("/patients");
            setPatient(refreshed.data);
            message.success("Profile picture removed");
        } catch {
            message.error("Failed to remove profile picture");
        } finally {
            setUploadingPhoto(false);
        }
    };

    return (
        <div style={{ maxWidth: 1000, margin: "40px auto", padding: "0 24px" }}>
            {/* Header Card */}
            <Card
                bordered={false}
                style={{
                    borderRadius: 12,
                    marginBottom: 24,
                    background: CARD_BG,
                }}
            >
                <Row align="middle" gutter={24}>
                    <Col>
                        <Avatar
                            size={90}
                            src={resolveImageUrl(patient?.profilePictureUrl) || undefined}
                            style={{ backgroundColor: PRIMARY, fontSize: 28 }}
                        >
                            {initials || <UserOutlined />}
                        </Avatar>
                    </Col>
                    <Col flex="auto">
                        <Title level={2} style={{ margin: 0, color: TEXT_COLOR }}>
                            {fullName || "Patient"}
                        </Title>
                        {patient?.id != null && (
                            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                Your unique ID for clinic sharing: <Text copyable strong>{String(patient.id)}</Text>
                            </Text>
                        )}
                        <Text type="secondary" style={{ fontSize: 14 }}>
                            {patient?.gender && (
                                <Tag color="blue">{patient.gender}</Tag>
                            )}{" "}
                            {patient?.bloodGroup && (
                                <Tag color="volcano">{patient.bloodGroup}</Tag>
                            )}
                        </Text>
                    </Col>
                    <Col>
                        {!isEditing ? (
                            <div style={{ display: "flex", gap: 8 }}>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={uploadProfilePicture}
                                    customRequest={() => {}}
                                >
                                    <Button loading={uploadingPhoto}>Upload Photo</Button>
                                </Upload>
                                <Button
                                    danger
                                    disabled={!patient?.profilePictureUrl}
                                    loading={uploadingPhoto}
                                    onClick={deleteProfilePicture}
                                >
                                    Remove Photo
                                </Button>
                                <Button
                                    icon={<EditOutlined />}
                                    type="default"
                                    onClick={handleEdit}
                                >
                                    Edit Profile
                                </Button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", gap: 8 }}>
                                <Button
                                    icon={<SaveOutlined />}
                                    type="primary"
                                    loading={saving}
                                    onClick={() => form.submit()}
                                >
                                    Save
                                </Button>
                                <Button
                                    icon={<CloseOutlined />}
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </Col>
                </Row>
            </Card>

            {/* View Mode */}
            {!isEditing && (
                <>
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Card
                                title="Personal Information"
                                bordered={false}
                                style={{ borderRadius: 12, marginBottom: 24 }}
                            >
                                <InfoRow
                                    label="Date of Birth"
                                    value={patient?.dateOfBirth}
                                />
                                <InfoRow
                                    label="Phone Number"
                                    value={patient?.phoneNumber}
                                />
                                <InfoRow label="Address" value={patient?.address} />
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card
                                title="Medical Information"
                                bordered={false}
                                style={{ borderRadius: 12, marginBottom: 24 }}
                            >
                                <InfoRow
                                    label="Blood Group"
                                    value={patient?.bloodGroup}
                                />
                                <InfoRow
                                    label="Allergies"
                                    value={patient?.allergies}
                                />
                                <InfoRow
                                    label="Chronic Conditions"
                                    value={patient?.chronicConditions}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Card
                        title="Emergency Contact"
                        bordered={false}
                        style={{ borderRadius: 12 }}
                    >
                        <Row gutter={24}>
                            <Col xs={24} md={12}>
                                <InfoRow
                                    label="Contact Name"
                                    value={patient?.emergencyContactName}
                                />
                            </Col>
                            <Col xs={24} md={12}>
                                <InfoRow
                                    label="Contact Phone"
                                    value={patient?.emergencyContactPhone}
                                />
                            </Col>
                        </Row>
                    </Card>
                </>
            )}

            {/* Edit Mode */}
            {isEditing && (
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{}}
                >
                    <Divider />
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <Card
                                title="Personal Information"
                                bordered={false}
                                style={{ borderRadius: 12 }}
                            >
                                <Form.Item
                                    label="First Name"
                                    name="firstName"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="First name" />
                                </Form.Item>
                                <Form.Item
                                    label="Last Name"
                                    name="lastName"
                                    rules={[{ required: true }]}
                                >
                                    <Input placeholder="Last name" />
                                </Form.Item>
                                <Form.Item label="Date of Birth" name="dateOfBirth">
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        placeholder="Select birth date"
                                    />
                                </Form.Item>
                                <Form.Item label="Gender" name="gender">
                                    <Select
                                        options={[
                                            { label: "Male", value: "MALE" },
                                            { label: "Female", value: "FEMALE" },
                                            { label: "Other", value: "OTHER" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item
                                    label="Phone Number"
                                    name="phoneNumber"
                                >
                                    <Input placeholder="Phone number" />
                                </Form.Item>
                                <Form.Item label="Address" name="address">
                                    <Input placeholder="Address" />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col xs={24} md={12}>
                            <Card
                                title="Medical Information"
                                bordered={false}
                                style={{ borderRadius: 12 }}
                            >
                                <Form.Item label="Blood Group" name="bloodGroup">
                                    <Select
                                        options={[
                                            { label: "A+", value: "A_POSITIVE" },
                                            { label: "A-", value: "A_NEGATIVE" },
                                            { label: "B+", value: "B_POSITIVE" },
                                            { label: "B-", value: "B_NEGATIVE" },
                                            { label: "O+", value: "O_POSITIVE" },
                                            { label: "O-", value: "O_NEGATIVE" },
                                            { label: "AB+", value: "AB_POSITIVE" },
                                            { label: "AB-", value: "AB_NEGATIVE" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item label="Allergies" name="allergies">
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                                <Form.Item
                                    label="Chronic Conditions"
                                    name="chronicConditions"
                                >
                                    <Input.TextArea rows={2} />
                                </Form.Item>
                            </Card>
                        </Col>
                        <Col xs={24}>
                            <Card
                                title="Emergency Contact"
                                bordered={false}
                                style={{ borderRadius: 12 }}
                            >
                                <Row gutter={24}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Contact Name"
                                            name="emergencyContactName"
                                        >
                                            <Input placeholder="Emergency contact name" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Contact Phone"
                                            name="emergencyContactPhone"
                                        >
                                            <Input placeholder="Emergency contact phone" />
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
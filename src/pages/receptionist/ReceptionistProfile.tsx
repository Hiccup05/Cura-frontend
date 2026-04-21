import { useEffect, useState } from 'react'
import {
    Card, Form, Input, Button, Descriptions, Tag, Avatar, Upload,
    Typography, Space, message, Spin, Row, Col,
} from 'antd'
import { EditOutlined, CloseOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import api from '../../services/api'
import {
    ReceptionistProfile as ReceptionistProfileData,
    UpdateReceptionistDto
} from '../../types/receptionist'
import { resolveImageUrl } from '../../utils/imageUrl'

const { Title, Text } = Typography

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'red',
}

const PRIMARY = '#056672'
const CARD_BG = '#ffffff'

const ReceptionistProfile = () => {
    const [profile, setProfile] = useState<ReceptionistProfileData | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const [form] = Form.useForm<UpdateReceptionistDto>()

    useEffect(() => {
        api.get('/receptionist')
            .then(r => setProfile(r.data))
            .catch(() => message.error('Failed to load profile'))
            .finally(() => setLoading(false))
    }, [])

    const startEdit = () => {
        form.setFieldsValue({
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            phoneNumber: profile?.phoneNumber,
        })
        setEditing(true)
    }

    const cancelEdit = () => {
        form.resetFields()
        setEditing(false)
    }

    const onSave = async (values: UpdateReceptionistDto) => {
        setSaving(true)
        try {
            const r = await api.put('/receptionist', values)
            setProfile(r.data)
            setEditing(false)
            message.success('Profile updated')
        } catch (err: any) {
            message.error(err.response?.data?.message ?? 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    const refreshProfile = async () => {
        const r = await api.get('/receptionist')
        setProfile(r.data)
    }

    const uploadProfilePicture = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            message.error('Only image files are allowed')
            return false
        }
        if (file.size > 2 * 1024 * 1024) {
            message.error('File size must be under 2MB')
            return false
        }

        const formData = new FormData()
        formData.append('file', file)
        setUploadingPhoto(true)
        try {
            await api.post('/user/profile/picture', formData)
            await refreshProfile()
            message.success('Profile picture updated')
        } catch {
            message.error('Failed to upload profile picture')
        } finally {
            setUploadingPhoto(false)
        }
        return false
    }

    const deleteProfilePicture = async () => {
        setUploadingPhoto(true)
        try {
            await api.delete('/user/profile/picture')
            await refreshProfile()
            message.success('Profile picture removed')
        } catch {
            message.error('Failed to remove profile picture')
        } finally {
            setUploadingPhoto(false)
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        )
    }

    if (!profile) return null

    return (
        <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 24px' }}>
            <Space direction="vertical" size={20} style={{ width: '100%' }}>

                {/* Header */}
                <Card
                    bordered={false}
                    style={{
                        borderRadius: 12,
                        background: CARD_BG,
                    }}
                >
                    <Row align="middle" gutter={24}>
                        <Col>
                            <Avatar
                                size={90}
                                src={resolveImageUrl(profile.profilePictureUrl) || undefined}
                                style={{ backgroundColor: PRIMARY, fontSize: 28 }}
                            >
                                <UserOutlined />
                            </Avatar>
                        </Col>
                        <Col flex="auto">
                            <Title level={2} style={{ margin: 0 }}>
                                {profile.firstName} {profile.lastName}
                            </Title>
                            {profile.id != null && (
                                <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                                    Your unique ID for clinic sharing: <Text copyable strong>{String(profile.id)}</Text>
                                </Text>
                            )}
                            <Text type="secondary">
                                Receptionist <Tag color={STATUS_COLOR[profile.status] ?? 'default'}>{profile.status}</Tag>
                            </Text>
                        </Col>
                        <Col>
                            {!editing ? (
                                <Space>
                                    <Upload accept="image/*" showUploadList={false} beforeUpload={uploadProfilePicture} customRequest={() => {}}>
                                        <Button loading={uploadingPhoto}>Upload Photo</Button>
                                    </Upload>
                                    <Button
                                        danger
                                        disabled={!profile.profilePictureUrl}
                                        loading={uploadingPhoto}
                                        onClick={deleteProfilePicture}
                                    >
                                        Remove Photo
                                    </Button>
                                    <Button icon={<EditOutlined />} onClick={startEdit}>
                                        Edit Profile
                                    </Button>
                                </Space>
                            ) : (
                                <Space>
                                    <Button icon={<SaveOutlined />} type="primary" loading={saving} onClick={() => form.submit()}>
                                        Save
                                    </Button>
                                    <Button icon={<CloseOutlined />} onClick={cancelEdit}>
                                        Cancel
                                    </Button>
                                </Space>
                            )}
                        </Col>
                    </Row>
                </Card>

                {/* View mode */}
                {!editing && (
                    <Card
                        bordered={false}
                        style={{ borderRadius: 12 }}
                    >
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="First Name">
                                {profile.firstName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Last Name">
                                {profile.lastName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone">
                                {profile.phoneNumber ?? <Text type="secondary">Not set</Text>}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                {/* Edit mode */}
                {editing && (
                    <Card
                        bordered={false}
                        style={{ borderRadius: 12 }}
                        title="Edit Profile"
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onSave}
                        >
                            <Form.Item
                                label="First Name"
                                name="firstName"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                label="Last Name"
                                name="lastName"
                                rules={[{ required: true, message: 'Required' }]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item label="Phone" name="phoneNumber">
                                <Input placeholder="+977 98XXXXXXXX" />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                >
                                    Save Changes
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

            </Space>
        </div>
    )
}

export default ReceptionistProfile

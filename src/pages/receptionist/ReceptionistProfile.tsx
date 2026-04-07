import { useEffect, useState } from 'react'
import {
    Card, Form, Input, Button, Descriptions, Tag,
    Typography, Space, message, Spin,
} from 'antd'
import { EditOutlined, CloseOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons'
import api from '../../services/api'

const { Title, Text } = Typography

interface ReceptionistProfile {
    id: number
    firstName: string
    lastName: string
    phoneNumber?: string
    status: string
}

interface UpdateReceptionistDto {
    firstName: string
    lastName: string
    phoneNumber?: string
}

const STATUS_COLOR: Record<string, string> = {
    ACTIVE: 'green',
    INACTIVE: 'red',
}

const ReceptionistProfile = () => {
    const [profile, setProfile] = useState<ReceptionistProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                <Spin size="large" />
            </div>
        )
    }

    if (!profile) return null

    return (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <Space direction="vertical" size={20} style={{ width: '100%' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '50%',
                        background: '#e6f4ff', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, color: '#1677ff',
                    }}>
                        <UserOutlined />
                    </div>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>
                            {profile.firstName} {profile.lastName}
                        </Title>
                        <Text type="secondary">Receptionist</Text>
                    </div>
                </div>

                {/* View mode */}
                {!editing && (
                    <Card
                        extra={
                            <Button icon={<EditOutlined />} onClick={startEdit}>
                                Edit
                            </Button>
                        }
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
                            <Descriptions.Item label="Status">
                                <Tag color={STATUS_COLOR[profile.status] ?? 'default'}>
                                    {profile.status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                {/* Edit mode */}
                {editing && (
                    <Card
                        title="Edit Profile"
                        extra={
                            <Button icon={<CloseOutlined />} onClick={cancelEdit}>
                                Cancel
                            </Button>
                        }
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

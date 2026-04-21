import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Typography, message, Popconfirm, Upload, Image, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { MedicalService, Specialization } from '../../types/admin';
import { serviceSlotDurationMinutes } from '../../utils/serviceSlotDuration';
import { normalizeMedicalServices } from '../../utils/medicalService';

const { Title } = Typography;
const serviceNamePattern = /^[A-Za-z0-9][A-Za-z0-9\s&(),./'-]*$/;

const AdminServices = () => {
    const [services, setServices] = useState<MedicalService[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [editingService, setEditingService] = useState<MedicalService | null>(null);

    const [form] = Form.useForm();

    useEffect(() => {
        fetchServices();
        fetchSpecializations();
    }, []);

    const fetchServices = () => {
        setLoading(true);
        api.get('/admin/services')
            .then((response) => setServices(normalizeMedicalServices(response.data)))
            .catch(() => message.error('Failed to load services'))
            .finally(() => setLoading(false));
    };

    const fetchSpecializations = () => {
        api.get('/admin/specialization')
            .then((response) => setSpecializations(response.data))
            .catch(() => message.error('Failed to load specializations'));
    };

    const openCreateModal = () => {
        setEditingService(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEditModal = (service: MedicalService) => {
        setEditingService(service);
        form.setFieldsValue({
            name: service.name,
            price: service.price,
            durationMinutes: service.durationMinutes,
            description: service.description,
            specializationId: service.specializationId
        });
        setModalOpen(true);
    };

    const handleSubmit = (values: any) => {
        setCreating(true);

        const request = editingService
            ? api.patch(`/admin/services/${editingService.id}`, values)
            : api.post('/admin/services', values);

        request
            .then(() => {
                message.success(editingService ? 'Service updated' : 'Service created');
                setModalOpen(false);
                form.resetFields();
                fetchServices();
            })
            .catch(() => message.error('Failed to save service'))
            .finally(() => setCreating(false));
    };

    const uploadServicePhoto = async (serviceId: number, file: File) => {
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
        try {
            await api.post(`/admin/services/${serviceId}/photo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Service photo uploaded');
            fetchServices();
        } catch {
            message.error('Failed to upload service photo');
        }
        return false;
    };

    const deleteServicePhoto = async (serviceId: number) => {
        try {
            await api.delete(`/admin/services/${serviceId}/photo`);
            message.success('Service photo removed');
            fetchServices();
        } catch {
            message.error('Failed to remove service photo');
        }
    };

    const toggleStatus = (id: number) => {
        api.patch(`/admin/services/${id}/status`)
            .then(() => {
                message.success('Status toggled');
                fetchServices();
            })
            .catch(() => message.error('Failed to toggle status'));
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (price: number) => `NPR ${price}`
        },
        {
            title: 'Duration',
            dataIndex: 'durationMinutes',
            render: (mins: number) => `${mins} mins`
        },
        {
            title: 'Slot (booking)',
            key: 'slotBooking',
            render: (_: unknown, record: MedicalService) => `${serviceSlotDurationMinutes(record)} mins`
        },
        {
            title: 'Specialization',
            dataIndex: 'specializationName'
        },
        {
            title: 'Photo',
            dataIndex: 'photoUrl',
            render: (photoUrl: string | null | undefined, record: MedicalService) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {photoUrl ? (
                        <Image
                            src={photoUrl}
                            alt={record.name}
                            width={56}
                            height={40}
                            style={{ objectFit: 'cover', borderRadius: 6 }}
                            preview={false}
                        />
                    ) : (
                        <div style={{
                            width: 56,
                            height: 40,
                            borderRadius: 6,
                            background: '#f5f5f5',
                            color: '#999',
                            fontSize: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            No image
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            render: (_: any, record: MedicalService) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => openEditModal(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        onClick={() => toggleStatus(record.id)}
                    >
                        {record.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={(file) => uploadServicePhoto(record.id, file)}
                    >
                        <Button size="small">Upload Photo</Button>
                    </Upload>
                    <Popconfirm
                        title="Remove service photo?"
                        onConfirm={() => deleteServicePhoto(record.id)}
                        okText="Yes"
                        cancelText="No"
                        disabled={!record.photoUrl}
                    >
                        <Button size="small" danger disabled={!record.photoUrl}>
                            Remove Photo
                        </Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Medical Services</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openCreateModal}
                >
                    Add Service
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={services}
                columns={columns}
                pagination={{ pageSize: 10 }}
            />

            {/* Create / Edit Modal — same form for both */}
            <Modal
                title={editingService ? 'Edit Service' : 'Add Service'}
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Service name is required' },
                            { whitespace: true, message: 'Service name cannot be empty' },
                            { min: 2, message: 'Service name must be at least 2 characters' },
                            { max: 120, message: 'Service name must be at most 120 characters' },
                            { pattern: serviceNamePattern, message: 'Service name contains invalid characters' }
                        ]}
                    >
                        <Input maxLength={120} />
                    </Form.Item>
                    <Form.Item
                        label="Price (NPR)"
                        name="price"
                        rules={[
                            { required: true, message: 'Price is required' },
                            { type: 'number', min: 1, max: 1000000, message: 'Price must be between 1 and 1,000,000' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} max={1000000} precision={2} />
                    </Form.Item>
                    <Form.Item
                        label="Duration (minutes)"
                        name="durationMinutes"
                        rules={[
                            { required: true, message: 'Duration is required' },
                            { type: 'number', min: 5, max: 480, message: 'Duration must be between 5 and 480 minutes' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={5} max={480} precision={0} />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                        rules={[{ max: 1000, message: 'Description must be at most 1000 characters' }]}
                    >
                        <Input.TextArea rows={3} maxLength={1000} showCount />
                    </Form.Item>
                    <Form.Item
                        label="Specialization"
                        name="specializationId"
                        rules={[{ required: true, message: 'Specialization is required' }]}
                    >
                        <Select
                            placeholder="Select specialization"
                            options={specializations.map(s => ({
                                label: s.name,
                                value: s.id
                            }))}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={creating} block>
                        {editingService ? 'Update' : 'Create'}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminServices;
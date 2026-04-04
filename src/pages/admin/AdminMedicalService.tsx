import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { MedicalService, Specialization } from '../../types/admin';

const { Title } = Typography;

const AdminServices = () => {
    const [services, setServices] = useState<MedicalService[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [editingService, setEditingService] = useState<MedicalService | null>(null);

    const [form] = Form.useForm();



    const fetchServices = () => {
        setLoading(true);
        api.get('/admin/services')
            .then((response) => setServices(response.data))
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
            title: 'Specialization',
            dataIndex: 'specializationName'
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
                    <Form.Item label="Name" name="name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Price (NPR)" name="price" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item label="Duration (minutes)" name="durationMinutes" rules={[{ required: true }]}>
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item label="Specialization" name="specializationId" rules={[{ required: true }]}>
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
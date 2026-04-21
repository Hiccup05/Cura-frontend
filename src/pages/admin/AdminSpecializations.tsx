import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography, message, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { Specialization } from '../../types/admin';

const { Title } = Typography;
const specializationNamePattern = /^[A-Za-z][A-Za-z\s&(),./'-]*$/;

const AdminSpecializations = () => {
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSpecializations();
    }, []);

    const fetchSpecializations = () => {
        setLoading(true);
        api.get('/admin/specialization')
            .then((response) => setSpecializations(response.data))
            .catch(() => message.error('Failed to load specializations'))
            .finally(() => setLoading(false));
    };

    const handleCreate = (values: { name: string; slotDuration: number }) => {
        setCreating(true);
        api.post('/admin/specialization', values)
            .then(() => {
                message.success('Specialization created');
                setModalOpen(false);
                form.resetFields();
                fetchSpecializations();
            })
            .catch(() => message.error('Failed to create specialization'))
            .finally(() => setCreating(false));
    };

    const handleDelete = (id: number) => {
        api.delete(`/admin/specialization/${id}`)
            .then(() => {
                message.success('Specialization deleted');
                fetchSpecializations();
            })
            .catch(() => message.error('Failed to delete specialization'));
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
            title: 'Slot (mins)',
            dataIndex: 'slotDuration',
            render: (v: number | undefined) => (v != null ? v : '—')
        },
        {
            title: 'Action',
            render: (_: any, record: Specialization) => (

                <Popconfirm
                    title="Delete this specialization?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button danger icon={<DeleteOutlined />} size="small">
                        Delete
                    </Button>
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Specializations</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    Add Specialization
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={specializations}
                columns={columns}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Add Specialization"
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                            { required: true, message: 'Name is required' },
                            { whitespace: true, message: 'Name cannot be empty' },
                            { min: 2, message: 'Name must be at least 2 characters' },
                            { max: 100, message: 'Name must be at most 100 characters' },
                            { pattern: specializationNamePattern, message: 'Name contains invalid characters' }
                        ]}
                    >
                        <Input placeholder="e.g. Cardiology" maxLength={100} />
                    </Form.Item>
                    <Form.Item
                        label="Slot duration (minutes)"
                        name="slotDuration"
                        rules={[{ required: true, message: 'Slot duration is required' }]}
                        extra="All services under this specialization use this slot length when booking."
                    >
                        <InputNumber min={5} max={480} style={{ width: '100%' }} placeholder="e.g. 30" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={creating} block>
                        Create
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminSpecializations;
import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { Specialization } from '../../types/admin';

const { Title } = Typography;

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

    const handleCreate = (values: { name: string }) => {
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
            title: 'Action',
            render: (_: any, record: Specialization) => (
                // Popconfirm — shows "are you sure?" before deleting
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
                        rules={[{ required: true, message: 'Name is required' }]}
                    >
                        <Input placeholder="e.g. Cardiology" />
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
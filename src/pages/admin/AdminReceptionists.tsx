import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, Select, Typography, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { Receptionist, ReceptionistStatus } from '../../types/admin';

const { Title } = Typography;

const statusColors: Record<ReceptionistStatus, string> = {
    ACTIVE: 'green',
    INACTIVE: 'red'
};

const AdminReceptionists = () => {
    const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // form instance — lets us control the form programmatically
    const [form] = Form.useForm();

    useEffect(() => {
        fetchReceptionists();
    }, []);

    const fetchReceptionists = () => {
        setLoading(true);
        api.get('/admin/receptionists')
            .then((response) => setReceptionists(response.data))
            .catch(() => message.error('Failed to load receptionists'))
            .finally(() => setLoading(false));
    };

    const changeStatus = (id: number, status: ReceptionistStatus) => {
        api.patch(`/admin/receptionists/${id}/status`, { status })
            .then(() => {
                message.success('Status updated');
                fetchReceptionists();
            })
            .catch(() => message.error('Failed to update status'));
    };

    const handleCreate = (values: any) => {
        setCreating(true);
        api.post(`/admin/receptionists/${values.userId}`, {
            firstName: values.firstName,
            lastName: values.lastName,
            phoneNumber: values.phoneNumber
        })
            .then(() => {
                message.success('Receptionist created');
                setModalOpen(false);
                form.resetFields();
                fetchReceptionists();
            })
            .catch(() => message.error('Failed to create receptionist'))
            .finally(() => setCreating(false));
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        {
            title: 'Name',
            render: (_: any, record: Receptionist) =>
                `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim() || '—'
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status: ReceptionistStatus) =>
                <Tag color={statusColors[status]}>{status}</Tag>
        },
        {
            title: 'Change Status',
            render: (_: any, record: Receptionist) => (
                <Select
                    value={record.status}
                    style={{ width: 120 }}
                    onChange={(value) => changeStatus(record.id, value)}
                    options={[
                        { label: 'Active', value: 'ACTIVE' },
                        { label: 'Inactive', value: 'INACTIVE' }
                    ]}
                />
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Receptionists</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    Add Receptionist
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={receptionists}
                columns={columns}
                pagination={{ pageSize: 10 }}
            />

            {/* Create Modal */}
            <Modal
                title="Add Receptionist"
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item label="User ID" name="userId" rules={[{ required: true }]}>
                        <Input type="number" placeholder="Existing user ID" />
                    </Form.Item>
                    <Form.Item label="First Name" name="firstName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Last Name" name="lastName" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="Phone Number" name="phoneNumber" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={creating} block>
                        Create
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminReceptionists;
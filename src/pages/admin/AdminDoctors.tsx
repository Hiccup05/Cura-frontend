import { useEffect, useState } from 'react';
import { Table, Tag, Button, Select, Typography, message, Modal, Form, Input } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { Doctor, DoctorStatus, Specialization } from '../../types/admin';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const statusColors: Record<DoctorStatus, string> = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    ON_LEAVE: 'orange'
};

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();
    const navigate = useNavigate();

    useEffect(() => {
        fetchDoctors();
        fetchSpecializations();
    }, []);

    const fetchDoctors = () => {
        setLoading(true);
        api.get('/admin/doctors')
            .then((response) => setDoctors(response.data))
            .catch(() => message.error('Failed to load doctors'))
            .finally(() => setLoading(false));
    };

    const fetchSpecializations = () => {
        api.get('/admin/specialization')
            .then((response) => setSpecializations(response.data))
            .catch(() => message.error('Failed to load specializations'));
    };

    const changeStatus = (id: number, status: DoctorStatus) => {
        api.patch(`/admin/doctors/${id}/status`, { doctorStatus: status })
            .then(() => {
                message.success('Doctor status updated');
                fetchDoctors();
            })
            .catch(() => message.error('Failed to update status'));
    };

    const handleCreate = (values: any) => {
        setCreating(true);
        api.post(`/admin/doctors/${values.userId}`, {
            specializationIds: values.specializationIds,
            yearsOfExperience: values.yearsOfExperience,
            licenseNumber: values.licenseNumber
        })
            .then(() => {
                message.success('Doctor created successfully');
                setModalOpen(false);
                form.resetFields();
                fetchDoctors();
            })
            .catch(() => message.error('Failed to create doctor'))
            .finally(() => setCreating(false));
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        {
            title: 'Name',
            render: (_: any, record: Doctor) =>
                `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim() || '—'
        },
        {
            title: 'License Number',
            dataIndex: 'licenseNumber'
        },
        {
            title: 'Experience',
            dataIndex: 'yearsOfExperience',
            render: (value: number) => `${value} yrs`
        },
        {
            title: 'Specializations',
            dataIndex: 'specialization',
            render: (specs: Doctor['specialization']) =>
                specs.map(s => <Tag key={s.id}>{s.name}</Tag>)
        },
        {
            title: 'Status',
            dataIndex: 'doctorStatus',
            render: (status: DoctorStatus) =>
                <Tag color={statusColors[status]}>{status}</Tag>
        },
        {
            title: 'Change Status',
            render: (_: any, record: Doctor) => (
                <Select
                    value={record.doctorStatus}
                    style={{ width: 130 }}
                    onChange={(value) => changeStatus(record.id, value)}
                    options={[
                        { label: 'Active', value: 'ACTIVE' },
                        { label: 'Inactive', value: 'INACTIVE' },
                        { label: 'On Leave', value: 'ON_LEAVE' },
                        { label: 'Pending', value: 'PENDING' }
                    ]}
                />
            )
        },
        {
            title: 'Detail',
            render: (_: any, record: Doctor) => (
                <Button size="small" onClick={() => navigate(`/admin/doctors/${record.id}`)}>
                    View
                </Button>
            )
        }
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Doctors</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setModalOpen(true)}
                >
                    Add Doctor
                </Button>
            </div>

            <Table
                rowKey="id"
                loading={loading}
                dataSource={doctors}
                columns={columns}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Promote User to Doctor"
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleCreate}>
                    <Form.Item
                        label="User ID"
                        name="userId"
                        rules={[{ required: true, message: 'User ID is required' }]}
                    >
                        <Input type="number" placeholder="Existing user ID" />
                    </Form.Item>
                    <Form.Item
                        label="License Number"
                        name="licenseNumber"
                        rules={[{ required: true, message: 'License number is required' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Years of Experience"
                        name="yearsOfExperience"
                        rules={[{ required: true, message: 'Years of experience is required' }]}
                    >
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item
                        label="Specializations"
                        name="specializationIds"
                        rules={[{ required: true, message: 'Select at least one specialization' }]}
                    >
                        {/* mode="multiple" allows selecting more than one */}
                        <Select
                            mode="multiple"
                            placeholder="Select specializations"
                            options={specializations.map(s => ({
                                label: s.name,
                                value: s.id
                            }))}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={creating} block>
                        Create Doctor
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDoctors;
import { useEffect, useState } from 'react';
import { Table, Tag, Button, Select, Typography, message, Modal, Form, Input, InputNumber } from 'antd';
import type { TableColumnsType } from 'antd';
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

type DoctorRecord = Doctor & {
    doctorName?: string;
    name?: string;
    user?: { firstName?: string; lastName?: string; fullName?: string; name?: string };
};

type CreateDoctorFormValues = {
    userId: number;
    firstName: string;
    lastName: string;
    specializationIds: number[];
    yearsOfExperience: number;
    licenseNumber: string;
};

const namePattern = /^[A-Za-z][A-Za-z\s'-]*$/;
const licensePattern = /^[A-Za-z0-9/-]{3,50}$/;

const isValidNamePart = (value?: string) => {
    if (!value) return false;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 && normalized !== 'null' && normalized !== 'undefined';
};

const getDoctorDisplayName = (doctor: DoctorRecord) => {
    const parts = [doctor.firstName, doctor.lastName, doctor.user?.firstName, doctor.user?.lastName]
        .map((value) => (value ?? '').toString().trim())
        .filter((value) => isValidNamePart(value));
    if (parts.length > 0) return parts.join(' ');
    return doctor.doctorName || doctor.name || doctor.user?.fullName || doctor.user?.name || '—';
};

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState<DoctorRecord[]>([]);
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
            .then((response) => setDoctors(response.data as DoctorRecord[]))
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

    const handleCreate = (values: CreateDoctorFormValues) => {
        setCreating(true);
        api.post(`/admin/doctors/${values.userId}`, {
            firstName: values.firstName,
            lastName: values.lastName,
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

    const columns: TableColumnsType<DoctorRecord> = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        {
            title: 'Name',
            render: (_, record) => getDoctorDisplayName(record)
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
            render: (specs: DoctorRecord['specialization']) =>
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
            render: (_, record) => (
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
            render: (_, record) => (
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
                        <InputNumber style={{ width: '100%' }} min={1} precision={0} placeholder="Existing user ID" />
                    </Form.Item>
                    <Form.Item
                        label="First Name"
                        name="firstName"
                        rules={[
                            { required: true, message: 'First name is required' },
                            { whitespace: true, message: 'First name cannot be empty' },
                            { min: 2, message: 'First name must be at least 2 characters' },
                            { max: 60, message: 'First name must be at most 60 characters' },
                            { pattern: namePattern, message: 'First name contains invalid characters' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Last Name"
                        name="lastName"
                        rules={[
                            { required: true, message: 'Last name is required' },
                            { whitespace: true, message: 'Last name cannot be empty' },
                            { min: 2, message: 'Last name must be at least 2 characters' },
                            { max: 60, message: 'Last name must be at most 60 characters' },
                            { pattern: namePattern, message: 'Last name contains invalid characters' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="License Number"
                        name="licenseNumber"
                        rules={[
                            { required: true, message: 'License number is required' },
                            { whitespace: true, message: 'License number cannot be empty' },
                            { pattern: licensePattern, message: 'Use 3-50 letters, numbers, "/" or "-"' }
                        ]}
                    >
                        <Input maxLength={50} />
                    </Form.Item>
                    <Form.Item
                        label="Years of Experience"
                        name="yearsOfExperience"
                        rules={[
                            { required: true, message: 'Years of experience is required' },
                            { type: 'number', min: 0, max: 60, message: 'Experience must be between 0 and 60 years' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} max={60} precision={0} />
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
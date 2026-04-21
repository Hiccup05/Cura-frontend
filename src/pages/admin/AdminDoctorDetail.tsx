import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Table, Button, Modal, Form, Input,
    Select, Tag, message, Popconfirm, TimePicker, DatePicker, InputNumber
} from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { Doctor, Schedule, Leave, Specialization } from '../../types/admin';


const dayOptions = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY',
    'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
].map(d => ({ label: d, value: d }));

type DoctorRecord = Doctor & {
    doctorName?: string;
    name?: string;
    user?: { firstName?: string; lastName?: string; fullName?: string; name?: string };
};

type UpdateDoctorFormValues = {
    firstName: string;
    lastName: string;
    licenseNumber: string;
    yearsOfExperience: number;
    specializationIds: number[];
};

type ScheduleFormValues = {
    dayOfWeek: string;
    startTime: dayjs.Dayjs;
    endTime: dayjs.Dayjs;
    maxAppointments: number;
};

type LeaveFormValues = {
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    reason: string;
};

const isValidNamePart = (value?: string) => {
    if (!value) return false;
    const normalized = value.trim().toLowerCase();
    return normalized.length > 0 && normalized !== 'null' && normalized !== 'undefined';
};

const getDoctorDisplayName = (doctor: DoctorRecord | null) => {
    if (!doctor) return 'Doctor';
    const parts = [doctor.firstName, doctor.lastName, doctor.user?.firstName, doctor.user?.lastName]
        .map((value) => (value ?? '').toString().trim())
        .filter((value) => isValidNamePart(value));
    if (parts.length > 0) return parts.join(' ');
    return doctor.doctorName || doctor.name || doctor.user?.fullName || doctor.user?.name || `Doctor ${doctor.id}`;
};

const namePattern = /^[A-Za-z][A-Za-z\s'-]*$/;
const licensePattern = /^[A-Za-z0-9/-]{3,50}$/;

const AdminDoctorDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);

    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [doctorModalOpen, setDoctorModalOpen] = useState(false);

    const [scheduleForm] = Form.useForm();
    const [leaveForm] = Form.useForm();
    const [doctorForm] = Form.useForm();

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([
            api.get(`/admin/doctors/doctor/${id}`),
            api.get(`/admin/doctors/${id}/schedule`),
            api.get(`/admin/doctors/${id}/leave`),
            api.get('/admin/specialization')
        ])
            .then(([doctorRes, scheduleRes, leaveRes, specRes]) => {
                setDoctor(doctorRes.data);
                setSchedules(scheduleRes.data);
                setLeaves(leaveRes.data);
                setSpecializations(specRes.data);
            })
            .catch(() => message.error('Failed to load doctor details'))
            .finally(() => setLoading(false));
    };

    const openDoctorModal = () => {
        const doctorRecord = doctor as DoctorRecord | null;
        doctorForm.setFieldsValue({
            firstName: doctorRecord?.firstName || doctorRecord?.user?.firstName,
            lastName: doctorRecord?.lastName || doctorRecord?.user?.lastName,
            licenseNumber: doctor?.licenseNumber,
            yearsOfExperience: doctor?.yearsOfExperience,
            specializationIds: doctor?.specialization.map(s => s.id)
        });
        setDoctorModalOpen(true);
    };

    const handleDoctorUpdate = (values: UpdateDoctorFormValues) => {
        api.patch(`/admin/doctors/${id}`, values)
            .then(() => {
                message.success('Doctor updated');
                setDoctorModalOpen(false);
                fetchAll();
            })
            .catch(() => message.error('Failed to update doctor'));
    };

    const openCreateSchedule = () => {
        setEditingSchedule(null);
        scheduleForm.resetFields();
        setScheduleModalOpen(true);
    };

    const openEditSchedule = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        scheduleForm.setFieldsValue({
            dayOfWeek: schedule.dayOfWeek,
            startTime: dayjs(schedule.startTime, 'HH:mm:ss'),
            endTime: dayjs(schedule.endTime, 'HH:mm:ss'),
            maxAppointments: schedule.maxAppointments
        });
        setScheduleModalOpen(true);
    };

    const handleScheduleSubmit = (values: ScheduleFormValues) => {
        const payload = {
            dayOfWeek: values.dayOfWeek,
            startTime: values.startTime.format('HH:mm:ss'),
            endTime: values.endTime.format('HH:mm:ss'),
            maxAppointments: values.maxAppointments
        };

        const request = editingSchedule
            ? api.patch(`/admin/doctors/${id}/schedules/${editingSchedule.id}`, payload)
            : api.post(`/admin/doctors/${id}/schedules`, payload);

        request
            .then(() => {
                message.success(editingSchedule ? 'Schedule updated' : 'Schedule created');
                setScheduleModalOpen(false);
                scheduleForm.resetFields();
                fetchAll();
            })
            .catch(() => message.error('Failed to save schedule'));
    };

    const deleteSchedule = (scheduleId: number) => {
        api.delete(`/admin/doctors/${id}/schedules/${scheduleId}`)
            .then(() => {
                message.success('Schedule deleted');
                fetchAll();
            })
            .catch(() => message.error('Failed to delete schedule'));
    };

    const toggleSchedule = (scheduleId: number) => {
        api.patch(`/admin/doctors/${id}/schedules/${scheduleId}/toggle`)
            .then(() => {
                message.success('Schedule toggled');
                fetchAll();
            })
            .catch(() => message.error('Failed to toggle schedule'));
    };


    const handleLeaveCreate = (values: LeaveFormValues) => {
        api.post(`/admin/doctors/${id}/leave`, {
            startDate: values.startDate.format('YYYY-MM-DD'),
            endDate: values.endDate.format('YYYY-MM-DD'),
            reason: values.reason
        })
            .then(() => {
                message.success('Leave created');
                setLeaveModalOpen(false);
                leaveForm.resetFields();
                fetchAll();
            })
            .catch((error) => {
                message.error(error?.response?.data?.message || 'Failed to create leave');
                // Refresh anyway so existing overlapping leaves are visible
                fetchAll();
            });
    };

    const deleteLeave = (leaveId: number) => {
        api.delete(`/admin/doctors/${id}/leave/${leaveId}`)
            .then(() => {
                message.success('Leave deleted');
                fetchAll();
            })
            .catch(() => message.error('Failed to delete leave'));
    };

    const scheduleColumns: TableColumnsType<Schedule> = [
        { title: 'Day', dataIndex: 'dayOfWeek' },
        { title: 'Start', dataIndex: 'startTime' },
        { title: 'End', dataIndex: 'endTime' },
        { title: 'Max Appointments', dataIndex: 'maxAppointments' },
        {
            title: 'Available',
            dataIndex: 'isAvailable',
            render: (val: boolean) => <Tag color={val ? 'green' : 'red'}>{val ? 'Yes' : 'No'}</Tag>
        },
        {
            title: 'Actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" icon={<EditOutlined />} onClick={() => openEditSchedule(record)}>
                        Edit
                    </Button>
                    <Button size="small" onClick={() => toggleSchedule(record.id)}>
                        Toggle
                    </Button>
                    <Popconfirm title="Delete this schedule?" onConfirm={() => deleteSchedule(record.id)}>
                        <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
                    </Popconfirm>
                </div>
            )
        }
    ];

    const leaveColumns: TableColumnsType<Leave> = [
        { title: 'Start Date', dataIndex: 'startDate' },
        { title: 'End Date', dataIndex: 'endDate' },
        { title: 'Reason', dataIndex: 'reason' },
        {
            title: 'Actions',
            render: (_, record) => (
                <Popconfirm title="Delete this leave?" onConfirm={() => deleteLeave(record.id)}>
                    <Button danger size="small" icon={<DeleteOutlined />}>Delete</Button>
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/admin/doctors')}
                style={{ marginBottom: 24 }}
            >
                Back to Doctors
            </Button>

            {/* Doctor Info Card */}
            <Card
                loading={loading}
                style={{ marginBottom: 24 }}
                title={getDoctorDisplayName(doctor)}
                extra={
                    <Button icon={<EditOutlined />} onClick={openDoctorModal}>
                        Edit
                    </Button>
                }
            >
                <p><strong>Name:</strong> {getDoctorDisplayName(doctor)}</p>
                <p><strong>License:</strong> {doctor?.licenseNumber}</p>
                <p><strong>Experience:</strong> {doctor?.yearsOfExperience} years</p>
                <p><strong>Status:</strong> <Tag>{doctor?.doctorStatus}</Tag></p>
                <p><strong>Specializations:</strong> {doctor?.specialization.map(s => <Tag key={s.id}>{s.name}</Tag>)}</p>
            </Card>

            {/* Schedules */}
            <Card
                title="Schedules"
                style={{ marginBottom: 24 }}
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={openCreateSchedule}>
                        Add Schedule
                    </Button>
                }
            >
                <Table rowKey="id" dataSource={schedules} columns={scheduleColumns} pagination={false} />
            </Card>

            {/* Leaves */}
            <Card
                title="Leaves"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setLeaveModalOpen(true)}>
                        Add Leave
                    </Button>
                }
            >
                <Table rowKey="id" dataSource={leaves} columns={leaveColumns} pagination={false} />
            </Card>

            {/* Doctor Edit Modal */}
            <Modal title="Update Doctor" open={doctorModalOpen} onCancel={() => setDoctorModalOpen(false)} footer={null}>
                <Form form={doctorForm} layout="vertical" onFinish={handleDoctorUpdate}>
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
                        <Select
                            mode="multiple"
                            options={specializations.map(s => ({ label: s.name, value: s.id }))}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Update</Button>
                </Form>
            </Modal>

            <Modal
                title={editingSchedule ? 'Edit Schedule' : 'Add Schedule'}
                open={scheduleModalOpen}
                onCancel={() => { setScheduleModalOpen(false); scheduleForm.resetFields(); }}
                footer={null}
            >
                <Form form={scheduleForm} layout="vertical" onFinish={handleScheduleSubmit}>
                    <Form.Item label="Day" name="dayOfWeek" rules={[{ required: true, message: 'Day is required' }]}>
                        <Select options={dayOptions} />
                    </Form.Item>
                    <Form.Item label="Start Time" name="startTime" rules={[{ required: true, message: 'Start time is required' }]}>
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="End Time"
                        name="endTime"
                        dependencies={['startTime']}
                        rules={[
                            { required: true, message: 'End time is required' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startTime = getFieldValue('startTime');
                                    if (!value || !startTime || value.isAfter(startTime)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('End time must be later than start time'));
                                }
                            })
                        ]}
                    >
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Max Appointments"
                        name="maxAppointments"
                        rules={[
                            { required: true, message: 'Max appointments is required' },
                            { type: 'number', min: 1, max: 200, message: 'Must be between 1 and 200' }
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} max={200} precision={0} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        {editingSchedule ? 'Update' : 'Create'}
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Add Leave"
                open={leaveModalOpen}
                onCancel={() => { setLeaveModalOpen(false); leaveForm.resetFields(); }}
                footer={null}
            >
                <Form form={leaveForm} layout="vertical" onFinish={handleLeaveCreate}>
                    <Form.Item label="Start Date" name="startDate" rules={[{ required: true, message: 'Start date is required' }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="End Date"
                        name="endDate"
                        dependencies={['startDate']}
                        rules={[
                            { required: true, message: 'End date is required' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDate = getFieldValue('startDate');
                                    if (!value || !startDate || value.isSame(startDate, 'day') || value.isAfter(startDate, 'day')) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('End date must be on or after start date'));
                                }
                            })
                        ]}
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Reason"
                        name="reason"
                        rules={[
                            { required: true, message: 'Reason is required' },
                            { whitespace: true, message: 'Reason cannot be empty' },
                            { min: 5, message: 'Reason must be at least 5 characters' },
                            { max: 500, message: 'Reason must be at most 500 characters' }
                        ]}
                    >
                        <Input.TextArea rows={3} maxLength={500} showCount />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Create Leave</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default AdminDoctorDetail;
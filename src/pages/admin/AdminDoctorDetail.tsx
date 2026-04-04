import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Table, Button, Modal, Form, Input,
    Select, Tag, Typography, message, Popconfirm, TimePicker, DatePicker
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { Doctor, Schedule, Leave, DayOfWeek, Specialization } from '../../types/admin';

const { Title } = Typography;

// all days for the dropdown
const dayOptions = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY',
    'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
].map(d => ({ label: d, value: d }));

const AdminDoctorDetail = () => {
    const { id } = useParams(); // gets the doctor id from the URL
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);

    // modal states
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
        doctorForm.setFieldsValue({
            licenseNumber: doctor?.licenseNumber,
            yearsOfExperience: doctor?.yearsOfExperience,
            specializationIds: doctor?.specialization.map(s => s.id)
        });
        setDoctorModalOpen(true);
    };

    const handleDoctorUpdate = (values: any) => {
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

    const handleScheduleSubmit = (values: any) => {
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


    const handleLeaveCreate = (values: any) => {
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
            .catch(() => message.error('Failed to create leave'));
    };

    const deleteLeave = (leaveId: number) => {
        api.delete(`/admin/doctors/${id}/leave/${leaveId}`)
            .then(() => {
                message.success('Leave deleted');
                fetchAll();
            })
            .catch(() => message.error('Failed to delete leave'));
    };

    const scheduleColumns = [
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
            render: (_: any, record: Schedule) => (
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

    const leaveColumns = [
        { title: 'Start Date', dataIndex: 'startDate' },
        { title: 'End Date', dataIndex: 'endDate' },
        { title: 'Reason', dataIndex: 'reason' },
        {
            title: 'Actions',
            render: (_: any, record: Leave) => (
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
                title={`${doctor?.firstName ?? ''} ${doctor?.lastName ?? ''}`.trim() || 'Doctor'}
                extra={
                    <Button icon={<EditOutlined />} onClick={openDoctorModal}>
                        Edit
                    </Button>
                }
            >
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
                    <Form.Item label="License Number" name="licenseNumber">
                        <Input />
                    </Form.Item>
                    <Form.Item label="Years of Experience" name="yearsOfExperience">
                        <Input type="number" />
                    </Form.Item>
                    <Form.Item label="Specializations" name="specializationIds">
                        <Select
                            mode="multiple"
                            options={specializations.map(s => ({ label: s.name, value: s.id }))}
                        />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Update</Button>
                </Form>
            </Modal>

        </div>
    );
};

export default AdminDoctorDetail;
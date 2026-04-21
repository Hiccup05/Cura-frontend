import { useEffect, useState } from 'react';
import {
    Table, Tag, Button, Modal, Typography,
    message, Popconfirm, Descriptions, Card, Spin, Segmented, Space, DatePicker
} from 'antd';
import api from '../../services/api';
import { AppointmentSummary, AppointmentResponse, AppointmentStatus } from '../../types/appointment';

const { Title, Text } = Typography;
type AppointmentSection = 'today' | 'upcoming' | 'history' | 'search';
type DateCategory = 'today' | 'upcoming' | 'history' | 'invalid';

const statusColors: Record<AppointmentStatus, string> = {
    PENDING: 'gold',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    COMPLETED: 'blue'
};

const categorizeDate = (dateText: string, today: Date): DateCategory => {
    const parsed = new Date(`${dateText}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return 'invalid';
    if (parsed.getTime() === today.getTime()) return 'today';
    if (parsed.getTime() > today.getTime()) return 'upcoming';
    return 'history';
};

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<AppointmentSection>('today');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = () => {
        setLoading(true);
        api.get('/appointment')
            .then((response) => setAppointments(response.data))
            .catch(() => message.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    };

    const viewDetail = (id: number) => {
        setDetailLoading(true);
        setModalOpen(true);
        setSelectedAppointment(null);
        api.get(`/appointment/${id}`)
            .then((response) => setSelectedAppointment(response.data))
            .catch(() => message.error('Failed to load appointment details'))
            .finally(() => setDetailLoading(false));
    };

    const cancelAppointment = (id: number) => {
        api.patch(`/appointment/${id}`)
            .then(() => {
                message.success('Appointment cancelled');
                setModalOpen(false);
                fetchAppointments();
            })
            .catch((error) => {
                // reads your ErrorResponse.message field
                message.error(error.response?.data?.message || 'Failed to cancel appointment');
            });
    };

    const initiatePayment = (id: number) => {
        api.post(`/payment/${id}`)
            .then((response) => {
                // response.data is the Khalti payment URL string
                window.location.href = response.data;
            })
            .catch((error) => {
                message.error(error.response?.data?.message || 'Failed to initiate payment');
            });
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'appointmentDate'
        },
        {
            title: 'Time',
            dataIndex: 'appointmentTime'
        },
        {
            title: 'Service',
            dataIndex: 'medicalServiceName'
        },
        {
            title: 'Status',
            dataIndex: 'appointmentStatus',
            render: (status: AppointmentStatus) => (
                <Tag color={statusColors[status]}>{status}</Tag>
            )
        },
        {
            title: 'Paid',
            dataIndex: 'isPaid',
            render: (isPaid: boolean) => (
                <Tag color={isPaid ? 'green' : 'red'}>{isPaid ? 'Yes' : 'No'}</Tag>
            )
        },
        {
            title: 'Actions',
            render: (_: any, record: AppointmentSummary) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button size="small" onClick={() => viewDetail(record.appointmentId)}>
                        View
                    </Button>

                    {/* Pay button — only if PENDING and not paid */}
                    {record.appointmentStatus === 'PENDING' && !record.isPaid && (
                        <Button
                            size="small"
                            type="primary"
                            onClick={() => initiatePayment(record.appointmentId)}
                        >
                            Pay
                        </Button>
                    )}

                    {/* Cancel button — only if PENDING or CONFIRMED */}
                    {(record.appointmentStatus === 'PENDING' || record.appointmentStatus === 'CONFIRMED') && (
                        <Popconfirm
                            title="Cancel this appointment?"
                            description="This cannot be undone."
                            onConfirm={() => cancelAppointment(record.appointmentId)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button size="small" danger>Cancel</Button>
                        </Popconfirm>
                    )}
                </div>
            )
        }
    ];

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const filteredAppointments = appointments.filter((appointment) => {
        if (activeSection === 'search') {
            if (!selectedDate) {
                return false;
            }
            return appointment.appointmentDate === selectedDate;
        }

        const category = categorizeDate(appointment.appointmentDate, startOfToday);
        if (category === 'invalid') {
            return activeSection === 'history';
        }

        return category === activeSection;
    });

    const counts = appointments.reduce(
        (acc, appointment) => {
            const category = categorizeDate(appointment.appointmentDate, startOfToday);
            if (category === 'today') acc.today += 1;
            else if (category === 'upcoming') acc.upcoming += 1;
            else acc.history += 1;
            return acc;
        },
        { today: 0, upcoming: 0, history: 0 }
    );

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Space direction="vertical" size={16} style={{ width: '100%' }}>
                    <Title level={4} style={{ marginBottom: 0 }}>My Appointments</Title>
                    <Segmented
                        block
                        value={activeSection}
                        onChange={(value) => {
                            const next = value as AppointmentSection;
                            setActiveSection(next);
                            if (next !== 'search') {
                                setSelectedDate(null);
                            }
                        }}
                        options={[
                            { label: `Today (${counts.today})`, value: 'today' },
                            { label: `Upcoming (${counts.upcoming})`, value: 'upcoming' },
                            { label: `History (${counts.history})`, value: 'history' },
                            { label: 'Search by Date', value: 'search' }
                        ]}
                    />
                    {activeSection === 'search' && (
                        <DatePicker
                            allowClear
                            style={{ width: 260 }}
                            placeholder="Search by specific date"
                            onChange={(value) => setSelectedDate(value ? value.format('YYYY-MM-DD') : null)}
                        />
                    )}
                </Space>
                <Table
                    rowKey="appointmentId"
                    loading={loading}
                    dataSource={filteredAppointments}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText:
                            activeSection === 'search'
                                ? (selectedDate ? `No appointments on ${selectedDate}.` : 'Select a date to search appointments.')
                                : `No ${activeSection} appointments.`
                    }}
                />
            </Card>

            {/* Detail Modal */}
            <Modal
                title="Appointment Details"
                open={modalOpen}
                onCancel={() => {
                    setModalOpen(false);
                    setSelectedAppointment(null);
                }}
                footer={null}
                width={600}
            >
                {detailLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : selectedAppointment && (
                    <div>
                        <Descriptions column={2} bordered size="small">
                            <Descriptions.Item label="Date">
                                {selectedAppointment.appointmentDate}
                            </Descriptions.Item>
                            <Descriptions.Item label="Time">
                                {selectedAppointment.appointmentTime}
                            </Descriptions.Item>
                            <Descriptions.Item label="Service">
                                {selectedAppointment.medicalServiceName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Price">
                                NPR {selectedAppointment.price}
                            </Descriptions.Item>
                            <Descriptions.Item label="Duration">
                                {selectedAppointment.durationMinutes} mins
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={statusColors[selectedAppointment.status]}>
                                    {selectedAppointment.status}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Reason" span={2}>
                                {selectedAppointment.reason || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Paid" span={2}>
                                <Tag color={selectedAppointment.isPaid ? 'green' : 'red'}>
                                    {selectedAppointment.isPaid ? 'Yes' : 'No'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Prescription — only show if exists and has description */}
                        {selectedAppointment.prescriptionResponseDto?.description && (
                            <Card
                                title="Prescription"
                                size="small"
                                style={{ marginTop: 16 }}
                                bordered={false}
                            >
                                <Text>{selectedAppointment.prescriptionResponseDto.description}</Text>
                            </Card>
                        )}

                        {/* Cancel button inside modal */}
                        {(selectedAppointment.status === 'PENDING' || selectedAppointment.status === 'CONFIRMED') && (
                            <div style={{ marginTop: 16, textAlign: 'right' }}>
                                <Popconfirm
                                    title="Cancel this appointment?"
                                    description="This cannot be undone."
                                    onConfirm={() => cancelAppointment(selectedAppointment.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button danger>Cancel Appointment</Button>
                                </Popconfirm>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PatientAppointments;
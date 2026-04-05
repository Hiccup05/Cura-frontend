import { useEffect, useState } from 'react';
import {
    Table, Tag, Button, Modal, Typography,
    message, Popconfirm, Descriptions, Card, Spin
} from 'antd';
import api from '../../services/api';
import { AppointmentSummary, AppointmentResponse, AppointmentStatus } from '../../types/appointment';

const { Title, Text } = Typography;

const statusColors: Record<AppointmentStatus, string> = {
    PENDING: 'gold',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    COMPLETED: 'blue'
};

const PatientAppointments = () => {
    const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

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

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Title level={4} style={{ marginBottom: 24 }}>My Appointments</Title>
                <Table
                    rowKey="appointmentId"
                    loading={loading}
                    dataSource={appointments}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
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
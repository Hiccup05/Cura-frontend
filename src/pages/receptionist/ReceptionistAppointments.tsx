import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Typography, message, Descriptions, Card, Spin } from 'antd';
import api from '../../services/api';
import { AppointmentSummary, AppointmentResponse, AppointmentStatus } from '../../types/appointment';

const { Title, Text } = Typography;

const statusColors: Record<AppointmentStatus, string> = {
    PENDING: 'gold',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    COMPLETED: 'blue'
};

const ReceptionistAppointments = () => {
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
        api.get('/receptionist/appointment')
            .then((response) => setAppointments(response.data))
            .catch(() => message.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    };

    const viewDetail = (id: number) => {
        setDetailLoading(true);
        setModalOpen(true);
        setSelectedAppointment(null);
        api.get(`/receptionist/appointment/${id}`)
            .then((response) => setSelectedAppointment(response.data))
            .catch(() => message.error('Failed to load appointment details'))
            .finally(() => setDetailLoading(false));
    };

    const columns = [
        { title: 'Date', dataIndex: 'appointmentDate' },
        { title: 'Time', dataIndex: 'appointmentTime' },
        { title: 'Service', dataIndex: 'medicalServiceName' },
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
                <Button size="small" onClick={() => viewDetail(record.appointmentId)}>
                    View
                </Button>
            )
        }
    ];

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Title level={4} style={{ marginBottom: 24 }}>All Appointments</Title>
                <Table
                    rowKey="appointmentId"
                    loading={loading}
                    dataSource={appointments}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title="Appointment Details"
                open={modalOpen}
                onCancel={() => { setModalOpen(false); setSelectedAppointment(null); }}
                footer={null}
                width={600}
            >
                {detailLoading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin size="large" />
                    </div>
                ) : selectedAppointment && (
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="Date">{selectedAppointment.appointmentDate}</Descriptions.Item>
                        <Descriptions.Item label="Time">{selectedAppointment.appointmentTime}</Descriptions.Item>
                        <Descriptions.Item label="Service">{selectedAppointment.medicalServiceName}</Descriptions.Item>
                        <Descriptions.Item label="Price">NPR {selectedAppointment.price}</Descriptions.Item>
                        <Descriptions.Item label="Duration">{selectedAppointment.durationMinutes} mins</Descriptions.Item>
                        <Descriptions.Item label="Status">
                            <Tag color={statusColors[selectedAppointment.status]}>{selectedAppointment.status}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Patient" span={2}>
                            {selectedAppointment.walkInPatientName || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone" span={2}>
                            {selectedAppointment.walkInPatientPhone || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Reason" span={2}>
                            {selectedAppointment.reason || '—'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Payment Method" span={2}>
                            {selectedAppointment.paymentMethod || '—'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default ReceptionistAppointments;
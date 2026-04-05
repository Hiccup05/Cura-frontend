import { useEffect, useState } from 'react';
import {
    Table, Tag, Button, Modal, Typography,
    message, Descriptions, Card, Spin, Input, Form
} from 'antd';
import api from '../../services/api';
import { AppointmentSummary, AppointmentResponse, AppointmentStatus } from '../../types/appointment';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColors: Record<AppointmentStatus, string> = {
    PENDING: 'gold',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    COMPLETED: 'blue'
};

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
    const [prescriptionText, setPrescriptionText] = useState('');
    const [savingPrescription, setSavingPrescription] = useState(false);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = () => {
        setLoading(true);
        api.get('/doctors/appointments')
            .then((response) => setAppointments(response.data))
            .catch(() => message.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    };

    const viewDetail = (id: number) => {
        setDetailLoading(true);
        setModalOpen(true);
        setSelectedAppointment(null);
        api.get(`/doctors/appointments/${id}`)
            .then((response) => setSelectedAppointment(response.data))
            .catch(() => message.error('Failed to load appointment details'))
            .finally(() => setDetailLoading(false));
    };

    const openPrescriptionModal = (appointment: AppointmentResponse) => {
        setSelectedPrescriptionId(appointment.prescriptionResponseDto?.id || null);
        setPrescriptionText(appointment.prescriptionResponseDto?.description || '');
        setPrescriptionModalOpen(true);
    };

    const savePrescription = () => {
        if (!selectedPrescriptionId) return;
        setSavingPrescription(true);
        api.patch(`/appointment/prescription/${selectedPrescriptionId}`, {
            description: prescriptionText
        })
            .then(() => {
                message.success('Prescription updated');
                setPrescriptionModalOpen(false);
                setModalOpen(false);
                fetchAppointments();
            })
            .catch((error) => {
                message.error(error.response?.data?.message || 'Failed to update prescription');
            })
            .finally(() => setSavingPrescription(false));
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
                onCancel={() => { setModalOpen(false); setSelectedAppointment(null); }}
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
                            <Descriptions.Item label="Date">{selectedAppointment.appointmentDate}</Descriptions.Item>
                            <Descriptions.Item label="Time">{selectedAppointment.appointmentTime}</Descriptions.Item>
                            <Descriptions.Item label="Service">{selectedAppointment.medicalServiceName}</Descriptions.Item>
                            <Descriptions.Item label="Price">NPR {selectedAppointment.price}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag color={statusColors[selectedAppointment.status]}>{selectedAppointment.status}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="Patient">
                                {selectedAppointment.patientName || selectedAppointment.walkInPatientName || '—'}
                            </Descriptions.Item>
                            <Descriptions.Item label="Reason" span={2}>
                                {selectedAppointment.reason || '—'}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* Prescription */}
                        {selectedAppointment.prescriptionResponseDto && (
                            <Card
                                title="Prescription"
                                size="small"
                                style={{ marginTop: 16 }}
                                extra={
                                    <Button
                                        size="small"
                                        type="primary"
                                        onClick={() => openPrescriptionModal(selectedAppointment)}
                                    >
                                        Update
                                    </Button>
                                }
                            >
                                <Text>
                                    {selectedAppointment.prescriptionResponseDto.description || 'No prescription yet'}
                                </Text>
                            </Card>
                        )}
                    </div>
                )}
            </Modal>

            {/* Prescription Modal */}
            <Modal
                title="Update Prescription"
                open={prescriptionModalOpen}
                onCancel={() => setPrescriptionModalOpen(false)}
                onOk={savePrescription}
                okText="Save"
                confirmLoading={savingPrescription}
            >
                <TextArea
                    rows={5}
                    value={prescriptionText}
                    onChange={(e) => setPrescriptionText(e.target.value)}
                    placeholder="Enter prescription details"
                />
            </Modal>
        </div>
    );
};

export default DoctorAppointments;
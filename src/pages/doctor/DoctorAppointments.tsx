import { useEffect, useState } from 'react';
import {
    Table, Tag, Button, Modal, Typography,
    message, Descriptions, Card, Spin, Input, Select, Space, DatePicker
} from 'antd';
import api from '../../services/api';
import {
    AppointmentSummary,
    AppointmentResponse,
    AppointmentStatus,
    DoctorAppointmentSummary,
    DatePreset
} from '../../types/appointment';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColors: Record<AppointmentStatus, string> = {
    PENDING: 'gold',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    COMPLETED: 'blue'
};

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState<DoctorAppointmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
    const [prescriptionText, setPrescriptionText] = useState('');
    const [savingPrescription, setSavingPrescription] = useState(false);
    const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<number | null>(null);
    const [patientNameFilter, setPatientNameFilter] = useState('');
    const [walkInNameFilter, setWalkInNameFilter] = useState('');
    const [receptionistNameFilter, setReceptionistNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'ALL'>('ALL');
    const [datePreset, setDatePreset] = useState<DatePreset>('ALL');
    const [customDate, setCustomDate] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        fetchAppointments();
    }, [page, pageSize, patientNameFilter, walkInNameFilter, receptionistNameFilter, statusFilter, datePreset, customDate]);

    const fetchAppointments = () => {
        setLoading(true);
        const today = new Date();
        const todayStr = today.toISOString().slice(0, 10);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().slice(0, 10);
        const day = today.getDay();
        const mondayOffset = day === 0 ? -6 : 1 - day;
        const monday = new Date(today);
        monday.setDate(today.getDate() + mondayOffset);
        const mondayStr = monday.toISOString().slice(0, 10);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const sundayStr = sunday.toISOString().slice(0, 10);

        const params: Record<string, string | number> = {
            page: page - 1,
            size: pageSize
        };
        if (patientNameFilter.trim()) params.patientName = patientNameFilter.trim();
        if (walkInNameFilter.trim()) params.walkInPatientName = walkInNameFilter.trim();
        if (receptionistNameFilter.trim()) params.receptionistName = receptionistNameFilter.trim();
        if (statusFilter !== 'ALL') params.status = statusFilter;
        if (datePreset === 'TODAY') {
            params.dateFrom = todayStr;
            params.dateTo = todayStr;
        }
        if (datePreset === 'TOMORROW') {
            params.dateFrom = tomorrowStr;
            params.dateTo = tomorrowStr;
        }
        if (datePreset === 'THIS_WEEK') {
            params.dateFrom = mondayStr;
            params.dateTo = sundayStr;
        }
        if (datePreset === 'CUSTOM' && customDate) {
            params.dateFrom = customDate;
            params.dateTo = customDate;
        }

        api.get('/doctors/appointments', { params })
            .then((response) => {
                const data = response.data;
                if (Array.isArray(data)) {
                    setAppointments(data);
                    setTotal(data.length);
                    return;
                }
                if (Array.isArray(data?.content)) {
                    setAppointments(data.content);
                    setTotal(typeof data.totalElements === 'number' ? data.totalElements : data.content.length);
                    return;
                }
                setAppointments([]);
                setTotal(0);
            })
            .catch(() => message.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    };

    const viewDetail = (id: number) => {
        setDetailLoading(true);
        setModalOpen(true);
        setSelectedAppointment(null);
        api.get(`/doctors/appointment/${id}`)
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
                <Space wrap style={{ marginBottom: 16 }}>
                    <Input
                        allowClear
                        placeholder="Filter by patient name"
                        value={patientNameFilter}
                        onChange={(e) => setPatientNameFilter(e.target.value)}
                        style={{ minWidth: 220 }}
                    />
                    <Input
                        allowClear
                        placeholder="Filter by walk-in name"
                        value={walkInNameFilter}
                        onChange={(e) => setWalkInNameFilter(e.target.value)}
                        style={{ minWidth: 220 }}
                    />
                    <Input
                        allowClear
                        placeholder="Filter by receptionist name"
                        value={receptionistNameFilter}
                        onChange={(e) => setReceptionistNameFilter(e.target.value)}
                        style={{ minWidth: 220 }}
                    />
                    <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        style={{ minWidth: 180 }}
                        options={[
                            { label: 'All Statuses', value: 'ALL' },
                            { label: 'PENDING', value: 'PENDING' },
                            { label: 'CONFIRMED', value: 'CONFIRMED' },
                            { label: 'COMPLETED', value: 'COMPLETED' },
                            { label: 'CANCELLED', value: 'CANCELLED' }
                        ]}
                    />
                    <Select
                        value={datePreset}
                        onChange={(value: DatePreset) => setDatePreset(value)}
                        style={{ minWidth: 170 }}
                        options={[
                            { label: 'All Dates', value: 'ALL' },
                            { label: 'Today', value: 'TODAY' },
                            { label: 'Tomorrow', value: 'TOMORROW' },
                            { label: 'This Week', value: 'THIS_WEEK' },
                            { label: 'Custom Date', value: 'CUSTOM' }
                        ]}
                    />
                    {datePreset === 'CUSTOM' && (
                        <DatePicker
                            allowClear
                            onChange={(date) => setCustomDate(date ? date.format('YYYY-MM-DD') : null)}
                        />
                    )}
                </Space>
                <Table
                    rowKey="appointmentId"
                    loading={loading}
                    dataSource={appointments}
                    columns={columns}
                    pagination={{
                        current: page,
                        pageSize,
                        total,
                        onChange: (nextPage, nextPageSize) => {
                            setPage(nextPage);
                            setPageSize(nextPageSize);
                        }
                    }}
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
                            <Descriptions.Item label="Receptionist">
                                {selectedAppointment.receptionistName || '—'}
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
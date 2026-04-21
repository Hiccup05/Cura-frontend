import { useCallback, useEffect, useState } from 'react';
import {
    Table, Tag, Button, Modal, Typography, message,
    Descriptions, Card, Spin, Segmented, Select, Space
} from 'antd';
import { Input } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { AppointmentSummary, AppointmentResponse, AppointmentStatus } from '../../types/appointment';

const { Title } = Typography;

const STATUS_COLORS: Record<AppointmentStatus, string> = {
    PENDING: 'gold',
    CONFIRMED: 'green',
    CANCELLED: 'red',
    COMPLETED: 'blue',
};

const ALL_STATUSES: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

const ReceptionistAppointments = () => {
    const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [myReceptionistId, setMyReceptionistId] = useState<number | null>(null);

    // Filters
    const [view, setView] = useState<'all' | 'mine'>('all');
    const [statusFilter, setStatusFilter] = useState<AppointmentStatus[]>([]);
    const [walkInPatientNameInput, setWalkInPatientNameInput] = useState('');
    const [walkInPatientNameFilter, setWalkInPatientNameFilter] = useState('');

    // Detail modal
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponse | null>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        // Get own receptionist ID for "My Bookings" filter and default queries
        api.get('/receptionist/profile')
            .then(r => setMyReceptionistId(r.data.id))
            .catch(() => { });
    }, []);

    const fetchAppointments = useCallback(() => {
        setLoading(true);
        const params: Record<string, string | number> = {};
        if (view === 'mine' && myReceptionistId !== null) {
            params.receptionistId = myReceptionistId;
        }
        if (walkInPatientNameFilter.trim()) {
            params.walkInPatientName = walkInPatientNameFilter.trim();
        }

        api.get('/receptionist/appointment', { params })
            .then(r => setAppointments(r.data))
            .catch(() => message.error('Failed to load appointments'))
            .finally(() => setLoading(false));
    }, [view, myReceptionistId, walkInPatientNameFilter]);

    useEffect(() => {
        // Wait until we know my receptionist id before querying "mine"
        if (view === 'mine' && myReceptionistId === null) return;
        fetchAppointments();
    }, [view, myReceptionistId, fetchAppointments]);

    const viewDetail = (id: number) => {
        setDetailLoading(true);
        setModalOpen(true);
        setSelectedAppointment(null);
        api.get(`/receptionist/appointment/${id}`)
            .then(r => setSelectedAppointment(r.data))
            .catch(() => message.error('Failed to load appointment details'))
            .finally(() => setDetailLoading(false));
    };

    // Apply filters client-side
    const filtered = appointments.filter(a => {
        const matchesView = view === 'all' || (view === 'mine' && a.receptionistId === myReceptionistId);
        const matchesStatus =
            statusFilter.length === 0 ||
            statusFilter.includes(a.appointmentStatus);
        return matchesView && matchesStatus;
    });

    const columns = [
        {
            title: 'Date',
            dataIndex: 'appointmentDate',
            sorter: (a: AppointmentSummary, b: AppointmentSummary) =>
                a.appointmentDate.localeCompare(b.appointmentDate),
        },
        {
            title: 'Time',
            dataIndex: 'appointmentTime',
            render: (t: string) => t?.slice(0, 5),
        },
        {
            title: 'Service',
            dataIndex: 'medicalServiceName',
        },
        {
            title: 'Status',
            dataIndex: 'appointmentStatus',
            render: (s: AppointmentStatus) => (
                <Tag color={STATUS_COLORS[s]}>{s}</Tag>
            ),
        },
        {
            title: 'Paid',
            dataIndex: 'isPaid',
            render: (v: boolean) => (
                <Tag color={v ? 'green' : 'red'}>{v ? 'Yes' : 'No'}</Tag>
            ),
        },
        {
            title: '',
            render: (_: any, record: AppointmentSummary) => (
                <Button size="small" onClick={() => viewDetail(record.appointmentId)}>
                    View
                </Button>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: 16 }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                    marginBottom: 20,
                }}>
                    <Title level={4} style={{ margin: 0 }}>Appointments</Title>

                    <Space wrap>
                        {/* All vs My Bookings */}
                        <Segmented
                            options={[
                                { label: 'All', value: 'all' },
                                { label: 'My Bookings', value: 'mine' },
                            ]}
                            value={view}
                            onChange={v => setView(v as 'all' | 'mine')}
                        />

                        <Input.Search
                            allowClear
                            placeholder="Search walk-in patient"
                            style={{ minWidth: 220 }}
                            value={walkInPatientNameInput}
                            onChange={(e) => setWalkInPatientNameInput(e.target.value)}
                            onSearch={(value) => setWalkInPatientNameFilter(value)}
                        />

                        {/* Status filter */}
                        <Select
                            mode="multiple"
                            allowClear
                            placeholder={
                                <span>
                                    <FilterOutlined style={{ marginRight: 6 }} />
                                    Filter by status
                                </span>
                            }
                            style={{ minWidth: 200 }}
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={ALL_STATUSES.map(s => ({
                                label: <Tag color={STATUS_COLORS[s]}>{s}</Tag>,
                                value: s,
                            }))}
                            maxTagCount="responsive"
                        />
                    </Space>
                </div>

                <Table
                    rowKey="appointmentId"
                    loading={loading}
                    dataSource={filtered}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                    locale={{
                        emptyText: statusFilter.length > 0 || view === 'mine'
                            ? 'No appointments match the current filters'
                            : 'No appointments found',
                    }}
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
                            <Tag color={STATUS_COLORS[selectedAppointment.status]}>
                                {selectedAppointment.status}
                            </Tag>
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

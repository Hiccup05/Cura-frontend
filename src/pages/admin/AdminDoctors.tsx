import { useEffect, useState } from 'react';
import { Table, Tag, Button, Select, Typography, message } from 'antd';
import api from '../../services/api';
import { Doctor, DoctorStatus } from '../../types/admin';


const { Title } = Typography;

const statusColors: Record<DoctorStatus, string> = {
    ACTIVE: 'green',
    INACTIVE: 'red',
    ON_LEAVE: 'orange',
    PENDING: 'gold'
};

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = () => {
        setLoading(true);
        api.get('/admin/doctors')
            .then((response) => setDoctors(response.data))
            .catch(() => message.error('Failed to load doctors'))
            .finally(() => setLoading(false));
    };

    const changeStatus = (id: number, status: DoctorStatus) => {
        api.patch(`/admin/doctors/${id}/status`, { doctorStatus: status })
            .then(() => {
                message.success('Doctor status updated');
                fetchDoctors(); // refresh the list
            })
            .catch(() => message.error('Failed to update status'));
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
        },
        {
            title: 'Name',
            // render lets you customize what shows in the cell
            // instead of showing one field, we combine firstName + lastName
            render: (_: any, record: Doctor) =>
                `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim() || '—'
        },
        {
            title: 'License Number',
            dataIndex: 'licenseNumber',
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
                        { label: 'Pending', value: 'PENDING' },
                    ]}
                />
            )
        }
    ];

    return (
        <div>
            <Title level={4} style={{ marginBottom: 24 }}>Doctors</Title>
            <Table
                rowKey="id"        // which field uniquely identifies each row
                loading={loading}
                dataSource={doctors}
                columns={columns}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default AdminDoctors;
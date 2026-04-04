import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { MedicalService, Specialization } from '../../types/admin';

const { Title } = Typography;

const AdminServices = () => {
    const [services, setServices] = useState<MedicalService[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const [editingService, setEditingService] = useState<MedicalService | null>(null);

    const [form] = Form.useForm();



    const fetchServices = () => {
        setLoading(true);
        api.get('/admin/services')
            .then((response) => setServices(response.data))
            .catch(() => message.error('Failed to load services'))
            .finally(() => setLoading(false));
    };

    const fetchSpecializations = () => {
        api.get('/admin/specialization')
            .then((response) => setSpecializations(response.data))
            .catch(() => message.error('Failed to load specializations'));
    };

    const openCreateModal = () => {
        setEditingService(null);
        form.resetFields();
        setModalOpen(true);
    };

    const openEditModal = (service: MedicalService) => {
        setEditingService(service);
        form.setFieldsValue({
            name: service.name,
            price: service.price,
            durationMinutes: service.durationMinutes,
            description: service.description,
            specializationId: service.specializationId
        });
        setModalOpen(true);
    };

    const handleSubmit = (values: any) => {
        setCreating(true);

        const request = editingService
            ? api.patch(`/admin/services/${editingService.id}`, values)
            : api.post('/admin/services', values);

        request
            .then(() => {
                message.success(editingService ? 'Service updated' : 'Service created');
                setModalOpen(false);
                form.resetFields();
                fetchServices();
            })
            .catch(() => message.error('Failed to save service'))
            .finally(() => setCreating(false));
    };

    const toggleStatus = (id: number) => {
        api.patch(`/admin/services/${id}/status`)
            .then(() => {
                message.success('Status toggled');
                fetchServices();
            })
            .catch(() => message.error('Failed to toggle status'));
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id'
        },
        {
            title: 'Name',
            dataIndex: 'name'
        },
        {
            title: 'Price',
            dataIndex: 'price',
            render: (price: number) => `NPR ${price}`
        },
        {
            title: 'Duration',
            dataIndex: 'durationMinutes',
            render: (mins: number) => `${mins} mins`
        },
        {
            title: 'Specialization',
            dataIndex: 'specializationName'
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Active' : 'Inactive'}
                </Tag>
            )
        },
        {
            title: 'Actions',
            render: (_: any, record: MedicalService) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => openEditModal(record)}
                    >
                        Edit
                    </Button>
                    <Button
                        size="small"
                        onClick={() => toggleStatus(record.id)}
                    >
                        {record.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                </div>
            )
        }
    ];

};

export default AdminServices;
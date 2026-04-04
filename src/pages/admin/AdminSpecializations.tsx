import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { Specialization } from '../../types/admin';

const { Title } = Typography;

const AdminSpecializations = () => {
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchSpecializations();
    }, []);

    const fetchSpecializations = () => {
        setLoading(true);
        api.get('/admin/specialization')
            .then((response) => setSpecializations(response.data))
            .catch(() => message.error('Failed to load specializations'))
            .finally(() => setLoading(false));
    };

    const handleCreate = (values: { name: string }) => {
        setCreating(true);
        api.post('/admin/specialization', values)
            .then(() => {
                message.success('Specialization created');
                setModalOpen(false);
                form.resetFields();
                fetchSpecializations();
            })
            .catch(() => message.error('Failed to create specialization'))
            .finally(() => setCreating(false));
    };

    const handleDelete = (id: number) => {
        api.delete(`/admin/specialization/${id}`)
            .then(() => {
                message.success('Specialization deleted');
                fetchSpecializations();
            })
            .catch(() => message.error('Failed to delete specialization'));
    };
};

export default AdminSpecializations;
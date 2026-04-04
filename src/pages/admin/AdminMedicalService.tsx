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


};

export default AdminServices;
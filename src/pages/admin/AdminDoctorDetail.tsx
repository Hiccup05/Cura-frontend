import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card, Table, Button, Modal, Form, Input,
    Select, Tag, Typography, message, Popconfirm, TimePicker, DatePicker
} from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';
import { Doctor, Schedule, Leave, DayOfWeek, Specialization } from '../../types/admin';

const { Title } = Typography;

// all days for the dropdown
const dayOptions = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY',
    'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
].map(d => ({ label: d, value: d }));

const AdminDoctorDetail = () => {
    const { id } = useParams(); // gets the doctor id from the URL
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [leaves, setLeaves] = useState<Leave[]>([]);
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [loading, setLoading] = useState(true);

    // modal states
    const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
    const [leaveModalOpen, setLeaveModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [doctorModalOpen, setDoctorModalOpen] = useState(false);

    const [scheduleForm] = Form.useForm();
    const [leaveForm] = Form.useForm();
    const [doctorForm] = Form.useForm();

    useEffect(() => {
        fetchAll();
    }, [id]);

    const fetchAll = () => {
        setLoading(true);
        Promise.all([
            api.get(`/admin/doctors/doctor/${id}`),
            api.get(`/admin/doctors/${id}/schedule`),
            api.get(`/admin/doctors/${id}/leave`),
            api.get('/admin/specialization')
        ])
            .then(([doctorRes, scheduleRes, leaveRes, specRes]) => {
                setDoctor(doctorRes.data);
                setSchedules(scheduleRes.data);
                setLeaves(leaveRes.data);
                setSpecializations(specRes.data);
            })
            .catch(() => message.error('Failed to load doctor details'))
            .finally(() => setLoading(false));
    };

    const openDoctorModal = () => {
        doctorForm.setFieldsValue({
            licenseNumber: doctor?.licenseNumber,
            yearsOfExperience: doctor?.yearsOfExperience,
            specializationIds: doctor?.specialization.map(s => s.id)
        });
        setDoctorModalOpen(true);
    };

    const handleDoctorUpdate = (values: any) => {
        api.patch(`/admin/doctors/${id}`, values)
            .then(() => {
                message.success('Doctor updated');
                setDoctorModalOpen(false);
                fetchAll();
            })
            .catch(() => message.error('Failed to update doctor'));
    };


};

export default AdminDoctorDetail;
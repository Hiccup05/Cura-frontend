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

const dayOptions = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY',
    'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
].map(d => ({ label: d, value: d }));
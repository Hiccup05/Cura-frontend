import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../services/api';
import { Specialization } from '../../types/admin';

const { Title } = Typography;
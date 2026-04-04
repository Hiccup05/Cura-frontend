import { useEffect, useState } from 'react';
import { Table, Tag, Button, Select, Typography, message } from 'antd';
import api from '../../services/api';
import { Doctor, DoctorStatus } from '../../types/admin';


const { Title } = Typography;
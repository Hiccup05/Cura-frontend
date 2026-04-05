import { useEffect, useState } from 'react';
import {
    Steps, Card, Select, DatePicker, Button,
    Typography, message, Input, Tag, Row, Col
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../services/api';
import { PublicDoctor, PublicSchedule } from '../../types/appointment';
import { MedicalService } from '../../types/admin';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;

const dayOfWeekMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
};

const ReceptionistBookAppointment = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
    const [services, setServices] = useState<MedicalService[]>([]);
    const [schedules, setSchedules] = useState<PublicSchedule[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<PublicDoctor | null>(null);
    const [selectedService, setSelectedService] = useState<MedicalService | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [walkInName, setWalkInName] = useState('');
    const [walkInPhone, setWalkInPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get('/public/doctors')
            .then((res) => setDoctors(res.data))
            .catch(() => message.error('Failed to load doctors'));
    }, []);

    const handleDoctorSelect = (doctorId: number) => {
        const doctor = doctors.find(d => d.id === doctorId) || null;
        setSelectedDoctor(doctor);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);

        if (doctor && doctor.specialization.length > 0) {
            const specIds = doctor.specialization.map(s => s.id);
            Promise.all(specIds.map(id => api.get(`/public/services/${id}`)))
                .then((responses) => {
                    const allServices = responses.flatMap(r => r.data);
                    const unique = allServices.filter((s, i, arr) =>
                        arr.findIndex(x => x.id === s.id) === i
                    );
                    setServices(unique);
                })
                .catch(() => message.error('Failed to load services'));

            api.get(`/public/doctors/${doctorId}/schedule`)
                .then((res) => setSchedules(res.data))
                .catch(() => message.error('Failed to load schedules'));
        }
    };

    const disabledDate = (date: Dayjs) => {
        if (!schedules.length) return true;
        const availableDays = schedules.map(s => dayOfWeekMap[s.dayOfWeek]);
        return !availableDays.includes(date.day()) || date.isBefore(dayjs(), 'day');
    };

    const generateTimeSlots = (): string[] => {
        if (!selectedDate || !selectedService || !schedules.length) return [];
        const dayName = Object.keys(dayOfWeekMap).find(
            key => dayOfWeekMap[key] === selectedDate.day()
        );
        const schedule = schedules.find(s => s.dayOfWeek === dayName);
        if (!schedule) return [];

        const slots: string[] = [];
        let current = dayjs(`2000-01-01 ${schedule.startTime}`);
        const end = dayjs(`2000-01-01 ${schedule.endTime}`);
        const duration = selectedService.durationMinutes;

        while (current.isBefore(end.subtract(duration - 1, 'minute'))) {
            slots.push(current.format('HH:mm:ss'));
            current = current.add(duration, 'minute');
        }
        return slots;
    };

    const handleSubmit = () => {
        if (!walkInName || !walkInPhone) {
            message.error('Patient name and phone are required');
            return;
        }

        setSubmitting(true);
        api.post('/receptionist/appointment', {
            doctorId: selectedDoctor?.id,
            medicalServiceId: selectedService?.id,
            appointmentDate: selectedDate?.format('YYYY-MM-DD'),
            appointmentTime: selectedTime,
            reason: reason || null,
            walkInPatientName: walkInName,
            walkInPatientPhone: walkInPhone,
            paymentMethod: paymentMethod
        })
            .then(() => {
                message.success('Appointment booked successfully');
                navigate('/receptionist/appointments');
            })
            .catch((error) => {
                message.error(error.response?.data?.message || 'Failed to book appointment');
            })
            .finally(() => setSubmitting(false));
    };

    const steps = [
        {
            title: 'Doctor',
            content: (
                <div>
                    <Text type="secondary">Select a doctor</Text>
                    <Select
                        style={{ width: '100%', marginTop: 8 }}
                        placeholder="Choose a doctor"
                        onChange={handleDoctorSelect}
                        value={selectedDoctor?.id}
                        options={doctors.map(d => ({
                            label: `${d.firstName ?? ''} ${d.lastName ?? ''}`.trim() || `Doctor ${d.id}`,
                            value: d.id
                        }))}
                    />
                    {selectedDoctor && (
                        <Card size="small" style={{ marginTop: 16 }}>
                            <p><strong>Experience:</strong> {selectedDoctor.yearsOfExperience} years</p>
                            <p><strong>Specializations:</strong> {selectedDoctor.specialization.map(s =>
                                <Tag key={s.id}>{s.name}</Tag>
                            )}</p>
                        </Card>
                    )}
                </div>
            )
        },
        {
            title: 'Service',
            content: (
                <div>
                    <Text type="secondary">Select a medical service</Text>
                    <Select
                        style={{ width: '100%', marginTop: 8 }}
                        placeholder="Choose a service"
                        onChange={(id) => setSelectedService(services.find(s => s.id === id) || null)}
                        value={selectedService?.id}
                        options={services.map(s => ({
                            label: `${s.name} — NPR ${s.price} (${s.durationMinutes} mins)`,
                            value: s.id
                        }))}
                    />
                </div>
            )
        },
        {
            title: 'Date & Time',
            content: (
                <div>
                    <Text type="secondary">Select appointment date</Text>
                    <DatePicker
                        style={{ width: '100%', marginTop: 8, marginBottom: 16 }}
                        disabledDate={disabledDate}
                        onChange={(date) => { setSelectedDate(date); setSelectedTime(null); }}
                        value={selectedDate}
                    />
                    {selectedDate && selectedService && (
                        <>
                            <Text type="secondary">Select time slot</Text>
                            <Row gutter={[8, 8]} style={{ marginTop: 8 }}>
                                {generateTimeSlots().map(slot => (
                                    <Col key={slot}>
                                        <Button
                                            type={selectedTime === slot ? 'primary' : 'default'}
                                            onClick={() => setSelectedTime(slot)}
                                            size="small"
                                        >
                                            {slot.slice(0, 5)}
                                        </Button>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </div>
            )
        },
        {
            title: 'Patient Info',
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                        <Text type="secondary">Patient Name</Text>
                        <Input
                            style={{ marginTop: 4 }}
                            value={walkInName}
                            onChange={(e) => setWalkInName(e.target.value)}
                            placeholder="Full name"
                        />
                    </div>
                    <div>
                        <Text type="secondary">Patient Phone</Text>
                        <Input
                            style={{ marginTop: 4 }}
                            value={walkInPhone}
                            onChange={(e) => setWalkInPhone(e.target.value)}
                            placeholder="Phone number"
                        />
                    </div>
                    <div>
                        <Text type="secondary">Payment Method</Text>
                        <Select
                            style={{ width: '100%', marginTop: 4 }}
                            value={paymentMethod}
                            onChange={setPaymentMethod}
                            options={[
                                { label: 'Cash', value: 'CASH' },
                                { label: 'Online', value: 'ONLINE' }
                            ]}
                        />
                    </div>
                    <div>
                        <Text type="secondary">Reason (optional)</Text>
                        <TextArea
                            rows={3}
                            style={{ marginTop: 4 }}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe symptoms or reason"
                        />
                    </div>
                </div>
            )
        },
        {
            title: 'Confirm',
            content: (
                <Card size="small">
                    <p><strong>Doctor:</strong> {`${selectedDoctor?.firstName ?? ''} ${selectedDoctor?.lastName ?? ''}`.trim()}</p>
                    <p><strong>Service:</strong> {selectedService?.name}</p>
                    <p><strong>Price:</strong> NPR {selectedService?.price}</p>
                    <p><strong>Date:</strong> {selectedDate?.format('YYYY-MM-DD')}</p>
                    <p><strong>Time:</strong> {selectedTime?.slice(0, 5)}</p>
                    <p><strong>Patient:</strong> {walkInName}</p>
                    <p><strong>Phone:</strong> {walkInPhone}</p>
                    <p><strong>Payment:</strong> {paymentMethod}</p>
                </Card>
            )
        }
    ];

    return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Title level={4} style={{ marginBottom: 24 }}>Book Walk-in Appointment</Title>
                <Steps
                    current={currentStep}
                    items={steps.map(s => ({ title: s.title }))}
                    style={{ marginBottom: 32 }}
                />
                <div style={{ minHeight: 200 }}>
                    {steps[currentStep].content}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                    <Button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        disabled={currentStep === 0}
                    >
                        Previous
                    </Button>
                    {currentStep < steps.length - 1 ? (
                        <Button
                            type="primary"
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={
                                (currentStep === 0 && !selectedDoctor) ||
                                (currentStep === 1 && !selectedService) ||
                                (currentStep === 2 && (!selectedDate || !selectedTime))
                            }
                        >
                            Next
                        </Button>
                    ) : (
                        <Button type="primary" loading={submitting} onClick={handleSubmit}>
                            Book Appointment
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReceptionistBookAppointment;
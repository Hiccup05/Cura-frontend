import { useEffect, useState, useRef, useCallback } from 'react';
import {
    Steps, Card, Select, DatePicker, Button,
    Typography, message, Input, Tag, Row, Col
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import api from '../../services/api';
import { PublicDoctor, PublicSchedule } from '../../types/doctor';
import { MedicalService } from '../../types/admin';
import { serviceSlotDurationMinutes } from '../../utils/serviceSlotDuration';
import { normalizeMedicalServices } from '../../utils/medicalService';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea, Search } = Input;

const dayOfWeekMap: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
    THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
};

const formatDoctorName = (doctor: Pick<PublicDoctor, 'id' | 'firstName' | 'lastName'>) => {
    const parts = [doctor.firstName, doctor.lastName]
        .map((value) => (value ?? '').toString().trim())
        .filter((value) => value.length > 0 && value.toLowerCase() !== 'null' && value.toLowerCase() !== 'undefined');
    return parts.join(' ') || `Doctor ${doctor.id}`;
};

const REASON_MAX_LEN = 500;

const validateWalkInName = (raw: string): string | undefined => {
    const t = raw.trim();
    if (!t) return 'Patient name is required';
    if (t.length < 2) return 'Name must be at least 2 characters';
    if (t.length > 120) return 'Name must be at most 120 characters';
    if (/^\d+$/.test(t)) return 'Name cannot be only numbers';
    return undefined;
};

const validateWalkInPhone = (raw: string): string | undefined => {
    const digits = raw.replace(/\D/g, '');
    if (!digits) return 'Phone number is required';
    if (digits.length < 7) return 'Phone number is too short (at least 7 digits)';
    if (digits.length > 15) return 'Phone number is too long (at most 15 digits)';
    return undefined;
};

const validateReasonField = (raw: string): string | undefined => {
    if (raw.length > REASON_MAX_LEN) {
        return `Reason must be at most ${REASON_MAX_LEN} characters`;
    }
    return undefined;
};

const ReceptionistBookAppointment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const doctorIdParam = searchParams.get('doctorId');
    const serviceIdParam = searchParams.get('serviceId');
    const initialDoctorId = doctorIdParam ? Number(doctorIdParam) : NaN;
    const initialServiceId = serviceIdParam ? Number(serviceIdParam) : NaN;
    const bookingPrefillDoneRef = useRef(false);
    const pendingServiceIdRef = useRef<number | null>(null);

    const [currentStep, setCurrentStep] = useState(0);
    const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
    const [services, setServices] = useState<MedicalService[]>([]);
    const [schedules, setSchedules] = useState<PublicSchedule[]>([]);
    const [doctorSearch, setDoctorSearch] = useState('');
    const [serviceSearch, setServiceSearch] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState<PublicDoctor | null>(null);
    const [selectedService, setSelectedService] = useState<MedicalService | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState('');
    const [walkInName, setWalkInName] = useState('');
    const [walkInPhone, setWalkInPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
    const [submitting, setSubmitting] = useState(false);
    const [patientFieldErrors, setPatientFieldErrors] = useState<{
        name?: string;
        phone?: string;
        reason?: string;
    }>({});

    const validatePatientStep = (): boolean => {
        const nameErr = validateWalkInName(walkInName);
        const phoneErr = validateWalkInPhone(walkInPhone);
        const reasonErr = validateReasonField(reason);
        setPatientFieldErrors({
            ...(nameErr ? { name: nameErr } : {}),
            ...(phoneErr ? { phone: phoneErr } : {}),
            ...(reasonErr ? { reason: reasonErr } : {}),
        });
        return !nameErr && !phoneErr && !reasonErr;
    };

    const handleNextStep = () => {
        if (currentStep === 3 && !validatePatientStep()) {
            message.error('Please correct the patient information');
            return;
        }
        setCurrentStep((s) => s + 1);
    };

    useEffect(() => {
        api.get('/public/doctors')
            .then((res) => setDoctors(res.data))
            .catch(() => message.error('Failed to load doctors'));
    }, []);

    const handleDoctorSelect = useCallback((doctorId: number) => {
        const doctor = doctors.find(d => d.id === doctorId) || null;
        setSelectedDoctor(doctor);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setServices([]);
        setSchedules([]);

        if (doctor && doctor.specialization.length > 0) {
            const specIds = doctor.specialization.map(s => s.id);
            Promise.all(specIds.map(id => api.get(`/public/service/${id}`)))
                .then((responses) => {
                    const allServices = responses.flatMap((r) => normalizeMedicalServices(r.data as MedicalService[]));
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
    }, [doctors]);

    useEffect(() => {
        if (!doctors.length || bookingPrefillDoneRef.current) return;

        const hasDoctor = Number.isFinite(initialDoctorId) && initialDoctorId > 0;
        const hasService = Number.isFinite(initialServiceId) && initialServiceId > 0;

        if (hasDoctor && hasService) {
            const doc = doctors.find((d) => d.id === initialDoctorId);
            if (!doc) return;
            bookingPrefillDoneRef.current = true;
            pendingServiceIdRef.current = initialServiceId;
            handleDoctorSelect(initialDoctorId);
            return;
        }

        if (hasDoctor && !hasService) {
            const docExists = doctors.find((d) => d.id === initialDoctorId);
            if (docExists) {
                bookingPrefillDoneRef.current = true;
                handleDoctorSelect(initialDoctorId);
            }
            return;
        }

        if (hasService && !hasDoctor) {
            api.get('/public/service')
                .then((res) => {
                    const list = normalizeMedicalServices(res.data as MedicalService[]);
                    const svc = list.find((s) => s.id === initialServiceId);
                    if (!svc) return;
                    const doctor = doctors.find((d) =>
                        d.specialization.some((sp) => sp.id === svc.specializationId)
                    );
                    if (!doctor) return;
                    bookingPrefillDoneRef.current = true;
                    pendingServiceIdRef.current = initialServiceId;
                    handleDoctorSelect(doctor.id);
                })
                .catch(() => message.error('Failed to load services'));
        }
    }, [doctors, initialDoctorId, initialServiceId, handleDoctorSelect]);

    useEffect(() => {
        const sid = pendingServiceIdRef.current;
        if (sid == null || !services.length) return;
        const svc = services.find((s) => s.id === sid);
        if (svc) {
            setSelectedService(svc);
            pendingServiceIdRef.current = null;
        }
    }, [services]);

    const filteredDoctors = doctors.filter((d) =>
        formatDoctorName(d).toLowerCase().includes(doctorSearch.toLowerCase())
    );

    const filteredServices = services.filter((s) =>
        s.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );

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
        const duration = serviceSlotDurationMinutes(selectedService);

        while (current.isBefore(end.subtract(duration - 1, 'minute'))) {
            slots.push(current.format('HH:mm:ss'));
            current = current.add(duration, 'minute');
        }
        return slots;
    };

    const handleSubmit = () => {
        if (!selectedDoctor || !selectedService || !selectedDate || !selectedTime) {
            message.error('Doctor, service, date, and time are required');
            return;
        }
        if (!validatePatientStep()) {
            message.error('Please correct the patient information');
            setCurrentStep(3);
            return;
        }

        const trimmedName = walkInName.trim();
        const phoneDigits = walkInPhone.replace(/\D/g, '');

        setSubmitting(true);
        api.post('/receptionist/appointment', {
            doctorId: selectedDoctor.id,
            medicalServiceId: selectedService.id,
            appointmentDate: selectedDate.format('YYYY-MM-DD'),
            appointmentTime: selectedTime,
            reason: reason.trim() || null,
            walkInPatientName: trimmedName,
            walkInPatientPhone: phoneDigits,
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
                    <Search
                        placeholder="Search doctors..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        style={{ marginTop: 8 }}
                        allowClear
                    />
                    <Select
                        showSearch
                        filterOption={false}
                        style={{ width: '100%', marginTop: 8 }}
                        placeholder="Choose a doctor"
                        onChange={handleDoctorSelect}
                        value={selectedDoctor?.id}
                        options={filteredDoctors.map(d => ({
                            label: formatDoctorName(d),
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
                    <Search
                        placeholder="Search services..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        style={{ marginTop: 8 }}
                        allowClear
                    />
                    <Select
                        showSearch
                        filterOption={false}
                        style={{ width: '100%', marginTop: 8 }}
                        placeholder="Choose a service"
                        onChange={(id) => setSelectedService(services.find(s => s.id === id) || null)}
                        value={selectedService?.id}
                        options={filteredServices.map(s => ({
                            label: `${s.name} — NPR ${s.price} (${serviceSlotDurationMinutes(s)} min slots)`,
                            value: s.id
                        }))}
                    />
                    {selectedService && (
                        <Card size="small" style={{ marginTop: 16 }}>
                            <p><strong>Name:</strong> {selectedService.name}</p>
                            <p><strong>Specialization:</strong> {selectedService.specializationName}</p>
                            <p><strong>Price:</strong> NPR {selectedService.price}</p>
                            <p><strong>Slot length:</strong> {serviceSlotDurationMinutes(selectedService)} mins</p>
                            {selectedService.description && (
                                <p><strong>Description:</strong> {selectedService.description}</p>
                            )}
                        </Card>
                    )}
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
                            onChange={(e) => {
                                setWalkInName(e.target.value);
                                setPatientFieldErrors((prev) => ({ ...prev, name: undefined }));
                            }}
                            placeholder="Full name"
                            status={patientFieldErrors.name ? 'error' : undefined}
                            maxLength={120}
                            showCount
                        />
                        {patientFieldErrors.name && (
                            <Text type="danger" style={{ fontSize: 12 }}>{patientFieldErrors.name}</Text>
                        )}
                    </div>
                    <div>
                        <Text type="secondary">Patient Phone</Text>
                        <Input
                            style={{ marginTop: 4 }}
                            value={walkInPhone}
                            onChange={(e) => {
                                setWalkInPhone(e.target.value);
                                setPatientFieldErrors((prev) => ({ ...prev, phone: undefined }));
                            }}
                            placeholder="e.g. 98XXXXXXXX or +977-98XXXXXXXX"
                            inputMode="tel"
                            autoComplete="tel"
                            status={patientFieldErrors.phone ? 'error' : undefined}
                        />
                        {patientFieldErrors.phone && (
                            <Text type="danger" style={{ fontSize: 12 }}>{patientFieldErrors.phone}</Text>
                        )}
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
                            onChange={(e) => {
                                setReason(e.target.value);
                                setPatientFieldErrors((prev) => ({ ...prev, reason: undefined }));
                            }}
                            placeholder="Describe symptoms or reason"
                            maxLength={REASON_MAX_LEN}
                            showCount
                            status={patientFieldErrors.reason ? 'error' : undefined}
                        />
                        {patientFieldErrors.reason && (
                            <Text type="danger" style={{ fontSize: 12 }}>{patientFieldErrors.reason}</Text>
                        )}
                    </div>
                </div>
            )
        },
        {
            title: 'Confirm',
            content: (
                <Card size="small">
                    <p><strong>Doctor:</strong> {selectedDoctor ? formatDoctorName(selectedDoctor) : '—'}</p>
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
                            onClick={handleNextStep}
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
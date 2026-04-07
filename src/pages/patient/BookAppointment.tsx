import { useState, useEffect, useCallback } from "react";
import {
    Steps,
    Card,
    Select,
    DatePicker,
    Button,
    Typography,
    message,
    Input,
    Row,
    Col,
    Space,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { PublicDoctor, PublicSchedule } from "../../types/appointment";
import { MedicalService } from "../../types/admin";

const { Title, Text } = Typography;
const { TextArea, Search } = Input;

const dayOfWeekMap: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
};

const BookAppointment = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialDoctorId = Number(searchParams.get("doctorId"));

    const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
    const [services, setServices] = useState<MedicalService[]>([]);
    const [schedules, setSchedules] = useState<PublicSchedule[]>([]);

    const [doctorSearch, setDoctorSearch] = useState("");
    const [serviceSearch, setServiceSearch] = useState("");

    const [selectedDoctor, setSelectedDoctor] = useState<PublicDoctor | null>(null);
    const [selectedService, setSelectedService] = useState<MedicalService | null>(null);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [reason, setReason] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        api.get("/public/doctors")
            .then((res) => setDoctors(res.data))
            .catch(() => message.error("Failed to load doctors"));
    }, []);

    const handleDoctorSelect = useCallback((doctorId: number) => {
        const doctor = doctors.find((d) => d.id === doctorId) || null;
        setSelectedDoctor(doctor);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setServices([]);
        setSchedules([]);

        if (doctor) {
            const specIds = doctor.specialization.map((s) => s.id);
            Promise.all(specIds.map((id) => api.get(`/public/service/${id}`)))
                .then((responses) => {
                    const allServices = responses.flatMap((r) => r.data);
                    const unique = allServices.filter(
                        (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
                    );
                    setServices(unique);
                })
                .catch(() => message.error("Failed to load services"));

            api.get(`/public/doctors/${doctorId}/schedule`)
                .then((res) => setSchedules(res.data))
                .catch(() => message.error("Failed to load schedules"));
        }
    }, [doctors]);

    useEffect(() => {
        if (initialDoctorId && doctors.length > 0) {
            const docExists = doctors.find((d) => d.id === initialDoctorId);
            if (docExists) {
                handleDoctorSelect(initialDoctorId);
            }
        }
    }, [initialDoctorId, doctors, handleDoctorSelect]);

    const filteredDoctors = doctors.filter((d) =>
        `${d.firstName} ${d.lastName}`
            .toLowerCase()
            .includes(doctorSearch.toLowerCase())
    );

    const filteredServices = services.filter((s) =>
        s.name.toLowerCase().includes(serviceSearch.toLowerCase())
    );

    const disabledDate = (date: Dayjs) => {
        if (!schedules.length) return true;
        const availableDays = schedules.map((s) => dayOfWeekMap[s.dayOfWeek]);
        return !availableDays.includes(date.day()) || date.isBefore(dayjs(), "day");
    };

    const generateTimeSlots = (): string[] => {
        if (!selectedDate || !selectedService || !schedules.length) return [];

        const dayName = Object.keys(dayOfWeekMap).find(
            (key) => dayOfWeekMap[key] === selectedDate.day()
        );
        const schedule = schedules.find((s) => s.dayOfWeek === dayName);
        if (!schedule) return [];

        const slots: string[] = [];
        let current = dayjs(`2000-01-01 ${schedule.startTime}`);
        const end = dayjs(`2000-01-01 ${schedule.endTime}`);
        const duration = selectedService.durationMinutes;

        while (current.isBefore(end.subtract(duration - 1, "minute"))) {
            slots.push(current.format("HH:mm"));
            current = current.add(duration, "minute");
        }
        return slots;
    };

    const handleSubmit = () => {
        if (!selectedDoctor || !selectedService || !selectedDate || !selectedTime) {
            message.error("Please complete all steps");
            return;
        }
        setSubmitting(true);

        api.post("/appointment", {
            doctorId: selectedDoctor.id,
            medicalServiceId: selectedService.id,
            appointmentDate: selectedDate.format("YYYY-MM-DD"),
            appointmentTime: selectedTime,
            reason: reason || null,
        })
            .then(() => {
                message.success("Appointment booked successfully");
                navigate("/patient/appointments");
            })
            .catch((error) => {
                message.error(error.response?.data?.message || "Failed to book appointment");
            })
            .finally(() => setSubmitting(false));
    };

    const steps = [
        {
            title: "Doctor",
            content: (
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Search
                        placeholder="Search doctors…"
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        enterButton
                    />
                    <Select
                        showSearch
                        placeholder="Choose a doctor"
                        style={{ width: "100%" }}
                        onChange={handleDoctorSelect}
                        value={selectedDoctor?.id}
                        options={filteredDoctors.map((d) => ({
                            label: `${d.firstName} ${d.lastName}`,
                            value: d.id,
                        }))}
                    />
                </Space>
            ),
        },
        {
            title: "Service",
            content: (
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Search
                        placeholder="Search services…"
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        enterButton
                    />
                    <Select
                        showSearch
                        placeholder="Choose a service"
                        style={{ width: "100%" }}
                        onChange={(id) =>
                            setSelectedService(services.find((s) => s.id === id) || null)
                        }
                        value={selectedService?.id}
                        options={filteredServices.map((s) => ({
                            label: `${s.name} — NPR ${s.price}`,
                            value: s.id,
                        }))}
                    />
                </Space>
            ),
        },
        {
            title: "Date & Time",
            content: (
                <>
                    <Text>Select date</Text>
                    <DatePicker
                        style={{ width: "100%", marginTop: 8 }}
                        disabledDate={disabledDate}
                        onChange={(d) => {
                            setSelectedDate(d);
                            setSelectedTime(null);
                        }}
                        value={selectedDate}
                    />
                    {selectedDate && selectedService && (
                        <>
                            <Text style={{ marginTop: 16, display: "block" }}>
                                Select time slot
                            </Text>
                            <Row gutter={[8, 8]}>
                                {generateTimeSlots().map((slot) => (
                                    <Col key={slot} xs={8}>
                                        <Button
                                            block
                                            type={selectedTime === slot ? "primary" : "default"}
                                            onClick={() => setSelectedTime(slot)}
                                        >
                                            {slot}
                                        </Button>
                                    </Col>
                                ))}
                            </Row>
                        </>
                    )}
                </>
            ),
        },
        {
            title: "Confirm",
            content: (
                <>
                    <Card size="small" style={{ marginBottom: 16 }}>
                        <Text>
                            <strong>Doctor:</strong> {selectedDoctor?.firstName}{" "}
                            {selectedDoctor?.lastName}
                        </Text>
                        <br />
                        <Text>
                            <strong>Service:</strong> {selectedService?.name}
                        </Text>
                        <br />
                        <Text>
                            <strong>Date:</strong> {selectedDate?.format("YYYY-MM-DD")}
                        </Text>
                        <br />
                        <Text>
                            <strong>Time:</strong> {selectedTime}
                        </Text>
                    </Card>
                    <TextArea
                        rows={3}
                        placeholder="Reason (optional)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                </>
            ),
        },
    ];

    return (
        <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 24px" }}>
            <Card bordered={false} style={{ borderRadius: 16 }}>
                <Title level={4}>Book Appointment</Title>
                <Steps current={currentStep} items={steps.map((s) => ({ title: s.title }))} />
                <div style={{ minHeight: 240, marginTop: 24 }}>
                    {steps[currentStep].content}
                </div>
                <Space
                    style={{ justifyContent: "space-between", width: "100%", marginTop: 24 }}
                >
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
                        >
                            Next
                        </Button>
                    ) : (
                        <Button type="primary" onClick={handleSubmit} loading={submitting}>
                            Book Appointment
                        </Button>
                    )}
                </Space>
            </Card>
        </div>
    );
};

export default BookAppointment;
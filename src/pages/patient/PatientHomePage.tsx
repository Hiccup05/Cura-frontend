import { useEffect, useRef, useState } from 'react';
import {
    Carousel,
    Card,
    Button,
    Typography,
    Row,
    Col,
    Space,
    Tag,
    Modal
} from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { PublicDoctor } from '../../types/appointment';
import { MedicalService } from '../../types/admin';

const { Title, Text } = Typography;

const PatientHomePage = () => {
    const navigate = useNavigate();

    const [services, setServices] = useState<MedicalService[]>([]);
    const [doctors, setDoctors] = useState<PublicDoctor[]>([]);
    const serviceCarouselRef = useRef<any>(null);
    const doctorCarouselRef = useRef<any>(null);

    // Modal state
    const [selectedServiceModal, setSelectedServiceModal] = useState<MedicalService | null>(null);
    const [serviceModalOpen, setServiceModalOpen] = useState(false);

    useEffect(() => {
        // load services
        api.get('/public/service')
            .then((res) => setServices(res.data))
            .catch(() => { });

        // load doctors
        api.get('/public/doctors')
            .then((res) => setDoctors(res.data))
            .catch(() => { });
    }, []);

    const handleBookDoctor = (doctorId: number) => {
        navigate(`/patient/book?doctorId=${doctorId}`);
    };

    const openServiceDetails = (service: MedicalService) => {
        setSelectedServiceModal(service);
        setServiceModalOpen(true);
    };

    return (
        <>
            <div style={{ padding: '0 40px' }}>
                {/* Hero */}
                <section style={{ textAlign: 'center', padding: '120px 0 60px' }}>
                    <Title>Find Your Doctor Anytime, Anywhere</Title>
                    <Text>Quick and easy appointments with top doctors.</Text>
                    <div style={{ marginTop: 24 }}>
                        <Button type="primary" size="large" onClick={() => navigate('/patient/book')}>
                            Book Appointment
                        </Button>
                    </div>
                </section>

                {/* Services Carousel */}
                <section style={{ marginTop: 60 }}>
                    <Title level={2}>Our Services</Title>

                    {services.length > 0 ? (
                        <div style={{ position: 'relative' }}>
                            <Button
                                style={{ position: 'absolute', left: -30, top: '40%', zIndex: 1 }}
                                onClick={() => serviceCarouselRef.current?.prev()}
                            >
                                ‹
                            </Button>

                            <Carousel
                                ref={serviceCarouselRef}
                                dots={false}
                                slidesToShow={3}
                                slidesToScroll={1}
                                responsive={[
                                    { breakpoint: 1024, settings: { slidesToShow: 2 } },
                                    { breakpoint: 600, settings: { slidesToShow: 1 } }
                                ]}
                            >
                                {services.map((s) => (
                                    <div key={s.id}>
                                        <Card
                                            hoverable
                                            style={{ margin: '0 8px', cursor: 'pointer' }}
                                            onClick={() => openServiceDetails(s)}
                                        >
                                            <Card.Meta
                                                title={s.name}
                                                description={`NPR ${s.price} — ${s.durationMinutes} mins`}
                                            />
                                        </Card>
                                    </div>
                                ))}
                            </Carousel>

                            <Button
                                style={{ position: 'absolute', right: -30, top: '40%', zIndex: 1 }}
                                onClick={() => serviceCarouselRef.current?.next()}
                            >
                                ›
                            </Button>
                        </div>
                    ) : (
                        <Text>No services available</Text>
                    )}
                </section>

                {/* Doctors Carousel */}
                <section style={{ marginTop: 80 }}>
                    <Title level={2}>Our Doctors</Title>

                    {doctors.length > 0 ? (
                        <div style={{ position: 'relative' }}>
                            <Button
                                style={{ position: 'absolute', left: -30, top: '40%', zIndex: 1 }}
                                onClick={() => doctorCarouselRef.current?.prev()}
                            >
                                ‹
                            </Button>

                            <Carousel
                                ref={doctorCarouselRef}
                                dots={false}
                                slidesToShow={3}
                                slidesToScroll={1}
                                responsive={[
                                    { breakpoint: 1024, settings: { slidesToShow: 2 } },
                                    { breakpoint: 600, settings: { slidesToShow: 1 } }
                                ]}
                            >
                                {doctors.map((doc) => (
                                    <div key={doc.id}>
                                        <Card hoverable style={{ margin: '0 8px' }}>
                                            <Card.Meta
                                                title={`${doc.firstName} ${doc.lastName}`}
                                                description={
                                                    <>
                                                        <Text>{doc.yearsOfExperience} yrs exp</Text><br />
                                                        {doc.specialization.map((spec) => (
                                                            <Tag key={spec.id}>{spec.name}</Tag>
                                                        ))}
                                                    </>
                                                }
                                            />
                                            <Button
                                                type="primary"
                                                style={{ marginTop: 16, width: '100%' }}
                                                onClick={() => handleBookDoctor(doc.id)}
                                            >
                                                Book Now
                                            </Button>
                                        </Card>
                                    </div>
                                ))}
                            </Carousel>

                            <Button
                                style={{ position: 'absolute', right: -30, top: '40%', zIndex: 1 }}
                                onClick={() => doctorCarouselRef.current?.next()}
                            >
                                ›
                            </Button>
                        </div>
                    ) : (
                        <Text>No doctors available</Text>
                    )}
                </section>
            </div>

            {/* Service Details Modal */}
            <Modal
                title={selectedServiceModal?.name}
                open={serviceModalOpen}
                onCancel={() => setServiceModalOpen(false)}
                footer={null}
            >
                {selectedServiceModal && (
                    <>
                        <Text strong>Price:</Text> NPR {selectedServiceModal.price}<br />
                        <Text strong>Duration:</Text> {selectedServiceModal.durationMinutes} mins<br />
                        <Text strong>Description:</Text><br />
                        <Text>{selectedServiceModal.description || 'No description available'}</Text>
                    </>
                )}
            </Modal>
        </>
    );
};

export default PatientHomePage;
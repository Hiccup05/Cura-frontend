import DiscoveryHomeContent from '../../components/DiscoveryHomeContent';

const PatientHomePage = () => {
    return (
        <DiscoveryHomeContent
            bookBasePath="/patient/book"
            heroTitle="Care that fits your life"
            heroSubtitle="Find a doctor or service, then book your visit in a few steps."
            heroPrimaryLabel="Book appointment"
        />
    );
};

export default PatientHomePage;

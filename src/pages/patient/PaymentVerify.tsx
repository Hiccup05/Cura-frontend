import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

const PaymentVerify = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pidx = searchParams.get('pidx');

    // if pidx exists in URL — backend already verified successfully
    // otherwise something went wrong
    if (!pidx) {
        return (
            <Result
                status="error"
                title="Payment Failed"
                subTitle="Something went wrong. Please try again."
                extra={
                    <Button type="primary" onClick={() => navigate('/patient/appointments')}>
                        Go Back
                    </Button>
                }
            />
        );
    }

    return (
        <Result
            status="success"
            title="Payment Successful!"
            subTitle="Your appointment has been confirmed."
            extra={
                <Button type="primary" onClick={() => navigate('/patient/appointments')}>
                    View Appointments
                </Button>
            }
        />
    );
};

export default PaymentVerify;
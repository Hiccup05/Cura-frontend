import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();
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

export default PaymentSuccess;
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
    const navigate = useNavigate();
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
};

export default PaymentFailed;
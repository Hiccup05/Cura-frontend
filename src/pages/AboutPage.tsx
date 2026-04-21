import { Button, Card, Space, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const AboutPage = () => {
    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 16px 48px' }}>
            <Space direction="vertical" size={20} style={{ width: '100%' }}>
                <Card size="small">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: 16 }}>Cura Healthcare</Text>
                        <Space wrap>
                            <Link to="/">Home</Link>
                            <Link to="/about">About</Link>
                            <Link to="/login">
                                <Button type="primary">Login</Button>
                            </Link>
                        </Space>
                    </div>
                </Card>

                <Card>
                    <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Title level={2} style={{ margin: 0 }}>About Us</Title>
                        <Paragraph style={{ margin: 0 }}>
                            Hey, I am <Text strong>Hiccup</Text>.
                        </Paragraph>
                        <Paragraph style={{ margin: 0 }}>
                            <Text italic>Person who thinks can make it work out.</Text>
                        </Paragraph>
                        <Paragraph style={{ margin: 0 }}>
                            I enjoy building backend systems and APIs. I like turning ideas into working features with Java and Spring.
                            This project is part of my learning journey, and the goal is simple: keep improving by building real things.
                        </Paragraph>
                        <Paragraph style={{ margin: 0 }}>
                            You can find me on GitHub: <a href="https://github.com/Hiccup05" target="_blank" rel="noreferrer">Hiccup05</a>
                        </Paragraph>
                    </Space>
                </Card>

                <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: 8 }}>
                    Copyright {new Date().getFullYear()} Cura Healthcare. All rights reserved.
                </Text>
                <Text type="secondary" style={{ textAlign: 'center', display: 'block', marginTop: -8 }}>
                    Built by Hiccup
                </Text>
            </Space>
        </div>
    );
};

export default AboutPage;

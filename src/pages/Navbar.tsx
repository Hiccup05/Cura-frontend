import { useNavigate } from 'react-router-dom';

const TEAL = '#0ea5e9';
const DARK_BG = '#0f172a';
const TEXT_COLOR = '#f8fafc';

const Navbar = () => {
    const navigate = useNavigate();

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const yOffset = -64;
        const y = el.getBoundingClientRect().top + window.scrollY + yOffset;

        window.scrollTo({ top: y, behavior: 'smooth' });
    };

    return (
        <nav
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                background: DARK_BG,
                boxShadow: '0 1px 16px rgba(0,0,0,0.4)',
                zIndex: 1000,
            }}
        >
            <div
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                }}
            >
                <img
                    src="https://res.cloudinary.com/docykoj1r/image/upload/v1776766564/logo.png"
                    alt="Cura"
                    style={{
                        height: 36,
                        objectFit: 'contain',
                    }}
                />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <button
                    onClick={() => scrollTo('services')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#cbd5e1',
                        fontSize: 14,
                    }}
                >
                    Services
                </button>

                <button
                    onClick={() => scrollTo('doctors')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#cbd5e1',
                        fontSize: 14,
                    }}
                >
                    Doctors
                </button>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '6px 18px',
                        borderRadius: 20,
                        border: `1px solid #334155`,
                        background: 'transparent',
                        cursor: 'pointer',
                        color: TEXT_COLOR,
                    }}
                >
                    Sign In
                </button>

                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '7px 20px',
                        borderRadius: 20,
                        background: TEAL,
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 500,
                    }}
                >
                    Book Now
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
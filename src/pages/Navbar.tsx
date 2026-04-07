import { useNavigate } from 'react-router-dom';

const TEAL = '#0ea5e9';
const DARK_BG = '#0f172a'; // base dark color
const TEXT_COLOR = '#f8fafc'; // light text

const Navbar = () => {
    const navigate = useNavigate();

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (!el) return;

        const yOffset = -64; // navbar height
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
                background: DARK_BG, // dark background
                boxShadow: '0 1px 16px rgba(0,0,0,0.4)',
                zIndex: 1000,
            }}
        >
            {/* Logo */}
            <div
                onClick={() => navigate('/')}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    cursor: 'pointer',
                }}
            >
                <div
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: 7,
                        background: TEAL,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: 600,
                    }}
                >
                    +
                </div>
                <span style={{ fontSize: 18, fontWeight: 600, color: TEXT_COLOR }}>
                    Cura
                </span>
            </div>

            {/* Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                <button
                    onClick={() => scrollTo('services')}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#cbd5e1', // lighter gray for link
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
                        color: '#cbd5e1', // lighter gray
                        fontSize: 14,
                    }}
                >
                    Doctors
                </button>

                {/* Sign In */}
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '6px 18px',
                        borderRadius: 20,
                        border: `1px solid #334155`, // darker border
                        background: 'transparent',
                        cursor: 'pointer',
                        color: TEXT_COLOR,
                    }}
                >
                    Sign In
                </button>

                {/* CTA */}
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
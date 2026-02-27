import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
    const { login } = useAuth();
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const canvasRef = useRef(null);

    // 3D Floating Particles Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animId;
        let particles = [];
        let mouse = { x: -1000, y: -1000 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 1000;
                this.baseSize = Math.random() * 3 + 1;
                this.speedX = (Math.random() - 0.5) * 0.8;
                this.speedY = (Math.random() - 0.5) * 0.8;
                this.speedZ = (Math.random() - 0.5) * 2;
                this.color = `hsl(${190 + Math.random() * 60}, 100%, ${50 + Math.random() * 30}%)`;
                this.pulseSpeed = Math.random() * 0.02 + 0.01;
                this.pulsePhase = Math.random() * Math.PI * 2;
            }

            update(time) {
                this.x += this.speedX;
                this.y += this.speedY;
                this.z += this.speedZ;

                // 3D perspective
                const perspective = 800 / (800 + this.z);
                this.projX = (this.x - canvas.width / 2) * perspective + canvas.width / 2;
                this.projY = (this.y - canvas.height / 2) * perspective + canvas.height / 2;
                this.projSize = this.baseSize * perspective;

                // Mouse interaction — particles flee from cursor
                const dx = this.projX - mouse.x;
                const dy = this.projY - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x += (dx / dist) * force * 2;
                    this.y += (dy / dist) * force * 2;
                }

                // Pulse effect
                this.pulse = Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.5 + 0.5;

                // Wrap
                if (this.x < -50) this.x = canvas.width + 50;
                if (this.x > canvas.width + 50) this.x = -50;
                if (this.y < -50) this.y = canvas.height + 50;
                if (this.y > canvas.height + 50) this.y = -50;
                if (this.z < 0) this.z = 1000;
                if (this.z > 1000) this.z = 0;
            }

            draw(ctx) {
                const alpha = (1000 - this.z) / 1000 * 0.6 + this.pulse * 0.3;
                ctx.beginPath();
                ctx.arc(this.projX, this.projY, this.projSize * (1 + this.pulse * 0.4), 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = Math.max(0.05, alpha);
                ctx.fill();

                // Glow
                ctx.beginPath();
                ctx.arc(this.projX, this.projY, this.projSize * 3 * (1 + this.pulse * 0.3), 0, Math.PI * 2);
                const grd = ctx.createRadialGradient(this.projX, this.projY, 0, this.projX, this.projY, this.projSize * 3);
                grd.addColorStop(0, this.color.replace(')', ', 0.2)').replace('hsl', 'hsla'));
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.globalAlpha = alpha * 0.4;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        resize();
        const count = Math.min(120, Math.floor(canvas.width * canvas.height / 8000));
        particles = Array.from({ length: count }, () => new Particle());

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const animate = (time) => {
            ctx.fillStyle = 'rgba(6, 8, 18, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw connections
            particles.forEach((p, i) => {
                p.update(time);
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.projX - p2.projX;
                    const dy = p.projY - p2.projY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 140) {
                        ctx.beginPath();
                        ctx.moveTo(p.projX, p.projY);
                        ctx.lineTo(p2.projX, p2.projY);
                        ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / 140) * 0.12})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
                p.draw(ctx);
            });

            // Floating geometric shapes (3D cubes)
            drawFloatingCubes(ctx, time, canvas);

            animId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        animId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        await new Promise(r => setTimeout(r, 1200));

        const result = login(email, password, role);
        setLoading(false);

        if (!result.success) {
            setError(result.error);
        }
    };

    const fillDemo = () => {
        if (role === 'student') {
            setEmail('rahul.sharma@university.edu');
            setPassword('student123');
        } else {
            setEmail('admin@university.edu');
            setPassword('admin123');
        }
    };

    return (
        <div className="login-page">
            <canvas ref={canvasRef} className="login-canvas" />

            {/* Floating 3D shapes */}
            <div className="login-shapes">
                <div className="floating-shape shape-1"><div className="shape-cube"><div className="cube-face front"></div><div className="cube-face back"></div><div className="cube-face left"></div><div className="cube-face right"></div><div className="cube-face top"></div><div className="cube-face bottom"></div></div></div>
                <div className="floating-shape shape-2"><div className="shape-pyramid"><div className="pyramid-face pf1"></div><div className="pyramid-face pf2"></div><div className="pyramid-face pf3"></div><div className="pyramid-face pf4"></div></div></div>
                <div className="floating-shape shape-3"><div className="shape-cube"><div className="cube-face front"></div><div className="cube-face back"></div><div className="cube-face left"></div><div className="cube-face right"></div><div className="cube-face top"></div><div className="cube-face bottom"></div></div></div>
                <div className="floating-shape shape-4"><div className="shape-ring"></div></div>
                <div className="floating-shape shape-5"><div className="shape-cube cube-sm"><div className="cube-face front"></div><div className="cube-face back"></div><div className="cube-face left"></div><div className="cube-face right"></div><div className="cube-face top"></div><div className="cube-face bottom"></div></div></div>
            </div>

            {/* Login Card */}
            <div className="login-container">
                <div className="login-card">
                    {/* Logo */}
                    <div className="login-logo">
                        <div className="logo-3d">
                            <i className="fas fa-graduation-cap"></i>
                        </div>
                        <h1>Campus<span>IQ</span></h1>
                        <p>AI-Powered Smart Campus Assistant</p>
                    </div>

                    {/* Role Switcher */}
                    <div className="role-switcher">
                        <button
                            className={`role-btn ${role === 'student' ? 'active' : ''}`}
                            onClick={() => { setRole('student'); setError(''); setEmail(''); setPassword(''); }}
                        >
                            <i className="fas fa-user-graduate"></i>
                            Student
                        </button>
                        <button
                            className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                            onClick={() => { setRole('admin'); setError(''); setEmail(''); setPassword(''); }}
                        >
                            <i className="fas fa-user-shield"></i>
                            Admin
                        </button>
                        <div className={`role-slider ${role === 'admin' ? 'admin' : ''}`}></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="login-input-group">
                            <i className="fas fa-envelope input-icon"></i>
                            <input
                                className="login-input"
                                type="email"
                                placeholder={role === 'student' ? 'Student email' : 'Admin email'}
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="login-input-group">
                            <i className="fas fa-lock input-icon"></i>
                            <input
                                className="login-input"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(''); }}
                                required
                                autoComplete="current-password"
                            />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                            </button>
                        </div>

                        {error && (
                            <div className="login-error">
                                <i className="fas fa-exclamation-circle"></i> {error}
                            </div>
                        )}

                        <button type="submit" className={`login-submit ${loading ? 'loading' : ''}`} disabled={loading}>
                            {loading ? (
                                <div className="spinner"></div>
                            ) : (
                                <>
                                    <span>Sign In as {role === 'student' ? 'Student' : 'Admin'}</span>
                                    <i className="fas fa-arrow-right"></i>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="demo-box">
                        <button className="demo-link" onClick={fillDemo}>
                            <i className="fas fa-magic"></i> Fill Demo Credentials
                        </button>
                        <div className="demo-creds">
                            {role === 'student' ? (
                                <p><strong>Demo:</strong> rahul.sharma@university.edu / student123</p>
                            ) : (
                                <p><strong>Demo:</strong> admin@university.edu / admin123</p>
                            )}
                        </div>
                    </div>

                    {/* Features */}
                    <div className="login-features">
                        {role === 'student' ? (
                            <>
                                <span className="login-tag"><i className="fas fa-calendar-alt"></i> Schedule</span>
                                <span className="login-tag"><i className="fas fa-chart-line"></i> Grades</span>
                                <span className="login-tag"><i className="fas fa-door-open"></i> Rooms</span>
                                <span className="login-tag"><i className="fas fa-robot"></i> AI Chat</span>
                            </>
                        ) : (
                            <>
                                <span className="login-tag"><i className="fas fa-database"></i> Data Mgmt</span>
                                <span className="login-tag"><i className="fas fa-users-cog"></i> Students</span>
                                <span className="login-tag"><i className="fas fa-chart-bar"></i> Analytics</span>
                                <span className="login-tag"><i className="fas fa-cog"></i> Settings</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Draw 3D floating cubes on canvas
function drawFloatingCubes(ctx, time, canvas) {
    const cubes = [
        { x: canvas.width * 0.15, y: canvas.height * 0.2, size: 20, speed: 0.0008, color: 'rgba(0, 212, 255, 0.12)' },
        { x: canvas.width * 0.85, y: canvas.height * 0.7, size: 15, speed: 0.0012, color: 'rgba(124, 58, 237, 0.12)' },
        { x: canvas.width * 0.7, y: canvas.height * 0.15, size: 12, speed: 0.001, color: 'rgba(244, 114, 182, 0.10)' },
    ];

    cubes.forEach(cube => {
        const angle = time * cube.speed;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const s = cube.size;
        const cx = cube.x + Math.sin(time * 0.0005) * 30;
        const cy = cube.y + Math.cos(time * 0.0007) * 20;

        // Simple 3D cube projection
        const vertices = [
            [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
            [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]
        ];

        const projected = vertices.map(([vx, vy, vz]) => {
            // Rotate Y
            let x1 = vx * cos - vz * sin;
            let z1 = vx * sin + vz * cos;
            // Rotate X
            const cosX = Math.cos(angle * 0.7);
            const sinX = Math.sin(angle * 0.7);
            let y1 = vy * cosX - z1 * sinX;
            z1 = vy * sinX + z1 * cosX;
            // Project
            const scale = 200 / (200 + z1);
            return [cx + x1 * scale, cy + y1 * scale];
        });

        const faces = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [2, 3, 7, 6], [0, 3, 7, 4], [1, 2, 6, 5]];
        faces.forEach(face => {
            ctx.beginPath();
            ctx.moveTo(projected[face[0]][0], projected[face[0]][1]);
            face.forEach(idx => ctx.lineTo(projected[idx][0], projected[idx][1]));
            ctx.closePath();
            ctx.strokeStyle = cube.color;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    });
}

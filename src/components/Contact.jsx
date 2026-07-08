import React, { useState } from 'react';
import Lanyard from './Lanyard';
import lauzaLanyardImg from '../assets/lauza_lanyard.jpg';

export default function Contact() {
    const [status, setStatus] = useState('idle'); // 'idle', 'submitting', 'success'
    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormValues(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('submitting');
        
        // Mock API call
        setTimeout(() => {
            setStatus('success');
            setFormValues({ name: '', email: '', subject: '', message: '' });
        }, 1500);
    };

    return (
        <section id="contact" className="contact-section">
            <div className="contact-card reveal-fade revealed">
                {/* Left side: Interactive 3D Lanyard Card */}
                <div className="contact-lanyard-container">
                    <Lanyard 
                        position={[0, 0, 17.5]} 
                        gravity={[0, -40, 0]} 
                        frontImage={lauzaLanyardImg} 
                    />
                </div>

                {/* Right side: Contact Form */}
                <div className="contact-form-container">
                    <div className="contact-form-header">
                        <span className="contact-form-tag">Get in Touch</span>
                        <h3 className="contact-form-title">Let's create something together</h3>
                    </div>
                    {status !== 'success' ? (
                        <form id="contact-form" className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="name">Your Name</label>
                                    <input 
                                        type="text" 
                                        id="name" 
                                        required 
                                        placeholder="e.g. John Doe"
                                        value={formValues.name}
                                        onChange={handleInputChange}
                                        disabled={status === 'submitting'}
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email Address</label>
                                    <input 
                                        type="email" 
                                        id="email" 
                                        required 
                                        placeholder="e.g. john@example.com"
                                        value={formValues.email}
                                        onChange={handleInputChange}
                                        disabled={status === 'submitting'}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="subject">Subject</label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    required 
                                    placeholder="Project inquiries..."
                                    value={formValues.subject}
                                    onChange={handleInputChange}
                                    disabled={status === 'submitting'}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea 
                                    id="message" 
                                    rows="5" 
                                    required 
                                    placeholder="Tell me more about your project goals..."
                                    value={formValues.message}
                                    onChange={handleInputChange}
                                    disabled={status === 'submitting'}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-submit" disabled={status === 'submitting'}>
                                <span>{status === 'submitting' ? 'Sending...' : 'Send Message'}</span>
                                <span className="send-arrow" style={{ transform: status === 'submitting' ? 'translateX(5px)' : 'none' }}>→</span>
                            </button>
                        </form>
                    ) : (
                        <div id="form-success" className="form-success-msg">
                            <div className="success-icon">✓</div>
                            <h3>Message Sent Successfully!</h3>
                            <p>Thank you for reaching out, Lauza will get back to you shortly.</p>
                            <button className="btn-submit" style={{ marginTop: '20px' }} onClick={() => setStatus('idle')}>
                                <span>Send Another Message</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

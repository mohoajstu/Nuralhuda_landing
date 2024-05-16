import React, { useState } from 'react';
import emailjs from 'emailjs-com';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    position: '',
    comments: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
      name: formData.name,
      email: formData.email
    };

    emailjs.send('service_rpg9tsq', 'template_uwvkykl', templateParams, '2c0CoID2ucNYaKVFe')
      .then((result) => {
        console.log('Email sent successfully:', result.text);
        alert('Registration successful! Check your email for confirmation.');
        navigate('/thank-you');
      }, (error) => {
        console.error('Error sending email:', error);
        alert('Registration failed, please try again.');
      });
  };

  const handleHome = () => {
    navigate('/');
  };

  return (
    <div className="register-container">
      <button className="home-button" onClick={handleHome}>Home</button>
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Webinar Registration</h2>
        <p className="event-description">
        We are Nur Al Huda, an organization focused on developing AI for Research education. Our upcoming webinar explores AI's potential in education and its practical applications for teachers. We aim to address challenges faced by educators in integrating Islamic components into daily lessons, particularly with the rise of AI and students misusing public tools for Islamic needs.        </p>
        <div className="input-group">
          <label>Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label>Position</label>
          <input type="text" name="position" value={formData.position} onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Comments</label>
          <textarea name="comments" value={formData.comments} onChange={handleChange}></textarea>
        </div>
        <button type="submit" className="register-button">Register</button>
      </form>
    </div>
  );
};

export default Register;

import React, { useState, useEffect } from "react";
import { db } from "../config/firebase-config"; // Adjust the import path as necessary
import MessageModal from "./MessageModal";
import { collection, addDoc } from "firebase/firestore";
import { useNavigate } from 'react-router-dom';

const ContactForm = () => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [number, setNumber] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "contactForm"), {
        name,
        position,
        number,
        message,
        email,
        timestamp: new Date()
      });
      console.log("Document written with ID: ", docRef.id);

      // Reset the form and show the modal
      setName("");
      setPosition("");
      setNumber("");
      setMessage("");
      setEmail("");
      setModalMessage("Thank you for your request. We will contact you soon regarding your request.");
      setShowModal(true);
      setErrorMessage("");
    } catch (e) {
      console.error("Error adding document: ", e);
      setErrorMessage("There was an error submitting your request. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/"); // Navigate to home page
  };

  return (
    <div className="contact-form-container">
      <div className="contact-form">
        <h2>Contact Us:</h2>
        <form onSubmit={handleSubmit}>
          <div className="contact-flex-container">
            <div className="contact-flex-item input-group">
              <label>Name:*</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="contact-flex-item input-group">
              <label>Position:*</label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Principal, Teacher, Parent"
                required
              />
            </div>
          </div>

          <div className="contact-flex-container">
            <div className="contact-flex-item input-group">
              <label htmlFor="email">Email address:*</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="contact-flex-item input-group">
              <label>Phone Number:</label>
              <input
                type="tel"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="+1(123) 456-7890"
              />
            </div>
          </div>

          <div className="contact-full-width textarea-group input-group">
            <label>Message:</label>
            <textarea
              value={message}
              placeholder="Outline your request:"
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
            />
          </div>
          <button type="submit" className="login-button">Submit</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
      <MessageModal
        isOpen={showModal}
        onClose={handleCloseModal}
        message={modalMessage}
      />
    </div>
  );
};

export default ContactForm;
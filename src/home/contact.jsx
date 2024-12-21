import { useState } from "react";
import emailjs from "emailjs-com";
import React from "react";
import SimpleModal from './SimpleModal.jsx';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const initialState = {
  name: "",
  email: "",
  message: "",
};

export const Contact = (props) => {
  const [{ name, email, message }, setState] = useState(initialState);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState((prevState) => ({ ...prevState, [name]: value }));
  };

  const clearState = () => setState({ ...initialState });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(name, email, message);

    emailjs
      .sendForm("service_rpg9tsq", "template_t06rk76", e.target, "2c0CoID2ucNYaKVFe")
      .then(
        (result) => {
          console.log(result.text);
          clearState();
          setShowModal(true);
        },
        (error) => {
          console.log(error.text);
        }
      );
  };

  const handleCloseModal = () => setShowModal(false);

  return (
    <div>
      <div id="contact">
        <div className="container">
          <div className="col-md-8">
            <div className="row">
              <div className="section-title">
                <h2>Get In Touch</h2>
                <p>
                  Please fill out the form below to send us an email and we will
                  get back to you as soon as possible.
                </p>
              </div>
              <form name="sentMessage" noValidate onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        placeholder="Name"
                        required
                        onChange={handleChange}
                        value={name}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        placeholder="Email"
                        required
                        onChange={handleChange}
                        value={email}
                      />
                      <p className="help-block text-danger"></p>
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <textarea
                    name="message"
                    id="message"
                    className="form-control"
                    rows="4"
                    placeholder="Message"
                    required
                    onChange={handleChange}
                    value={message}
                  ></textarea>
                  <p className="help-block text-danger"></p>
                </div>
                <div id="success"></div>
                <button type="submit" className="btn btn-custom btn-lg">
                  Send Message
                </button>
              </form>
            </div>
          </div>
          <div className="col-md-3 col-md-offset-1 contact-info">
            <div className="contact-item">
              <h3>Contact Info</h3>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-phone"></i> Phone
                </span>{" "}
                {props.data ? props.data.phone : "loading"}
              </p>
            </div>
            <div className="contact-item">
              <p>
                <span>
                  <i className="fa fa-envelope-o"></i> Email
                </span>{" "}
                {props.data ? props.data.email : "loading"}
              </p>
            </div>
          </div>
          <div className="col-md-12">
            <div className="row">
              <div className="social">
                <ul>
                  <li>
                    <a href={props.data ? props.data.facebook : "/"}>
                      <i className="fa fa-facebook"></i>
                    </a>
                  </li>
                  <li>
                    <a href={props.data ? props.data.instagram : "/"}>
                      <i className="fa fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href={props.data ? props.data.youtube : "/"}>
                      <i className="fa fa-youtube"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="footer">
    <div className="container text-center">
        <p>
            Disclaimer: <br />
            At Nur Al Huda, we strive to provide insightful Islamic teachings
            using advanced AI technology. While our AI continuously evolves and
            improves for an enhanced user experience, it is not flawless. The
            responses and information provided here are for educational and
            informational purposes only and should not be taken as Islamic legal
            rulings (fatwa). We recommend consulting qualified Islamic scholars
            for detailed guidance, particularly on matters related to fiqh
            (Islamic jurisprudence). Your journey of understanding and knowledge
            is important to us, and we are committed to supporting it with the
            most accurate and helpful information possible.
        </p>
        <p>
            <Link to="/privacy-policy">Privacy Policy</Link> |{" "}
            <Link to="/terms-of-use">Terms of Use</Link> |{" "}
            <a
                href="https://billing.stripe.com/p/login/14kfYZ43Qa1L63K3cc"
                target="_blank"
                rel="noopener noreferrer"
            >
                Customer Portal
            </a>
        </p>
    </div>
</div>

      {/* Modal */}
      <SimpleModal
        isOpen={showModal}
        onClose={handleCloseModal}
        message="Thank you for your submission. We will reach out soon."
      />
    </div>
  );
};

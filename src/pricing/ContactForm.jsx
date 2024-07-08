import React, { Component } from "react";

class ContactForm extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      position: "",
      number: "",
      message: "",
      email: ""
    };
  }
  
  componentDidMount() {
    // Hide overflow when the component mounts
    document.body.style.overflow = 'hidden';
  }

  componentWillUnmount() {
    // Revert overflow when the component unmounts
    document.body.style.overflow = 'auto';
  }

  handlenameChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  handlepositionChange = (event) => {
    this.setState({
      position: event.target.value,
    });
  };

  handlenumberChange = (event) => {
    this.setState({
      number: event.target.value,
    });
  };

  handlemessageChange = (event) => {
    this.setState({
      message: event.target.value,
    });
  };

  handleemailChange = (event) => {
    this.setState({
      email: event.target.value,
    });
  };

  handleSubmit = (event) => {
    
    //Add code to send data backend
    
    this.setState({
      name: "",
      position: "",
      number: "",
      message: "",
      email: ""
    });
    event.preventDefault();
  };



  render() {
    const { name, position, number, message, email } = this.state;
    return (
      <div className="contact-form-container">
        <div className="contact-form">
          <h2>Contact Us:</h2>
          <form onSubmit={this.handleSubmit}>
            <div className="contact-flex-container">
              <div className="contact-flex-item input-group">
                <label>Name:*</label>
                <input
                  type="text"
                  value={name}
                  onChange={this.handlenameChange}
                  required
                />
              </div>
              <div className="contact-flex-item input-group">
                <label>Position:*</label>
                <input
                  type="text"
                  value={position}
                  onChange={this.handlepositionChange}
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
                    onChange={this.handleemailChange}
                    required
                />
              </div>

              <div className="contact-flex-item input-group">
                <label>Phone Number:</label>
                  <input
                    type="tel"
                    value={number}
                    onChange={this.handlenumberChange}
                    placeholder="+1(123)456-7890"
                  />
              </div>

            </div>
              
            <div className="contact-full-width textarea-group input-group">
              <label>Message:</label>
              <textarea value={message} placeholder="Outline your request:" onChange={this.handlemessageChange} rows="4" />
            </div>
            <button type="submit" className="login-button">Submit</button>
          </form>
        </div>
      </div>
    );
  }
}

export default ContactForm;

import React, { Component } from "react";

class ContactForm extends Component {
  
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      position: "",
      plan: "Basic",
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

  handleplanChange = (event) => {
    this.setState({
      plan: event.target.value,
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
      plan: "Basic",
      message: "",
      email: ""
    });
    event.preventDefault();
  };



  render() {
    const { name, position, plan, message, email } = this.state;
    return (
      <div className="contact-form-container">
        <div className="contact-form">
          <h2>Contact Us:</h2>
          <form onSubmit={this.handleSubmit}>
            <div className="contact-flex-container">
              <div className="contact-flex-item input-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={this.handlenameChange}
                />
              </div>
              <div className="contact-flex-item input-group">
                <label>Position:</label>
                <input
                  type="text"
                  value={position}
                  onChange={this.handlepositionChange}
                />
              </div>
            </div>

            <div className="contact-flex-container">
              <div className="contact-flex-item input-group">
                <label>Plan:</label>
                <select value={plan} onChange={this.handleplanChange}>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="contact-flex-item input-group">
                <label htmlFor="email">Email address:</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={this.handleemailChange}
                    required
                />
              </div>
            </div>
              
            <div className="contact-full-width textarea-group input-group">
              <label>Message:</label>
              <textarea value={message} onChange={this.handlemessageChange} rows="4" />
            </div>
            <button type="submit" className="login-button">Submit</button>
          </form>
        </div>
      </div>
    );
  }
}

export default ContactForm;

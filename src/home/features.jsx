import React from "react";

export const Features = (props) => {

  return (
    <div id="features" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Our Features</h2>
          <p>
            We offer a varity of different features including:
          </p>
        </div>
        <div className="row">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.name}-${i}`} className="col-sm-6 col-md-6 col-lg-6">
                  {" "}
                  <i className={d.icon}></i>
                  <div className="features-desc">
                    <h3>{d.name}</h3>
                    <p>{d.text}</p>
                  </div>
                </div>
              ))
            : "loading"}
        </div>
      </div>
    </div>
  );
};

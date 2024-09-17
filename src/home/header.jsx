import React from "react";
import { useNavigate } from "react-router-dom";

export const Header = (props) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat/nurAlHuda');
  };
  

  return (
    <header id="header">
      <div className="intro">
        <div className="overlay">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-8 col-md-offset-2 intro-text text-center">
                <h1>
                  {props.data ? props.data.title : "Loading"}
                  <span></span>
                </h1>
                <p>{props.data ? props.data.paragraph : "Loading"}</p>
                <a
                  onClick={handleClick}
                  className="text-center btn btn-custom btn-lg page-scroll"
                >
                  Start Now
                </a>{" "}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

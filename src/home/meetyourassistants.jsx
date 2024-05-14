import React from "react";
import { Image } from "./image";

export const Meetyourassistants = (props) => {
  return (
    <div id="meetyourassistants" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Meet Your Assistants</h2>
        </div>
        <div className="row">
          {props.data
            ? props.data.map((d, i) => (
                <div key={`${d.title}-${i}`} className="col-6 col-sm-4 col-md-4 col-lg-4 col-xl-3">
                  {" "}
                  <Image iconImg={d.iconImg} size={75} />
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                </div>
              ))
            : "Loading..."}
        </div>
      </div>
    </div>
  );
};

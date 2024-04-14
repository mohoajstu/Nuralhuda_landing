import { Image } from "./image";
import React from "react";

export const Assistants = (props) => {
  return (
    <div id="assistants" className="text-center">
      <div className="container">
        <div className="section-title">
          <h2>Assistants</h2>
          <p>
          At the heart of our mission is the commitment to provide specialized, user-centric Islamic learning and research tools. Our library of assistants, each with its unique focus, is designed to cater to diverse needs, from general inquiries to educational material for children, and from research assistance to in-depth scholarly exploration.
          </p>
        </div>
        <div className="row">
          <div className="assitants-items">
            {props.data
              ? props.data.map((d, i) => (
                  <div
                    key={`${d.title}-${i}`}
                    className="col-sm-4 col-md-3 col-lg-3"
                  >
                    <Image
                      title={d.title}
                      largeImage={d.largeImage}
                      smallImage={d.smallImage}
                    />
                  </div>
                ))
              : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
};

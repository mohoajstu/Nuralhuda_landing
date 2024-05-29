import React from 'react';
import { useNavigate } from 'react-router-dom';

const titleToChatbotTypeMap = {
  'Nur Al Huda': 'nurAlHuda',
  'Nur Al Huda For Kids': 'nurAlHudaForKids',
  'Islamic Socratic Method': 'islamicSocraticMethod',
  'AI for Islamic Research': 'aiForIslamicResearch',
  'Iqra With Us': 'iqraWithUs',
  default: 'default', 
};
export const Assistants = (props) => {
  const navigate = useNavigate();

  const navigateToChat = (chatbotType) => {
    navigate(`/chat/${encodeURIComponent(chatbotType)}`);
  };

    return (
      <div id="assistants" className="assistants-section text-center">
        <div className="container">
        <div className="section-title">
          <h2>Assistants</h2>
          <p>
            At the heart of our mission is the commitment to provide specialized, user-centric Islamic learning and research tools. Our library of assistants, each with its unique focus, is designed to cater to diverse needs, from general inquiries to educational material for children, and from research assistance to in-depth scholarly exploration.
          </p>
          <h3>Try Us Now!</h3>
        </div>
          <div className="row">
          <div className="assistants-items">
            {props.data ? props.data.map((d, i) => (
              <div key={`${d.title}-${i}`} className="col-6 col-sm-4 col-md-4 col-lg-3 col-xl-3">
                <button
                  className="assistant-title-button"
                  onClick={() => navigateToChat(titleToChatbotTypeMap[d.title] || 'default')}
                >
                  <h4 className="h4-text">{d.title}</h4>
                </button>

                <div
                  className="assistant-container"
                  onClick={() => navigateToChat(titleToChatbotTypeMap[d.title] || 'default')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="hover-bg">
                    <img
                      src={d.smallImage}
                      className={`img-responsive ${d.title === 'Nur Al Huda For Kids' ? 'nur-al-huda-kids-img' : ''}`}
                      alt={d.title}
                      style={d.title === 'Nur Al Huda For Kids' ? { width: 'auto', maxWidth: '250px', height: 'auto' } : {}}
                    />
                    <div className="hover-text">
                      <h4 className="h4-text">{d.title}</h4>
                    </div>
                  </div>
                </div>
              </div>
            )) : "Loading..."}
          </div>
        </div>
      </div>
    </div>
  );
  };

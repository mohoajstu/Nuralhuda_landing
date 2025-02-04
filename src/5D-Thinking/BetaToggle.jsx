import React, { useState } from "react";
import { Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FaInfoCircle } from "react-icons/fa";
import "./BetaToggle.css"; // Import styles

// Styled iOS-style switch using MUI
const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 42,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0,
    margin: 2,
    transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(16px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        backgroundColor: "#144040", // Updated to match your theme
        opacity: 1,
        border: 0,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxSizing: "border-box",
    width: 22,
    height: 22,
  },
  "& .MuiSwitch-track": {
    borderRadius: 26 / 2,
    backgroundColor: "#E9E9EA",
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const BetaToggle = ({ isBetaTest, setIsBetaTest }) => {
  const [isTooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="beta-toggle-container">
      <strong>Beta Test:</strong>
      {/* iOS-style Toggle Switch */}
      <IOSSwitch
        checked={isBetaTest}
        onChange={(e) => setIsBetaTest(e.target.checked)}
      />

      {/* Clickable Info Icon */}
      <div className="info-container">
        <FaInfoCircle
          className="beta-info-icon"
          onClick={() => setTooltipVisible(!isTooltipVisible)}
        />
        
        {/* Tooltip (Only visible when clicked) */}
        {isTooltipVisible && (
          <div className="tooltip">
            <strong>Beta Test:</strong> You are using a new version of the 5D Lesson Planner with an updated reasoning model.  
            <br /><br />
            <strong>⚠️ Please Note:</strong> This model takes longer to generate slides, but offers more detailed reasoning.  
            <br /><br />
            Mistakes may occur—please share your feedback!
          </div>
        )}
      </div>
    </div>
  );
};

export default BetaToggle;

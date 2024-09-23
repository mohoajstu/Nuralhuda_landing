import React from 'react';
import './ScheduleDisplay.css'; // Import the CSS file

const ScheduleDisplay = ({ schedule }) => {
    const timeSlots = [
        "9:00-10:00", "10:00-10:10", "10:10-11:00", "11:00-12:00", 
        "12:00-12:45", "12:45-1:45", "1:45-2:00", "2:00-3:00"
    ];

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return (
        <div className="weekly-schedule-container">
            <h2>Weekly Schedule</h2>
            <div className="schedule-grid">
                {/* Render the header row with the days of the week */}
                <div className="header time-label"></div>
                {daysOfWeek.map(day => (
                    <div key={day} className="header day-header">{day}</div>
                ))}

                {/* Render the time slots and schedule cells */}
                {timeSlots.map((time, timeIndex) => (
                    <React.Fragment key={time}>
                        <div className="time-label">{time}</div>
                        {daysOfWeek.map(day => (
                            <div 
                                key={`${day}-${time}`} 
                                className={`schedule-cell ${timeIndex % 2 === 0 ? 'even' : 'odd'}`}
                            >
                                {schedule[day][time] ? schedule[day][time] : 'Available'}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ScheduleDisplay;

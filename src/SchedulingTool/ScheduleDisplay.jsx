import React from 'react';
import './ScheduleDisplay.css';

const ScheduleDisplay = ({ schedule, grade }) => {
    const timeSlots = [
        { time: "9:00-10:00", label: "Class" },
        { time: "10:00-10:10", label: "Nutrition Break" },
        { time: "10:10-11:00", label: "Class" },
        { time: "11:00-12:00", label: "Class" },
        { time: "12:00-12:45", label: "Lunch" },
        { time: "12:45-1:45", label: "Class" },
        { time: "1:45-2:00", label: "Nutrition Break" },
        { time: "2:00-3:00", label: "Class" },
    ];

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return (
        <div className="weekly-schedule-container">
            <h2>Grade {grade} Weekly Schedule</h2>
            <div className="schedule-grid">
                {/* Render the header row with the days of the week */}
                <div className="header time-label"></div>
                {daysOfWeek.map((day) => (
                    <div key={day} className="header day-header">
                        {day}
                    </div>
                ))}

                {/* Render the time slots and schedule cells */}
                {timeSlots.map(({ time, label }, timeIndex) => (
                    <React.Fragment key={time}>
                        <div className="time-label">
                            {time} <span className="slot-label">{label}</span>
                        </div>
                        {daysOfWeek.map((day) => {
                            const slotData = schedule?.[grade]?.[day]?.[time];

                            const isBreak = label.includes("Break") || label === "Lunch";
                            
                            // Debugging output
                            // console.log(`slotData for ${day} ${time}:`, slotData);

                            return (
                                <div 
                                    key={`${day}-${time}`} 
                                    className={`schedule-cell ${timeIndex % 2 === 0 ? 'even' : 'odd'}`}
                                >
                                    {isBreak ? (
                                        <div><strong>{label}</strong></div>
                                    ) : slotData ? (
                                        <>
                                            <div><strong>Subject:</strong> {slotData.subject}</div>
                                            <div><strong>Teacher:</strong> {slotData.teacher}</div>
                                        </>
                                    ) : (
                                        <div><em>Unscheduled</em></div>
                                    )}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

export default ScheduleDisplay;

import React from 'react';
import './TeacherDisplay.css'; // Import CSS for styling

const TeacherDisplay = ({ teachers, onTeacherClick, selectedTeacher, closeTeacherDetails }) => {
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
        <div className="teacher-display-container">
            <h2>Added Teachers</h2>
            <div className="teachers-list">
                {teachers.length > 0 ? (
                    teachers.map((teacher, index) => (
                        <div 
                            key={index} 
                            className="teacher-card"
                            onClick={() => onTeacherClick(teacher)}
                        >
                            {teacher.name}
                        </div>
                    ))
                ) : (
                    <p>No teachers added yet.</p>
                )}
            </div>

            {/* Display the selected teacher's details */}
            {selectedTeacher && (
                <div className="teacher-details-wrapper">
                    <div className="teacher-details-header">
                        <h2>{selectedTeacher.name}'s Details</h2>
                        <button className="teacher-close-button" onClick={closeTeacherDetails}>Close</button>
                    </div>
                    <div className="teacher-details-content">
                        <p><strong>Type:</strong> {selectedTeacher.type}</p>
                        <p><strong>Subjects:</strong> {selectedTeacher.subjects.join(', ')}</p>
                        <p><strong>Grade Levels:</strong> {selectedTeacher.gradeLevels.map(level => `Grade ${level}`).join(', ')}</p>
                        
                        {/* Availability Grid */}
                        <h3>Availability:</h3>
                        <div className="teacher-schedule-grid">
                            {/* Render the header row with the days of the week */}
                            <div className="teacher-header time-label"></div>
                            {daysOfWeek.map(day => (
                                <div key={day} className="teacher-header day-header">{day}</div>
                            ))}

                            {/* Render the time slots and availability cells */}
                            {timeSlots.map(({ time, label }, timeIndex) => (
                                <React.Fragment key={time}>
                                    <div className="time-label">
                                        {time} <span className="slot-label">{label}</span>
                                    </div>
                                    {daysOfWeek.map(day => (
                                        <div 
                                            key={`${day}-${time}`} 
                                            className={`teacher-schedule-cell ${timeIndex % 2 === 0 ? 'even' : 'odd'}`}
                                        >
                                            {selectedTeacher.availability[day]?.includes(time) ? '✓' : label}
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDisplay;

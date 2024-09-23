import React from 'react';
import './TeacherDisplay.css'; // Import CSS for styling

const TeacherDisplay = ({ teachers, onTeacherClick, selectedTeacher, closeTeacherDetails }) => {
    const timeSlots = ["9:00-10:00", "10:00-10:10", "10:10-11:00", "11:00-12:00", "12:00-12:45", "12:45-1:45", "1:45-2:00", "2:00-3:00"];
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

            {/* Display the selected teacher's availability using a grid similar to the weekly schedule format */}
            {selectedTeacher && (
                <div className="teacher-weekly-schedule-wrapper">
                    <div className="schedule-header">
                        <h2>{selectedTeacher.name}'s Availability</h2>
                        <button className="teacher-close-button" onClick={closeTeacherDetails}>Close</button>
                    </div>
                    
                    <div className="teacher-schedule-grid">
                        {/* Render the header row with the days of the week */}
                        <div className="teacher-header time-label"></div>
                        {daysOfWeek.map(day => (
                            <div key={day} className="teacher-header day-header">{day}</div>
                        ))}

                        {/* Render the time slots and availability cells */}
                        {timeSlots.map((time, timeIndex) => (
                            <React.Fragment key={time}>
                                <div className="time-label">{time}</div>
                                {daysOfWeek.map(day => (
                                    <div 
                                        key={`${day}-${time}`} 
                                        className={`teacher-schedule-cell ${timeIndex % 2 === 0 ? 'even' : 'odd'}`}
                                    >
                                        {selectedTeacher.availability[day]?.includes(time) ? '✓' : ''}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherDisplay;

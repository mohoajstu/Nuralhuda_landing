import React, { useState } from 'react';
import './TeacherInput.css'; // Import the CSS file

const TeacherInput = ({ addTeacher }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState('part-time');
    const [availability, setAvailability] = useState({
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
    });

    const handleAvailabilityChange = (day, timeSlot) => {
        setAvailability(prev => ({
            ...prev,
            [day]: prev[day].includes(timeSlot)
                ? prev[day].filter(slot => slot !== timeSlot)
                : [...prev[day], timeSlot],
        }));
    };

    const handleSubmit = () => {
        if (name.trim() === '') {
            alert('Please enter a teacher name');
            return;
        }

        const teacherData = {
            name,
            type,
            availability
        };

        addTeacher(teacherData);

        // Clear the form
        setName('');
        setType('part-time');
        setAvailability({
            Monday: [],
            Tuesday: [],
            Wednesday: [],
            Thursday: [],
            Friday: [],
        });
    };

    const timeSlots = ["9:00-10:00", "10:10-11:00", "11:00-12:00", "12:45-1:45", "2:00-3:00"];
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    return (
        <div className="teacher-input-container">
            <h2>Add Teacher</h2>
            <input 
                type="text" 
                placeholder="Teacher Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="teacher-name-input"
            />
            <select value={type} onChange={(e) => setType(e.target.value)} className="teacher-type-select">
                <option value="part-time">Part-Time</option>
                <option value="full-time">Full-Time</option>
            </select>

            <div className="availability-grid">
                {/* Render day headers */}
                <div className="time-label"></div> {/* Placeholder for the top-left corner */}
                {daysOfWeek.map(day => (
                    <div key={day} className="day-header">{day}</div>
                ))}

                {/* Render the availability grid for each time slot */}
                {timeSlots.map((time, timeIndex) => (
                    <React.Fragment key={time}>
                        <div className="time-label">{time}</div>
                        {daysOfWeek.map(day => (
                            <div 
                                key={`${day}-${time}`} 
                                className={`availability-cell ${availability[day].includes(time) ? 'selected' : ''}`}
                                onClick={() => handleAvailabilityChange(day, time)}
                            >
                                {availability[day].includes(time) ? '✓' : ''}
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>
            <button onClick={handleSubmit} className="submit-button">Add Teacher</button>
        </div>
    );
};

export default TeacherInput;

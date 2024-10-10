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
    const [subjects, setSubjects] = useState([]);
    const [otherSubjectName, setOtherSubjectName] = useState('');
    const [gradeLevels, setGradeLevels] = useState([]);
    const [otherGradeLevel, setOtherGradeLevel] = useState('');

    const handleAvailabilityChange = (day, timeSlot) => {
        setAvailability(prev => ({
            ...prev,
            [day]: prev[day].includes(timeSlot)
                ? prev[day].filter(slot => slot !== timeSlot)
                : [...prev[day], timeSlot],
        }));
    };

    const handleSubjectChange = (e, subject) => {
        if (e.target.checked) {
            setSubjects([...subjects, { name: subject, frequency: '' }]);
        } else {
            setSubjects(subjects.filter(s => s.name !== subject));
            if (subject === 'Other') {
                setOtherSubjectName('');
            }
        }
    };

    const handleFrequencyChange = (e, subject) => {
        const updatedSubjects = subjects.map(s =>
            s.name === subject ? { ...s, frequency: e.target.value } : s
        );
        setSubjects(updatedSubjects);
    };

    const handleGradeLevelChange = (e, level) => {
        if (e.target.checked) {
            setGradeLevels([...gradeLevels, level]);
        } else {
            setGradeLevels(gradeLevels.filter(l => l !== level));
            if (level === 'Other') {
                setOtherGradeLevel('');
            }
        }
    };

    const handleSubmit = () => {
        if (name.trim() === '') {
            alert('Please enter a teacher name');
            return;
        }
        if (subjects.length === 0) {
            alert('Please select at least one subject');
            return;
        }
        if (gradeLevels.length === 0) {
            alert('Please select at least one grade level');
            return;
        }

        // Replace "Other" subject and grade level with actual inputs
        const finalSubjects = subjects.map(subject => {
            if (subject.name === 'Other') {
                return { name: otherSubjectName || 'Other', frequency: subject.frequency };
            }
            return subject;
        });

        const finalGradeLevels = gradeLevels.map(level =>
            level === 'Other' ? otherGradeLevel || 'Other' : level
        );

        const teacherData = {
            name,
            type,
            availability,
            subjects: finalSubjects,
            gradeLevels: finalGradeLevels,
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
        setSubjects([]);
        setOtherSubjectName('');
        setGradeLevels([]);
        setOtherGradeLevel('');
    };

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

    // Available subjects and grade levels
    const availableSubjects = [
        "Mathematics", "Physics", "Chemistry", "Biology", "English", 
        "History", "Quran", "Islamic Studies"
    ];
    const availableGradeLevels = ["KG", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

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

            {/* Subjects Selection */}
            <div className="subjects-container">
                <h3>Select Subjects and Frequencies:</h3>
                {availableSubjects.map(subject => (
                    <div key={subject} className="subject-item">
                        <label>
                            <input
                                type="checkbox"
                                value={subject}
                                checked={subjects.some(s => s.name === subject)}
                                onChange={(e) => handleSubjectChange(e, subject)}
                            />
                            {subject}
                        </label>
                        {subjects.some(s => s.name === subject) && (
                            <input
                                type="number"
                                min="1"
                                placeholder="Frequency"
                                value={subjects.find(s => s.name === subject).frequency || ''}
                                onChange={(e) => handleFrequencyChange(e, subject)}
                                className="frequency-input"
                            />
                        )}
                    </div>
                ))}

                {/* "Other" subject option */}
                <div className="subject-item">
                    <label>
                        <input
                            type="checkbox"
                            value="Other"
                            checked={subjects.some(s => s.name === 'Other')}
                            onChange={(e) => handleSubjectChange(e, 'Other')}
                        />
                        Other
                    </label>
                    {subjects.some(s => s.name === 'Other') && (
                        <>
                            <input
                                type="text"
                                placeholder="Subject Name"
                                value={otherSubjectName}
                                onChange={(e) => setOtherSubjectName(e.target.value)}
                                className="other-subject-input"
                            />
                            <input
                                type="number"
                                min="1"
                                placeholder="Frequency"
                                value={subjects.find(s => s.name === 'Other').frequency || ''}
                                onChange={(e) => handleFrequencyChange(e, 'Other')}
                                className="frequency-input"
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Grade Levels Selection */}
            <div className="grade-levels-container">
                <h3>Select Grade Levels:</h3>
                {availableGradeLevels.map(level => (
                    <div key={level} className="grade-level-item">
                        <label>
                            <input
                                type="checkbox"
                                value={level}
                                checked={gradeLevels.includes(level)}
                                onChange={(e) => handleGradeLevelChange(e, level)}
                            />
                            {level}
                        </label>
                    </div>
                ))}

                {/* "Other" grade option */}
                <div className="grade-level-item">
                    <label>
                        <input
                            type="checkbox"
                            value="Other"
                            checked={gradeLevels.includes('Other')}
                            onChange={(e) => handleGradeLevelChange(e, 'Other')}
                        />
                        Other
                    </label>
                    {gradeLevels.includes('Other') && (
                        <input
                            type="text"
                            placeholder="Grade Level"
                            value={otherGradeLevel}
                            onChange={(e) => setOtherGradeLevel(e.target.value)}
                            className="other-grade-input"
                        />
                    )}
                </div>
            </div>

            {/* Availability Grid */}
            <div className="availability-grid">
                {/* Render day headers */}
                <div className="time-label"></div> {/* Placeholder for the top-left corner */}
                {daysOfWeek.map(day => (
                    <div key={day} className="day-header">{day}</div>
                ))}

                {/* Render the availability grid for each time slot */}
                {timeSlots.map(({ time, label }, timeIndex) => (
                    <React.Fragment key={time}>
                        <div className="time-label">
                            {time} <span className="slot-label">{label}</span>
                        </div>
                        {daysOfWeek.map(day => (
                            <div 
                                key={`${day}-${time}`} 
                                className={`availability-cell ${availability[day].includes(time) ? 'selected' : ''}`}
                                onClick={() => handleAvailabilityChange(day, time)}
                            >
                                {availability[day].includes(time) ? '✓' : label}
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

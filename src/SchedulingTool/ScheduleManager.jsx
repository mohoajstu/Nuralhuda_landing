import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase-config';
import TeacherInput from './TeacherInput';
import ScheduleDisplay from './ScheduleDisplay';
import TeacherDisplay from './TeacherDisplay';
import './ScheduleManager.css';
import {
  createThread,
  createMessage,
  createRun,
  titleToAssistantIDMap
} from '../chat/openAIUtils';

const ScheduleManager = () => {
  const [teachers, setTeachers] = useState([]);
  const [finalSchedule, setFinalSchedule] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  useEffect(() => {
    const storedTeachers = JSON.parse(sessionStorage.getItem('teachers')) || [];
    setTeachers(storedTeachers);
  }, []);

  const saveTeacherToFirebase = async (teacher) => {
    try {
      await setDoc(doc(db, 'teachers', teacher.name), teacher);
      console.log('Teacher data saved to Firebase');
    } catch (error) {
      console.error('Error saving teacher to Firebase:', error);
    }
  };

  const addTeacher = (teacher) => {
    const updatedTeachers = [...teachers, teacher];
    setTeachers(updatedTeachers);
    saveTeacherToFirebase(teacher);
    sessionStorage.setItem('teachers', JSON.stringify(updatedTeachers));
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const closeTeacherDetails = () => {
    setSelectedTeacher(null);
  };

  const generateSchedules = () => {
    console.log('Starting the scheduling process...');
    
    // Simulating schedule generation with hardcoded data
    const generatedSchedule = {
        "Grade 1": {
          "Monday": {
            "9:00-10:00": {
              "subject": "Mathematics",
              "teacher": "Alice Johnson"
            },
            "10:00-10:10": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "10:10-11:00": {
              "subject": "Mathematics",
              "teacher": "David Brown"
            },
            "11:00-12:00": {
              "subject": "Islamic Studies",
              "teacher": "Bob Smith"
            },
            "12:00-12:45": {
              "subject": "Lunch",
              "teacher": null
            },
            "12:45-1:45": {
              "subject": "Free Period",
              "teacher": null
            },
            "1:45-2:00": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "2:00-3:00": {
              "subject": "Art",
              "teacher": "Catherine Lee"
            }
          },
          "Tuesday": {
            "9:00-10:00": {
              "subject": "Mathematics",
              "teacher": "Alice Johnson"
            },
            "10:00-10:10": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "10:10-11:00": {
              "subject": "Mathematics",
              "teacher": "David Brown"
            },
            "11:00-12:00": {
              "subject": "Islamic Studies",
              "teacher": "Eva Green"
            },
            "12:00-12:45": {
              "subject": "Lunch",
              "teacher": null
            },
            "12:45-1:45": {
              "subject": "Free Period",
              "teacher": null
            },
            "1:45-2:00": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "2:00-3:00": {
              "subject": "Art",
              "teacher": "Eva Green"
            }
          },
          "Wednesday": {
            "9:00-10:00": {
              "subject": "Mathematics",
              "teacher": "Alice Johnson"
            },
            "10:00-10:10": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "10:10-11:00": {
              "subject": "Mathematics",
              "teacher": "David Brown"
            },
            "11:00-12:00": {
              "subject": "Islamic Studies",
              "teacher": "Bob Smith"
            },
            "12:00-12:45": {
              "subject": "Lunch",
              "teacher": null
            },
            "12:45-1:45": {
              "subject": "Free Period",
              "teacher": null
            },
            "1:45-2:00": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "2:00-3:00": {
              "subject": "Art",
              "teacher": "Catherine Lee"
            }
          },
          "Thursday": {
            "9:00-10:00": {
              "subject": "Mathematics",
              "teacher": "Alice Johnson"
            },
            "10:00-10:10": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "10:10-11:00": {
              "subject": "Free Period",
              "teacher": null
            },
            "11:00-12:00": {
              "subject": "Islamic Studies",
              "teacher": "Bob Smith"
            },
            "12:00-12:45": {
              "subject": "Lunch",
              "teacher": null
            },
            "12:45-1:45": {
              "subject": "Free Period",
              "teacher": null
            },
            "1:45-2:00": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "2:00-3:00": {
              "subject": "Art",
              "teacher": "Eva Green"
            }
          },
          "Friday": {
            "9:00-10:00": {
              "subject": "Mathematics",
              "teacher": "Alice Johnson"
            },
            "10:00-10:10": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "10:10-11:00": {
              "subject": "Mathematics",
              "teacher": "David Brown"
            },
            "11:00-12:00": {
              "subject": "Islamic Studies",
              "teacher": "Eva Green"
            },
            "12:00-12:45": {
              "subject": "Lunch",
              "teacher": null
            },
            "12:45-1:45": {
              "subject": "Free Period",
              "teacher": null
            },
            "1:45-2:00": {
              "subject": "Nutrition Break",
              "teacher": null
            },
            "2:00-3:00": {
              "subject": "Art",
              "teacher": "Catherine Lee"
            }
          }
        }
      }
      

    setFinalSchedule(generatedSchedule);
  };

  return (
    <div className="schedule-manager">
      <h2 className="schedule-manager-title">Schedule Manager</h2>
      <TeacherInput addTeacher={addTeacher} />
      
      <TeacherDisplay
        teachers={teachers}
        onTeacherClick={handleTeacherClick}
        selectedTeacher={selectedTeacher}
        closeTeacherDetails={closeTeacherDetails}
      />

      <button
        className="generate-schedule-button"
        onClick={generateSchedules}
        disabled={teachers.length === 0}
      >
        Generate Optimized Schedule
      </button>

      {finalSchedule ? (
    <ScheduleDisplay schedule={finalSchedule} grade="Grade 1" />
) : (
    <p className="schedule-placeholder">No schedule generated yet. Please add teachers and click the button to generate a schedule.</p>
)}

    </div>
  );
};

export default ScheduleManager;

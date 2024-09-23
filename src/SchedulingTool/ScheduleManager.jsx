import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDocs, collection } from 'firebase/firestore'; // Firebase Firestore methods
import { db } from '../config/firebase-config'; // Your Firebase configuration
import TeacherInput from './TeacherInput';
import ScheduleDisplay from './ScheduleDisplay';
import TeacherDisplay from './TeacherDisplay';
import GLPK from 'glpk.js';
import './ScheduleManager.css';

const ScheduleManager = () => {
    const [teachers, setTeachers] = useState([]);
    const [finalSchedule, setFinalSchedule] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Load teachers from session storage on initial render
    useEffect(() => {
        const storedTeachers = JSON.parse(sessionStorage.getItem('teachers')) || [];
        setTeachers(storedTeachers);
    }, []);

    // Function to save data to Firebase
    const saveTeacherToFirebase = async (teacher) => {
        try {
            await setDoc(doc(db, "teachers", teacher.name), teacher);
            console.log("Teacher data saved to Firebase");
        } catch (error) {
            console.error("Error saving teacher to Firebase:", error);
        }
    };

    // Add a teacher to the state, Firebase, and session storage
    const addTeacher = (teacher) => {
        const updatedTeachers = [...teachers, teacher];
        setTeachers(updatedTeachers);

        // Save to Firebase
        saveTeacherToFirebase(teacher);

        // Save to session storage
        sessionStorage.setItem('teachers', JSON.stringify(updatedTeachers));
    };

    const handleTeacherClick = (teacher) => {
        setSelectedTeacher(teacher);
    };

    const closeTeacherDetails = () => {
        setSelectedTeacher(null);
    };

    const generateOptimizedSchedule = async () => {
        console.log("Starting the schedule optimization process...");
    
        let scheduleTemplate = {
            "Monday": { "9:00-10:00": null, "10:00-10:10": "Morning Nutrition Break", "10:10-11:00": null, "11:00-12:00": null, "12:00-12:45": "Lunch Break", "12:45-1:45": null, "1:45-2:00": "Afternoon Nutrition Break", "2:00-3:00": null },
            "Tuesday": { "9:00-10:00": null, "10:00-10:10": "Morning Nutrition Break", "10:10-11:00": null, "11:00-12:00": null, "12:00-12:45": "Lunch Break", "12:45-1:45": null, "1:45-2:00": "Afternoon Nutrition Break", "2:00-3:00": null },
            "Wednesday": { "9:00-10:00": null, "10:00-10:10": "Morning Nutrition Break", "10:10-11:00": null, "11:00-12:00": null, "12:00-12:45": "Lunch Break", "12:45-1:45": null, "1:45-2:00": "Afternoon Nutrition Break", "2:00-3:00": null },
            "Thursday": { "9:00-10:00": null, "10:00-10:10": "Morning Nutrition Break", "10:10-11:00": null, "11:00-12:00": null, "12:00-12:45": "Lunch Break", "12:45-1:45": null, "1:45-2:00": "Afternoon Nutrition Break", "2:00-3:00": null },
            "Friday": { "9:00-10:00": null, "10:00-10:10": "Morning Nutrition Break", "10:10-11:00": null, "11:00-12:00": null, "12:00-12:45": "Lunch Break", "12:45-1:45": null, "1:45-2:00": "Afternoon Nutrition Break", "2:00-3:00": null }
        };
    
        const problem = {
            name: "Schedule Optimization",
            objective: {
                direction: "min", // This should be 'min' or 'max' as per GLPK's requirement
                name: "workload",
                vars: []
            },
            subjectTo: [],
            binaries: [],
        };
    
        // Adding variables and constraints to the problem object
        teachers.forEach((teacher) => {
            Object.entries(teacher.availability).forEach(([day, times]) => {
                times.forEach((time) => {
                    if (scheduleTemplate[day][time] === null) {
                        const variableName = `${teacher.name}_${day}_${time}`;
    
                        // Add the variable as a binary (0 or 1)
                        problem.binaries.push(variableName);
    
                        // Add the variable to the objective function
                        problem.objective.vars.push({ name: variableName, coef: 1 });
    
                        // Ensure each slot is assigned to one teacher
                        const slotConstraintName = `${day}_${time}`;
                        let constraint = problem.subjectTo.find(constraint => constraint.name === slotConstraintName);
    
                        if (!constraint) {
                            constraint = {
                                name: slotConstraintName,
                                vars: [],
                                bnds: { type: "fixed", lb: 1, ub: 1 },
                            };
                            problem.subjectTo.push(constraint);
                        }
    
                        constraint.vars.push({ name: variableName, coef: 1 });
                    }
                });
            });
        });
    
        try {
            console.log("Solving the problem using GLPK...");
            const glpk = await GLPK();
            const result = glpk.solve(problem);
    
            console.log("GLPK optimization result:", result);
    
            if (result.status === "optimal") {
                console.log("Optimal solution found! Updating the schedule...");
                Object.entries(scheduleTemplate).forEach(([day, slots]) => {
                    Object.keys(slots).forEach((time) => {
                        const assignedTeacher = teachers.find(teacher => result.vars[`${teacher.name}_${day}_${time}`]);
                        if (assignedTeacher) {
                            scheduleTemplate[day][time] = assignedTeacher.name;
                        }
                    });
                });
    
                setFinalSchedule(scheduleTemplate);
                console.log("Optimized schedule has been set:", scheduleTemplate);
                alert("The optimized schedule has been generated successfully! You can now view it.");
            } else {
                console.error("No feasible solution found by GLPK. Check the constraints and input data.");
                alert("Could not find a feasible solution. Please check the input data or try again.");
            }
        } catch (error) {
            console.error("Error during GLPK optimization:", error);
            alert("An error occurred while generating the optimized schedule. Please try again.");
        }
    };
    
    
    

    return (
        <div className="schedule-manager">
            <TeacherInput addTeacher={addTeacher} />
            
            {/* Use the TeacherDisplay component for displaying added teachers and viewing their details */}
            <TeacherDisplay 
                teachers={teachers} 
                onTeacherClick={handleTeacherClick}
                selectedTeacher={selectedTeacher}
                closeTeacherDetails={closeTeacherDetails}
            />

            <button className="generate-schedule-button" onClick={generateOptimizedSchedule}>
                Generate Optimized Schedule
            </button>

            {finalSchedule && <ScheduleDisplay schedule={finalSchedule} />}
        </div>
    );
};

export default ScheduleManager;

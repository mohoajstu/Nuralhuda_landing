// toolsMapping.js

import autograderIMG from './img/quiz-gen.png';
import quizGenIMG from './img/quiz-gen.png';
import fiveDThinkingImg from './img/5dlogotransparent.png';

export const titleToToolTypeMap = {
    'Automatic Grader': 'autograder',
    'AI Quiz Generator': 'quiz-generator',
    '5D Lesson Planner': '5dthinking',
};

export const titleToToolImageMap = {
    'Automatic Grader': autograderIMG,
    'AI Quiz Generator': quizGenIMG,
    '5D Lesson Planner': fiveDThinkingImg,
};

export const titleToToolDescriptionMap = {
    'Automatic Grader': 'Automatically grade assignments and quizzes with ease.',
    'AI Quiz Generator': 'Create AI-powered quizzes for efficient and effective learning.',
    '5D Lesson Planner': 'Plan your lessons using the 5D thinking model.',
};

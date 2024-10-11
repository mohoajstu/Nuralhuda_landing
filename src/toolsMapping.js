// toolsMapping.js

import autograderIMG from './img/auto.png';
import quizGenIMG from './img/quiz-gen.png';
import fiveDThinkingImg from './img/5dlogotransparent.png';
import slideGeneratorIMG from './img/prez-gen.png';

export const titleToToolTypeMap = {
    'GraderBot': 'graderbot',
    'Quiz Generator': 'quiz-generator',
    '5D Lesson Planner': '5dthinking',
    'Presentation Generator': 'slidegenerator',
};

export const titleToToolImageMap = {
    'GraderBot': autograderIMG,
    'Quiz Generator': quizGenIMG,
    '5D Lesson Planner': fiveDThinkingImg,
    'Presentation Generator': slideGeneratorIMG
};

export const titleToToolDescriptionMap = {
    'GraderBot': 'Automatically grade assignments and quizzes with ease.',
    'Quiz Generator': 'Create AI-powered quizzes for efficient and effective learning.',
    '5D Lesson Planner': 'Plan your lessons using the 5D thinking model.',
    'Presentation Generator': 'Create custom PowerPoint slides with ease.'
};


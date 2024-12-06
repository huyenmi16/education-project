// App.js
import React from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import './App.css';
import CourseLayout from './components/CourseLayout.js';
import DetailCourse from './components/DetailCourse.js';
import Report from './components/Report.js';
import AuthForm from './components/AuthForm.js';
import ListQuiz from './components/ListQuiz.js';
import DetailQuiz from './components/Quiz.js';
import MyCourses from './components/MyCourses.js';
import HistoryReport from './components/HistoryReport.js';
import Profile from './components/Profile.js';
import TeacherManage from './components/Teacher/TeacherManage.js'
import DetailCourseT from './components/Teacher/DetailCourseT.js';
import QuizDetail from './components/Teacher/QuizDetail.js';
function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/list-courses" element={<CourseLayout/>} />
          <Route path="/course/:id" element={<DetailCourse/>} />
          <Route path="/report" element={<Report/>} />
          <Route path="/mycourse" element={<MyCourses/>} />
          <Route path="/history-report" element={<HistoryReport/>} />
          <Route path="/profile" element={<Profile/>} />
          <Route path="/" element={<AuthForm />} />
          <Route path="/listquiz" element={<ListQuiz />} />
          <Route path="/quiz/:id" element={<DetailQuiz />} /> 
          <Route path="/teacher-manager" element={<TeacherManage />} /> 
          <Route path="/courses/:id" element={<DetailCourseT />} /> 
          <Route path="/detail-quiz" element={<QuizDetail />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;

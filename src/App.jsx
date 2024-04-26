import React, { useState, useEffect } from "react";
import { Routes, Route} from 'react-router-dom'; // Use only Routes and Route here
import { Navigation } from "./components/navigation";
import { Header } from "./components/header";
import { Meetyourassistants } from "./components/meetyourassistants";
import { About } from "./components/about";
import { Features } from "./components/features";
import { Assistants } from "./components/assistants";
import { Team } from "./components/Team";
import { Contact } from "./components/contact";
import JsonData from "./data/data.json";
import SmoothScroll from "smooth-scroll";
import "./App.css";
//import useAuth from "./hooks/useAuth";
import Login  from "./components/Login.jsx";
import ProtectedRoute from "./utils/ProtectedRoute";
import ChatScreen from './components/chatScreen';


export const scroll = new SmoothScroll('a[href*="#"]', {
  speed: 1000,
  speedAsDuration: true,
});

const App = () => {
  const [landingPageData, setLandingPageData] = useState({});
  useEffect(() => {
    setLandingPageData(JsonData);
  }, []);

  //const { user } = useAuth();

  return (
    <>
      <Navigation />
      <Header data={landingPageData.Header} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          {/* Protected routes go here */}
          <Route path="/chat/:chatbotType" element={<ChatScreen />} />
        </Route>
                  <Route index element={
            <>
              <About data={landingPageData.About} />
              <Meetyourassistants data={landingPageData.Meetyourassistants} />
              <Assistants data={landingPageData.Assistants} />
              <Features data={landingPageData.Features} />
              <Team data={landingPageData.Team} />
              <Contact data={landingPageData.Contact} />
            </>
          } />
          {/* If you have other routes that require the user to be logged in, they should also be defined here */}
        {/* If you have additional routes, they should be defined here as well */}
      </Routes>
    </>
  );
};

export default App;
// src/home/Home.jsx
import React from 'react';
import { Header } from './header';
import { About } from './about';
import { Features } from './features';
import { Assistants } from './assistants';
import { Tools } from './tools';
import { Team } from './Team';
import { Contact } from './contact';
import  FAQ  from './FAQ'; // Import the FAQ component

const Home = ({ data }) => {
  return (
    <div className="home">
      <Header data={data?.Header} />
      <Assistants data={data?.Assistants} />
      <Tools data={data?.Tools}/>
      <Features data={data?.Features} />
      <About data={data?.About} />
      <FAQ /> 
      {/*<Team data={data?.Team} />*/}
      <Contact data={data?.Contact} />
    </div>
  );
};

export default Home;

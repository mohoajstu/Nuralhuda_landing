import React from 'react';
import { Header } from './header';
import { About } from './about';
import { Features } from './features';
import { Assistants } from './assistants';
import { Team } from './Team';
import { Contact } from './contact';
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = ({ data }) => {
  return (
    <div className="home">
      <Header data={data?.Header} />
      <Assistants data={data?.Assistants} />
      <About data={data?.About} />
      <Features data={data?.Features} />
      <Team data={data?.Team} />
      <Contact data={data?.Contact} />
    </div>
  );
};

export default Home;
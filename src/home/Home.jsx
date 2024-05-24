// home/Home.jsx
import { Header } from './header';
import { About } from './about';
import { Meetyourassistants } from './meetyourassistants';
import { Features } from './features';
import { Assistants } from './assistants';
import { Team } from './Team';
import { Contact } from './contact';

const Home = ({ data }) => {
  return (
    <div className="home">
      <Header data={data?.Header} />
      <About data={data?.About} />
      <Meetyourassistants data={data?.Meetyourassistants} />
      <Assistants data={data?.Assistants} />
      <Features data={data?.Features} />
      <Team data={data?.Team} />
      <Contact data={data?.Contact} />
    </div>
  );
};

export default Home;
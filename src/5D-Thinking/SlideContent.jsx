import React from 'react';
import './SlideContent.css';

const SlideContent = ({ slide }) => {
  switch (slide.dimension) {
    case 'Explore':
      return <ExploreContent {...slide} />;
    case 'Compare':
      return <CompareContent {...slide} />;
    case 'Question':
      return <QuestionContent {...slide} />;
    case 'Connect':
      return <ConnectContent {...slide} />;
    case 'Appreciate':
      return <AppreciateContent {...slide} />;
    default:
      return null;
  }
};

const ExploreContent = ({ content, explanation, observations, fascinatingFacts }) => (
  <div className="slide explore-content">
    <h2>Explore</h2>
    <div className="content-section">
      <h3>Content</h3>
      <p>{content}</p>
    </div>
    <div className="content-section">
      <h3>Explanation</h3>
      <p>{explanation}</p>
    </div>
    <div className="content-section">
      <h3>Observations</h3>
      <p>{observations}</p>
    </div>
    <div className="content-section">
      <h3>Fascinating Facts</h3>
      <p>{fascinatingFacts}</p>
    </div>
  </div>
);

const CompareContent = ({ analogy, content, explanation, comparison }) => (
  <div className="slide compare-content">
    <h2>Compare</h2>
    <div className="content-section">
      <h3>Analogy</h3>
      <p>{analogy}</p>
    </div>
    <div className="content-section">
      <h3>Content</h3>
      <p>{content}</p>
    </div>
    <div className="content-section">
      <h3>Explanation</h3>
      <p>{explanation}</p>
    </div>
    <div className="content-section">
      <h3>Comparison</h3>
      <p>{comparison}</p>
    </div>
  </div>
);

const QuestionContent = ({ questions, conclusion }) => (
  <div className="slide question-content">
    <h2>Question</h2>
    <div className="content-section">
      <h3>Questions</h3>
      <ul>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ul>
    </div>
    <div className="content-section">
      <h3>Conclusion</h3>
      <p>{conclusion}</p>
    </div>
  </div>
);

const ConnectContent = ({ connections, allahNames }) => (
  <div className="slide connect-content">
    <h2>Connect</h2>
    <div className="content-section">
      <h3>Connections</h3>
      <p>{connections}</p>
    </div>
    <div className="content-section">
      <h3>Allah's Names</h3>
      <div>
        <h4>What it tells us about Allah</h4>
        <ul>
          {allahNames.whatItTells.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <h4>Names in English</h4>
        <ul>
          {allahNames.namesInEnglish.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <h4>Names in Arabic</h4>
        <ul>
          {allahNames.namesInArabic.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

const AppreciateContent = ({ whatIfs, zikrFikrShukr, characterLessons, connectWithQuranHadith }) => (
  <div className="slide appreciate-content">
    <h2>Appreciate</h2>
    <div className="content-section">
      <h3>What If's</h3>
      <p>{whatIfs}</p>
    </div>
    <div className="content-section">
      <h3>Zikr, Fikr, Shukr</h3>
      <div>
        <h4>Zikr</h4>
        <ul>
          {zikrFikrShukr.zikr.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <h4>Fikr</h4>
        <ul>
          {zikrFikrShukr.fikr.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        <h4>Shukr</h4>
        <ul>
          {zikrFikrShukr.shukr.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
    <div className="content-section">
      <h3>Character Lessons</h3>
      <p>{characterLessons}</p>
    </div>
    <div className="content-section">
      <h3>Connect with Quran or Hadith</h3>
      <p>{connectWithQuranHadith}</p>
    </div>
  </div>
);

export default SlideContent;

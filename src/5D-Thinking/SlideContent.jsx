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

const ExploreContent = ({ content = '', explanation = '', observations = '', fascinatingFacts = '' }) => (
  <div className="slide explore-content">
    <h2>Explore</h2>
    {content && (
      <div className="content-section">
        <h3>Content</h3>
        <p>{content}</p>
      </div>
    )}
    {explanation && (
      <div className="content-section">
        <h3>Explanation</h3>
        <p>{explanation}</p>
      </div>
    )}
    {observations && (
      <div className="content-section">
        <h3>Observations</h3>
        <p>{observations}</p>
      </div>
    )}
    {fascinatingFacts && (
      <div className="content-section">
        <h3>Fascinating Facts</h3>
        <p>{fascinatingFacts}</p>
      </div>
    )}
  </div>
);

const CompareContent = ({ analogy = '', content = '', explanation = '', comparison = '' }) => (
  <div className="slide compare-content">
    <h2>Compare</h2>
    {analogy && (
      <div className="content-section">
        <h3>Analogy</h3>
        <p>{analogy}</p>
      </div>
    )}
    {content && (
      <div className="content-section">
        <h3>Content</h3>
        <p>{content}</p>
      </div>
    )}
    {explanation && (
      <div className="content-section">
        <h3>Explanation</h3>
        <p>{explanation}</p>
      </div>
    )}
    {comparison && (
      <div className="content-section">
        <h3>Comparison</h3>
        <p>{comparison}</p>
      </div>
    )}
  </div>
);

const QuestionContent = ({ questions = [], conclusion = '' }) => (
  <div className="slide question-content">
    <h2>Question</h2>
    {questions.length > 0 && (
      <div className="content-section">
        <h3>Questions</h3>
        <ul>
          {questions.map((question, index) => (
            <li key={index}>{question}</li>
          ))}
        </ul>
      </div>
    )}
    {conclusion && (
      <div className="content-section">
        <h3>Conclusion</h3>
        <p>{conclusion}</p>
      </div>
    )}
  </div>
);

const ConnectContent = ({ connections = '', allahNames = {} }) => (
  <div className="slide connect-content">
    <h2>Connect</h2>
    {connections && (
      <div className="content-section">
        <h3>Connections</h3>
        <p>{connections}</p>
      </div>
    )}
    {allahNames.whatItTells?.length > 0 && allahNames.namesInEnglish?.length > 0 && allahNames.namesInArabic?.length > 0 && (
      <div className="content-section">
        <h3>Allah's Names</h3>
        <table>
          <thead>
            <tr>
              <th>What it tells us about Allah</th>
              <th>Names in English</th>
              <th>Names in Arabic</th>
            </tr>
          </thead>
          <tbody>
            {allahNames.whatItTells.map((item, index) => (
              <tr key={index}>
                <td>{item}</td>
                <td>{allahNames.namesInEnglish[index]}</td>
                <td>{allahNames.namesInArabic[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const AppreciateContent = ({ whatIfs = '', zikrFikrShukr = {}, characterLessons = '', connectWithQuranHadith = [] }) => (
    <div className="slide appreciate-content">
      <h2>Appreciate</h2>
      {whatIfs && (
        <div className="content-section">
          <h3>What If's</h3>
          <p>{whatIfs}</p>
        </div>
      )}
      {zikrFikrShukr.zikr?.length > 0 && zikrFikrShukr.fikr?.length > 0 && zikrFikrShukr.shukr?.length > 0 && (
        <div className="content-section">
          <h3>Zikr, Fikr, Shukr</h3>
          <table>
            <thead>
              <tr>
                <th>Zikr</th>
                <th>Fikr</th>
                <th>Shukr</th>
              </tr>
            </thead>
            <tbody>
              {zikrFikrShukr.zikr.map((item, index) => (
                <tr key={index}>
                  <td>{item}</td>
                  <td>{zikrFikrShukr.fikr[index]}</td>
                  <td>{zikrFikrShukr.shukr[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {characterLessons && (
        <div className="content-section">
          <h3>Character Lessons</h3>
          <p>{characterLessons}</p>
        </div>
      )}
      {Array.isArray(connectWithQuranHadith) && connectWithQuranHadith.length > 0 && (
      <div className="content-section">
        <h3>Connect with Quran or Hadith</h3>
        {connectWithQuranHadith.map((item, index) => (
          <div key={index}>
            {item.includes('Quran') ? (
              <p><strong>{item}</strong></p>
            ) : (
              <p><strong>Hadith:</strong> {item}</p>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);

export default SlideContent;

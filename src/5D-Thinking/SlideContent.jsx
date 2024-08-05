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
        <p>{typeof content === 'string' ? content : JSON.stringify(content)}</p>
      </div>
    )}
    {explanation && (
      <div className="content-section">
        <h3>Explanation</h3>
        <p>{typeof explanation === 'string' ? explanation : JSON.stringify(explanation)}</p>
      </div>
    )}
    {observations && (
      <div className="content-section">
        <h3>Observations</h3>
        <p>{typeof observations === 'string' ? observations : JSON.stringify(observations)}</p>
      </div>
    )}
    {fascinatingFacts && (
      <div className="content-section">
        <h3>Fascinating Facts</h3>
        <p>{typeof fascinatingFacts === 'string' ? fascinatingFacts : JSON.stringify(fascinatingFacts)}</p>
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
        <ul>{typeof analogy === 'string' ? analogy : JSON.stringify(analogy)}</ul>
      </div>
    )}
    {content && (
      <div className="content-section">
        <h3>Content</h3>
        <ul>{typeof content === 'string' ? content : JSON.stringify(content)}</ul>
      </div>
    )}
    {explanation && (
      <div className="content-section">
        <h3>Explanation</h3>
        <ul>{typeof explanation === 'string' ? explanation : JSON.stringify(explanation)}</ul>
      </div>
    )}
    {comparison && (
      <div className="content-section">
        <h3>Comparison</h3>
        <ul>{typeof comparison === 'string' ? comparison : JSON.stringify(comparison)}</ul>
      </div>
    )}
  </div>
);

const QuestionContent = ({ questions = [], conclusion = '' }) => (
  <div className="slide question-content">
    <h2>Question</h2>
    {questions && questions.length > 0 && (
      <div className="content-section">
        <h3>Questions</h3>
        <ul>
          {questions.map((question, index) => (
            <li key={index}>{typeof question === 'string' ? question : JSON.stringify(question)}</li>
          ))}
        </ul>
      </div>
    )}
    {conclusion && (
      <div className="content-section">
        <h3>Conclusion</h3>
        <p>{typeof conclusion === 'string' ? conclusion : JSON.stringify(conclusion)}</p>
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
        <p>{typeof connections === 'string' ? connections : JSON.stringify(connections)}</p>
      </div>
    )}
    {allahNames && (
      <div className="content-section">
        <h3>Allah's Names</h3>
        <div>
          {allahNames.whatItTells && (
            <>
              <h4>What it tells us about Allah</h4>
              <ul>
                {allahNames.whatItTells.map((item, index) => (
                  <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                ))}
              </ul>
            </>
          )}
          {allahNames.namesInEnglish && (
            <>
              <h4>Names in English</h4>
              <ul>
                {allahNames.namesInEnglish.map((item, index) => (
                  <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                ))}
              </ul>
            </>
          )}
          {allahNames.namesInArabic && (
            <>
              <h4>Names in Arabic</h4>
              <ul>
                {allahNames.namesInArabic.map((item, index) => (
                  <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    )}
  </div>
);

const AppreciateContent = ({ whatIfs = '', zikrFikrShukr = {}, characterLessons = '', connectWithQuranHadith = '' }) => (
  <div className="slide appreciate-content">
    <h2>Appreciate</h2>
    {whatIfs && (
      <div className="content-section">
        <h3>What If's</h3>
        <p>{typeof whatIfs === 'string' ? whatIfs : JSON.stringify(whatIfs)}</p>
      </div>
    )}
    {zikrFikrShukr && (
      <div className="content-section">
        <h3>Zikr, Fikr, Shukr</h3>
        <div>
          {zikrFikrShukr.zikr && (
            <>
              <h4>Zikr</h4>
              <ul>
                {zikrFikrShukr.zikr.map((item, index) => (
                  <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                ))}
              </ul>
            </>
          )}
          {zikrFikrShukr.fikr && (
            <>
              <h4>Fikr</h4>
              <ul>
                {zikrFikrShukr.fikr.map((item, index) => (
                  <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                ))}
              </ul>
            </>
          )}
          {zikrFikrShukr.shukr && (
            <>
              <h4>Shukr</h4>
              <ul>
                {zikrFikrShukr.shukr.map((item, index) => (
                  <li key={index}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    )}
    {characterLessons && (
      <div className="content-section">
        <h3>Character Lessons</h3>
        <p>{typeof characterLessons === 'string' ? characterLessons : JSON.stringify(characterLessons)}</p>
      </div>
    )}
    {connectWithQuranHadith && (
      <div className="content-section">
        <h3>Connect with Quran or Hadith</h3>
        <p>{typeof connectWithQuranHadith === 'string' ? connectWithQuranHadith : JSON.stringify(connectWithQuranHadith)}</p>
      </div>
    )}
  </div>
);

export default SlideContent;

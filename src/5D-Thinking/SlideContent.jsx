import React from 'react';
import './SlideContent.css';

const SlideContent = ({ slide }) => {
  return (
    <div className="slide-container">
      {(() => {
        switch (slide.dimension) {
          case 'Objectives':
            return <ObjectivesContent {...slide} />;
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
          case 'Activities':
            return <ActivitiesContent {...slide} />;
          default:
            return null;
        }
      })()}
    </div>
  );
};

const ObjectivesContent = ({ learningObjectives = {} }) => (
  <div className="slide objectives-content">
    <h2>Learning Objectives</h2>
    {Object.entries(learningObjectives).map(([category, objectives]) => (
      <div key={category} className="content-section">
        <h3>{capitalizeWords(category)}</h3>
        <ul>
          {objectives.map((objective, index) => (
            <li key={index}>{objective}</li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const ActivitiesContent = ({ activities = [] }) => (
  <div className="slide activities-content">
    <h2>Activities</h2>
    {activities.map((activity, index) => (
      <div key={index} className="activity-section">
        <h3>{activity.title}</h3>
        <p><strong>Dimension:</strong> {activity.dimension}</p>
        <p><strong>Objective:</strong> {activity.objective}</p>
        <div className="content-section">
          <h4>Materials</h4>
          <ul>
            {activity.materials.map((material, idx) => (
              <li key={idx}>{material}</li>
            ))}
          </ul>
        </div>
        <div className="content-section">
          <h4>Instructions</h4>
          <ol>
            {activity.instructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
    ))}
  </div>
);

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

const capitalizeWords = (text) => {
  return text
    .replace(/_/g, ' ') // Replace underscores with spaces
    .split(' ') // Split the text into words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
    .join(' '); // Join the words back into a single string
};

// 1) Import or define titleSubtopicMap in SlideContent.jsx
//    or pass it in as a prop. For example, if you keep it
//    in the same file, do something like this:

const titleSubtopicMap = {
  Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
  Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
  Question: [
    'Negation of Chance',
    'Negation of Material Causes',
    'Negation of Nature',
    'Conclusion',
  ],
  Connect: ['Interdependency', 'Interconnectedness', "Allah's Names"],
  Appreciate: ['What ifs', 'Zikr Fikr Shukr', 'Character Lessons', 'Connect With Quran', 'Connect With Hadith'],
};


const QuestionContent = ({
  questions = [],
  conclusion = '',
  subtopicIndex = 0,
}) => {
  const subtopicTitle = titleSubtopicMap.Question[subtopicIndex];

  return (
    <div className="slide question-content">
      <h2>Question</h2>

      {/* Show "questions" container only if it's NOT the conclusion */}
      {subtopicIndex !== 3 && (
        <div className="content-section">
          <h3>{subtopicTitle}</h3>
          <ul>
            {questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Show conclusion container only if it IS the conclusion */}
      {subtopicIndex === 3 && conclusion && (
        <div className="content-section">
          <h3>Conclusion</h3>
          <p>{conclusion}</p>
        </div>
      )}
    </div>
  );
};




const ConnectContent = ({
  interdependency = '',
  interconnectedness = '',
  allahNames = {},
  subtopicIndex = 0,
}) => {
  const subtopicTitle = titleSubtopicMap.Connect[subtopicIndex];
  
  return (
    <div className="slide connect-content">
      <h2>Connect</h2>

      {/* Slide 0 => Interdependency */}
      {subtopicIndex === 0 && interdependency && (
        <div className="content-section">
          <h3>{subtopicTitle}</h3>
          <p>{interdependency}</p>
        </div>
      )}

      {/* Slide 1 => Interconnectedness */}
      {subtopicIndex === 1 && interconnectedness && (
        <div className="content-section">
          <h3>{subtopicTitle}</h3>
          <p>{interconnectedness}</p>
        </div>
      )}

      {/* Slide 2 => Allah's Names */}
      {subtopicIndex === 2 && allahNames.whatItTells?.length > 0 && (
        <div className="content-section">
          <h3>{subtopicTitle}</h3>
          <table>
            <thead>
              <tr>
                <th>What it tells us</th>
                <th>Names in English</th>
                <th>Names in Arabic</th>
              </tr>
            </thead>
            <tbody>
              {allahNames.whatItTells.map((desc, i) => (
                <tr key={i}>
                  <td>{desc}</td>
                  <td>{allahNames.namesInEnglish[i] || ''}</td>
                  <td>{allahNames.namesInArabic[i] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};



const AppreciateContent = ({
  whatIfs = '',
  zikrFikrShukr = {},
  characterLessons = '',
  connectWithQuran = [],
  connectWithHadith = [],
  dua = ''
}) => (
  <div className="slide appreciate-content">
    <h2>Appreciate</h2>

    {/* What Ifs Section */}
    {whatIfs && (
      <div className="content-section">
        <h3>What Ifs</h3>
        <p>{whatIfs}</p>
      </div>
    )}

    {/* Zikr, Fikr, Shukr Section */}
    {zikrFikrShukr.zikr?.length > 0 &&
      zikrFikrShukr.fikr?.length > 0 &&
      zikrFikrShukr.shukr?.length > 0 && (
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
              {zikrFikrShukr.zikr.map((zikrItem, index) => (
                <tr key={index}>
                  <td>{zikrItem}</td>
                  <td>{zikrFikrShukr.fikr[index]}</td>
                  <td>{zikrFikrShukr.shukr[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    {/* Character Lessons Section */}
    {characterLessons && (
      <div className="content-section">
        <h3>Character Lessons</h3>
        <p>{characterLessons}</p>
      </div>
    )}

    {/* Connect with Quran Section */}
    {connectWithQuran.length > 0 && (
      <div className="content-section">
        <h3>Connect with Quran</h3>
        {connectWithQuran.map((quranItem, index) => (
          <div key={index} className="quran-item">
            <p><strong>Verse:</strong> {quranItem.verse}</p>
            <p><strong>Translation:</strong> {quranItem.translation}</p>
            <p><strong>Explanation:</strong> {quranItem.explanation}</p>
          </div>
        ))}
      </div>
    )}

    {/* Connect with Hadith Section */}
    {connectWithHadith.length > 0 && (
      <div className="content-section">
        <h3>Connect with Hadith</h3>
        {connectWithHadith.map((hadithItem, index) => (
          <div key={index} className="hadith-item">
            <p><strong>Hadith:</strong> {hadithItem.hadith}</p>
            <p><strong>Explanation:</strong> {hadithItem.explanation}</p>
          </div>
        ))}
      </div>
    )}

    {/* Dua Section */}
    {dua && (
      <div className="content-section">
        <h3>Dua</h3>
        <p>{dua}</p>
      </div>
    )}
  </div>
);


export default SlideContent;

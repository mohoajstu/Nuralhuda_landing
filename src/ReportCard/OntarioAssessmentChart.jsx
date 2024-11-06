// OntarioAssessmentChart.jsx

import React from 'react';
import './OntarioAssessmentChart.css';

const OntarioAssessmentChart = () => (
  <div className="ontario-assessment-chart">
    <h2>Ontario Assessment Chart Summary</h2>

    {/* Achievement Level Table */}
    <table className="achievement-table">
      <thead>
        <tr>
          <th>Achievement Level</th>
          <th>Letter Grade</th>
          <th>Percentage</th>
          <th>Progress Report</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>4+</td>
          <td>A+</td>
          <td>95-100%</td>
          <td>Progressing very well</td>
        </tr>
        <tr>
          <td>4</td>
          <td>A</td>
          <td>87-94%</td>
          <td>Progressing very well</td>
        </tr>
        <tr>
          <td>4-</td>
          <td>A-</td>
          <td>80-86%</td>
          <td>Progressing very well</td>
        </tr>
        <tr>
          <td>3+</td>
          <td>B+</td>
          <td>77-79%</td>
          <td>Progressing well</td>
        </tr>
        <tr>
          <td>3</td>
          <td>B</td>
          <td>73-76%</td>
          <td>Progressing well</td>
        </tr>
        <tr>
          <td>3-</td>
          <td>B-</td>
          <td>70-72%</td>
          <td>Progressing well</td>
        </tr>
        <tr>
          <td>2+</td>
          <td>C+</td>
          <td>67-69%</td>
          <td>Progressing with difficulty</td>
        </tr>
        <tr>
          <td>2</td>
          <td>C</td>
          <td>63-66%</td>
          <td>Progressing with difficulty</td>
        </tr>
        <tr>
          <td>2-</td>
          <td>C-</td>
          <td>60-62%</td>
          <td>Progressing with difficulty</td>
        </tr>
        <tr>
          <td>1+</td>
          <td>D+</td>
          <td>57-59%</td>
          <td>Progressing with difficulty</td>
        </tr>
        <tr>
          <td>1</td>
          <td>D</td>
          <td>53-56%</td>
          <td>Progressing with difficulty</td>
        </tr>
        <tr>
          <td>1-</td>
          <td>D-</td>
          <td>50-52%</td>
          <td>Progressing with difficulty</td>
        </tr>
        <tr>
          <td>R</td>
          <td>F</td>
          <td>Below 50%</td>
          <td>Requires extensive remediation</td>
        </tr>
      </tbody>
    </table>

    {/* Qualifiers Section */}
    <h3>Qualifiers</h3>
    <table className="qualifiers-table">
      <thead>
        <tr>
          <th>Level</th>
          <th>Qualifier</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Level 1</td>
          <td>Rarely, is working on, is starting to, with consistent assistance, very limited understanding</td>
        </tr>
        <tr>
          <td>Level 2</td>
          <td>Sometimes, with frequent assistance, limited understanding</td>
        </tr>
        <tr>
          <td>Level 3</td>
          <td>Usually, at standard, general understanding, some complexity</td>
        </tr>
        <tr>
          <td>Level 4</td>
          <td>Complex, consistent, independent, thorough understanding</td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default OntarioAssessmentChart;

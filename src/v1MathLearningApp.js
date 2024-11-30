import React, { useState, useEffect } from 'react';

const MathLearningApp = () => {
  const [question, setQuestion] = useState({});
  const [options, setOptions] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState("0:00");

  const generateQuestion = (repeat = false) => {
    if (repeat && wrongAnswers.length > 0) {
      const randomWrong = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];
      setQuestion(randomWrong.question);
      setOptions(generateOptions(randomWrong.question.result));
    } else {
      const num1 = Math.floor(Math.random() * 9) + 1;
      const num2 = Math.floor(Math.random() * 9) + 1;
      const result = num1 + num2;
      if (result < 11 || result > 18) return generateQuestion();

      const newQuestion = { num1, num2, result };
      setQuestion(newQuestion);
      setOptions(generateOptions(result));
    }
  };

  const generateOptions = (correct) => {
    const optionsSet = new Set([correct]);
    while (optionsSet.size < 8) {
      const randomOption = Math.floor(Math.random() * 8) + 11;
      optionsSet.add(randomOption);
    }
    return Array.from(optionsSet).sort((a, b) => a - b);
  };

  const handleAnswer = (selected) => {
    if (selected === question.result) {
      setCorrectCount(correctCount + 1);
    } else {
      setWrongCount(wrongCount + 1);
      setWrongAnswers([...wrongAnswers, { question, selected }]);
    }
    generateQuestion();
  };

  useEffect(() => {
    generateQuestion();

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setTimeElapsed(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, wrongAnswers]);

  return (
    <div style={styles.container}>
      <div style={styles.questionBox}>
        <h1 style={styles.questionText}>
          {question.num1} + {question.num2} = ?
        </h1>
      </div>
      <div style={styles.optionsBox}>
        {options.map((option) => (
          <button
            key={option}
            style={styles.optionButton}
            onClick={() => handleAnswer(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div style={styles.statsBox}>
        <h2>Statistik</h2>
        <p>Richtig: {correctCount}</p>
        <p>Falsch: {wrongCount}</p>
        <p>Zeit: {timeElapsed}</p>
        <h3>Falsche Aufgaben</h3>
        <ul>
          {wrongAnswers.map((entry, index) => (
            <li key={index}>
              {entry.question.num1} + {entry.question.num2} = {entry.question.result}, du hast {entry.selected} gewählt.
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
  },
  questionBox: {
    marginBottom: '20px',
  },
  questionText: {
    fontSize: '24px',
    margin: 0,
  },
  optionsBox: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  optionButton: {
    fontSize: '18px',
    padding: '10px 20px',
    margin: '5px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
  },
  statsBox: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'left',
  },
};

export default MathLearningApp;

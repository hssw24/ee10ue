import React, { useState, useEffect } from 'react';

const MathLearningApp = () => {
  const [question, setQuestion] = useState({});
  const [options, setOptions] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [wrongAnswers, setWrongAnswers] = useState([]);
  const [timeElapsed, setTimeElapsed] = useState("0:00");
  const [isGameOver, setIsGameOver] = useState(false);

  const generateQuestion = (repeat = false) => {
    if (isGameOver) return;
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
    if (isGameOver) return;
    if (selected === question.result) {
      setCorrectCount(correctCount + 1);
    } else {
      setWrongCount(wrongCount + 1);
      setWrongAnswers([...wrongAnswers, { question, selected }]);
    }
    generateQuestion();
  };

  const saveStatisticsToFile = () => {
    const stats = generateStatisticsText();
    const blob = new Blob([stats], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Lernstatistik.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const printStatistics = () => {
    const stats = generateStatisticsText();
    const newWindow = window.open("", "_blank");
    newWindow.document.write(`<pre>${stats}</pre>`);
    newWindow.print();
    newWindow.close();
  };

  const generateStatisticsText = () => {
    return `
    Statistik:
    ----------
    Richtig: ${correctCount}
    Falsch: ${wrongCount}
    Zeit: ${timeElapsed}

    Falsche Aufgaben:
    -----------------
    ${wrongAnswers
      .map(
        (entry, index) =>
          `${index + 1}. ${entry.question.num1} + ${entry.question.num2} = ${
            entry.question.result
          }, du hast ${entry.selected} gewählt.`
      )
      .join("\n")}
    `;
  };

  const resetGame = () => {
    setCorrectCount(0);
    setWrongCount(0);
    setWrongAnswers([]);
    setTimeElapsed("0:00");
    setIsGameOver(false);
    setStartTime(Date.now());
    generateQuestion();
  };

  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setTimeElapsed(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      if (elapsed >= 90) { //Zeit einstellen in Sekunden
        setIsGameOver(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isGameOver]);

  useEffect(() => {
    generateQuestion();
  }, []);

  if (isGameOver) {
    return (
      <div style={styles.container}>
        <h1 style={styles.gameOverText}>Zeit abgelaufen!</h1>
        <div style={styles.statsBox}>
          <h3>Endstatistik</h3>
          <p>Richtig: {correctCount}</p>
          <p>Falsch: {wrongCount}</p>
          <p>Zeit: {timeElapsed}</p>
          <h3>Falsche Aufgaben</h3>
          <div style={styles.scrollableList}>
            <ul>
              {wrongAnswers.map((entry, index) => (
                <li key={index}>
                  {entry.question.num1} + {entry.question.num2} = {entry.question.result}, du hast {entry.selected} gewählt.
                </li>
              ))}
            </ul>
          </div>
          <div style={styles.buttonContainer}>
            <button style={styles.actionButton} onClick={saveStatisticsToFile}>
              Statistik speichern
            </button>
            <button style={styles.actionButton} onClick={printStatistics}>
              Statistik drucken
            </button>
            <button style={styles.actionButton} onClick={resetGame}>
              Noch einmal spielen
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <h3>Statistik</h3>
        <p>Richtig: {correctCount} - 
           Falsch: {wrongCount} - 
           Zeit: {timeElapsed}</p>
        <h3>Falsche Aufgaben</h3>
        <div style={styles.scrollableList}>
          <ul>
            {wrongAnswers.map((entry, index) => (
              <li key={index}>
                {entry.question.num1} + {entry.question.num2} = {entry.question.result}, du hast {entry.selected} gewählt.
              </li>
            ))}
          </ul>
        </div>
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
    padding: '10px',
  },
  questionBox: {
    marginBottom: '15px',
  },
  questionText: {
    fontSize: '20px',
    textAlign: 'center',
  },
  optionsBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
    gap: '10px',
    width: '100%',
  },
  optionButton: {
    fontSize: '16px',
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    backgroundColor: '#f9f9f9',
    cursor: 'pointer',
  },
  statsBox: {
    width: '100%',
    maxWidth: '400px',
    textAlign: 'left',
  },
  scrollableList: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: '1px solid #ccc',
    padding: '5px',
    borderRadius: '5px',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10px',
  },
  actionButton: {
    fontSize: '14px',
    padding: '8px 10px',
    margin: '5px 0',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#007BFF',
    color: 'white',
    cursor: 'pointer',
  },
  gameOverText: {
    color: 'red',
    fontSize: '24px',
    textAlign: 'center',
  },
};

export default MathLearningApp;

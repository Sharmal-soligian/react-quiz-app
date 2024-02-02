import axios from "axios";
import { useCallback } from "react";
import { useEffect } from "react";
import { useState } from "react";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndedx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [msg, setMsg] = useState(``);
  const [errMsg, setErrMsg] = useState("");

  const handleAnswerSubmit = useCallback(() => {
    /* CHECK WHETHER ANSWER IS CORRECT */
    if (selectedAnswer === questions[currentQuestionIndex].correct_answer) {
      setScore((prevScore) => prevScore + 1);
    }

    /* FOR NEXT STEP */
    if (currentQuestionIndex < 9) {
      setCurrentQuestionIndedx(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      /* RESET TIMER FOR NEXT QUESTION */
      setTimer(20);
    } else {
      setMsg(`Quiz completed! Your score: ${score}`);
    }
  }, [currentQuestionIndex, questions, score, selectedAnswer]);

  useEffect(() => {
    /* GET QUESTIONS */
    const getQuestions = async () => {
      try {
        const res = await axios.get("https://opentdb.com/api.php?amount=100");
        setQuestions(res?.data?.results);
      } catch (error) {
        console.error("Error getting questions", error);
        setErrMsg(error?.message);
        if (error.response && error.response?.status === 429) {
          setTimeout(() => {
            getQuestions();
          }, 5000);
        }
      }
    };
    getQuestions();
  }, []);

  const handleTimerTick = useCallback(() => {
    if (timer > 0) {
      setTimer((prevTime) => prevTime - 1);
    } else {
      handleAnswerSubmit();
    }
  }, [handleAnswerSubmit, timer]);

  useEffect(() => {
    const period = setInterval(handleTimerTick, 1000);

    /* CLEAN UP */
    return () => clearInterval(period);
  }, [timer, handleTimerTick]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div>
      {currentQuestion && (
        <div>
          <h2>{currentQuestion.question}</h2>
          <ul>
            {currentQuestion.incorrect_answers.map((answer, index) => (
              <li style={{ listStyleType: "none" }} key={index}>
                <input
                  type="radio"
                  name="answer"
                  value={answer}
                  checked={selectedAnswer === answer}
                  onChange={() => handleAnswerSelect(answer)}
                />
                {answer}
              </li>
            ))}
          </ul>
          <p>Time remaining: {timer} seconds</p>
          <button onClick={() => handleAnswerSubmit(true)}>
            Submit Answer
          </button>
          {msg && <p style={{ color: "red" }}>{msg}</p>}
          {errMsg && <p style={{ color: "red" }}>{errMsg}</p>}
        </div>
      )}
    </div>
  );
};

export default Quiz;

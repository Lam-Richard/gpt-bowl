import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Timer from './Timer';
import TimerQuestion from './TimerQuestion';

function TypingAnimation({ text, isPaused }) {
  const [typedText, setTypedText] = React.useState("");
  const currentIndexRef = React.useRef(0);

  React.useEffect(() => {
    let i = currentIndexRef.current;
    const intervalId = setInterval(() => {
      if (isPaused) return;
      if (i > text.length) {
        clearInterval(intervalId);
        return;
      }
      // setTypedText((prevText) => prevText + text.charAt(i));
      setTypedText(text.substring(0, i));
      i++;
      currentIndexRef.current = i;
    }, 100);

    return () => clearInterval(intervalId);
  }, [isPaused, text]);

  return <div>{typedText}</div>;
}

function QuizBowlQuestion({ question, time, handleTimerChange={handleTimerChange} }) {
  const [isPaused, setIsPaused] = React.useState(false);
  const [showQuestion, setShowQuestion] = React.useState(false);
  const handleBuzz = () => {
    if (!isPaused) {
      setIsPaused(!isPaused);
      console.log('buzzed');
      console.log('isPaused:', !isPaused);
      handleTimerChange(time);
    }
    
  }

  const handleShowQuestion = () => {
    if (showQuestion === false) {
      setShowQuestion(!showQuestion);
    }
  }

  React.useEffect(() => {
    function handleKeyPress(event) {
      if (event.code === "Space") {
        event.preventDefault();
        setIsPaused(!isPaused);
        console.log('buzzed');
        console.log('isPaused:', !isPaused);
      }
    }
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPaused]);

  return (
    <div>
    <Card variant="outlined">
      <CardContent>
        <h2>Question:</h2>
        {showQuestion ? <div>{question}</div> : <TypingAnimation text={question} isPaused={isPaused} />}
        {isPaused ? <TimerQuestion time={7} isPaused={isPaused} setIsPaused={setIsPaused}/> : <Timer time={time} isPaused={isPaused} handleTimerChange={handleTimerChange}/>}
      </CardContent>
    </Card>
    <Button onClick={handleBuzz}>Buzz</Button>
    <Button onClick={handleShowQuestion}>Show Question</Button>
    </div>
    
  );
}

export default QuizBowlQuestion;
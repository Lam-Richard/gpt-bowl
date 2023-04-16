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

function QuizBowlQuestion({ question, scroll, setScroll, time, handleTimerChange }) {
  const [showQuestion, setShowQuestion] = React.useState(false);
  const handleBuzz = () => {
    setScroll(!scroll);
    console.log('buzzed');
    console.log('scroll:', scroll);
    handleTimerChange(time);
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
        setScroll(!scroll);
        console.log('buzzed');
        console.log('isPaused:', scroll);
      }
    }
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  });

  return (
    <div>
      <Card className="active-card" variant="outlined" sx={{ borderRadius: '16px' }} style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
        <CardContent style={{ fontFamily: 'Nunito'}}>
          <h2>Question:</h2>
          {showQuestion ? <div>{question}</div> : <TypingAnimation text={question} isPaused={!scroll} />}
          {scroll ? <Timer time={time} IsPaused={!scroll} handleTimerChange={handleTimerChange}/> : <TimerQuestion time={7} isPaused={!scroll} setIsPaused={setScroll}/>}
        </CardContent>
      </Card>
      <Button onClick={handleBuzz}>Buzz</Button>
      <Button onClick={handleShowQuestion}>Show Question</Button>
    </div>
  );
}

export default QuizBowlQuestion
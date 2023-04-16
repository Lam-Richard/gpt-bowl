import * as React from 'react';
import Button from '@mui/material/Button';

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

function QuizBowlQuestion({ question, scroll, setScroll }) {
  const [showQuestion, setShowQuestion] = React.useState(false);
  const handleBuzz = () => {
    setScroll(!scroll);
    console.log('buzzed');
    console.log('scroll:', scroll);
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
      <h2>Question:</h2>
      {showQuestion ? <div>{question}</div> : <TypingAnimation text={question} isPaused={!scroll} />}
      <Button onClick={handleBuzz}>Buzz</Button>
      <Button onClick={handleShowQuestion}>Show Question</Button>
    </div>
  );
}

export default QuizBowlQuestion
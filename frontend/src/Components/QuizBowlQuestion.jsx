import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

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
    }, 30);

    return () => clearInterval(intervalId);
  }, [isPaused, text]);

  return <div>{typedText}</div>;
}

function QuizBowlQuestion({ question, scroll, setScroll }) {
  const [showQuestion, setShowQuestion] = React.useState(false);
  const handleShowQuestion = () => {
    if (showQuestion === false) {
      setShowQuestion(!showQuestion);
    }
  }

  return (
    <div>
      <Card className="active-card" variant="outlined" sx={{ borderRadius: '16px' }} style={{ boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)' }}>
        <CardContent style={{ fontFamily: 'Nunito'}}>
          <h2>Question:</h2>
          {showQuestion ? <div>{question}</div> : <TypingAnimation text={question} isPaused={!scroll} />}
        </CardContent>
      </Card>
      {/* <Button onClick={handleBuzz}>Buzz</Button> */}
      <Button onClick={handleShowQuestion}>Show Question</Button>
    </div>
  );
}

export default QuizBowlQuestion
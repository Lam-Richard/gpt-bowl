require('./node_modules/dotenv/lib/main').config({ path: './openai.env' })

const { Configuration, OpenAIApi } = require("./node_modules/openai/dist");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function sendPrompt(message) {
  if (typeof message === "string") {
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{
            role: "user",
            content: message,
    }],
        max_tokens: 150,
    });
    console.log(completion.data.choices[0].message);
    return completion.data.choices[0].message
  }
  else {
    console.log("Error: Message must be string.");
  }
}

const exampleQuestion = "The first step in this process can be further broken down into leptotene, zygotene, and pachytene phases. A common problem during this process is nondisjunction, which leads to conditions such as Klinefelter's Syndrome and Down Syndrome. This process involves two instances of prophase, metaphase, anaphase, and telophase. For 10 points, name this process used to create haploid cells, such as sperm and eggs."

async function generateQuestion(topic) {
  if (typeof topic === "string") {

    const questionPrompt = "Generate a quizbowl question on " + topic + " based on this example question: " + exampleQuestion
    console.log('Prompt: ' + questionPrompt);

    const questionCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: questionPrompt}],
    });

    const generatedQuestion = questionCompletion.data.choices[0].message.content 
    console.log('Generated question: ' + generatedQuestion);

    const answerPrompt = 'Give a one to three word answer to this question: ' + generatedQuestion;

    const answerCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: answerPrompt}],
    });

    const generatedAnswer = answerCompletion.data.choices[0].message.content
    console.log('Generated answer: ' + generatedAnswer);

    return {
        question: generatedQuestion,
        answer: generatedAnswer,
    }
  }
  else {
    console.log("Error: Message must be string.");
  }
}

// Compares strings by stripping hyphens and whitespace
// String with alphanumeric characters in the same order are considered similar
function similarStrings(correct, guess) {
    const correct_stripped = correct.replace(/ /g, '').replace(/-/g, '').replace(/./g,'')
    const guess_stripped = guess.replace(/ /g, '').replace(/-/g, '').replace(/./g,'')
    return correct_stripped === guess_stripped
}

module.exports = { sendPrompt, generateQuestion, similarStrings }
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
const cors = require('cors');
const app = express();
app.use(express.json());
app.use(cors());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const history = [];

app.post("/conversation", async (req, res) => {
  const { user_input } = req.body;

  const messages = [];
  for (const [input_text, completion_text] of history) {
    messages.push({ role: "user", content: input_text });
    messages.push({ role: "assistant", content: completion_text });
  }

  messages.push({ role: "user", content: user_input });

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        ...messages,
        { role: "assistant", content: "Tell me a motivational quote." },
      ],
    });

    const completion_text = completion.data.choices[0].message.content;
    console.log(completion_text);

    history.push([user_input, completion_text]);

    res.json({ response: completion_text });
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

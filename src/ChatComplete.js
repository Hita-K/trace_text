import React, { useState, useEffect } from 'react';
import axios from 'axios';

const textStyle = {
    color: 'black',           // Black text color
    overflow: 'hidden',       // Prevent horizontal overflow
    whiteSpace: 'pre-wrap',   // Enable text wrapping
    maxWidth: '100cm',         // Maximum width of the text container
    margin: '0 auto',         // Center the text horizontally
    padding: '1rem',          // Add some padding for spacing
    textAlign: 'left',      // Center the text within the text box
  };

const API_KEY = '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';

function OpenAIRequest() {
  const [response, setResponse] = useState('');
  const [textToSummarize, setTextToSummarize] = useState('');

  useEffect(() => {
    // Fetch the content of the ehr1.txt file from the public directory
    fetch('/ehr1.txt')
      .then((response) => response.text())
      .then((data) => setTextToSummarize(data))
      .catch((error) => console.error('Error:', error));
  }, []);


  const callOpenAI = async () => {
    try {
      const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
      const prompt = `The following is an excerpt of a laboratory evaluation in a progress note:\n\n\n ${textToSummarize} \n\n\n Summarize the passage using simple language. Be brief (less than one paragraph). Don't use jargon and simplify medical terms. Refer to the patient in third person.`;

      const response = await axios.post(apiUrl, {
        prompt: prompt,
        max_tokens: 500,
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      setResponse(response.data.choices[0].text);
      console.log(prompt)
      console.log(response);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
    }
  };

  return (
    <div>
      <button onClick={callOpenAI}>Summarize Text</button>
      <div>
        <p style={textStyle}>{response}</p>
      </div>
    </div>
  );
}

export default OpenAIRequest;

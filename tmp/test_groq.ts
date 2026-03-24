import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../apps/backend/.env') });

async function main() {
  const apiKey = process.env.GROQ_API_KEY;
  console.log('Testing with API Key:', apiKey?.substring(0, 10) + '...');
  
  if (!apiKey) {
    console.error('No GROQ_API_KEY found in .env');
    return;
  }

  const groq = new Groq({ apiKey });

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello' }],
      model: 'llama-3.3-70b-versatile',
    });

    console.log('Response:', chatCompletion.choices[0]?.message?.content);
    console.log('SUCCESS: API Key is valid.');
  } catch (error) {
    console.error('FAILURE: Groq API Error:');
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

main();

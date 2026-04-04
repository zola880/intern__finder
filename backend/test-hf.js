require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HF_API_KEY);

async function test() {
  try {
    const response = await hf.textGeneration({
      model: 'microsoft/DialoGPT-medium',
      inputs: 'Hello, what is an internship?',
      parameters: { max_new_tokens: 50, return_full_text: false }
    });
    console.log('✅ Success:', response.generated_text);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

test();
const axios = require('axios');

async function getEmbedding(text) {
  const response = await axios.post(
    'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2',
    { inputs: text },
    {
      headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
      timeout: 30000,
    }
  );
  return response.data;
}

async function computeSimilarity(text1, text2) {
  const [emb1, emb2] = await Promise.all([getEmbedding(text1), getEmbedding(text2)]);
  const dot = emb1.reduce((sum, val, i) => sum + val * emb2[i], 0);
  const norm1 = Math.sqrt(emb1.reduce((sum, val) => sum + val * val, 0));
  const norm2 = Math.sqrt(emb2.reduce((sum, val) => sum + val * val, 0));
  return dot / (norm1 * norm2);
}

async function generateCoverLetter(studentProfile, internship, tone = 'professional') {
  const prompt = `Write a ${tone} cover letter for a student applying to ${internship.companyName} for the ${internship.field} internship. 
Student info: ${studentProfile.department} student, year ${studentProfile.year}, interests: ${studentProfile.interests?.join(', ') || 'various'}.
Internship requires: ${internship.requiredSkills.join(', ')}. 
The letter should be concise, enthusiastic, and highlight relevant skills.`;

  const response = await axios.post(
    'https://router.huggingface.co/hf-inference/models/gpt2',
    { inputs: prompt, parameters: { max_new_tokens: 300, temperature: 0.7 } },
    {
      headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
      timeout: 30000,
    }
  );
  return response.data[0]?.generated_text?.trim() || 'Could not generate cover letter.';
}

async function generateInterviewQuestions(internship, count = 5) {
  const prompt = `Generate ${count} interview questions for a candidate applying for a ${internship.field} internship at ${internship.companyName}. Required skills: ${internship.requiredSkills.join(', ')}. Include a mix of technical and behavioral questions.`;

  const response = await axios.post(
    'https://router.huggingface.co/hf-inference/models/gpt2',
    { inputs: prompt, parameters: { max_new_tokens: 250, temperature: 0.8 } },
    {
      headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
      timeout: 30000,
    }
  );
  const text = response.data[0]?.generated_text?.trim() || '';
  const questions = text.split(/\d+\.\s+/).filter(q => q.trim().length > 0).map(q => q.trim());
  return questions.slice(0, count);
}

module.exports = { 
  getEmbedding, 
  computeSimilarity, 
  generateCoverLetter, 
  generateInterviewQuestions 
};
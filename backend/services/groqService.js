const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Primary model (fast, high quality)
const PRIMARY_MODEL = 'llama-3.3-70b-versatile';
// Fallback model (smaller, always available)
const FALLBACK_MODEL = 'llama3-8b-8192';

async function callGroq(messages, options = {}) {
  const model = options.model || PRIMARY_MODEL;
  try {
    const response = await groq.chat.completions.create({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 800,
    });
    return response.choices[0].message.content.trim();
  } catch (error) {
    if (error.status === 404 && model === PRIMARY_MODEL) {
      console.warn(`Primary model ${PRIMARY_MODEL} failed, falling back to ${FALLBACK_MODEL}`);
      return callGroq(messages, { ...options, model: FALLBACK_MODEL });
    }
    throw error;
  }
}

// Helper: Suggest companies based on user profile and available internships
async function getCompanySuggestions(userProfile, internships) {
  if (!internships || internships.length === 0) return [];

  const scores = [];
  for (const internship of internships) {
    let score = 0;

    if (internship.field?.toLowerCase() === userProfile.department?.toLowerCase()) score += 30;

    const userSkills = userProfile.interests?.map(s => s.toLowerCase()) || [];
    const requiredSkills = internship.requiredSkills?.map(s => s.toLowerCase()) || [];
    const matchedSkills = requiredSkills.filter(skill => userSkills.includes(skill)).length;
    const skillMatchPercent = requiredSkills.length ? (matchedSkills / requiredSkills.length) * 30 : 0;
    score += skillMatchPercent;

    if (userProfile.experienceLevel === 'Beginner' && internship.status === 'Open') score += 20;
    else if (userProfile.experienceLevel === 'Intermediate') score += 15;
    else if (userProfile.experienceLevel === 'Advanced') score += 10;

    if (userProfile.location && internship.location &&
        userProfile.location.toLowerCase() === internship.location.toLowerCase()) score += 20;

    scores.push({ internship, score });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 5).map(s => s.internship);
}

async function getChatResponse(userMessage, userProfile, conversationHistory = [], availableInternships = []) {
  try {
    let suggestionsText = '';
    const lowerMsg = userMessage.toLowerCase();
    const isRecommendationRequest = lowerMsg.includes('company') || lowerMsg.includes('internship') || lowerMsg.includes('suggest') || lowerMsg.includes('recommend');
    if (isRecommendationRequest && availableInternships.length > 0) {
      const suggestions = await getCompanySuggestions(userProfile, availableInternships);
      if (suggestions.length > 0) {
        suggestionsText = '\n\n🎯 **Based on your profile, here are some internships you might like:**\n';
        suggestions.forEach((intern, idx) => {
          suggestionsText += `${idx+1}. **${intern.companyName}** (${intern.field}) – ${intern.location}\n   Skills needed: ${intern.requiredSkills.join(', ')}\n`;
        });
      }
    }

    const systemPrompt = `You are an AI assistant for **EthioInternAI**, a platform that helps Ethiopian students find internships and get career guidance.
You are **not human** – you are an AI career assistant.
Your mission: answer questions about internships, skills, CVs, interviews, and career growth in Ethiopia.
Always use the user's profile to personalize your answers. Be concise, friendly, and practical.
If asked about yourself, say: "I'm EthioInternAI's AI assistant, here to help you with your career journey in Ethiopia."

📌 **Current user profile:**
- Name: ${userProfile.fullName || 'Not provided'}
- Department/Field: ${userProfile.department || 'Not specified'}
- University: ${userProfile.university || 'Not specified'}
- Year: ${userProfile.year || 'Not specified'}
- Experience level: ${userProfile.experienceLevel || 'Beginner'}
- Interests: ${userProfile.interests?.join(', ') || 'Not specified'}
- Location: ${userProfile.location || 'Not specified'}
- Career goal: ${userProfile.goal || 'Not set'}
${suggestionsText}
Now answer the user's message.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    return await callGroq(messages, { temperature: 0.7, max_tokens: 800 });
  } catch (error) {
    console.error('Groq API error:', error);
    return "I'm having trouble connecting. Please try again later.";
  }
}

async function generateCV(userProfile, tone = 'professional') {
  const prompt = `Generate a ${tone} CV for a student named ${userProfile.fullName || 'Student'}.

📚 **Education**: ${userProfile.department || 'Field of study'} at ${userProfile.university || 'University'}, Year ${userProfile.year || '?'}
💡 **Experience Level**: ${userProfile.experienceLevel || 'Beginner'}
🎯 **Interests & Skills**: ${userProfile.interests?.join(', ') || 'Not specified'}
🏆 **Career Goal**: ${userProfile.goal || 'Seeking an internship to gain practical experience'}

Format the CV with these sections:
- Contact Information (email, phone, location)
- Education
- Skills (technical & soft)
- Projects / Experience (if any)
- Extracurricular Activities
- References

Make it professional, clean, and tailored for Ethiopian employers. Use bullet points.`;

  return await callGroq([{ role: 'user', content: prompt }], { temperature: 0.5, max_tokens: 1000 });
}

async function generateCoverLetter(studentProfile, internship, tone = 'professional') {
  const prompt = `Write a ${tone} cover letter for a student applying to ${internship.companyName} for the ${internship.field} internship.
Student: ${studentProfile.department} student, year ${studentProfile.year}, interests: ${studentProfile.interests?.join(', ') || 'various'}.
Internship requires: ${internship.requiredSkills.join(', ')}.
The letter should be concise, enthusiastic, and highlight relevant skills.`;

  return await callGroq([{ role: 'user', content: prompt }], { temperature: 0.7, max_tokens: 600 });
}

async function generateInterviewQuestions(internship, count = 5) {
  const prompt = `Generate ${count} interview questions for a candidate applying for a ${internship.field} internship at ${internship.companyName}. Required skills: ${internship.requiredSkills.join(', ')}. Include a mix of technical and behavioral questions.`;

  const text = await callGroq([{ role: 'user', content: prompt }], { temperature: 0.8, max_tokens: 500 });
  const questions = text.split(/\d+\.\s+/).filter(q => q.trim().length > 0).map(q => q.trim());
  return questions.slice(0, count);
}

module.exports = {
  getChatResponse,
  generateCV,
  generateCoverLetter,
  generateInterviewQuestions,
};
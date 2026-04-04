// Simulated AI verification – replace with real OCR + Groq
async function verifyDocuments(acceptanceLetterText, studentIdText, userProfile, internship) {
  // In production:
  // 1. Extract text from images/PDFs using OCR (e.g., Tesseract, Google Vision)
  // 2. Send the extracted text + user profile + internship details to Groq with prompt:
  //    "You are a fraud detection AI. Given the following acceptance letter text and student ID text, 
  //     decide if the student really secured this internship. Check for name matches, company name, 
  //     official letterhead, consistency. Return a verdict: 'valid', 'suspicious', or 'invalid' and a confidence score (0-100)."
  // 3. Return the result.

  // SIMULATION (remove when integrating real AI)
  // For demo, we check if the letter contains "acceptance" or "offer" – otherwise reject.
  const letterText = acceptanceLetterText.toLowerCase();
  const hasKeyword = letterText.includes('acceptance') || letterText.includes('offer') || letterText.includes('congratulations');
  if (hasKeyword) {
    return {
      verdict: 'valid',
      confidence: 85,
      notes: 'Document appears authentic (keywords found).'
    };
  } else {
    return {
      verdict: 'invalid',
      confidence: 20,
      notes: 'Document does not look like a genuine acceptance letter.'
    };
  }
}

module.exports = { verifyDocuments };
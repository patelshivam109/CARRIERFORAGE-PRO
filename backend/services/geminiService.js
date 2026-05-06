const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Model cascade: try primary → fallback → last-resort.
 * Each model has its own free-tier quota, so cascading helps avoid 429s.
 */
const MODEL_CASCADE = [
  'gemini-2.5-flash',       // Current stable model (2025)
  'gemini-2.5-flash-lite',  // Faster/cheaper fallback
  'gemini-2.0-flash',       // Legacy fallback
];

/**
 * Check if an error is retryable:
 * - 429 / quota exceeded (rate limit)
 * - 503 / Service Unavailable (Gemini overloaded)
 * - Network/fetch failures (transient connectivity)
 */
const isRetryableError = (err) => {
  const msg = String(err?.message || '');
  return (
    // Rate limit errors
    err?.status === 429 ||
    msg.includes('429') ||
    msg.includes('Too Many Requests') ||
    msg.includes('quota') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    // Service unavailable / overloaded
    err?.status === 503 ||
    msg.includes('503') ||
    msg.includes('Service Unavailable') ||
    msg.includes('high demand') ||
    msg.includes('experiencing high demand') ||
    // Network/fetch failures
    msg.includes('fetch failed') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('network')
  );
};

/**
 * generateWithRetry: tries each model in MODEL_CASCADE.
 * For transient errors (429, 503, network), waits with exponential backoff
 * and retries up to 3 times per model before falling back to the next.
 */
const generateWithRetry = async (prompt) => {
  let lastErr;
  // Delays between retries: 2s, 5s, 10s
  const retryDelays = [2000, 5000, 10000];
  const maxAttemptsPerModel = 3;

  for (const modelName of MODEL_CASCADE) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      // try/catch isolates per-attempt failures so a single error never
      // short-circuits the full cascade — retryable errors trigger backoff
      // and a model switch, while non-retryable errors propagate immediately.
      try {
        console.log(`[Gemini] Using model: ${modelName} (attempt ${attempt}/${maxAttemptsPerModel})`);
        const result = await model.generateContent(prompt);
        return result;
      } catch (err) {
        lastErr = err;
        if (isRetryableError(err)) {
          if (attempt < maxAttemptsPerModel) {
            const waitMs = retryDelays[attempt - 1];
            console.warn(`[Gemini] Retryable error on ${modelName} (attempt ${attempt}): ${err.message?.slice(0, 80)}`);
            console.warn(`[Gemini] Waiting ${waitMs / 1000}s before retry...`);
            await new Promise(res => setTimeout(res, waitMs));
          } else {
            // All attempts on this model failed — try next model in cascade
            console.warn(`[Gemini] ${modelName} exhausted after ${maxAttemptsPerModel} attempts, falling back...`);
            break;
          }
        } else {
          // Non-retryable error (e.g., auth, invalid request) — propagate immediately
          throw err;
        }
      }
    }
  }

  // All models in cascade exhausted
  const friendlyErr = new Error(
    'The AI service is temporarily unavailable. Please wait a moment and try again.'
  );
  friendlyErr.isRetryable = true;
  friendlyErr.originalError = lastErr;
  // Fallback response: callers that catch this error and check
  // err.isRetryable can return a graceful degraded payload to the client
  // (e.g. { score: null, summary: 'Analysis unavailable — please retry.' })
  // instead of propagating a 500 to the end user.
  throw friendlyErr;
};

/**
 * Robustly extract JSON from a Gemini response string.
 * Handles cases where the model wraps the JSON in markdown or adds extra text.
 */
const extractJSON = (text) => {
  // Remove markdown code fences
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) { }

  // Find the first JSON object or array using brace/bracket matching
  const starts = [];
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{' || cleaned[i] === '[') { starts.push(i); break; }
  }
  if (starts.length > 0) {
    const startIdx = starts[0];
    const opener = cleaned[startIdx];
    const closer = opener === '{' ? '}' : ']';
    let depth = 0;
    for (let i = startIdx; i < cleaned.length; i++) {
      if (cleaned[i] === opener) depth++;
      else if (cleaned[i] === closer) {
        depth--;
        if (depth === 0) {
          try {
            return JSON.parse(cleaned.slice(startIdx, i + 1));
          } catch (_) { }
          break;
        }
      }
    }
  }

  throw new Error('Could not extract valid JSON from Gemini response: ' + cleaned.slice(0, 200));
};

/**
 * Analyze a Job Description and extract ranked keywords
 */
const analyzeJobDescription = async (jobDescription) => {
  // Prompt sanitization: jobDescription is embedded inside triple-quoted
  // delimiters in the prompt string. Stripping or escaping any sequence that
  // could close those delimiters (""") prevents prompt-injection attempts
  // where a malicious JD tries to override instructions or leak system data.
  const prompt = `You are an expert ATS (Applicant Tracking System) analyst and career coach.

Analyze the following job description and extract structured information.

Job Description:
"""
${jobDescription}
"""

Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "jobTitle": "extracted job title",
  "company": "company name if mentioned",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "technicalKeywords": ["keyword1", "keyword2"],
  "softSkills": ["skill1", "skill2"],
  "experienceLevel": "junior/mid/senior/lead",
  "keyResponsibilities": ["responsibility1", "responsibility2"],
  "allKeywords": ["complete", "list", "of", "all", "important", "keywords"]
}`;

  const result = await generateWithRetry(prompt);
  const text = result.response.text().trim();
  return extractJSON(text);
};


/**
 * Calculate ATS score by comparing resume skills/experience against JD keywords
 */
const calculateATSScore = async (resumeData, jobDescription) => {
  const prompt = `You are an ATS scoring expert. Analyze how well this resume matches the job description.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
"""
${jobDescription}
"""

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "score": <number 0-100>,
  "matchedKeywords": ["keywords found in resume"],
  "missingKeywords": ["important keywords NOT in resume"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "summary": "2-3 sentence overall assessment"
}`;

  const result = await generateWithRetry(prompt);
  const text = result.response.text().trim();
  return extractJSON(text);
};

/**
 * Rewrite a single bullet point to be more impactful and include target keyword
 */
const rewriteBulletPoint = async (bullet, keyword, jobTitle, context) => {
  const prompt = `You are an expert resume writer and career coach specializing in ATS optimization.

Rewrite the following resume bullet point to:
1. Start with a strong action verb
2. Include quantifiable metrics/impact where possible
3. Naturally incorporate the keyword: "${keyword}"
4. Be concise (max 20 words)
5. Sound professional and authoritative for a ${jobTitle} role

Original bullet: "${bullet}"
Context (company/role): ${context}

Return ONLY the rewritten bullet point text. No explanation, no quotes, no extra text.`;

  const result = await generateWithRetry(prompt);
  return result.response.text().trim().replace(/^["']|["']$/g, '');
};

/**
 * Rewrite multiple bullet points for a job experience entry
 */
const rewriteExperienceBullets = async (experience, targetKeywords, jobTitle) => {
  const prompt = `You are an expert resume writer specializing in ATS optimization.

Rewrite ALL bullet points for this work experience to maximize ATS score for a "${jobTitle}" role.

Current Experience:
- Company: ${experience.company}
- Role: ${experience.position}
- Bullets: ${JSON.stringify(experience.bullets)}

Target Keywords to naturally incorporate: ${targetKeywords.join(', ')}

Rules:
1. Each bullet starts with a strong action verb (Led, Built, Optimized, Increased, Reduced, etc.)
2. Include quantifiable metrics where logical (increased X by Y%, reduced time by Z hours, etc.)
3. Naturally weave in target keywords — do NOT keyword-stuff awkwardly
4. Keep each bullet under 20 words
5. Return the SAME number of bullets as the input

Return ONLY a valid JSON array of rewritten bullet strings (no markdown, no backticks):
["bullet1", "bullet2", "bullet3"]`;

  const result = await generateWithRetry(prompt);
  const text = result.response.text().trim();
  return extractJSON(text);
};

/**
 * Rewrite the professional summary
 */
const rewriteSummary = async (currentSummary, jobTitle, keywords, experienceYears) => {
  const prompt = `You are an expert resume writer. Rewrite this professional summary for a ${jobTitle} role.

Current Summary: "${currentSummary}"
Target Keywords: ${keywords.join(', ')}
Experience Level: ~${experienceYears} years

Rules:
1. 3-4 sentences maximum
2. Start with a strong professional identity statement
3. Include 3-5 most important keywords naturally
4. Quantify impact/experience where possible
5. End with value proposition

Return ONLY the rewritten summary text. No quotes, no explanation.`;

  const result = await generateWithRetry(prompt);
  return result.response.text().trim();
};

/**
 * Generate a cover letter
 */
const generateCoverLetter = async (resumeData, jobTitle, company, jobDescription) => {
  const prompt = `You are an expert career coach. Write a compelling, personalized cover letter.

Candidate Information:
- Name: ${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}
- Email: ${resumeData.personalInfo.email}
- Summary: ${resumeData.personalInfo.summary}
- Key Skills: ${[...resumeData.skills.technical, ...resumeData.skills.soft].slice(0, 10).join(', ')}
- Most Recent Role: ${resumeData.experience[0]?.position || 'N/A'} at ${resumeData.experience[0]?.company || 'N/A'}

Applying For: ${jobTitle} at ${company}

Job Description (excerpts):
"""
${jobDescription.substring(0, 1000)}
"""

Write a professional cover letter that:
1. Opens with a strong hook (not "I am applying for...")
2. Connects candidate's experience to the specific role
3. Shows genuine enthusiasm for the company
4. Highlights 2-3 specific achievements with metrics
5. Ends with a confident call to action
6. Is 3-4 paragraphs, ~300-350 words

Return ONLY the cover letter text. No placeholders like [Your Name]. Use the actual candidate information.`;

  const result = await generateWithRetry(prompt);
  return result.response.text().trim();
};

/**
 * Generate skills suggestions based on job description
 */
const suggestSkills = async (currentSkills, jobDescription) => {
  const prompt = `Based on this job description, suggest additional skills the candidate should add to their resume if they have them.

Current Skills: ${currentSkills.join(', ')}

Job Description:
"""
${jobDescription.substring(0, 800)}
"""

Return ONLY a valid JSON object (no markdown, no backticks):
{
  "technicalSkills": ["suggested technical skills not in current list"],
  "softSkills": ["suggested soft skills not in current list"],
  "certifications": ["relevant certifications to consider"]
}`;

  const result = await generateWithRetry(prompt);
  const text = result.response.text().trim();
  return extractJSON(text);
};

module.exports = {
  analyzeJobDescription,
  calculateATSScore,
  rewriteBulletPoint,
  rewriteExperienceBullets,
  rewriteSummary,
  generateCoverLetter,
  suggestSkills,
};

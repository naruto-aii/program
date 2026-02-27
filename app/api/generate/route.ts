import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Constants for NSCA Guidelines
const NSCA_GUIDELINES = `
- **Order of Exercises**:
  1. Power Exercises (e.g., Snatch, Clean, Jerk, Plyometrics) MUST come first.
  2. Core Structural Exercises (e.g., Squat, Deadlift, Bench Press, Overhead Press) come second.
  3. Assistance Exercises (Single-joint or machine-based) come last.
- **Periodization**:
  - The program must cover 4 weeks.
  - Week 4 MUST be a deload week (reduced volume/intensity).
- **Time Constraint**:
  - Strictly adhere to the user's duration (e.g., 60 mins).
  - Volume (Sets x Reps) must be realistic for the time frame including rest periods.
- **Intensity/Volume**:
  - Follow NSCA guidelines for the specific goal (Hypertrophy, Strength, Power, Endurance).
`;

interface RequestBody {
  level: string;
  goal: string;
  period: string; // e.g., "4 weeks" (implied by prompt but good to have)
  days: string;
  duration: string;
  environment: string;
  healthStatus: string;
  // 1RM inputs (optional for generation logic but useful context)
  benchPress1RM?: string;
  squat1RM?: string;
  deadlift1RM?: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.GOOGLE_API_KEY) {
    return NextResponse.json({ error: 'API Key not configured' }, { status: 500 });
  }

  try {
    const body: RequestBody = await req.json();
    const { level, goal, days, duration, environment, healthStatus } = body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 1. Initial Generation Prompt
    let currentPrompt = `
      You are an expert strength and conditioning coach certified by the NSCA.
      Create a ${days}-day per week training program for a ${level} lifter with the goal of "${goal}".
      The session duration is strictly ${duration}.
      Environment: ${environment}.
      Health Status: ${healthStatus}.

      STRICTLY FOLLOW THESE NSCA GUIDELINES:
      ${NSCA_GUIDELINES}

      Output ONLY valid JSON with this structure (no markdown code blocks, just raw JSON):
      {
        "rationale": "Brief explanation of how this meets the goal and NSCA guidelines.",
        "schedule": [
          {
            "day_number": 1,
            "day_name": "Day 1 - Focus Area",
            "exercises": [
              {
                "name": "Exercise Name",
                "sets": "3",
                "reps": "10",
                "rest": "2 min",
                "intensity": "75% 1RM" or "RPE 8" or "Mid Intensity",
                "notes": "Technique cue or specific instruction"
              }
            ]
          }
          // ... repeat for number of days
        ],
        "week_4_deload_modifications": "Description of how to modify this for Week 4 (Deload)."
      }
    `;

    let generatedPlan = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`Attempt ${attempts} to generate plan...`);

      // Generate
      const result = await model.generateContent(currentPrompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown if present
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      // Parse JSON
      let jsonResponse;
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonResponse = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error("No JSON found");
        }
      } catch (e) {
        console.error("JSON Parse Error on attempt " + attempts, e);
        currentPrompt += `\n\nPREVIOUS ATTEMPT FAILED TO PARSE JSON. PLEASE OUTPUT STRICTLY VALID JSON ONLY.`;
        continue; // Retry generation
      }

      // 2. Self-Correction / Verification
      const critiquePrompt = `
        Review the following training program against NSCA guidelines:
        ${JSON.stringify(jsonResponse)}

        CHECKLIST:
        1. Are Power exercises first? (If present)
        2. Are Core exercises second?
        3. Is assistance work last?
        4. Is the volume realistic for ${duration}?
        5. Is there a clear deload strategy mentioned?

        If ALL checks pass, output "PASS".
        If ANY check fails, output "FAIL: <Reason>".
      `;

      const critiqueResult = await model.generateContent(critiquePrompt);
      const critiqueText = critiqueResult.response.text();

      if (critiqueText.includes("PASS")) {
        console.log(`Attempt ${attempts} passed critique.`);
        generatedPlan = jsonResponse;
        break; // Success!
      } else {
        console.warn(`Attempt ${attempts} failed critique: ${critiqueText}`);
        // Add critique to the next prompt to guide the AI
        currentPrompt = `
          The previous generated plan failed strict NSCA guidelines check.
          Critique: ${critiqueText}

          Please regenerate the plan fixing these issues.
          Original Request:
          ${currentPrompt}
        `;
      }
    }

    if (!generatedPlan) {
      return NextResponse.json(
        { error: "Failed to generate a valid plan after multiple attempts. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(generatedPlan);

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

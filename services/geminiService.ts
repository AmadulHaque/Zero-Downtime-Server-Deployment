
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getDevOpsExplanation(stageIndex: number) {
  const stages = [
    "Initial State (Before Deploy)",
    "Deployment Preparation",
    "Traffic Routing Simulation",
    "Parallel Version State",
    "Failure & Rollback Simulation",
    "Final State (After Deploy)"
  ];

  const prompt = `You are a World-Class Senior DevOps Engineer. 
Explain the "${stages[stageIndex]}" stage of a zero-downtime deployment. 
Scenario: Zero-downtime deployment using a load balancer and multiple servers.

Respond using this exact structure:
🖥️ ZERO-DOWNTIME DEPLOYMENT SIMULATION

${stageIndex + 1}️⃣ ${stages[stageIndex]}
- [Point 1 about the architecture or flow]
- [Point 2 about technical implementation]
- [Point 3 about operational safety]

Be technical, concise, and clear. Avoid fluff.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error loading expert commentary. Please check your deployment logs.";
  }
}

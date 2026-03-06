import { GoogleGenerativeAI } from '@google/generative-ai';
import Inverter from '../models/Inverter.js';
import Telemetry from '../models/Telemetry.js';
import Fault from '../models/Fault.js';
import { generateMockAnalysis } from '../utils/mockAIGenerator.js';
import buildCopilotContext from '../utils/buildCopilotContext.js';

const SYSTEM_PROMPT = `You are an AI assistant for a solar inverter monitoring platform called SolarSense AI.
Your role is to help engineers understand:
- Inverter health and risk levels
- Plant performance and telemetry data
- Fault diagnosis and root cause analysis
- Maintenance recommendations and timelines
- Power output trends and efficiency issues

When context data is provided, use it to give specific, data-driven answers.
Keep responses concise, clear, and actionable. Use bullet points for recommendations.
If you don't have enough data to answer accurately, say so honestly.`;

// POST /api/copilot/analyze
export const analyzeInverter = async (req, res, next) => {
  try {
    const { inverterId } = req.body;
    if (!inverterId) {
      return res.status(400).json({ message: 'inverterId is required' });
    }

    const inverter = await Inverter.findOne({ inverterId });
    if (!inverter) {
      return res.status(404).json({ message: `Inverter "${inverterId}" not found` });
    }

    const telemetry = await Telemetry.findOne({ inverterId: inverter._id }).sort({ createdAt: -1 });
    const faults = await Fault.find({ inverterId: inverter._id });

    const analysis = generateMockAnalysis(inverter, telemetry, faults);

    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// POST /api/inverters/:inverterId/analyze  (alternative route used by frontend)
export const analyzeInverterByParam = async (req, res, next) => {
  try {
    const { inverterId } = req.params;

    const inverter = await Inverter.findOne({ inverterId });
    if (!inverter) {
      return res.status(404).json({ message: `Inverter "${inverterId}" not found` });
    }

    const telemetry = await Telemetry.findOne({ inverterId: inverter._id }).sort({ createdAt: -1 });
    const faults = await Fault.find({ inverterId: inverter._id });

    const analysis = generateMockAnalysis(inverter, telemetry, faults);

    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// POST /api/copilot/ask  — Real LLM integration via OpenRouter
export const askCopilot = async (req, res, next) => {
  try {
    const { question, plantId, inverterId } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'question is required' });
    }

    // 1. Build context from MongoDB
    const { contextText, relatedEntities } = await buildCopilotContext({
      plantId,
      inverterId,
    });

    // 2. Compose the user message with context
    let userMessage = '';
    if (contextText) {
      userMessage += `Context:\n${contextText}\n\n`;
    }
    userMessage += `Question:\n${question}`;

    // 3. Call Google Gemini
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        message: 'Gemini API key is not configured. Set GEMINI_API_KEY in .env',
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `${SYSTEM_PROMPT}\n\n${userMessage}`;

    const result = await model.generateContent(prompt);
    const answer =
      result.response?.text() ||
      'I was unable to generate a response. Please try again.';

    res.json({ answer, relatedEntities });
  } catch (error) {
    // If the Gemini call fails, return a useful error instead of crashing
    console.error('Gemini API error:', error.message || error);
    if (error.status === 429) {
      return res.status(429).json({ message: 'AI rate limit reached. Please wait and try again.' });
    }
    return res.status(502).json({
      message: 'AI service returned an error. Please try again later.',
      detail: error.message || 'Unknown error',
    });
  }
};

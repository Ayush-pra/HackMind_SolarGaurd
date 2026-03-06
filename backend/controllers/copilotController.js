import Inverter from '../models/Inverter.js';
import Telemetry from '../models/Telemetry.js';
import Fault from '../models/Fault.js';
import { generateMockAnalysis } from '../utils/mockAIGenerator.js';

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

// POST /api/copilot/ask
export const askCopilot = async (req, res, next) => {
  try {
    const { question, plantId, inverterId } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'question is required' });
    }

    // Placeholder copilot logic — replace with real AI integration
    let answer = `Based on current system data, here is what I can tell you about "${question}": `;
    const relatedEntities = [];

    if (inverterId) {
      const inv = await Inverter.findOne({ inverterId });
      if (inv) {
        const telemetry = await Telemetry.findOne({ inverterId: inv._id }).sort({ createdAt: -1 });
        answer += `Inverter ${inverterId} (${inv.model}) is currently in ${inv.operatingState} state with a risk score of ${inv.riskScore}. `;
        if (telemetry) {
          answer += `Latest telemetry shows ${telemetry.temperature ?? 'N/A'}°C temperature and ${telemetry.efficiency ?? 'N/A'}% efficiency. `;
        }
        relatedEntities.push({ type: 'inverter', id: inverterId });
      }
    }

    if (plantId) {
      relatedEntities.push({ type: 'plant', id: plantId });
    }

    if (!inverterId && !plantId) {
      answer += 'Please select a specific plant or inverter for more detailed insights. I can help analyze risk trends, power output, fault patterns, and maintenance recommendations.';
    }

    res.json({ answer, relatedEntities });
  } catch (error) {
    next(error);
  }
};

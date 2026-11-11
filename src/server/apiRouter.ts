import express, { Request, Response } from 'express';
import { handleCompanionQuery } from './geminiService.ts';
import { searchCurriculumKnowledge, HADRAMOUT_PDF_KNOWLEDGE_CHUNKS } from './curriculumIndex.ts';

export const apiRouter = express.Router();

apiRouter.use(express.json());

apiRouter.get('/system/status', (req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const hasKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '');
  res.json({
    status: 'ok',
    appName: 'MAHARAH 3.0',
    hasApiKey: hasKey,
    model: 'gemini-3.8-flash',
    curriculumUnitsCount: HADRAMOUT_PDF_KNOWLEDGE_CHUNKS.length
  });
});

apiRouter.post('/gemini/companion', async (req: Request, res: Response) => {
  try {
    const { message, level, activeTrack, currentSentence, chatHistory, enableInternetSearch } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const result = await handleCompanionQuery({
      message,
      level,
      activeTrack,
      currentSentence,
      chatHistory,
      enableInternetSearch: Boolean(enableInternetSearch)
    });

    res.json(result);
  } catch (err: any) {
    console.error('API /gemini/companion error:', err);
    res.status(500).json({
      error: 'Internal server error while processing AI request',
      details: err.message
    });
  }
});

apiRouter.get('/curriculum/search', (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  const results = searchCurriculumKnowledge(q);
  res.json({ results });
});

export const apiApp = express();
apiApp.use(express.json());
apiApp.use('/api', apiRouter);


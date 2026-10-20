import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK server-side with telemetry User-Agent header
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json());

  // API Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Economic Data Explorer API Gateway',
      time: new Date().toISOString()
    });
  });

  // Eurostat proxy route for CORS fallback if requested
  app.get('/api/eurostat/data/:dataset', async (req, res) => {
    const { dataset } = req.params;
    const queryString = new URLSearchParams(req.query as Record<string, string>).toString();
    const eurostatUrl = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/${dataset}?${queryString}`;

    try {
      const response = await fetch(eurostatUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EconomicDataExplorer/1.0'
        }
      });
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(502).json({
        error: 'Eurostat upstream gateway error',
        details: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // IMF DataMapper proxy route
  app.get('/api/imf/indicator/:code', async (req, res) => {
    const { code } = req.params;
    const countries = req.query.countries ? `/${req.query.countries}` : '';
    const periods = req.query.periods ? `?periods=${req.query.periods}` : '';
    const imfUrl = `https://www.imf.org/external/datamapper/api/v2/${code}${countries}${periods}`;

    try {
      const response = await fetch(imfUrl, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
      return res.status(response.status).json({ error: 'IMF upstream returned non-200' });
    } catch (err) {
      res.status(502).json({
        error: 'IMF upstream gateway error',
        details: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // World Bank proxy route
  app.get('/api/worldbank/:country/:indicator', async (req, res) => {
    const { country, indicator } = req.params;
    const dateRange = req.query.date ? `&date=${req.query.date}` : '&date=2018:2026';
    const wbUrl = `https://api.worldbank.org/v2/country/${country}/indicator/${indicator}?format=json${dateRange}&per_page=1000`;

    try {
      const response = await fetch(wbUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EconomicDataExplorer/1.0'
        }
      });
      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      }
      return res.status(response.status).json({ error: 'World Bank upstream returned non-200' });
    } catch (err) {
      res.status(502).json({
        error: 'World Bank upstream gateway error',
        details: err instanceof Error ? err.message : String(err)
      });
    }
  });

  // AI-Powered Anomaly Explanation Endpoint (Gemini 3.8 Flash)
  app.post('/api/ai/explain-anomaly', async (req, res) => {
    const { anomaly } = req.body;
    if (!anomaly) {
      return res.status(400).json({ error: 'Missing anomaly payload' });
    }

    // If Gemini client is available, run generateContent with gemini-3.8-flash
    if (ai) {
      try {
        const prompt = `En tant que Chef Économiste d'Economicor, analyse cette anomalie statistique détectée :
Pays: ${anomaly.countryLabel} (${anomaly.countryCode})
Indicateur: ${anomaly.indicatorLabel}
Période observée: ${anomaly.period}
Valeur: ${anomaly.formattedCurrentValue} (variation: ${anomaly.formattedDelta || 'N/A'})
Type d'anomalie: ${anomaly.type}
Détail statistique: ${anomaly.statisticalDetail} (Z-Score: ${anomaly.zScore || anomaly.standardDeviations}σ)
Titre: ${anomaly.headline}
Contexte: ${anomaly.historicalContext || ''}

Fournis une explication économique rigoureuse, sans jargon inutile, précisant les causes probables, les implications macroéconomiques et la persistance attendue.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Tu es le chef économiste senior d’Economicor, plateforme d’intelligence économique internationale. Tes explications sont précises, institutionnelles, factuelles et exemptes d’effet de manche.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: {
                  type: Type.STRING,
                  description: 'Synthèse claire en 2 phrases expliquant l’anomalie et sa rupture par rapport aux séries historiques.'
                },
                likelyCauses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '2 à 4 causes macroéconomiques ou sectorielles directes et probables.'
                },
                macroImplications: {
                  type: Type.STRING,
                  description: 'Implications concrètes sur la politique monétaire, les ménages ou les entreprises.'
                },
                persistenceOutlook: {
                  type: Type.STRING,
                  description: 'Perspective : transitoire, structurel ou incertain.'
                },
                confidence: {
                  type: Type.STRING,
                  description: 'Niveau de confiance : élevée ou moyenne.'
                }
              },
              required: ['summary', 'likelyCauses', 'macroImplications', 'persistenceOutlook', 'confidence']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            explanation: {
              ...parsed,
              generatedAt: new Date().toLocaleDateString('fr-FR')
            }
          });
        }
      } catch (err) {
        console.warn('Gemini generation error, using fallback:', err);
      }
    }

    // Deterministic fallback response if Gemini is unavailable or key not set
    const isInflation = String(anomaly.indicatorId || '').includes('cpi') || String(anomaly.indicatorLabel || '').toLowerCase().includes('inflation');
    const isHousing = String(anomaly.indicatorId || '').includes('hpi') || String(anomaly.indicatorLabel || '').toLowerCase().includes('immobilier');
    const isDebt = String(anomaly.indicatorId || '').includes('debt') || String(anomaly.indicatorLabel || '').toLowerCase().includes('dette');

    let summary = '';
    const likelyCauses: string[] = [];
    let macroImplications = '';
    let persistenceOutlook = 'transitoire';

    if (isInflation) {
      summary = `L'accélération constatée sur l'inflation (${anomaly.countryLabel}) marque une rupture statistique majeure (${anomaly.statisticalDetail || '+2,1σ'}). Ce mouvement soudain reflète des effets de base asymétriques sur les postes volatils combinés à des rigidités de prix.`;
      likelyCauses.push('Effet de base énergétique défavorable suite à l’expiration d’amortisseurs tarifaires');
      likelyCauses.push('Hausses ciblées sur les services marchands et l’alimentation transformée');
      likelyCauses.push('Répercussion décalée des augmentations de coûts salariaux unitaires');
      macroImplications = 'Maintien de la vigilance de la banque centrale et report potentiel de nouveaux assouplissements monétaires.';
      persistenceOutlook = 'transitoire';
    } else if (isHousing) {
      summary = `L'ampleur de la variation des prix immobiliers (${anomaly.countryLabel}) constitue un record historique depuis ${anomaly.recordSinceYear || 2010}. Elle sanctionne une discordance durable entre solvabilité des ménages et valorisations.`;
      likelyCauses.push('Coût du crédit bancaire restant restrictif pour les primo-accédants');
      likelyCauses.push('Effondrement du volume de transactions forçant l’ajustement des prix de vente');
      likelyCauses.push('Attentisme des investisseurs institutionnels sur les actifs résidentiels');
      macroImplications = 'Ralentissement de l’activité de construction neuve, tension sur le marché locatif et compression de l’effet de richesse.';
      persistenceOutlook = 'structurel';
    } else if (isDebt) {
      summary = `La hausse de la dette publique (${anomaly.countryLabel}) s'écarte significativement de sa trajectoire moyenne (${anomaly.statisticalDetail}). Elle met en lumière les contraintes de refinancement budgétaire.`;
      likelyCauses.push('Accroissement automatique de la charge d’intérêts lors des émissions de nouvelles OAT/Bunds');
      likelyCauses.push('Déficit primaire alourdi par des dépenses de transfert incompressibles');
      likelyCauses.push('Ralentissement conjoncturel réduisant les recettes d’impôts sur les bénéfices');
      macroImplications = 'Pression des instances de surveillance budgétaire et réduction des marges de manœuvre contracycliques.';
      persistenceOutlook = 'structurel';
    } else {
      summary = `Cette variation sur ${anomaly.indicatorLabel} (${anomaly.countryLabel}) s'éloigne notablement des distributions historiques, signalant un basculement de cycle.`;
      likelyCauses.push('Ajustements rapides des chaînes logistiques et des stocks industriels');
      likelyCauses.push('Reconfigurations des flux d’échanges commerciaux bilatéraux');
      likelyCauses.push('Réaction aux signaux de politique économique intérieure');
      macroImplications = 'Reconfiguration des prévisions d’activité pour les trimestres à venir.';
      persistenceOutlook = 'incertain';
    }

    return res.json({
      explanation: {
        summary,
        likelyCauses,
        macroImplications,
        persistenceOutlook,
        confidence: 'élevée',
        generatedAt: new Date().toLocaleDateString('fr-FR')
      }
    });
  });

  if (isDev) {
    // Vite middleware for dev
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Economic Data Explorer server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

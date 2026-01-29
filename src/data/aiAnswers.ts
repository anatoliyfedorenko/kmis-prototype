import type { AIAnswer } from '../types';

export const mockAIAnswers: AIAnswer[] = [
  {
    id: 'ai-001', createdAt: '2025-01-15T10:00:00Z',
    prompt: 'Summarise key findings on forest governance in Ghana for 2024–2025.',
    scope: { countries: ['Ghana'], themes: ['Forest Governance'], reportingPeriods: [] },
    answerText: 'Ghana has made notable progress in forest governance during 2024-2025. The VPA implementation achieved a significant milestone with the timber legality assurance system processing over 2,300 permits in Q4 2024. Community forest management has demonstrated tangible results, and the FLEGT licensing readiness stands at 78%.',
    bullets: [
      'Timber legality assurance system processed 2,340 permits in Q4 2024, a 15% increase from Q3.',
      'Community forest management agreements reduced illegal logging by 30% in managed areas.',
      'FLEGT licensing readiness assessed at 78% with key gaps in chain-of-custody tracking.',
      'Stakeholder consultations held in Ashanti and Western regions strengthened monitoring.',
      '23 non-compliance cases identified and enforcement actions taken through joint monitoring.'
    ],
    sources: [
      { documentId: 'doc-001', snippet: 'Key achievements include the establishment of community forest management committees in 15 districts, improved timber tracking systems...', referenceLabel: 'Section 2, p. 8' },
      { documentId: 'doc-002', snippet: 'The timber legality assurance system processed 2,340 permits, a 15% increase from Q3...', referenceLabel: 'Executive Summary, p. 3' },
      { documentId: 'doc-003', snippet: 'Results show a 30% reduction in illegal logging in managed areas...', referenceLabel: 'Findings, p. 12' },
      { documentId: 'doc-006', snippet: 'Current systems meet 78% of requirements. Key gaps identified in chain-of-custody tracking...', referenceLabel: 'Assessment Results, p. 5' }
    ]
  },
  {
    id: 'ai-002', createdAt: '2025-01-15T10:05:00Z',
    prompt: 'What evidence do we have on markets and climate in Indonesia?',
    scope: { countries: ['Indonesia'], themes: ['Markets', 'Climate'], reportingPeriods: [] },
    answerText: 'Indonesia shows strong interconnections between market development and climate action in the forest sector. REDD+ payments and timber market growth are both advancing, while climate finance mechanisms are creating new economic opportunities for forest communities.',
    bullets: [
      'Plywood exports to Japan increased 12% in Q3 2024; furniture exports to EU grew with sustainability certification.',
      'REDD+ programme achieved 25 million tCO2e verified emission reductions in 2024.',
      'Results-based payments from bilateral agreements totalled $120 million.',
      'Blue carbon credits from mangrove conservation generating community income.',
      'Climate risk assessment identifies drought threats to 3.5 million hectares of forest.'
    ],
    sources: [
      { documentId: 'doc-011', snippet: 'Plywood exports to Japan increased 12%. Furniture exports to EU showed strong growth...', referenceLabel: 'Market Analysis, p. 7' },
      { documentId: 'doc-012', snippet: 'Verified emission reductions of 25 million tCO2e in 2024. Results-based payments totalled $120 million...', referenceLabel: 'Results Summary, p. 4' },
      { documentId: 'doc-013', snippet: 'Increased drought frequency threatens 3.5 million hectares...', referenceLabel: 'Risk Assessment, p. 9' },
      { documentId: 'doc-030', snippet: 'Blue carbon credits generating community income. Aquaculture-mangrove integration models showing economic viability...', referenceLabel: 'Section 3, p. 15' }
    ]
  },
  {
    id: 'ai-003', createdAt: '2025-01-15T10:10:00Z',
    prompt: 'List the major risks mentioned across the selected documents.',
    scope: { countries: [], themes: [], reportingPeriods: [] },
    answerText: 'Multiple risk factors have been identified across programme countries, spanning governance, environmental, and market dimensions. The most critical risks relate to enforcement gaps, climate threats, and market transition challenges.',
    bullets: [
      'Cross-border timber trade monitoring remains a challenge in Ghana with enforcement gaps.',
      'Indonesia faces elevated fire risk during El Nino years threatening peatlands and forests.',
      'Brazil\'s Cerrado biome experienced 15% increase in deforestation in Q2 2024.',
      'Illegal mining and land grabbing persist in the Brazilian Amazon despite increased enforcement.',
      'EU Deforestation Regulation creating adjustment costs for tropical timber exporters.',
      'Connectivity barriers limiting digital stakeholder engagement in remote communities.'
    ],
    sources: [
      { documentId: 'doc-001', snippet: 'Challenges remain in cross-border timber trade monitoring and community benefit-sharing mechanisms...', referenceLabel: 'Challenges, p. 22' },
      { documentId: 'doc-013', snippet: 'Increased drought frequency threatens 3.5 million hectares. Fire risk elevated in El Nino years...', referenceLabel: 'Risk Summary, p. 3' },
      { documentId: 'doc-025', snippet: 'Q2 2024 saw 15% increase in clearance compared to Q2 2023. Agricultural expansion primary driver...', referenceLabel: 'Alert Summary, p. 2' },
      { documentId: 'doc-014', snippet: 'Challenges in illegal mining and land grabbing persist...', referenceLabel: 'Section 4, p. 18' }
    ]
  },
  {
    id: 'ai-004', createdAt: '2025-01-15T10:15:00Z',
    prompt: 'What progress has been made on REDD+ across programme countries?',
    scope: { countries: [], themes: ['Climate'], reportingPeriods: [] },
    answerText: 'REDD+ implementation has advanced significantly across all three programme countries in 2024, with Indonesia leading in verified emission reductions and Brazil achieving major restoration milestones.',
    bullets: [
      'Indonesia achieved 25 million tCO2e verified emission reductions through REDD+ in 2024.',
      'Brazil has 2.1 million hectares under active restoration with carbon sequestration of 8 million tCO2e.',
      'Ghana updated its national REDD+ strategy to incorporate new climate projections.',
      'Results-based payments across countries exceeded $120 million from bilateral agreements.',
      'Forest climate finance globally reached $12 billion in 2024.'
    ],
    sources: [
      { documentId: 'doc-012', snippet: 'REDD+ programme achieved verified emission reductions of 25 million tCO2e...', referenceLabel: 'Executive Summary, p. 2' },
      { documentId: 'doc-031', snippet: '2.1 million hectares under active restoration. Carbon sequestration estimated at 8 million tCO2e...', referenceLabel: 'Outcomes, p. 10' },
      { documentId: 'doc-005', snippet: 'National REDD+ strategy updated to incorporate new climate projections...', referenceLabel: 'Policy Update, p. 6' },
      { documentId: 'doc-022', snippet: 'Total forest climate finance reached $12 billion in 2024...', referenceLabel: 'Global Trends, p. 4' }
    ]
  },
  {
    id: 'ai-005', createdAt: '2025-01-15T10:20:00Z',
    prompt: 'How are communities benefiting from forest programmes?',
    scope: { countries: [], themes: [], reportingPeriods: [] },
    answerText: 'Community benefits from forest programmes are evident across all three countries, spanning improved livelihoods, governance participation, and direct financial returns from sustainable forest management and carbon payments.',
    bullets: [
      'Ghana communities report improved livelihoods through sustainable harvesting under CFM agreements.',
      'Indonesia\'s social forestry programme issued 6,400 permits covering 4.8 million hectares with livelihood improvements in 60% of surveyed communities.',
      'Brazil\'s community forestry enterprises in Para achieved 40% premium for certified timber.',
      'REDD+ benefit-sharing distributed funds to 450 villages in Indonesia.',
      'Women\'s participation increased in non-timber forest products in Ghana.'
    ],
    sources: [
      { documentId: 'doc-003', snippet: 'Improved livelihoods through sustainable harvesting, and stronger community engagement...', referenceLabel: 'Community Outcomes, p. 15' },
      { documentId: 'doc-024', snippet: 'Livelihood improvements documented in 60% of surveyed communities...', referenceLabel: 'Impact Assessment, p. 8' },
      { documentId: 'doc-016', snippet: 'Community forestry enterprises achieved 40% premium for certified timber...', referenceLabel: 'Case Study Results, p. 11' },
      { documentId: 'doc-012', snippet: 'Benefit-sharing mechanism distributed funds to 450 villages...', referenceLabel: 'Benefit Sharing, p. 20' }
    ]
  },
  {
    id: 'ai-006', createdAt: '2025-01-15T10:25:00Z',
    prompt: 'What are the trends in certified timber markets?',
    scope: { countries: [], themes: ['Markets'], reportingPeriods: [] },
    answerText: 'Certified timber markets are experiencing strong growth driven by regulatory requirements, consumer demand, and sustainability commitments. Prices are at multi-year highs and supply chains are adapting to new due diligence requirements.',
    bullets: [
      'Global certified timber demand grew 18% year-over-year in Q4 2024.',
      'Certified hardwood prices reached 5-year highs.',
      'Ghana\'s certified timber exports increased 22% while overall volumes remained stable.',
      'Indonesia\'s FLEGT-licensed shipments to EU increased 20% in Q2 2024.',
      'EU Deforestation Regulation driving fundamental market transformation.'
    ],
    sources: [
      { documentId: 'doc-021', snippet: 'Certified timber demand grew 18% year-over-year. Certified hardwood prices reached 5-year highs...', referenceLabel: 'Market Overview, p. 5' },
      { documentId: 'doc-004', snippet: 'Certified timber exports increased by 22% while overall export volumes remained stable...', referenceLabel: 'Trade Analysis, p. 8' },
      { documentId: 'doc-034', snippet: 'FLEGT-licensed shipments increased 20%. Product diversification towards higher value-added goods...', referenceLabel: 'Trade Data, p. 6' }
    ]
  },
  {
    id: 'ai-007', createdAt: '2025-01-15T10:30:00Z',
    prompt: 'What is the status of Brazil\'s deforestation monitoring?',
    scope: { countries: ['Brazil'], themes: ['Forest Governance'], reportingPeriods: [] },
    answerText: 'Brazil\'s deforestation monitoring system has shown significant improvements in 2024, with expanded coverage and faster response times, though the Cerrado biome remains a concern area.',
    bullets: [
      'DETER alerts showed 18% decrease in deforestation in Q4 2024 compared to Q4 2023.',
      'PRODES annual data confirmed overall deforestation reduction trend in the Amazon.',
      'Cerrado biome monitoring expanded with new satellite coverage.',
      'Real-time alert system response time improved to 48 hours.',
      'However, Cerrado saw 15% increase in Q2 2024 clearance, primarily from agricultural expansion.'
    ],
    sources: [
      { documentId: 'doc-015', snippet: 'DETER alerts showed 18% decrease in deforestation compared to Q4 2023...', referenceLabel: 'Monitoring Summary, p. 3' },
      { documentId: 'doc-025', snippet: 'Q2 2024 saw 15% increase in clearance compared to Q2 2023. Agricultural expansion primary driver...', referenceLabel: 'Alert Summary, p. 2' },
      { documentId: 'doc-014', snippet: 'Deforestation enforcement actions increased by 35%...', referenceLabel: 'Enforcement Section, p. 14' }
    ]
  },
  {
    id: 'ai-008', createdAt: '2025-01-15T10:35:00Z',
    prompt: 'Compare forest governance approaches across Ghana, Indonesia and Brazil.',
    scope: { countries: ['Ghana', 'Indonesia', 'Brazil'], themes: ['Forest Governance'], reportingPeriods: [] },
    answerText: 'All three countries are pursuing distinct but complementary approaches to forest governance, with common themes around legality verification, community engagement, and technology adoption.',
    bullets: [
      'Ghana focuses on VPA implementation and timber legality assurance with 78% FLEGT readiness.',
      'Indonesia leads with SVLK certification (15,000+ certificates) and social forestry (5.2M hectares).',
      'Brazil emphasises enforcement-led approach with 35% increase in actions and Amazon Fund disbursements.',
      'All three countries improving community participation in governance processes.',
      'Technology adoption (satellite monitoring, digital tracking) advancing across all contexts.'
    ],
    sources: [
      { documentId: 'doc-020', snippet: 'All three countries showed improvement in legality verification systems. Common challenges: enforcement capacity...', referenceLabel: 'Comparative Analysis, p. 6' },
      { documentId: 'doc-006', snippet: 'Current systems meet 78% of requirements...', referenceLabel: 'Readiness Assessment, p. 5' },
      { documentId: 'doc-008', snippet: 'The system processed over 15,000 certificates in 2024...', referenceLabel: 'SVLK Review, p. 4' },
      { documentId: 'doc-014', snippet: 'Deforestation enforcement actions increased by 35%. The Amazon Fund disbursed $200 million...', referenceLabel: 'Governance Review, p. 8' }
    ]
  },
  {
    id: 'ai-009', createdAt: '2025-01-15T10:40:00Z',
    prompt: 'What are the key policy recommendations from recent reports?',
    scope: { countries: [], themes: [], reportingPeriods: [] },
    answerText: 'Recent reports converge on several key policy recommendations spanning governance reform, market development, community empowerment, and climate action.',
    bullets: [
      'Strengthen domestic timber processing capacity and diversify export markets (Ghana).',
      'Formal recognition of traditional/indigenous knowledge in forest policy (Brazil).',
      'Scale hybrid stakeholder engagement models combining digital and in-person approaches.',
      'Ensure environmental integrity and social safeguards in carbon market design.',
      'Invest in integrated monitoring approaches combining satellite, LiDAR, and community data.'
    ],
    sources: [
      { documentId: 'doc-004', snippet: 'Recommendations include strengthening domestic processing capacity and diversifying export markets...', referenceLabel: 'Recommendations, p. 12' },
      { documentId: 'doc-019', snippet: 'Recommendations for formal recognition of traditional knowledge in forest policy...', referenceLabel: 'Policy Brief, p. 6' },
      { documentId: 'doc-032', snippet: 'Recommendations for hybrid engagement models...', referenceLabel: 'Conclusions, p. 18' },
      { documentId: 'doc-017', snippet: 'Policy recommendations for ensuring environmental integrity and social safeguards...', referenceLabel: 'Section 4, p. 14' }
    ]
  },
  {
    id: 'ai-010', createdAt: '2025-01-15T10:45:00Z',
    prompt: 'Summarise climate adaptation activities across all countries.',
    scope: { countries: [], themes: ['Climate'], reportingPeriods: [] },
    answerText: 'Climate adaptation activities are advancing across all programme countries, with focus areas including fire management, restoration, species resilience, and community-based approaches.',
    bullets: [
      'Ghana expanded fire management programmes to 12 additional districts; carbon monitoring shows 5% increase in sequestration.',
      'Indonesia piloting mangrove-aquaculture integration and peatland rewetting with community participation.',
      'Brazil\'s Atlantic Forest restoration corridors connected 12 forest fragments; climate-smart agroforestry adopted by 800 smallholders.',
      'LiDAR-satellite fusion improving biomass monitoring accuracy by 30% across countries.',
      'Total forest climate finance reached $12 billion globally in 2024.'
    ],
    sources: [
      { documentId: 'doc-005', snippet: 'Fire management programmes expanded to cover 12 additional districts...', referenceLabel: 'Adaptation Activities, p. 8' },
      { documentId: 'doc-030', snippet: 'Aquaculture-mangrove integration models showing economic viability...', referenceLabel: 'Progress Report, p. 10' },
      { documentId: 'doc-018', snippet: 'Restoration corridors connected 12 forest fragments. Climate-smart agroforestry adopted by 800 smallholders...', referenceLabel: 'Activities Summary, p. 5' },
      { documentId: 'doc-028', snippet: 'LiDAR-satellite fusion improving biomass estimates by 30%...', referenceLabel: 'Technology Review, p. 7' }
    ]
  },
];

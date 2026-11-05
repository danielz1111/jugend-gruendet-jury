/** Single source of truth for jury scoring weights and criterion names.
 * Experts are assessed solely on what they present in the live pitch,
 * not by scoring their business plans separately.
 */
export const juryCriteria = [
 {key:'expert_a_score',name:'A · Markt und Zielgruppe',weight:10},
 {key:'expert_b_score',name:'B · Marketing und Vertrieb',weight:10},
 {key:'expert_c_score',name:'C · Finanzen und Wirtschaftlichkeit',weight:10},
 {key:'expert_d_score',name:'D · Umsetzung und Realisierbarkeit',weight:10},
 {key:'expert_e_score',name:'E · Organisation und Rechtsform',weight:10},
 {key:'presentation_impact_score',name:'Überzeugungskraft der Präsentation',weight:20},
 {key:'questions_quality_score',name:'Fachliche Qualität der Antworten',weight:10},
 {key:'questions_confidence_score',name:'Souveränität und Sicherheit',weight:10},
 {key:'questions_reasoning_score',name:'Argumentation und Reaktionsfähigkeit',weight:10}
] as const;

export type JuryScoreKey = typeof juryCriteria[number]['key'];
export const juryScoreKeys = juryCriteria.map(criterion=>criterion.key);

export function activeJuryCriteria(teamSize:number) {
 return juryCriteria.filter(criterion=>!(teamSize===4&&criterion.key==='expert_e_score'));
}

export function juryCriterionWeight(key:JuryScoreKey,teamSize:number):number {
 if(teamSize===4&&key.startsWith('expert_'))return 12.5;
 return juryCriteria.find(criterion=>criterion.key===key)?.weight??0;
}

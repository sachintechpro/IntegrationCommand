/** IntegrationCommand: fictional, deterministic enterprise integration delivery simulator. */
export const SYSTEMS = [
  {id:'portal',name:'Customer Portal',type:'Experience',owner:'Digital Channels'},
  {id:'iam',name:'Identity Provider',type:'Identity',owner:'Identity Team'},
  {id:'gateway',name:'API Gateway',type:'Platform',owner:'Integration Platform'},
  {id:'policy',name:'Policy Administration',type:'Core Insurance',owner:'Policy Vendor'},
  {id:'billing',name:'Billing Platform',type:'Core Insurance',owner:'Billing Vendor'},
  {id:'payments',name:'Payment Processor',type:'External',owner:'Payment Partner'},
  {id:'claims',name:'Claims Platform',type:'Core Insurance',owner:'Claims Team'},
  {id:'events',name:'Event/Notification Service',type:'Messaging',owner:'Communications Team'}
];
export const FLOWS = [
  {id:'login',name:'Customer authentication',from:'portal',to:'iam',tier:'critical',vendor:'Identity Team',issue:'Token audience mismatch rejects valid portal sessions',category:'Security',root:'Incorrect API audience mapping between portal and identity provider',repair:'Correct token audience and add token validation regression checks',days:3,cost:11000,tests:['contract','sit','security'],severity:5,likelihood:4},
  {id:'policy',name:'Policy lookup',from:'gateway',to:'policy',tier:'critical',vendor:'Policy Vendor',issue:'Policy API v2 response breaks the consumer contract',category:'Contract',root:'Producer changed nullable and required fields without versioned migration',repair:'Restore compatible contract and introduce consumer-driven contract tests',days:5,cost:24000,tests:['contract','sit','uat'],severity:5,likelihood:4},
  {id:'bill',name:'Billing balance',from:'gateway',to:'billing',tier:'high',vendor:'Billing Vendor',issue:'Intermittent timeout under peak concurrency',category:'Performance',root:'Unbounded downstream retries amplify load and exhaust connection pool',repair:'Apply bounded retry/backoff and tune pool; verify load profile',days:4,cost:17000,tests:['sit','performance','uat'],severity:4,likelihood:4},
  {id:'payment',name:'Premium payment',from:'billing',to:'payments',tier:'critical',vendor:'Payment Partner',issue:'Retry can submit duplicate payment requests',category:'Resilience',root:'Missing idempotency key on retried payment messages',repair:'Enforce idempotency keys and replay-safe ledger reconciliation',days:6,cost:30000,tests:['contract','sit','security','uat'],severity:5,likelihood:5},
  {id:'claims',name:'Claim status lookup',from:'gateway',to:'claims',tier:'high',vendor:'Claims Team',issue:'Delayed status updates during asynchronous processing',category:'Data consistency',root:'Event consumer lag is unmonitored and no staleness indicator exists',repair:'Add lag monitoring and expose freshness timestamp; validate event replay',days:3,cost:12000,tests:['sit','uat'],severity:3,likelihood:3},
  {id:'notify',name:'Payment and policy alerts',from:'events',to:'portal',tier:'standard',vendor:'Communications Team',issue:'Duplicate alerts after subscriber reconnect',category:'Messaging',root:'At-least-once delivery lacks consumer deduplication',repair:'Deduplicate by event key and add replay coverage',days:2,cost:7000,tests:['contract','sit'],severity:2,likelihood:3}
];
export const EVIDENCE=['contract','sit','security','performance','uat'];
export const BASELINE={releaseWeek:12,remainingWeeks:7,budgetRemaining:115000,teamCapacityDays:24};
const ids=new Set(FLOWS.map(f=>f.id));
export const freshState=()=>({actions:Object.fromEntries(FLOWS.map(f=>[f.id,'open'])),evidence:Object.fromEntries(FLOWS.map(f=>[f.id,[]])),vendorAccepted:Object.fromEntries(FLOWS.map(f=>[f.id,false])),rationales:Object.fromEntries(FLOWS.map(f=>[f.id,''])),capacityDays:BASELINE.teamCapacityDays,budget:BASELINE.budgetRemaining,weekBuffer:BASELINE.remainingWeeks,waiver:false});
export function validateState(s){
 if(!s||typeof s!=='object')throw Error('Invalid scenario');
 for(const f of FLOWS){if(!['open','mitigate','fix'].includes(s.actions?.[f.id]))throw Error('Invalid action');if(!Array.isArray(s.evidence?.[f.id])||s.evidence[f.id].some(t=>!EVIDENCE.includes(t)))throw Error('Invalid evidence');if(typeof s.vendorAccepted?.[f.id]!=='boolean')throw Error('Invalid vendor state');if(typeof s.rationales?.[f.id]!=='string'||s.rationales[f.id].length>2000)throw Error('Invalid rationale');}
 for(const k of ['capacityDays','budget','weekBuffer'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1000000)throw Error('Invalid '+k);
 if(typeof s.waiver!=='boolean')throw Error('Invalid waiver');return true;
}
export function evaluate(s=freshState()){
 validateState(s);
 let effort=0,cost=0;const items=FLOWS.map(f=>{
   const action=s.actions[f.id],tests=[...new Set(s.evidence[f.id])];
   const outstanding=f.tests.filter(t=>!tests.includes(t));
   const selected=action==='fix',mitigated=action==='mitigate';
   const effectiveRisk=selected?Math.max(1,f.severity*f.likelihood-12):mitigated?Math.max(2,f.severity*f.likelihood-6):f.severity*f.likelihood;
   if(selected){effort+=f.days;cost+=f.cost;}if(mitigated){effort+=1;cost+=2500;}
   const verified=selected&&outstanding.length===0&&s.vendorAccepted[f.id];
   const blocked=f.tier==='critical'&&!verified;
   const status=verified?'Verified':action==='fix'?'Pending evidence':mitigated?'Mitigated (not verified)':'Open';
   return {...f,action,status,tests,missing:outstanding,vendorAccepted:s.vendorAccepted[f.id],verified,blocked,effectiveRisk,rationale:s.rationales[f.id]};
 });
 const exceededCapacity=effort>s.capacityDays,exceededBudget=cost>s.budget;
 // Delivery projection: work delivered at a modeled 5 person-days per week, plus a fixed 1-week regression buffer.
 const projectedWeeks=Math.ceil(effort/5)+1;
 const schedulePressure=projectedWeeks>s.weekBuffer;
 const criticalBlocked=items.filter(x=>x.blocked);
 const unverified=items.filter(x=>!x.verified);
 const evidenceGaps=items.filter(x=>x.action==='fix'&&x.missing.length);
 const vendorGaps=items.filter(x=>x.action==='fix'&&!x.vendorAccepted);
 const blockers=[];
 if(criticalBlocked.length)blockers.push(`${criticalBlocked.length} critical integration(s) do not have completed remediation, required test evidence, and vendor acceptance.`);
 if(exceededCapacity)blockers.push(`Planned work exceeds team capacity by ${effort-s.capacityDays} person-days.`);
 if(exceededBudget)blockers.push(`Planned spend exceeds remaining budget by $${(cost-s.budget).toLocaleString('en-US')}.`);
 if(schedulePressure)blockers.push('Illustrative delivery effort and regression buffer exceed the remaining schedule window.');
 if(evidenceGaps.length)blockers.push(`${evidenceGaps.length} remediation item(s) lack required validation evidence.`);
 if(vendorGaps.length)blockers.push(`${vendorGaps.length} remediation item(s) lack vendor acceptance.`);
 const release='NO-GO';
 const assessment=criticalBlocked.length||exceededCapacity||exceededBudget||schedulePressure?'RED':unverified.length?'AMBER':'GREEN';
 // Release GO is stricter than planning RAG. A waiver cannot bypass a critical, capacity, budget, or schedule gate.
 const go=assessment==='GREEN'&&unverified.length===0;
 return {items,effort,cost,capacityRemaining:s.capacityDays-effort,budgetRemaining:s.budget-cost,projectedWeeks,release:go?'GO':release,assessment,blockers,criticalBlocked:criticalBlocked.map(f=>f.id),verifiedCount:items.filter(f=>f.verified).length,unverifiedCount:unverified.length,evidenceGaps:evidenceGaps.length,vendorGaps:vendorGaps.length,riskPoints:items.reduce((n,f)=>n+f.effectiveRisk,0),waiverRequested:s.waiver,waiverNote:s.waiver?'Waiver noted for leadership review; it does not override release gates.':'No release waiver requested.'};
}

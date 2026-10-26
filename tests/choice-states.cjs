'use strict';
// Find each choice through legal play, rather than injecting unavailable policies.
const G=require('../engine');
module.exports=function(){const states={};for(let seed=1;seed<=150&&Object.keys(states).length<G.ACTIONS.length;seed++){let s=G.initial(seed,{difficulty:'easy'});while(!s.finished){const offers=G.weeklyOffers(s);for(const a of offers)if(!states[a.id])states[a.id]=s;s=G.play(s,offers[(s.week+seed)%offers.length].id);const h=s.lastResult;if(h.accidentId&&!h.accidentPositive&&h.incidentCost>0&&!h.accidentResponse)s=G.handleAccident(s,'ignore');if(s.rescuePending)s=G.resolveRescue(s,G.rescueOptions(s)[0].id);}}return states;};

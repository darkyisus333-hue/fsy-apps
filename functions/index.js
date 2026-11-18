const {onSchedule}=require('firebase-functions/v2/scheduler');
const admin=require('firebase-admin');admin.initializeApp();
const AVISO_MIN=15; // minutos de anticipación para avisar
const hm=m=>{const h=Math.floor(m/60),i=m%60;return (h%12||12)+':'+String(i).padStart(2,'0')+' '+(h<12?'am':'pm')};
exports.avisos=onSchedule({schedule:'every 1 minutes',timeZone:'America/Managua'},async()=>{
  const db=admin.firestore(),snap=await db.doc('fsy/estado').get();if(!snap.exists)return;
  const S=JSON.parse(snap.data().json),now=Date.now(),com={};
  S.teams.forEach(t=>t.com.forEach(c=>com[c.id]=c.name));
  for(const d of S.days)for(const i of d.items){
    if(!i.act||/^traslado|apagar/i.test(i.act))continue;
    const st=new Date(d.date+'T00:00:00-06:00').getTime()+i.s*60000,min=(st-now)/60000;
    if(min<=0||min>AVISO_MIN)continue;
    try{await db.doc('enviados/'+d.date+'_'+i.id).create({ts:now})}catch(e){continue} // ya enviado
    const cs=(i.com||[]).map(x=>com[x]).filter(Boolean).join(', ');
    const body=[hm(i.s),i.lug,cs&&'Comités: '+cs,i.mats&&i.mats.length&&i.mats.length+' materiales'].filter(Boolean).join(' · ');
    const toks=(await db.collection('tokens').get()).docs.map(x=>x.id);
    for(let k=0;k<toks.length;k+=500){
      const r=await admin.messaging().sendEachForMulticast({tokens:toks.slice(k,k+500),data:{title:'En '+Math.ceil(min)+' min: '+i.act,body,tag:d.date+'_'+i.id},webpush:{headers:{Urgency:'high',TTL:'600'}}});
      await Promise.all(r.responses.map((x,j)=>!x.success&&/registration-token-not-registered|invalid-argument/.test(x.error?.code||'')?db.doc('tokens/'+toks[k+j]).delete():null));
    }
  }
});

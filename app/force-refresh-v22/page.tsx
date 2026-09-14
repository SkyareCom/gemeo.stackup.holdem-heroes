export default function ForceRefreshV22Page(){
  const script = `
    (async()=>{
      try{
        if('serviceWorker' in navigator){
          const regs=await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map(reg=>reg.unregister().catch(()=>false)));
        }
        if('caches' in window){
          const names=await caches.keys();
          await Promise.all(names.map(name=>caches.delete(name).catch(()=>false)));
        }
        try{
          Object.keys(localStorage).filter(k=>k.startsWith('heroes-cache-reset-')).forEach(k=>localStorage.removeItem(k));
          Object.keys(sessionStorage).filter(k=>k.startsWith('heroes-cache-reset-')).forEach(k=>sessionStorage.removeItem(k));
        }catch(_){}
      }catch(_){}
      const target='/gemeo.stackup.holdem-heroes/player-dna/?_force=v22-'+Date.now();
      location.replace(target);
    })();
  `;
  return <main style={{minHeight:'100vh',background:'#031a31',color:'#fff',display:'grid',placeItems:'center',padding:24,textAlign:'center'}}><div><div style={{fontSize:18,marginBottom:8}}>ATUALIZANDO O STACKUP HOLD&apos;EM HEROES</div><div style={{fontSize:13,opacity:.8}}>LIMPANDO A VERSÃO ANTIGA E ABRINDO A VERSÃO ATUAL.</div></div><script dangerouslySetInnerHTML={{__html:script}} /></main>;
}

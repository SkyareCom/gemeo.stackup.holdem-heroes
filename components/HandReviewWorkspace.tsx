"use client";

import {useMemo,useRef,useState} from "react";
import {
  actionNeedsAmount,actions,calculateHandMath,fieldLeftOptions,formatBB,handReviewSummary,positions,ranks,requiredBoardCards,streets,suits,
  tableSizes,tournamentPhases,tournamentTypes,trim,validateHandReview,
  type Card,type FieldLeft,type HandAction,type HandGameMode,type HandReviewInput,type Position,type Rank,type Street,type Suit,type TableSize,type TournamentPhase,type TournamentType,
} from "@/lib/hand-review";
import type {VisionHandDraft} from "@/lib/vision-hand-draft";
import HandReviewIntelligencePanel from "./HandReviewIntelligencePanel";
import styles from "./HandReviewWorkspace.module.css";

type PickerTarget={kind:"hero"|"board";index:number}|null;

const emptyInput:HandReviewInput={
  game:"CASH",tournamentTypes:[],tournamentPhase:null,fieldLeft:null,tableSize:null,bigBlind:null,ante:0,pot:null,
  heroPosition:null,villainPositions:[],heroStack:null,villainStacks:{},street:"PREFLOP",board:[],heroCards:[],
  villainActions:{},villainActionAmounts:{},heroAction:null,heroActionAmount:null,notes:"",
};

export default function HandReviewWorkspace(){
  const[input,setInput]=useState<HandReviewInput>(emptyInput);
  const[submitted,setSubmitted]=useState(false);
  const[picker,setPicker]=useState<PickerTarget>(null);
  const[pickRank,setPickRank]=useState<Rank|null>(null);
  const[pickSuit,setPickSuit]=useState<Suit|null>(null);
  const[visionFile,setVisionFile]=useState<File|null>(null);
  const[visionPreview,setVisionPreview]=useState("");
  const[visionDraft,setVisionDraft]=useState<VisionHandDraft|null>(null);
  const[visionBusy,setVisionBusy]=useState(false);
  const[visionError,setVisionError]=useState("");
  const[visionContext,setVisionContext]=useState("");
  const cameraRef=useRef<HTMLInputElement>(null);
  const galleryRef=useRef<HTMLInputElement>(null);
  const validation=useMemo(()=>validateHandReview(input),[input]);
  const math=useMemo(()=>calculateHandMath(input),[input]);

  function patch<K extends keyof HandReviewInput>(key:K,value:HandReviewInput[K]){setInput(prev=>({...prev,[key]:value}));setSubmitted(false)}
  function setGame(game:HandGameMode){setInput(prev=>({...prev,game,...(game==="CASH"?{tournamentTypes:[],tournamentPhase:null,fieldLeft:null}:{})}));setSubmitted(false)}
  function toggleTournamentType(value:TournamentType){patch("tournamentTypes",input.tournamentTypes.includes(value)?input.tournamentTypes.filter(v=>v!==value):[...input.tournamentTypes,value])}
  function selectHeroPosition(position:Position){setInput(prev=>({...prev,heroPosition:position,villainPositions:prev.villainPositions.filter(p=>p!==position)}));setSubmitted(false)}
  function toggleVillain(position:Position){if(position===input.heroPosition)return;const exists=input.villainPositions.includes(position);setInput(prev=>({...prev,villainPositions:exists?prev.villainPositions.filter(p=>p!==position):[...prev.villainPositions,position]}));setSubmitted(false)}
  function setVillainStack(position:Position,value:string){setInput(prev=>({...prev,villainStacks:{...prev.villainStacks,[position]:numberOrNull(value)??undefined}}));setSubmitted(false)}
  function setVillainAction(position:Position,action:HandAction){setInput(prev=>({...prev,villainActions:{...prev.villainActions,[position]:action},villainActionAmounts:{...prev.villainActionAmounts,...(!actionNeedsAmount(action)?{[position]:undefined}:{})}}));setSubmitted(false)}
  function setVillainActionAmount(position:Position,value:string){setInput(prev=>({...prev,villainActionAmounts:{...prev.villainActionAmounts,[position]:numberOrNull(value)??undefined}}));setSubmitted(false)}
  function setHeroAction(action:HandAction){setInput(prev=>({...prev,heroAction:action,heroActionAmount:actionNeedsAmount(action)?prev.heroActionAmount:null}));setSubmitted(false)}
  function setStreet(street:Street){const count=requiredBoardCards(street);setInput(prev=>({...prev,street,board:prev.board.slice(0,count)}));setSubmitted(false)}
  function openPicker(kind:"hero"|"board",index:number){setPicker({kind,index});setPickRank(null);setPickSuit(null)}
  function selectRank(rank:Rank){setPickRank(rank);if(pickSuit)commitCard(rank,pickSuit)}
  function selectSuit(suit:Suit){setPickSuit(suit);if(pickRank)commitCard(pickRank,suit)}
  function commitCard(rank:Rank,suit:Suit){if(!picker)return;const card=`${rank}${suit}` as Card;const used=[...input.heroCards,...input.board];const current=picker.kind==="hero"?input.heroCards[picker.index]:input.board[picker.index];if(used.includes(card)&&current!==card)return;setInput(prev=>{const list=[...(picker.kind==="hero"?prev.heroCards:prev.board)];list[picker.index]=card;return picker.kind==="hero"?{...prev,heroCards:list as Card[]}:{...prev,board:list as Card[]}});setSubmitted(false);setPicker(null);setPickRank(null);setPickSuit(null)}
  function clearCard(){if(!picker)return;setInput(prev=>{const list=[...(picker.kind==="hero"?prev.heroCards:prev.board)];list.splice(picker.index,1);return picker.kind==="hero"?{...prev,heroCards:list as Card[]}:{...prev,board:list as Card[]}});setPicker(null);setSubmitted(false)}
  function analyze(){setSubmitted(true);if(validation.valid)window.scrollTo({top:0,behavior:"smooth"})}
  function reset(){setInput(emptyInput);setSubmitted(false);setVisionDraft(null);setVisionError("");setVisionFile(null);setVisionPreview("")}

  function chooseVisionFile(file:File|null){
    if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setVisionError("USE JPG, PNG OU WEBP.");return}
    if(file.size>8*1024*1024){setVisionError("A IMAGEM DEVE TER NO MÁXIMO 8 MB.");return}
    if(visionPreview)URL.revokeObjectURL(visionPreview);
    setVisionFile(file);setVisionPreview(URL.createObjectURL(file));setVisionDraft(null);setVisionError("");
  }

  async function extractVision(){
    if(!visionFile||visionBusy)return;
    setVisionBusy(true);setVisionError("");setVisionDraft(null);
    try{
      const form=new FormData();form.set("image",visionFile);form.set("mode","HAND_REVIEW");form.set("question",visionContext.trim());
      const response=await fetch("/api/poker-vision",{method:"POST",body:form});
      const data=await response.json() as {draft?:VisionHandDraft;error?:string};
      if(!response.ok||!data.draft)throw new Error(data.error||"VISION_TEMPORARILY_UNAVAILABLE");
      setVisionDraft(data.draft);
    }catch(error){
      const code=error instanceof Error?error.message:"VISION_TEMPORARILY_UNAVAILABLE";
      setVisionError(code==="VISION_PARSE_FAILED"?"A IA NÃO CONSEGUIU ESTRUTURAR ESTA IMAGEM. TENTE OUTRO PRINT OU FOTO MAIS NÍTIDA.":code==="DAILY_LIMIT"||code==="MONTHLY_CREDITS"?"LIMITE DO STACKUP AI ATINGIDO.":"NÃO FOI POSSÍVEL LER A IMAGEM AGORA.");
    }finally{setVisionBusy(false)}
  }

  function applyVisionDraft(){
    if(!visionDraft)return;
    setInput(prev=>{
      const villainPositions=visionDraft.villains.length?visionDraft.villains.map(v=>v.position).filter(p=>p!==visionDraft.heroPosition):prev.villainPositions;
      const villainStacks={...prev.villainStacks};const villainActions={...prev.villainActions};const villainActionAmounts={...prev.villainActionAmounts};
      visionDraft.villains.forEach(v=>{if(v.position===visionDraft.heroPosition)return;if(v.stack!==null)villainStacks[v.position]=v.stack;if(v.action)villainActions[v.position]=v.action;if(v.actionAmount!==null)villainActionAmounts[v.position]=v.actionAmount});
      const visionNote=[visionDraft.notes,visionDraft.needsConfirmation.length?`CONFIRMAR: ${visionDraft.needsConfirmation.join(" · ")}`:""].filter(Boolean).join(" | ");
      return{
        ...prev,
        game:visionDraft.game??prev.game,
        tournamentTypes:visionDraft.tournamentTypes.length?visionDraft.tournamentTypes:prev.tournamentTypes,
        tournamentPhase:visionDraft.tournamentPhase??prev.tournamentPhase,
        fieldLeft:visionDraft.fieldLeft??prev.fieldLeft,
        tableSize:visionDraft.tableSize??prev.tableSize,
        bigBlind:visionDraft.bigBlind??prev.bigBlind,
        ante:visionDraft.ante??prev.ante,
        pot:visionDraft.pot??prev.pot,
        street:visionDraft.street??prev.street,
        heroPosition:visionDraft.heroPosition??prev.heroPosition,
        heroCards:visionDraft.heroCards.length?visionDraft.heroCards:prev.heroCards,
        heroStack:visionDraft.heroStack??prev.heroStack,
        heroAction:visionDraft.heroAction??prev.heroAction,
        heroActionAmount:visionDraft.heroActionAmount??prev.heroActionAmount,
        board:visionDraft.board.length?visionDraft.board:prev.board,
        villainPositions,villainStacks,villainActions,villainActionAmounts,
        notes:visionNote?[prev.notes,`STACKUP VISION (${visionDraft.confidence}): ${visionNote}`].filter(Boolean).join("\n"):prev.notes,
      };
    });
    setSubmitted(false);setVisionDraft(null);
  }

  if(submitted&&validation.valid)return <Analysis input={input} onBack={()=>setSubmitted(false)} onReset={reset}/>;
  const boardCount=requiredBoardCards(input.street);

  return <div className={styles.workspace}>
    <header className={styles.intro}><div className="eyebrow">AI HAND REVIEW</div><h2>MONTE A MÃO</h2><p>PREENCHA NA ORDEM EM QUE A MÃO ACONTECEU. OS CÁLCULOS SÃO ATUALIZADOS SEM DUPLICAR CONTRIBUIÇÕES NO POTE.</p></header>

    <section style={{border:"1px solid rgba(92,187,126,.25)",borderRadius:16,padding:16,background:"rgba(7,20,12,.72)"}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap"}}><div><div className="eyebrow">STACKUP AI VISION</div><h3 style={{margin:"5px 0 4px"}}>PREENCHER A PARTIR DE FOTO / PRINT</h3><p style={{margin:0,opacity:.72,fontSize:12}}>A IA extrai os dados. Você confirma antes de analisar.</p></div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><button type="button" className={styles.choice} onClick={()=>cameraRef.current?.click()}>CÂMERA</button><button type="button" className={styles.choice} onClick={()=>galleryRef.current?.click()}>ANEXAR IMAGEM</button></div></div>
      <input ref={cameraRef} hidden type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={e=>chooseVisionFile(e.target.files?.[0]||null)}/><input ref={galleryRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>chooseVisionFile(e.target.files?.[0]||null)}/>
      {visionFile&&<div style={{display:"grid",gridTemplateColumns:"110px 1fr",gap:12,marginTop:14,alignItems:"stretch"}}><img src={visionPreview} alt="Imagem para leitura" style={{width:110,height:110,objectFit:"cover",borderRadius:10,border:"1px solid rgba(92,187,126,.22)"}}/><div style={{display:"flex",flexDirection:"column",gap:8}}><textarea value={visionContext} onChange={e=>setVisionContext(e.target.value)} placeholder="CONTEXTO OPCIONAL: ex. Hero está no BTN; o valor cortado no canto é 15.000..." style={{minHeight:64}}/><button type="button" className="primary" onClick={()=>void extractVision()} disabled={visionBusy}>{visionBusy?"LENDO IMAGEM...":"IDENTIFICAR E PREENCHER"}</button></div></div>}
      {visionError&&<div className={styles.validation} style={{marginTop:12}}><strong>{visionError}</strong></div>}
      {visionDraft&&<div style={{marginTop:14,borderTop:"1px solid rgba(92,187,126,.18)",paddingTop:14}}><div style={{display:"flex",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><strong>LEITURA VISUAL · CONFIANÇA {visionDraft.confidence}</strong><span style={{fontSize:11,opacity:.7}}>CONFIRA ANTES DE APLICAR</span></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:8,marginTop:10}}>{[
        ["MODALIDADE",visionDraft.game],["BB",visionDraft.bigBlind],["ANTE",visionDraft.ante],["POTE",visionDraft.pot],["STREET",visionDraft.street],["HERO",visionDraft.heroPosition],["CARTAS",visionDraft.heroCards.join(" ")||null],["STACK HERO",visionDraft.heroStack],["BOARD",visionDraft.board.join(" ")||null],["VILÕES",visionDraft.villains.map(v=>v.position).join(", ")||null]
      ].map(([label,value])=><div key={String(label)} style={{padding:9,border:"1px solid rgba(92,187,126,.14)",borderRadius:9}}><small style={{display:"block",opacity:.55}}>{label}</small><b>{value??"NÃO IDENTIFICADO"}</b></div>)}</div>{visionDraft.needsConfirmation.length>0&&<p style={{fontSize:12,margin:"10px 0",opacity:.8}}>CONFIRMAR: {visionDraft.needsConfirmation.join(" · ")}</p>}<button type="button" className="primary" onClick={applyVisionDraft}>APLICAR NOS CAMPOS</button></div>}
    </section>

    <Step n="01" title="CONTEXTO DO JOGO">
      <Section title="MODALIDADE"><div className={styles.two}>{(["CASH","TORNEIO"] as HandGameMode[]).map(game=><Choice key={game} active={input.game===game} onClick={()=>setGame(game)}>{game}</Choice>)}</div></Section>
      {input.game==="TORNEIO"&&<div className={styles.stepGrid}><Section title="TIPO" helper="1 OU MAIS"><div className={styles.grid}>{tournamentTypes.map(type=><Choice key={type} active={input.tournamentTypes.includes(type)} onClick={()=>toggleTournamentType(type)}>{type}</Choice>)}</div></Section><Section title="FASE"><div className={styles.grid}>{tournamentPhases.map(phase=><Choice key={phase} active={input.tournamentPhase===phase} onClick={()=>patch("tournamentPhase",phase as TournamentPhase)}>{phase}</Choice>)}</div></Section><Section title="FIELD LEFT"><div className={styles.four}>{fieldLeftOptions.map(value=><Choice key={value} active={input.fieldLeft===value} onClick={()=>patch("fieldLeft",value as FieldLeft)}>{value}</Choice>)}</div></Section></div>}
      <Section title="JOGADORES POR MESA"><div className={styles.five}>{tableSizes.map(size=><Choice key={size} active={input.tableSize===size} onClick={()=>patch("tableSize",size as TableSize)}>{size}</Choice>)}</div></Section>
    </Step>

    <Step n="02" title="BLINDS, ANTE E STACKS">
      <div className={styles.moneyGrid}><MoneyField label="VALOR DO BB" value={input.bigBlind} onChange={v=>patch("bigBlind",numberOrNull(v))}/><MoneyField label="VALOR DO ANTE" value={input.ante} allowZero onChange={v=>patch("ante",numberOrZero(v))}/></div>
      <Section title="POSIÇÃO · HERÓI"><div className={styles.positionGrid}>{positions.map(position=><Choice key={position} active={input.heroPosition===position} onClick={()=>selectHeroPosition(position)}>{position}</Choice>)}</div></Section>
      <Section title="POSIÇÕES · VILÕES" helper="1 OU MAIS"><div className={styles.positionGrid}>{positions.map(position=><Choice key={position} active={input.villainPositions.includes(position)} disabled={input.heroPosition===position} onClick={()=>toggleVillain(position)}>{position}</Choice>)}</div></Section>
      <Section title="STACKS"><StackRow label="HERÓI" value={input.heroStack} bigBlind={input.bigBlind} onChange={value=>patch("heroStack",numberOrNull(value))}/>{input.villainPositions.length===0?<p className={styles.muted}>SELECIONE OS VILÕES PARA PREENCHER OS STACKS.</p>:input.villainPositions.map(position=><StackRow key={position} label={position} value={input.villainStacks[position]??null} bigBlind={input.bigBlind} onChange={value=>setVillainStack(position,value)}/>)}</Section>
    </Step>

    <Step n="03" title="POTE E STREET">
      <Section title="POT ANTES DAS AÇÕES"><MoneyField label="VALOR EM FICHAS" value={input.pot} bigBlind={input.bigBlind} onChange={v=>patch("pot",numberOrZero(v))}/></Section>
      <Section title="STREET"><div className={styles.four}>{streets.map(street=><Choice key={street} active={input.street===street} onClick={()=>setStreet(street)}>{street}</Choice>)}</div></Section>
      <Section title="BOARD"><div className={styles.cards}>{Array.from({length:5},(_,index)=><CardSlot key={index} card={input.board[index]} disabled={index>=boardCount} onClick={()=>openPicker("board",index)}/>)}</div></Section>
    </Step>

    <Step n="04" title="AÇÕES DOS VILÕES">
      <Section title="SEQUÊNCIA INFORMADA"><p className={styles.helperText}>REGISTRE A AÇÃO E O VALOR TOTAL COLOCADO NO POTE NESTA DECISÃO.</p>{input.villainPositions.length===0?<p className={styles.muted}>SELECIONE OS VILÕES PARA DEFINIR AS AÇÕES.</p>:input.villainPositions.map(position=><div className={styles.actionRow} key={position}><span className={styles.badge}>{position}</span><div><div className={styles.actionGrid}>{actions.filter(action=>action!=="FOLD").map(action=><Choice key={action} active={input.villainActions[position]===action} onClick={()=>setVillainAction(position,action)}>{action}</Choice>)}</div>{actionNeedsAmount(input.villainActions[position])&&<ActionAmount value={input.villainActionAmounts[position]??null} bigBlind={input.bigBlind} onChange={value=>setVillainActionAmount(position,value)}/>}</div></div>)}</Section>
    </Step>

    <Step n="05" title="HERÓI E DECISÃO">
      <Section title="HERÓI · MÃO"><div className={styles.heroCards}>{[0,1].map(index=><CardSlot key={index} card={input.heroCards[index]} onClick={()=>openPicker("hero",index)}/>)}</div><h4 className={styles.subhead}>SUA AÇÃO</h4><div className={styles.actionGrid}>{actions.map(action=><Choice key={action} active={input.heroAction===action} onClick={()=>setHeroAction(action)}>{action}</Choice>)}</div>{actionNeedsAmount(input.heroAction)&&<ActionAmount value={input.heroActionAmount} bigBlind={input.bigBlind} onChange={value=>patch("heroActionAmount",numberOrNull(value))}/>}</Section>
      <div className={styles.liveMath}><Metric label="POT ANTES DA AÇÃO DO HERÓI" value={`${math.potBeforeHeroAction.toLocaleString("pt-BR")} · ${formatBB(math.potBeforeHeroAction,input.bigBlind)}`}/><Metric label="POT APÓS AÇÕES" value={`${math.potAfterActions.toLocaleString("pt-BR")} · ${formatBB(math.potAfterActions,input.bigBlind)}`}/><Metric label="POT ODDS" value={math.potOdds!==null?`${trim(math.potOdds)}% · EXACT`:"NÃO SE APLICA / AGUARDANDO CALL"}/><Metric label="SPR" value={math.spr!==null?`${trim(math.spr)} · EXACT`:"DADOS INSUFICIENTES"}/></div>
    </Step>

    <Step n="06" title="OBSERVAÇÕES"><Section title="OUTRAS INFORMAÇÕES"><textarea className={styles.notes} value={input.notes} onChange={e=>patch("notes",e.target.value)} placeholder="Reads, dinâmica, payout, bounty, histórico do vilão e outras informações relevantes..."/></Section></Step>

    {submitted&&!validation.valid&&<div className={styles.validation}><strong>INFORMAÇÕES INCOMPLETAS</strong>{validation.missing.length>0&&<p>{validation.missing.join(" · ")}</p>}{validation.conflicts.length>0&&<p>{validation.conflicts.join(" · ")}</p>}</div>}
    <button className="primary" onClick={analyze}>ANÁLISE E COMENTÁRIOS</button>

    {picker&&<div className={styles.modalBackdrop} onClick={()=>setPicker(null)}><div className={styles.modal} onClick={e=>e.stopPropagation()}><div className={styles.modalHead}><strong>SELECIONE A CARTA</strong><button onClick={()=>setPicker(null)}>×</button></div><div className={styles.rankGrid}>{ranks.map(rank=><Choice key={rank} active={pickRank===rank} onClick={()=>selectRank(rank)}>{rank}</Choice>)}</div><div className={styles.suitGrid}>{suits.map(suit=><Choice key={suit} active={pickSuit===suit} onClick={()=>selectSuit(suit)}>{suit}</Choice>)}</div><button className={styles.clear} onClick={clearCard}>LIMPAR CARTA</button></div></div>}
  </div>;
}

function Analysis({input,onBack,onReset}:{input:HandReviewInput;onBack:()=>void;onReset:()=>void}){
  const summary=handReviewSummary(input);const math=summary.math;
  const potOddsText=math.potOdds!==null?`${trim(math.potOdds)}%`:"NÃO SE APLICA";
  const mathReason=input.heroAction==="CALL"&&math.potOdds!==null?`O CALL PRECISA DE PELO MENOS ${potOddsText} DE EQUITY PARA EMPATAR EM CHIP EV. O CÁLCULO USA ${formatBB(math.heroCallCost,input.bigBlind)} PARA PAGAR E ${formatBB(math.potBeforeHeroAction,input.bigBlind)} NO POTE ANTES DO CALL.`:`A DECISÃO É MOSTRADA COM O POTE RECONSTRUÍDO, STACK EFETIVO E SPR. POT ODDS SÓ É EXIBIDO QUANDO EXISTE UM CALL COM VALOR INFORMADO.`;
  return <div className={styles.workspace}><div className={styles.analysisHead}><button className={styles.back} onClick={onBack}>← MÃO</button><div><div className="eyebrow">AI HAND REVIEW</div><h2>ANÁLISE DA MÃO</h2></div></div>
    <div className={styles.summary}>{Object.entries({MODALIDADE:summary.modality,MESA:summary.table,"BB / ANTE":summary.blinds,HERÓI:summary.hero,VILÕES:summary.villains,"POT INICIAL":`${math.basePot.toLocaleString("pt-BR")} · ${formatBB(math.basePot,input.bigBlind)}`,"POT APÓS AÇÕES":`${math.potAfterActions.toLocaleString("pt-BR")} · ${formatBB(math.potAfterActions,input.bigBlind)}`,STREET:summary.street,BOARD:summary.board,"AÇÃO DO HERÓI":summary.heroAction}).map(([label,value])=><div key={label}><small>{label}</small><strong>{value}</strong></div>)}</div>
    <div className={styles.verdict}><small>VEREDITO MATEMÁTICO</small><strong>{mathReason}</strong></div>
    <div className={styles.analysisGrid}><AnalysisCard title="O QUE ACONTECEU" text={`${summary.hero} enfrenta ${input.villainPositions.join(", ")} em ${input.street}. O pote passou de ${formatBB(math.basePot,input.bigBlind)} para ${formatBB(math.potAfterActions,input.bigBlind)} após as ações registradas.`}/><AnalysisCard title="ANÁLISE" text={`STACK EFETIVO ${formatBB(math.effectiveStack,input.bigBlind)}. SPR ${math.spr!==null?trim(math.spr):"—"}. ${math.potOdds!==null?`POT ODDS ${trim(math.potOdds)}%.`:"SEM CALL, POT ODDS NÃO SE APLICA."} ${input.notes?`OBSERVAÇÕES CONSIDERADAS: ${input.notes}`:"SEM OBSERVAÇÕES ADICIONAIS."}`}/><AnalysisCard title="MELHOR LINHA" text="A camada matemática está ativa e não inventa equity. A recomendação estratégica final deve comparar equity/ranges com estes thresholds exatos antes de classificar a ação."/><AnalysisCard title="ALTERNATIVAS" text="Cada alternativa poderá ser comparada contra o mesmo estado reconstruído do pote, evitando inconsistência de pot odds entre call, raise e all-in."/><AnalysisCard title="PONTO PRINCIPAL DA MÃO" text="Pote e valores de ação agora são dados estruturados. O sistema soma cada contribuição uma vez e separa POT ANTES DO HERÓI de POT APÓS AS AÇÕES."/></div>
    <div className={styles.metrics}><Metric label="STACK EFETIVO" value={math.effectiveStackBB!==null?`${trim(math.effectiveStackBB)} BB · EXACT`:"DADOS INSUFICIENTES"}/><Metric label="POT ANTES DO HERÓI" value={`${formatBB(math.potBeforeHeroAction,input.bigBlind)} · EXACT`}/><Metric label="POT ODDS" value={math.potOdds!==null?`${trim(math.potOdds)}% · EXACT`:"NÃO SE APLICA"}/><Metric label="EQUITY MÍNIMA" value={math.equityRequired!==null?`${trim(math.equityRequired)}% · EXACT`:"NÃO SE APLICA"}/><Metric label="SPR" value={math.spr!==null?`${trim(math.spr)} · EXACT`:"DADOS INSUFICIENTES"}/><Metric label="MDF" value={math.mdf!==null?`${trim(math.mdf)}% · EXACT`:"NÃO SE APLICA"}/></div>
    <HandReviewIntelligencePanel input={input}/>
    <button className="primary" onClick={onReset}>NOVA MÃO</button></div>;
}

function Step({n,title,children}:{n:string;title:string;children:React.ReactNode}){return <div className={styles.step}><div className={styles.stepHead}><span>{n}</span><strong>{title}</strong></div>{children}</div>}
function Section({title,helper,children}:{title:string;helper?:string;children:React.ReactNode}){return <section className={styles.section}><div className={styles.sectionTitle}><h3>{title}</h3>{helper&&<small>{helper}</small>}</div>{children}</section>}
function Choice({active,disabled,onClick,children}:{active?:boolean;disabled?:boolean;onClick:()=>void;children:React.ReactNode}){return <button type="button" className={`${styles.choice} ${active?styles.active:""}`} disabled={disabled} onClick={onClick}>{children}</button>}
function MoneyField({label,value,bigBlind,allowZero,onChange}:{label:string;value:number|null;bigBlind?:number|null;allowZero?:boolean;onChange:(value:string)=>void}){return <label className={styles.moneyField}><span>{label}</span><div><input type="number" min="0" step="1" inputMode="numeric" value={value??""} onChange={e=>onChange(e.target.value)} placeholder="FICHAS"/>{bigBlind&&<b>{formatBB(value,bigBlind)}</b>}</div>{allowZero&&<small>ZERO É ACEITO QUANDO NÃO HÁ ANTE.</small>}</label>}
function StackRow({label,value,bigBlind,onChange}:{label:string;value:number|null;bigBlind:number|null;onChange:(value:string)=>void}){return <div className={styles.stackRow}><span className={styles.badge}>{label}</span><div className={styles.inputWithBB}><input type="number" min="0" step="1" inputMode="numeric" value={value??""} onChange={e=>onChange(e.target.value)} placeholder="STACK EM FICHAS"/><b>{formatBB(value,bigBlind)}</b></div></div>}
function ActionAmount({value,bigBlind,onChange}:{value:number|null;bigBlind:number|null;onChange:(value:string)=>void}){return <div className={styles.actionAmount}><span>VALOR DA AÇÃO</span><div className={styles.inputWithBB}><input type="number" min="0" step="1" inputMode="numeric" value={value??""} onChange={e=>onChange(e.target.value)} placeholder="FICHAS"/><b>{formatBB(value,bigBlind)}</b></div></div>}
function CardSlot({card,disabled,onClick}:{card?:Card;disabled?:boolean;onClick:()=>void}){return <button type="button" className={styles.card} disabled={disabled} onClick={onClick}>{card??"+"}</button>}
function AnalysisCard({title,text}:{title:string;text:string}){return <div className={styles.analysisCard}><small>{title}</small><p>{text}</p></div>}
function Metric({label,value}:{label:string;value:string}){return <div className={styles.metric}><small>{label}</small><strong>{value}</strong></div>}
function numberOrNull(value:string){const parsed=Number(value);return Number.isFinite(parsed)&&parsed>0?parsed:null}
function numberOrZero(value:string){if(value.trim()==="")return null;const parsed=Number(value);return Number.isFinite(parsed)&&parsed>=0?parsed:null}

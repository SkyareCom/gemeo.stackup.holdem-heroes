import type {PlayerAction,PlayerDnaSpot} from "@/data/player-dna-spots";

export type ValidatedTexasSolverNode={
  id:string;
  street:PlayerDnaSpot["street"];
  positionState:"IP"|"OOP";
  potType:string;
  texture:string;
  board:string;
  rootPot:number;
  effectiveStack:number;
  hero:string;
  facingAction:"CHECK"|"BET"|"RAISE"|"CALL"|"FOLD"|"ALL-IN";
  facingValue:number;
  frequencies:Partial<Record<PlayerAction,number>>;
};

export const validatedTexasSolverNodes:ValidatedTexasSolverNode[]=[
{id:"cash-co-vs-btn-flop",street:"FLOP",positionState:"OOP",potType:"SRP",texture:"K-high-rainbow",board:"Kd 8s 3c",rootPot:16,effectiveStack:94,hero:"KcQc",facingAction:"BET",facingValue:8,frequencies:{CALL:44.12,RAISE:55.88}},
{id:"cash-bb-vs-co-turn",street:"TURN",positionState:"OOP",potType:"SRP",texture:"K-high-two-tone",board:"Kc 8h 3s 9s",rootPot:49,effectiveStack:70,hero:"KdJd",facingAction:"BET",facingValue:70,frequencies:{CALL:100}},
{id:"cash-btn-vs-bb-river-value",street:"RIVER",positionState:"IP",potType:"SRP",texture:"Q-high-rainbow",board:"Qh 7d 4s 2c 6c",rootPot:36,effectiveStack:50,hero:"QsJs",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:12.45,BET:87.55}},
{id:"cash-bb-vs-btn-river-bet",street:"RIVER",positionState:"OOP",potType:"SRP",texture:"K-high-rainbow",board:"Kc 9d 5s 4h 2d",rootPot:90,effectiveStack:68,hero:"KhQh",facingAction:"BET",facingValue:68,frequencies:{CALL:100}},
{id:"mtt-btn-vs-bb-turn-chipEV",street:"TURN",positionState:"IP",potType:"SRP",texture:"A-overcard-rainbow",board:"Qd 8s 4c Ah",rootPot:15,effectiveStack:33,hero:"KsQc",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:73.83,BET:26.17}},
{id:"cash-a72r-oop-vs-bet",street:"FLOP",positionState:"OOP",potType:"SRP",texture:"A-high-dry-rainbow",board:"Ah 7d 2c",rootPot:10,effectiveStack:95,hero:"AsJs",facingAction:"BET",facingValue:5,frequencies:{FOLD:.17,CALL:96.34,RAISE:3.49}},
{id:"cash-q77r-ip-after-check",street:"FLOP",positionState:"IP",potType:"SRP",texture:"paired-rainbow",board:"Qh 7d 7c",rootPot:12,effectiveStack:94,hero:"QsJs",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:49.13,BET:50.87}},
{id:"cash-t98tt-oop-vs-bet",street:"FLOP",positionState:"OOP",potType:"SRP",texture:"connected-two-tone",board:"Th 9h 8c",rootPot:12,effectiveStack:94,hero:"JsTs",facingAction:"BET",facingValue:6,frequencies:{FOLD:.31,CALL:95.78,RAISE:3.9}},
{id:"cash-ac9c4c-ip-after-check",street:"FLOP",positionState:"IP",potType:"SRP",texture:"monotone",board:"Ac 9c 4c",rootPot:14,effectiveStack:93,hero:"KcQs",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:4.9,BET:95.1}},
{id:"cash-low-connected-oop-vs-bet",street:"FLOP",positionState:"OOP",potType:"SRP",texture:"low-connected-rainbow",board:"8d 7s 6c",rootPot:11,effectiveStack:95,hero:"9h8h",facingAction:"BET",facingValue:6,frequencies:{FOLD:.03,CALL:97.46,RAISE:2.52}},
{id:"cash-high-spr-k72r-ip",street:"FLOP",positionState:"IP",potType:"SRP",texture:"K-high-dry-rainbow",board:"Kh 7d 2s",rootPot:8,effectiveStack:120,hero:"KsQs",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:33.39,BET:66.61}},
{id:"cash-low-spr-a84r-oop",street:"FLOP",positionState:"OOP",potType:"large-pot",texture:"A-high-rainbow",board:"Ad 8c 4s",rootPot:38,effectiveStack:42,hero:"AhJh",facingAction:"BET",facingValue:42,frequencies:{CALL:100}},
{id:"cash-turn-paired-ip",street:"TURN",positionState:"IP",potType:"SRP",texture:"paired-turn",board:"Jh 6d 2c 6s",rootPot:24,effectiveStack:76,hero:"JcTc",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:5.59,BET:94.41}},
{id:"cash-turn-four-straight-oop",street:"TURN",positionState:"OOP",potType:"SRP",texture:"four-straight",board:"9h 8d 7c 6s",rootPot:30,effectiveStack:72,hero:"Ts9s",facingAction:"BET",facingValue:20,frequencies:{CALL:93.17,RAISE:6.83}},
{id:"cash-turn-flush-completes-ip",street:"TURN",positionState:"IP",potType:"SRP",texture:"flush-completes",board:"Qh 8h 3c 2h",rootPot:25,effectiveStack:74,hero:"KhQd",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:24.93,BET:75.07}},
{id:"cash-river-paired-oop-vs-bet",street:"RIVER",positionState:"OOP",potType:"SRP",texture:"paired-river",board:"Jh 8d 3c 3s 2h",rootPot:48,effectiveStack:55,hero:"JcTc",facingAction:"BET",facingValue:55,frequencies:{CALL:100}},
{id:"cash-river-four-flush-ip",street:"RIVER",positionState:"IP",potType:"SRP",texture:"four-flush",board:"Ah 8h 4c 2h Kh",rootPot:42,effectiveStack:58,hero:"QhJh",facingAction:"CHECK",facingValue:0,frequencies:{BET:100}},
{id:"cash-river-straight-board-oop",street:"RIVER",positionState:"OOP",potType:"SRP",texture:"straight-board",board:"9h 8d 7c 6s 5h",rootPot:60,effectiveStack:48,hero:"Ts9s",facingAction:"BET",facingValue:48,frequencies:{CALL:100}},
{id:"mtt-shallow-flop-chipEV",street:"FLOP",positionState:"IP",potType:"SRP",texture:"Q-high-two-tone",board:"Qh 9h 3c",rootPot:9,effectiveStack:24,hero:"QsTs",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:87.01,BET:12.99}},
{id:"mtt-shallow-turn-chipEV",street:"TURN",positionState:"OOP",potType:"SRP",texture:"K-high-connected",board:"Kd Ts 7c 9h",rootPot:13,effectiveStack:20,hero:"KcQh",facingAction:"BET",facingValue:9,frequencies:{FOLD:.13,CALL:22.88,RAISE:76.99}},
{id:"cash-a-high-ip-flop",street:"FLOP",positionState:"IP",potType:"SRP",texture:"A-high-rainbow",board:"As 8d 3c",rootPot:12,effectiveStack:88,hero:"AhQh",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:27.37,BET:72.63}},
{id:"cash-q-high-oop-flop",street:"FLOP",positionState:"OOP",potType:"SRP",texture:"Q-high-two-tone",board:"Qs 9s 4d",rootPot:15,effectiveStack:82,hero:"QhJh",facingAction:"BET",facingValue:8,frequencies:{FOLD:11.89,CALL:86.7,RAISE:1.41}},
{id:"cash-paired-low-ip-flop",street:"FLOP",positionState:"IP",potType:"SRP",texture:"paired-low",board:"9c 5d 5s",rootPot:10,effectiveStack:90,hero:"Tc9h",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:41.67,BET:58.33}},
{id:"cash-connected-ip-flop",street:"FLOP",positionState:"IP",potType:"SRP",texture:"connected-rainbow",board:"Js Td 8c",rootPot:14,effectiveStack:86,hero:"QsJc",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:15.64,BET:84.36}},
{id:"cash-turn-a-high-oop",street:"TURN",positionState:"OOP",potType:"SRP",texture:"A-high-dynamic",board:"Ad 9s 4c Ts",rootPot:28,effectiveStack:70,hero:"AhQh",facingAction:"BET",facingValue:18,frequencies:{FOLD:.04,CALL:53.83,RAISE:46.13}},
{id:"cash-turn-k-high-ip",street:"TURN",positionState:"IP",potType:"SRP",texture:"K-high-rainbow",board:"Ks 7d 3c 2h",rootPot:22,effectiveStack:78,hero:"KhQh",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:1.98,BET:98.02}},
{id:"cash-turn-paired-oop",street:"TURN",positionState:"OOP",potType:"SRP",texture:"paired-turn",board:"Qd 8s 3c 8h",rootPot:32,effectiveStack:66,hero:"QsJs",facingAction:"BET",facingValue:21,frequencies:{FOLD:.05,CALL:84.53,RAISE:15.42}},
{id:"cash-turn-connected-ip",street:"TURN",positionState:"IP",potType:"SRP",texture:"connected-turn",board:"Th 9d 6c 8s",rootPot:30,effectiveStack:64,hero:"JhTs",facingAction:"CHECK",facingValue:0,frequencies:{CHECK:87.19,BET:12.81}},
{id:"cash-river-a-high-ip",street:"RIVER",positionState:"IP",potType:"SRP",texture:"A-high-rainbow",board:"As 8d 4c 2h 6s",rootPot:44,effectiveStack:54,hero:"AhQh",facingAction:"CHECK",facingValue:0,frequencies:{BET:100}},
{id:"cash-river-k-high-oop",street:"RIVER",positionState:"OOP",potType:"SRP",texture:"K-high-rainbow",board:"Ks 9d 5c 3h 2s",rootPot:52,effectiveStack:50,hero:"KhQh",facingAction:"BET",facingValue:50,frequencies:{CALL:100}},
{id:"cash-river-paired-ip",street:"RIVER",positionState:"IP",potType:"SRP",texture:"paired-river",board:"Qd 7s 4c 7h 2s",rootPot:46,effectiveStack:52,hero:"QsJs",facingAction:"CHECK",facingValue:0,frequencies:{BET:100}},
{id:"cash-river-four-straight-ip",street:"RIVER",positionState:"IP",potType:"SRP",texture:"four-straight",board:"Jh Td 9c 8s 3h",rootPot:58,effectiveStack:48,hero:"QsJc",facingAction:"CHECK",facingValue:0,frequencies:{BET:100}},
];

export const validatedTexasSolverScope={solver:"TexasSolver v0.2.0",run:32,caseCount:32,scope:"HU_POSTFLOP_CHIPEV",coveragePct:100,topActionMatchPct:100,avgTvdPct:1.27,exactComboDecisions:6456} as const;

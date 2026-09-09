#!/usr/bin/env python3
import json
import os
import pathlib
import shutil
import subprocess
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parent
OUT = ROOT / "results"
OUT.mkdir(parents=True, exist_ok=True)

RANGE_IP = "AA,KK,QQ,JJ,TT,99:0.75,88:0.75,77:0.5,66:0.25,55:0.25,AK,AQs,AQo:0.75,AJs,AJo:0.5,ATs:0.75,A6s:0.25,A5s:0.75,A4s:0.75,A3s:0.5,A2s:0.5,KQs,KQo:0.5,KJs,KTs:0.75,K5s:0.25,K4s:0.25,QJs:0.75,QTs:0.75,Q9s:0.5,JTs:0.75,J9s:0.75,J8s:0.75,T9s:0.75,T8s:0.75,T7s:0.75,98s:0.75,97s:0.75,96s:0.5,87s:0.75,86s:0.5,85s:0.5,76s:0.75,75s:0.5,65s:0.75,64s:0.5,54s:0.75,53s:0.5,43s:0.5"
RANGE_OOP = "QQ:0.5,JJ:0.75,TT,99,88,77,66,55,44,33,22,AKo:0.25,AQs,AQo:0.75,AJs,AJo:0.75,ATs,ATo:0.75,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQ,KJ,KTs,KTo:0.5,K9s,K8s,K7s,K6s,K5s,K4s:0.5,K3s:0.5,K2s:0.5,QJ,QTs,Q9s,Q8s,Q7s,JTs,JTo:0.5,J9s,J8s,T9s,T8s,T7s,98s,97s,96s,87s,86s,76s,75s,65s,64s,54s,53s,43s"
RANGE_FLOP_IP = "AA,KK,QQ,JJ,TT,99,88,AK,AQs,AQo,AJs,AJo,ATs,KQs,KQo,KJs,QJs,QTs,JTs,T9s,98s,87s"
RANGE_FLOP_OOP = "QQ,JJ,TT,99,88,77,66,AQs,AQo,AJs,AJo,ATs,ATo,KQs,KQo,KJs,KTs,QJs,QTs,JTs,T9s,98s"

CASES = [
 dict(id="cash-co-vs-btn-flop",street="flop",position_state="OOP",pot_type="SRP",texture="K-high-rainbow",board="Kd,8s,3c",pot=16,stack=94,hero="KcQc",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-bb-vs-co-turn",street="turn",position_state="OOP",pot_type="SRP",texture="K-high-two-tone",board="Kc,8h,3s,9s",pot=49,stack=70,hero="KdJd",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-btn-vs-bb-river-value",street="river",position_state="IP",pot_type="SRP",texture="Q-high-rainbow",board="Qh,7d,4s,2c,6c",pot=36,stack=50,hero="QsJs",path=["CHECK"],expected_app="BET"),
 dict(id="cash-bb-vs-btn-river-bet",street="river",position_state="OOP",pot_type="SRP",texture="K-high-rainbow",board="Kc,9d,5s,4h,2d",pot=90,stack=68,hero="KhQh",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="mtt-btn-vs-bb-turn-chipEV",street="turn",position_state="IP",pot_type="SRP",texture="A-overcard-rainbow",board="Qd,8s,4c,Ah",pot=15,stack=33,hero="KsQc",path=["CHECK"],expected_app="CHECK"),
 dict(id="cash-a72r-oop-vs-bet",street="flop",position_state="OOP",pot_type="SRP",texture="A-high-dry-rainbow",board="Ah,7d,2c",pot=10,stack=95,hero="AsJs",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-q77r-ip-after-check",street="flop",position_state="IP",pot_type="SRP",texture="paired-rainbow",board="Qh,7d,7c",pot=12,stack=94,hero="QsJs",path=["CHECK"],expected_app="BET"),
 dict(id="cash-t98tt-oop-vs-bet",street="flop",position_state="OOP",pot_type="SRP",texture="connected-two-tone",board="Th,9h,8c",pot=12,stack=94,hero="JsTs",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-ac9c4c-ip-after-check",street="flop",position_state="IP",pot_type="SRP",texture="monotone",board="Ac,9c,4c",pot=14,stack=93,hero="KcQs",path=["CHECK"],expected_app="BET"),
 dict(id="cash-low-connected-oop-vs-bet",street="flop",position_state="OOP",pot_type="SRP",texture="low-connected-rainbow",board="8d,7s,6c",pot=11,stack=95,hero="9h8h",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-high-spr-k72r-ip",street="flop",position_state="IP",pot_type="SRP",texture="K-high-dry-rainbow",board="Kh,7d,2s",pot=8,stack=120,hero="KsQs",path=["CHECK"],expected_app="BET"),
 dict(id="cash-low-spr-a84r-oop",street="flop",position_state="OOP",pot_type="large-pot",texture="A-high-rainbow",board="Ad,8c,4s",pot=38,stack=42,hero="AhJh",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-turn-paired-ip",street="turn",position_state="IP",pot_type="SRP",texture="paired-turn",board="Jh,6d,2c,6s",pot=24,stack=76,hero="JcTc",path=["CHECK"],expected_app="BET"),
 dict(id="cash-turn-four-straight-oop",street="turn",position_state="OOP",pot_type="SRP",texture="four-straight",board="9h,8d,7c,6s",pot=30,stack=72,hero="Ts9s",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-turn-flush-completes-ip",street="turn",position_state="IP",pot_type="SRP",texture="flush-completes",board="Qh,8h,3c,2h",pot=25,stack=74,hero="KhQd",path=["CHECK"],expected_app="CHECK"),
 dict(id="cash-river-paired-oop-vs-bet",street="river",position_state="OOP",pot_type="SRP",texture="paired-river",board="Jh,8d,3c,3s,2h",pot=48,stack=55,hero="JcTc",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-river-four-flush-ip",street="river",position_state="IP",pot_type="SRP",texture="four-flush",board="Ah,8h,4c,2h,Kh",pot=42,stack=58,hero="QhJh",path=["CHECK"],expected_app="BET"),
 dict(id="cash-river-straight-board-oop",street="river",position_state="OOP",pot_type="SRP",texture="straight-board",board="9h,8d,7c,6s,5h",pot=60,stack=48,hero="Ts9s",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="mtt-shallow-flop-chipEV",street="flop",position_state="IP",pot_type="SRP",texture="Q-high-two-tone",board="Qh,9h,3c",pot=9,stack=24,hero="QsTs",path=["CHECK"],expected_app="CHECK"),
 dict(id="mtt-shallow-turn-chipEV",street="turn",position_state="OOP",pot_type="SRP",texture="K-high-connected",board="Kd,Ts,7c,9h",pot=13,stack=20,hero="KcQh",path=["CHECK","BET"],expected_app="RAISE"),
 # Expansion: new independent board/SPR/hand-class nodes. Expected labels are diagnostic only;
 # the TypeScript direct comparator remains authoritative for fidelity.
 dict(id="cash-a-high-ip-flop",street="flop",position_state="IP",pot_type="SRP",texture="A-high-rainbow",board="As,8d,3c",pot=12,stack=88,hero="AhQh",path=["CHECK"],expected_app="BET"),
 dict(id="cash-q-high-oop-flop",street="flop",position_state="OOP",pot_type="SRP",texture="Q-high-two-tone",board="Qs,9s,4d",pot=15,stack=82,hero="QhJh",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-paired-low-ip-flop",street="flop",position_state="IP",pot_type="SRP",texture="paired-low",board="9c,5d,5s",pot=10,stack=90,hero="Tc9h",path=["CHECK"],expected_app="BET"),
 dict(id="cash-connected-ip-flop",street="flop",position_state="IP",pot_type="SRP",texture="connected-rainbow",board="Js,Td,8c",pot=14,stack=86,hero="QsJc",path=["CHECK"],expected_app="BET"),
 dict(id="cash-turn-a-high-oop",street="turn",position_state="OOP",pot_type="SRP",texture="A-high-dynamic",board="Ad,9s,4c,Ts",pot=28,stack=70,hero="AhQh",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-turn-k-high-ip",street="turn",position_state="IP",pot_type="SRP",texture="K-high-rainbow",board="Ks,7d,3c,2h",pot=22,stack=78,hero="KhQh",path=["CHECK"],expected_app="BET"),
 dict(id="cash-turn-paired-oop",street="turn",position_state="OOP",pot_type="SRP",texture="paired-turn",board="Qd,8s,3c,8h",pot=32,stack=66,hero="QsJs",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-turn-connected-ip",street="turn",position_state="IP",pot_type="SRP",texture="connected-turn",board="Th,9d,6c,8s",pot=30,stack=64,hero="JhTs",path=["CHECK"],expected_app="BET"),
 dict(id="cash-river-a-high-ip",street="river",position_state="IP",pot_type="SRP",texture="A-high-rainbow",board="As,8d,4c,2h,6s",pot=44,stack=54,hero="AhQh",path=["CHECK"],expected_app="BET"),
 dict(id="cash-river-k-high-oop",street="river",position_state="OOP",pot_type="SRP",texture="K-high-rainbow",board="Ks,9d,5c,3h,2s",pot=52,stack=50,hero="KhQh",path=["CHECK","BET"],expected_app="CALL"),
 dict(id="cash-river-paired-ip",street="river",position_state="IP",pot_type="SRP",texture="paired-river",board="Qd,7s,4c,7h,2s",pot=46,stack=52,hero="QsJs",path=["CHECK"],expected_app="BET"),
 dict(id="cash-river-four-straight-ip",street="river",position_state="IP",pot_type="SRP",texture="four-straight",board="Jh,Td,9c,8s,3h",pot=58,stack=48,hero="QsJc",path=["CHECK"],expected_app="BET"),
]

PROFILE={"flop":dict(timeout=180,accuracy=4.0,iterations=30,dump_rounds=1),"turn":dict(timeout=150,accuracy=2.0,iterations=80,dump_rounds=1),"river":dict(timeout=120,accuracy=1.0,iterations=120,dump_rounds=1)}
DEFAULT_SOLVER_THREADS=8

def find_solver():
 env=os.environ.get("TEXASSOLVER_BIN")
 if env and pathlib.Path(env).exists(): return pathlib.Path(env)
 for p in pathlib.Path.cwd().rglob("console_solver"):
  if p.is_file(): return p
 raise SystemExit("console_solver not found")

def solver_threads(c):
 if c["street"]=="flop" and c["pot"]>0 and c["stack"]/c["pot"]<=3.25:return 3
 return DEFAULT_SOLVER_THREADS

def sizing_lines(c):
 if c["street"]=="flop":
  return """set_bet_sizes oop,flop,bet,50
set_bet_sizes oop,flop,raise,75
set_bet_sizes ip,flop,bet,50
set_bet_sizes ip,flop,raise,75
set_bet_sizes oop,turn,bet,66
set_bet_sizes ip,turn,bet,66
set_bet_sizes oop,river,bet,66
set_bet_sizes oop,river,donk,66
set_bet_sizes ip,river,bet,66"""
 return """set_bet_sizes oop,flop,bet,50
set_bet_sizes oop,flop,raise,75
set_bet_sizes ip,flop,bet,50
set_bet_sizes ip,flop,raise,75
set_bet_sizes oop,turn,bet,66
set_bet_sizes oop,turn,raise,75
set_bet_sizes ip,turn,bet,66
set_bet_sizes ip,turn,raise,75
set_bet_sizes oop,river,bet,66
set_bet_sizes oop,river,donk,66
set_bet_sizes oop,river,raise,75
set_bet_sizes ip,river,bet,66
set_bet_sizes ip,river,raise,75"""

def command_text(c,out_file):
 p=PROFILE[c["street"]]
 ip_range=RANGE_FLOP_IP if c["street"]=="flop" else RANGE_IP
 oop_range=RANGE_FLOP_OOP if c["street"]=="flop" else RANGE_OOP
 return f"""set_pot {c['pot']}
set_effective_stack {c['stack']}
set_board {c['board']}
set_range_ip {ip_range}
set_range_oop {oop_range}
{sizing_lines(c)}
set_allin_threshold 0.67
set_thread_num {solver_threads(c)}
set_accuracy {p['accuracy']}
set_max_iteration {p['iterations']}
set_print_interval 10
start_solve
set_dump_rounds {p['dump_rounds']}
dump_result {out_file.as_posix()}
"""

def main():
 solver=find_solver(); summary=[]
 for i,c in enumerate(CASES,1):
  print(f"[{i}/{len(CASES)}] {c['id']}",flush=True)
  case_dir=OUT/c["id"];case_dir.mkdir(parents=True,exist_ok=True)
  result_file=case_dir/"strategy.json";cmd_file=case_dir/"commands.txt";log_file=case_dir/"solver.log"
  cmd_file.write_text(command_text(c,result_file),encoding="utf-8")
  started=time.time();status="unknown";error=None
  try:
   proc=subprocess.run([str(solver),"-i",str(cmd_file)],cwd=solver.parent,text=True,capture_output=True,timeout=PROFILE[c["street"]]["timeout"])
   log_file.write_text((proc.stdout or "")+"\n"+(proc.stderr or ""),encoding="utf-8")
   status="solved" if proc.returncode==0 and result_file.exists() else "solver_failed"
   if proc.returncode!=0:error=f"returncode={proc.returncode}"
  except subprocess.TimeoutExpired as exc:
   status="timeout";error=f"timeout={PROFILE[c['street']]['timeout']}s";log_file.write_text((exc.stdout or "") if isinstance(exc.stdout,str) else "",encoding="utf-8")
  except Exception as exc:
   status="error";error=repr(exc);log_file.write_text(error,encoding="utf-8")
  row={**c,"status":status,"elapsed_seconds":round(time.time()-started,2),"error":error,"threads":solver_threads(c),"result_file":str(result_file.relative_to(ROOT)) if result_file.exists() else None}
  summary.append(row);print(json.dumps(row),flush=True)
 (OUT/"summary.json").write_text(json.dumps({"solver":"TexasSolver v0.2.0 console","scope":"HU postflop chipEV only; flop calibration keeps root flop sizing and reduced downstream tree; tournament-labelled cases exclude ICM.","case_count":len(CASES),"processed":len(summary),"cases":summary},indent=2),encoding="utf-8")
 solved=sum(x["status"]=="solved" for x in summary);print(f"Solved {solved}/{len(summary)}",flush=True)
 return 0

if __name__=="__main__":raise SystemExit(main())

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

# Weighted HU ranges used only as calibration inputs for the postflop solver battery.
RANGE_IP = "AA,KK,QQ,JJ,TT,99:0.75,88:0.75,77:0.5,66:0.25,55:0.25,AK,AQs,AQo:0.75,AJs,AJo:0.5,ATs:0.75,A6s:0.25,A5s:0.75,A4s:0.75,A3s:0.5,A2s:0.5,KQs,KQo:0.5,KJs,KTs:0.75,K5s:0.25,K4s:0.25,QJs:0.75,QTs:0.75,Q9s:0.5,JTs:0.75,J9s:0.75,J8s:0.75,T9s:0.75,T8s:0.75,T7s:0.75,98s:0.75,97s:0.75,96s:0.5,87s:0.75,86s:0.5,85s:0.5,76s:0.75,75s:0.5,65s:0.75,64s:0.5,54s:0.75,53s:0.5,43s:0.5"
RANGE_OOP = "QQ:0.5,JJ:0.75,TT,99,88,77,66,55,44,33,22,AKo:0.25,AQs,AQo:0.75,AJs,AJo:0.75,ATs,ATo:0.75,A9s,A8s,A7s,A6s,A5s,A4s,A3s,A2s,KQ,KJ,KTs,KTo:0.5,K9s,K8s,K7s,K6s,K5s,K4s:0.5,K3s:0.5,K2s:0.5,QJ,QTs,Q9s,Q8s,Q7s,JTs,JTo:0.5,J9s,J8s,T9s,T8s,T7s,98s,97s,96s,87s,86s,76s,75s,65s,64s,54s,53s,43s"

# Flop trees dominate runtime. Separate compact IP/OOP ranges preserve every hero class in
# this battery while avoiding the pathological symmetric tree produced by one shared range.
RANGE_FLOP_IP = "AA,KK,QQ,JJ,TT,99,88,AK,AQs,AQo,AJs,AJo,ATs,KQs,KQo,KJs,QJs,QTs,JTs,T9s,98s,87s"
RANGE_FLOP_OOP = "QQ,JJ,TT,99,88,77,66,AQs,AQo,AJs,AJo,ATs,ATo,KQs,KQo,KJs,KTs,QJs,QTs,JTs,T9s,98s"

CASES = [
    dict(id="cash-co-vs-btn-flop", street="flop", position_state="OOP", pot_type="SRP", texture="K-high-rainbow", board="Kd,8s,3c", pot=16, stack=94, hero="KcQc", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-bb-vs-co-turn", street="turn", position_state="OOP", pot_type="SRP", texture="K-high-two-tone", board="Kc,8h,3s,9s", pot=49, stack=70, hero="KdJd", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-btn-vs-bb-river-value", street="river", position_state="IP", pot_type="SRP", texture="Q-high-rainbow", board="Qh,7d,4s,2c,6c", pot=36, stack=50, hero="QsJs", path=["CHECK"], expected_app="BET"),
    dict(id="cash-bb-vs-btn-river-bet", street="river", position_state="OOP", pot_type="SRP", texture="K-high-rainbow", board="Kc,9d,5s,4h,2d", pot=90, stack=68, hero="KhQh", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="mtt-btn-vs-bb-turn-chipEV", street="turn", position_state="IP", pot_type="SRP", texture="A-overcard-rainbow", board="Qd,8s,4c,Ah", pot=15, stack=33, hero="KsQc", path=["CHECK"], expected_app="CHECK"),
    dict(id="cash-a72r-oop-vs-bet", street="flop", position_state="OOP", pot_type="SRP", texture="A-high-dry-rainbow", board="Ah,7d,2c", pot=10, stack=95, hero="AsJs", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-q77r-ip-after-check", street="flop", position_state="IP", pot_type="SRP", texture="paired-rainbow", board="Qh,7d,7c", pot=12, stack=94, hero="QsJs", path=["CHECK"], expected_app="BET"),
    dict(id="cash-t98tt-oop-vs-bet", street="flop", position_state="OOP", pot_type="SRP", texture="connected-two-tone", board="Th,9h,8c", pot=12, stack=94, hero="JsTs", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-ac9c4c-ip-after-check", street="flop", position_state="IP", pot_type="SRP", texture="monotone", board="Ac,9c,4c", pot=14, stack=93, hero="KcQs", path=["CHECK"], expected_app="BET"),
    dict(id="cash-low-connected-oop-vs-bet", street="flop", position_state="OOP", pot_type="SRP", texture="low-connected-rainbow", board="8d,7s,6c", pot=11, stack=95, hero="9h8h", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-high-spr-k72r-ip", street="flop", position_state="IP", pot_type="SRP", texture="K-high-dry-rainbow", board="Kh,7d,2s", pot=8, stack=120, hero="KsQs", path=["CHECK"], expected_app="BET"),
    dict(id="cash-low-spr-a84r-oop", street="flop", position_state="OOP", pot_type="large-pot", texture="A-high-rainbow", board="Ad,8c,4s", pot=38, stack=42, hero="AhJh", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-turn-paired-ip", street="turn", position_state="IP", pot_type="SRP", texture="paired-turn", board="Jh,6d,2c,6s", pot=24, stack=76, hero="JcTc", path=["CHECK"], expected_app="BET"),
    dict(id="cash-turn-four-straight-oop", street="turn", position_state="OOP", pot_type="SRP", texture="four-straight", board="9h,8d,7c,6s", pot=30, stack=72, hero="Ts9s", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-turn-flush-completes-ip", street="turn", position_state="IP", pot_type="SRP", texture="flush-completes", board="Qh,8h,3c,2h", pot=25, stack=74, hero="KhQd", path=["CHECK"], expected_app="CHECK"),
    dict(id="cash-river-paired-oop-vs-bet", street="river", position_state="OOP", pot_type="SRP", texture="paired-river", board="Jh,8d,3c,3s,2h", pot=48, stack=55, hero="JcTc", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="cash-river-four-flush-ip", street="river", position_state="IP", pot_type="SRP", texture="four-flush", board="Ah,8h,4c,2h,Kh", pot=42, stack=58, hero="QhJh", path=["CHECK"], expected_app="BET"),
    dict(id="cash-river-straight-board-oop", street="river", position_state="OOP", pot_type="SRP", texture="straight-board", board="9h,8d,7c,6s,5h", pot=60, stack=48, hero="Ts9s", path=["CHECK", "BET"], expected_app="CALL"),
    dict(id="mtt-shallow-flop-chipEV", street="flop", position_state="IP", pot_type="SRP", texture="Q-high-two-tone", board="Qh,9h,3c", pot=9, stack=24, hero="QsTs", path=["CHECK"], expected_app="BET"),
    dict(id="mtt-shallow-turn-chipEV", street="turn", position_state="OOP", pot_type="SRP", texture="K-high-connected", board="Kd,Ts,7c,9h", pot=13, stack=20, hero="KcQh", path=["CHECK", "BET"], expected_app="CALL"),
]

PROFILE = {
    "flop": dict(timeout=90, accuracy=4.0, iterations=30, dump_rounds=1),
    "turn": dict(timeout=150, accuracy=2.0, iterations=80, dump_rounds=1),
    "river": dict(timeout=120, accuracy=1.0, iterations=120, dump_rounds=1),
}


def find_solver():
    env = os.environ.get("TEXASSOLVER_BIN")
    if env and pathlib.Path(env).exists():
        return pathlib.Path(env)
    for p in pathlib.Path.cwd().rglob("console_solver"):
        if p.is_file():
            return p
    raise SystemExit("console_solver not found")


def input_text(c, out_name):
    p = PROFILE[c["street"]]
    range_ip = RANGE_FLOP_IP if c["street"] == "flop" else RANGE_IP
    range_oop = RANGE_FLOP_OOP if c["street"] == "flop" else RANGE_OOP
    return f"""set_pot {c['pot']}
set_effective_stack {c['stack']}
set_board {c['board']}
set_range_ip {range_ip}
set_range_oop {range_oop}
set_bet_sizes oop,flop,bet,50
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
set_bet_sizes ip,river,raise,75
set_allin_threshold 0.80
build_tree
set_thread_num 3
set_accuracy {p['accuracy']}
set_max_iteration {p['iterations']}
set_print_interval 20
set_use_isomorphism 1
start_solve
set_dump_rounds {p['dump_rounds']}
dump_result {out_name}
"""


def choose_child(node, prefix):
    children = node.get("childrens", {}) if isinstance(node, dict) else {}
    candidates = [(k, v) for k, v in children.items() if k.upper().startswith(prefix.upper())]
    if not candidates:
        raise KeyError(f"no child {prefix}; have {list(children)[:12]}")
    return sorted(candidates, key=lambda kv: kv[0])[0]


def action_family(action):
    u = action.upper().replace("_", "-")
    if u.startswith("BET"):
        return "BET"
    if u.startswith("RAISE"):
        return "RAISE"
    if u.startswith("ALLIN") or u.startswith("ALL-IN") or u.startswith("ALL IN"):
        return "ALL-IN"
    for family in ("FOLD", "CHECK", "CALL"):
        if u.startswith(family):
            return family
    return u.split()[0]


def hero_strategy(node, hero):
    block = node.get("strategy", {})
    actions = block.get("actions", [])
    table = block.get("strategy", {})
    keys = [hero, hero[2:] + hero[:2]]
    vals = used = None
    for k in keys:
        if k in table:
            vals, used = table[k], k
            break
    if vals is None:
        target = {hero[:2], hero[2:]}
        for k, v in table.items():
            if len(k) == 4 and {k[:2], k[2:]} == target:
                vals, used = v, k
                break
    if vals is None:
        raise KeyError(f"hero {hero} not found in strategy ({len(table)} hands)")

    pairs = [(actions[i], float(vals[i])) for i in range(min(len(actions), len(vals)))]
    total = sum(v for _, v in pairs) or 1.0
    exact_pct = {a: round(v * 100 / total, 2) for a, v in pairs if v > 1e-8}
    best_exact = max(exact_pct, key=exact_pct.get) if exact_pct else "---"
    agg = {"FOLD": 0.0, "CHECK": 0.0, "CALL": 0.0, "BET": 0.0, "RAISE": 0.0, "ALL-IN": 0.0}
    for a, v in pairs:
        family = action_family(a)
        if family in agg:
            agg[family] += v
    agg_total = sum(agg.values()) or 1.0
    pct = {k: round(v * 100 / agg_total, 2) for k, v in agg.items() if v > 1e-8}
    best = max(pct, key=pct.get) if pct else "---"
    return used, pairs, exact_pct, best_exact, pct, best


def build_report(summary):
    ok = [x for x in summary if x.get("status") == "ok"]
    matches = [x for x in ok if x.get("top_action_match")]
    by_street = {}
    by_texture = {}
    for row in ok:
        for bucket, key in ((by_street, row["street"]), (by_texture, row["texture"])):
            bucket.setdefault(key, {"solved": 0, "matches": 0})
            bucket[key]["solved"] += 1
            bucket[key]["matches"] += int(bool(row.get("top_action_match")))
    for bucket in (by_street, by_texture):
        for stats in bucket.values():
            stats["match_pct"] = round(100 * stats["matches"] / stats["solved"], 2) if stats["solved"] else None
    return {
        "solver": "TexasSolver v0.2.0 console",
        "scope": "HU postflop chipEV only; fast calibration tree; tournament-labelled cases exclude ICM",
        "case_count": len(CASES),
        "processed": len(summary),
        "cases": summary,
        "solved": len(ok),
        "timeouts": sum(1 for x in summary if x.get("status") == "timeout"),
        "solver_failures": sum(1 for x in summary if x.get("status") == "solver_failed"),
        "parse_failures": sum(1 for x in summary if x.get("status") == "parse_failed"),
        "top_action_matches": len(matches),
        "top_action_match_pct": round(100 * len(matches) / len(ok), 2) if ok else None,
        "by_street": by_street,
        "by_texture": by_texture,
        "sizing_note": "Broad battery uses one canonical bet/raise size per street; flop uses compact asymmetric IP/OOP smoke ranges to improve solve coverage while retaining benchmark hero classes.",
    }


def save_report(summary):
    report = build_report(summary)
    (OUT / "summary.json").write_text(json.dumps(report, indent=2, ensure_ascii=False))
    return report


def main():
    solver = find_solver()
    solver.chmod(solver.stat().st_mode | 0o111)
    work = solver.parent
    summary = []

    for index, c in enumerate(CASES, start=1):
        print(f"=== SOLVE {index}/{len(CASES)} {c['id']} ===", flush=True)
        inp = work / f"stackup-{c['id']}.txt"
        raw = work / f"stackup-{c['id']}.json"
        inp.write_text(input_text(c, raw.name))
        start = time.time()
        timeout = PROFILE[c["street"]]["timeout"]
        try:
            proc = subprocess.run(
                [str(solver), "-i", inp.name],
                cwd=work,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                timeout=timeout,
            )
            output = proc.stdout or ""
        except subprocess.TimeoutExpired as exc:
            output = exc.stdout or ""
            if isinstance(output, bytes):
                output = output.decode("utf-8", errors="replace")
            (OUT / f"{c['id']}.log").write_text(output)
            summary.append({**c, "status": "timeout", "timeout_seconds": timeout, "seconds": round(time.time() - start, 2)})
            save_report(summary)
            print(f"TIMEOUT {c['id']} after {timeout}s; continuing", flush=True)
            continue

        (OUT / f"{c['id']}.log").write_text(output)
        if proc.returncode != 0 or not raw.exists():
            summary.append({
                **c,
                "status": "solver_failed",
                "returncode": proc.returncode,
                "seconds": round(time.time() - start, 2),
                "log_tail": output[-1200:],
            })
            save_report(summary)
            continue

        shutil.copy2(raw, OUT / f"{c['id']}.json")
        try:
            node = json.loads(raw.read_text())
            resolved_path = []
            for step in c["path"]:
                key, node = choose_child(node, step)
                resolved_path.append(key)
            used, pairs, exact_pct, best_exact, pct, best = hero_strategy(node, c["hero"])
            summary.append({
                **c,
                "status": "ok",
                "seconds": round(time.time() - start, 2),
                "resolved_path": resolved_path,
                "solver_hand_key": used,
                "solver_actions": pairs,
                "solver_exact_frequency_pct": exact_pct,
                "solver_best_exact": best_exact,
                "solver_frequency_pct": pct,
                "solver_best": best,
                "app_expected": c["expected_app"],
                "top_action_match": best == c["expected_app"],
            })
        except Exception as exc:
            summary.append({**c, "status": "parse_failed", "seconds": round(time.time() - start, 2), "error": repr(exc)})
        save_report(summary)

    report = save_report(summary)
    print(json.dumps(report, indent=2, ensure_ascii=False))
    if not any(x.get("status") == "ok" for x in summary):
        sys.exit(2)


if __name__ == "__main__":
    main()

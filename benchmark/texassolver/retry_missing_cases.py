#!/usr/bin/env python3
import json
import pathlib
import shutil
import subprocess
import sys
import time

import run_battery as base

OUT = base.OUT / "retry-missing"
OUT.mkdir(parents=True, exist_ok=True)
TARGET_IDS = {
    "cash-low-spr-a84r-oop",
    "cash-paired-low-ip-flop",
    "cash-connected-ip-flop",
    "cash-turn-connected-ip",
    "cash-river-four-straight-ip",
}

# The three parse failures in run #21 were not solver disagreements: the exact
# hero combo was absent from the calibration input range. Add only the missing
# offsuit classes required by those test nodes.
base.RANGE_IP += ",JTo,QJo"
base.RANGE_FLOP_IP += ",T9o,QJo"

# TexasSolver v0.2.0 crashed intermittently on two flop trees in run #21.
# Re-run the isolated unresolved nodes single-threaded to remove concurrency as
# a source of nondeterministic card lookup/segfault failures.
def retry_threads(case):
    return 1 if case["street"] == "flop" else 4

base.solver_threads = retry_threads


def run_case(solver, case):
    work = solver.parent
    inp = work / f"stackup-retry-{case['id']}.txt"
    raw = work / f"stackup-retry-{case['id']}.json"
    if raw.exists():
        raw.unlink()
    inp.write_text(base.input_text(case, raw.name))
    started = time.time()
    timeout = base.PROFILE[case["street"]]["timeout"] * 2
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
        (OUT / f"{case['id']}.log").write_text(output)
        return {**case, "status": "timeout", "timeout_seconds": timeout, "seconds": round(time.time()-started, 2), "solver_threads": retry_threads(case)}

    (OUT / f"{case['id']}.log").write_text(output)
    if proc.returncode != 0 or not raw.exists():
        return {
            **case,
            "status": "solver_failed",
            "returncode": proc.returncode,
            "seconds": round(time.time()-started, 2),
            "solver_threads": retry_threads(case),
            "log_tail": output[-1200:],
        }

    shutil.copy2(raw, OUT / f"{case['id']}.json")
    try:
        node = json.loads(raw.read_text())
        resolved_path = []
        for step in case["path"]:
            key, node = base.choose_child(node, step)
            resolved_path.append(key)
        used, pairs, exact_pct, best_exact, pct, best = base.hero_strategy(node, case["hero"])
        return {
            **case,
            "status": "ok",
            "seconds": round(time.time()-started, 2),
            "solver_threads": retry_threads(case),
            "resolved_path": resolved_path,
            "solver_hand_key": used,
            "solver_actions": pairs,
            "solver_exact_frequency_pct": exact_pct,
            "solver_best_exact": best_exact,
            "solver_frequency_pct": pct,
            "solver_best": best,
        }
    except Exception as exc:
        return {**case, "status": "parse_failed", "seconds": round(time.time()-started, 2), "solver_threads": retry_threads(case), "error": repr(exc)}


def main():
    solver = base.find_solver()
    solver.chmod(solver.stat().st_mode | 0o111)
    targets = [case for case in base.CASES if case["id"] in TARGET_IDS]
    summary = []
    for index, case in enumerate(targets, 1):
        print(f"=== RETRY {index}/{len(targets)} {case['id']} ===", flush=True)
        row = run_case(solver, case)
        summary.append(row)
        print(json.dumps(row, ensure_ascii=False), flush=True)
        (OUT / "summary.json").write_text(json.dumps({"case_count": len(targets), "cases": summary}, indent=2, ensure_ascii=False))
    solved = sum(row.get("status") == "ok" for row in summary)
    print(f"Resolved {solved}/{len(targets)}", flush=True)
    return 0 if solved == len(targets) else 2


if __name__ == "__main__":
    raise SystemExit(main())

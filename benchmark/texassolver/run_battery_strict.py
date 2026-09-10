#!/usr/bin/env python3
"""Strict 32-node calibration runner.

Keep the proven battery configuration for nodes that already solve reliably.
Only the decision nodes that need an additional exact Hero class receive that
range extension, and only the flop nodes proven unstable at higher concurrency
use one solver thread. This keeps node inputs explicit without changing the
validated configuration of unrelated cases.
"""
import run_battery as base

_BASE_RANGE_IP = base.RANGE_IP
_BASE_RANGE_FLOP_IP = base.RANGE_FLOP_IP
_BASE_INPUT_TEXT = base.input_text
_BASE_THREADS = base.solver_threads

# Minimal range additions proven by the isolated missing-node retry.
_RANGE_IP_ADDITIONS = {
    "cash-turn-connected-ip": ",JTo:0.5",
    "cash-river-four-straight-ip": ",QJo:0.5",
}
_RANGE_FLOP_IP_ADDITIONS = {
    "cash-paired-low-ip-flop": ",T9o",
    "cash-connected-ip-flop": ",QJo",
}

# TexasSolver v0.2.0 has shown nondeterministic crashes on these exact flop
# trees at higher concurrency. One thread changes only execution concurrency,
# not the configured ranges/tree/accuracy, and has already been the stable path
# for the slow/expanded flop nodes.
_SINGLE_THREAD_FLOPS = {
    "cash-a72r-oop-vs-bet",
    "cash-ac9c4c-ip-after-check",
    "cash-low-spr-a84r-oop",
    "cash-paired-low-ip-flop",
    "cash-connected-ip-flop",
}

# The paired-low exact-combo solve has already completed in the isolated retry,
# but can exceed the generic 180s ceiling on shared CI runners. Raising only the
# flop ceiling does not change solver inputs or strategy; it only lets the
# already-validated single-thread solve finish under slower runner load.
base.PROFILE["flop"]["timeout"] = 300


def strict_input_text(case, out_name):
    original_ip = base.RANGE_IP
    original_flop_ip = base.RANGE_FLOP_IP
    try:
        base.RANGE_IP = _BASE_RANGE_IP + _RANGE_IP_ADDITIONS.get(case["id"], "")
        base.RANGE_FLOP_IP = _BASE_RANGE_FLOP_IP + _RANGE_FLOP_IP_ADDITIONS.get(case["id"], "")
        return _BASE_INPUT_TEXT(case, out_name)
    finally:
        base.RANGE_IP = original_ip
        base.RANGE_FLOP_IP = original_flop_ip


def strict_threads(case):
    if case["id"] in _SINGLE_THREAD_FLOPS:
        return 1
    return _BASE_THREADS(case)


base.input_text = strict_input_text
base.solver_threads = strict_threads

if __name__ == "__main__":
    base.main()

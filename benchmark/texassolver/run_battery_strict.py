#!/usr/bin/env python3
"""Strict 32-node calibration runner.

Keeps the proven run_battery implementation intact while extending only the
input ranges required for the exact Hero classes already validated by the
isolated missing-node retry. Flop solves use one thread for TexasSolver v0.2.0
stability; non-flop cases retain the validated default policy.
"""
import run_battery as base

# These exact classes were absent from the calibration input ranges. The
# isolated retry proved they solve correctly when included.
base.RANGE_IP += ",JTo:0.5,QJo:0.5"
base.RANGE_FLOP_IP += ",T9o,QJo"

_default_threads = base.solver_threads

def strict_threads(case):
    if case["street"] == "flop":
        return 1
    return _default_threads(case)

base.solver_threads = strict_threads

if __name__ == "__main__":
    base.main()

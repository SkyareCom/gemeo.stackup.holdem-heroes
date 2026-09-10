#!/usr/bin/env python3
import argparse
import json
import pathlib

RANKS = set("23456789TJQKA")
SUITS = set("cdhs")


def split_cards(text: str):
    text = text.replace(",", " ")
    return [token.strip() for token in text.split() if token.strip()]


def normalize_card(card: str):
    if len(card) != 2:
        return None
    rank = card[0].upper()
    suit = card[1].lower()
    if rank not in RANKS or suit not in SUITS:
        return None
    return rank + suit


def combo_cards(combo: str):
    if len(combo) != 4:
        return None
    a = normalize_card(combo[:2])
    b = normalize_card(combo[2:])
    if not a or not b or a == b:
        return None
    return a, b


def action_family(action: str):
    upper = action.upper().replace("_", "-")
    if upper.startswith("BET"):
        return "BET"
    if upper.startswith("RAISE"):
        return "RAISE"
    if upper.startswith("ALLIN") or upper.startswith("ALL-IN") or upper.startswith("ALL IN"):
        return "ALL-IN"
    for family in ("FOLD", "CHECK", "CALL"):
        if upper.startswith(family):
            return family
    return upper.split()[0]


def choose_exact_child(node, child_key: str):
    children = node.get("childrens", {}) if isinstance(node, dict) else {}
    if child_key in children:
        return children[child_key]
    matches = [value for key, value in children.items() if key.upper().startswith(child_key.upper())]
    if len(matches) == 1:
        return matches[0]
    raise KeyError(f"cannot resolve child {child_key}; have {list(children)[:12]}")


def normalize_frequencies(actions, values):
    aggregate = {}
    for index, value in enumerate(values[: len(actions)]):
        frequency = float(value)
        if frequency <= 1e-12:
            continue
        family = action_family(actions[index])
        aggregate[family] = aggregate.get(family, 0.0) + frequency
    total = sum(aggregate.values())
    if total <= 0:
        return {}
    return {key: round(value * 100.0 / total, 4) for key, value in aggregate.items()}


def extract(results_dir: pathlib.Path):
    summary_path = results_dir / "summary.json"
    report = json.loads(summary_path.read_text())
    nodes = []
    combo_count = 0
    rejected_collisions = 0

    for case in report.get("cases", []):
        if case.get("status") != "ok":
            continue
        raw_path = results_dir / f"{case['id']}.json"
        if not raw_path.exists():
            continue
        node = json.loads(raw_path.read_text())
        for child_key in case.get("resolved_path", []):
            node = choose_exact_child(node, child_key)

        strategy = node.get("strategy", {})
        actions = strategy.get("actions", [])
        table = strategy.get("strategy", {})
        board = [normalize_card(card) for card in split_cards(case.get("board", ""))]
        board = [card for card in board if card]
        dead = set(board)
        combos = {}

        for combo, values in table.items():
            parsed = combo_cards(combo)
            if not parsed:
                continue
            if parsed[0] in dead or parsed[1] in dead:
                rejected_collisions += 1
                continue
            frequencies = normalize_frequencies(actions, values)
            if not frequencies:
                continue
            combos[combo] = frequencies

        if not combos:
            continue
        combo_count += len(combos)
        nodes.append({
            "id": case["id"],
            "street": case.get("street"),
            "positionState": case.get("position_state"),
            "potType": case.get("pot_type"),
            "texture": case.get("texture"),
            "board": board,
            "rootPot": case.get("pot"),
            "effectiveStack": case.get("stack"),
            "resolvedPath": case.get("resolved_path", []),
            "actions": actions,
            "combos": combos,
        })

    return {
        "schemaVersion": 1,
        "source": report.get("solver", "TexasSolver"),
        "scope": report.get("scope"),
        "nodeCount": len(nodes),
        "exactComboDecisionCount": combo_count,
        "rejectedBoardCollisionCombos": rejected_collisions,
        "nodes": nodes,
    }


def main():
    parser = argparse.ArgumentParser(description="Extract every exact Hero combo strategy from solved TexasSolver benchmark nodes.")
    parser.add_argument("results_dir", nargs="?", default="benchmark/texassolver/results")
    parser.add_argument("--output", default=None)
    args = parser.parse_args()

    results_dir = pathlib.Path(args.results_dir)
    output = pathlib.Path(args.output) if args.output else results_dir / "exact-combo-bank.json"
    bank = extract(results_dir)
    output.write_text(json.dumps(bank, ensure_ascii=False, separators=(",", ":")))
    print(json.dumps({
        "output": str(output),
        "nodes": bank["nodeCount"],
        "exact_combo_decisions": bank["exactComboDecisionCount"],
        "rejected_board_collisions": bank["rejectedBoardCollisionCombos"],
    }, indent=2))


if __name__ == "__main__":
    main()

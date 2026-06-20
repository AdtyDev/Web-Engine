#!/usr/bin/env python3
"""
Generate configs/schema.json from the Pydantic ClientConfig model.

Run from the backend/ directory:
    python scripts/generate_schema.py

This is the single source of truth — never hand-maintain a separate JSON Schema file.
The generated file can be used with any JSON Schema validator or editor plugin.
"""
import json
import sys
from pathlib import Path

# Allow running from the backend/ directory
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.models.config_schema import ClientConfig  # noqa: E402


def main() -> None:
    schema = ClientConfig.model_json_schema()
    out_path = Path(__file__).parent.parent / "configs" / "schema.json"
    out_path.write_text(json.dumps(schema, indent=2) + "\n", encoding="utf-8")
    print(f"Schema written to {out_path}")
    print(f"  {len(schema.get('properties', {}))} top-level properties")
    print(f"  {len(schema.get('$defs', {}))} sub-schemas defined")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Merge all CSV files in a directory into a single CSV file.

Uses UTF-8 with BOM for output so Excel on Windows opens Chinese text correctly.
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path


def merge_csv_files(
    input_dir: Path,
    output_path: Path,
    pattern: str = "*.csv",
    encoding: str = "utf-8-sig",
    recursive: bool = False,
    skip_duplicate_header: bool = True,
) -> None:
    if not input_dir.is_dir():
        raise SystemExit(f"输入路径不是目录: {input_dir}")

    if recursive:
        csv_files = sorted(input_dir.rglob(pattern))
    else:
        csv_files = sorted(input_dir.glob(pattern))

    csv_files = [p for p in csv_files if p.is_file()]
    if not csv_files:
        raise SystemExit(f"目录中未找到匹配 {pattern!r} 的文件: {input_dir}")

    output_path.parent.mkdir(parents=True, exist_ok=True)

    header_row: list[str] | None = None
    written_any = False

    with output_path.open("w", newline="", encoding=encoding) as out_f:
        writer = csv.writer(out_f)

        for path in csv_files:
            try:
                with path.open("r", newline="", encoding=encoding, errors="replace") as in_f:
                    rows = list(csv.reader(in_f))
            except OSError as e:
                print(f"跳过（无法读取）: {path} — {e}", file=sys.stderr)
                continue

            if not rows:
                print(f"跳过（空文件）: {path}", file=sys.stderr)
                continue

            if not written_any:
                writer.writerows(rows)
                header_row = rows[0] if rows else None
                written_any = True
                continue

            data = rows
            if (
                skip_duplicate_header
                and header_row is not None
                and len(rows) > 1
                and rows[0] == header_row
            ):
                data = rows[1:]

            writer.writerows(data)

    if not written_any:
        output_path.unlink(missing_ok=True)
        raise SystemExit("没有可合并的内容（全部跳过或为空）。")

    print(f"已合并 -> {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="将目录下多个 CSV 合并为一个文件（按文件名排序）。"
    )
    parser.add_argument(
        "input_dir",
        type=Path,
        nargs="?",
        default=Path("."),
        help="包含 CSV 的目录（默认当前目录）",
    )
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("merged.csv"),
        help="输出文件路径（默认 merged.csv）",
    )
    parser.add_argument(
        "-p",
        "--pattern",
        default="*.csv",
        help="匹配文件名（默认 *.csv）",
    )
    parser.add_argument(
        "-r",
        "--recursive",
        action="store_true",
        help="递归子目录",
    )
    parser.add_argument(
        "--encoding",
        default="utf-8-sig",
        help="读写编码（默认 utf-8-sig，兼容 Excel）",
    )
    parser.add_argument(
        "--no-skip-duplicate-header",
        action="store_true",
        help="不跳过与首文件相同的表头行（每个文件整表追加）",
    )
    args = parser.parse_args()

    merge_csv_files(
        args.input_dir,
        args.output,
        pattern=args.pattern,
        encoding=args.encoding,
        recursive=args.recursive,
        skip_duplicate_header=not args.no_skip_duplicate_header,
    )


if __name__ == "__main__":
    main()

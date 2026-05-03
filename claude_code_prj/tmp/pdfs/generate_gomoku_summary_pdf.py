from pathlib import Path
import textwrap

import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle


ROOT = Path(r"F:\AI_Project\claude_code_prj")
OUTPUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs"
PDF_PATH = OUTPUT_DIR / "gomoku_game_app_summary.pdf"
PNG_PATH = TMP_DIR / "gomoku_game_app_summary_preview.png"


TITLE = "App Summary - gomoku_game"
SUBTITLE = (
    "Scope note: the repo root is a multi-project workspace. This summary covers "
    "the clearest standalone app folder found in the repo: gomoku_game."
)

WHAT_IT_IS = (
    "A standalone browser-based Gomoku game built with plain HTML, CSS, and "
    "JavaScript. It runs entirely on the client and keeps game state in memory."
)

WHO_ITS_FOR = (
    "Two local players who want a lightweight 15x15 Gomoku game in a browser. "
    "It also fits developers looking for a small vanilla-JS example with separated UI and game logic."
)

FEATURES = [
    "15x15 board rendered as a clickable grid.",
    "Two-player local play with alternating black and white turns.",
    "Occupied cells are blocked from being reused.",
    "Win detection across horizontal, vertical, and both diagonal lines.",
    "Draw detection when the board is full with no winner.",
    "Restart control resets UI state and in-memory board state.",
    "Responsive styling and simple hover/slide-in visual feedback.",
]

ARCHITECTURE = [
    "`index.html` defines the shell: title, current-player label, restart button, board container, and result area.",
    "`game.js` is the controller. It creates `Board` and `GameLogic`, binds click/restart events, tracks turns, and ends the game.",
    "`board.js` owns DOM rendering. It creates 225 cells, maps row/col through `data-*` attributes, and paints stones with CSS classes.",
    "`gameLogic.js` owns rules and state. It stores a 15x15 in-memory array, places stones, checks four directions, and detects full-board draws.",
    "`style.css` provides layout, piece styling, hover states, animation, and a mobile adjustment for smaller screens.",
    "Data flow: user click -> `game.js` handler -> `gameLogic.js` state update/checks -> `board.js` DOM update -> result/current-player text refresh.",
    "Backend, API, database, auth, and persistence layers: Not found in repo.",
]

RUN_STEPS = [
    "Open `gomoku_game/index.html` directly in a browser.",
    "Or from `gomoku_game/`, run `python -m http.server 8000` and open `http://localhost:8000`.",
    "Install/build steps inside `gomoku_game`: Not found in repo.",
]


def add_wrapped_text(ax, x, y, text, width_chars, fontsize=10, color="#22313f", line_height=0.021):
    lines = textwrap.wrap(text, width=width_chars)
    joined = "\n".join(lines)
    ax.text(
        x,
        y,
        joined,
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=fontsize,
        color=color,
        family="DejaVu Sans",
    )
    return y - line_height * len(lines)


def add_bullets(ax, x, y, items, width_chars, fontsize=9.6, bullet_indent=0.018, line_height=0.0205):
    for item in items:
        wrapped = textwrap.wrap(item, width=width_chars)
        if not wrapped:
            continue
        ax.text(
            x,
            y,
            "-",
            transform=ax.transAxes,
            ha="left",
            va="top",
            fontsize=fontsize,
            color="#22313f",
            family="DejaVu Sans",
        )
        ax.text(
            x + bullet_indent,
            y,
            "\n".join(wrapped),
            transform=ax.transAxes,
            ha="left",
            va="top",
            fontsize=fontsize,
            color="#22313f",
            family="DejaVu Sans",
        )
        y -= line_height * len(wrapped) + 0.006
    return y


def add_section_title(ax, x, y, title):
    ax.text(
        x,
        y,
        title.upper(),
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=10.5,
        fontweight="bold",
        color="#0f4c5c",
        family="DejaVu Sans",
    )
    return y - 0.031


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    fig = plt.figure(figsize=(8.27, 11.69), dpi=200, facecolor="#f7f4ee")
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_axis_off()

    ax.add_patch(Rectangle((0, 0.905), 1, 0.095, transform=ax.transAxes, color="#0f4c5c"))
    ax.text(
        0.055,
        0.962,
        TITLE,
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=22,
        fontweight="bold",
        color="white",
        family="DejaVu Sans",
    )
    ax.text(
        0.055,
        0.922,
        "Repo-evidence summary",
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=10.5,
        color="#d9edf2",
        family="DejaVu Sans",
    )

    ax.add_patch(
        Rectangle(
            (0.055, 0.842),
            0.89,
            0.046,
            transform=ax.transAxes,
            facecolor="#fff6dd",
            edgecolor="#d6b656",
            linewidth=1.0,
        )
    )
    ax.text(
        0.07,
        0.872,
        "\n".join(textwrap.wrap(SUBTITLE, width=112)),
        transform=ax.transAxes,
        ha="left",
        va="top",
        fontsize=8.9,
        color="#6b5300",
        family="DejaVu Sans",
    )

    left_x = 0.07
    right_x = 0.54
    col_top = 0.807

    y = col_top
    y = add_section_title(ax, left_x, y, "What it is")
    y = add_wrapped_text(ax, left_x, y, WHAT_IT_IS, width_chars=44, fontsize=9.8)

    y -= 0.018
    y = add_section_title(ax, left_x, y, "Who it's for")
    y = add_wrapped_text(ax, left_x, y, WHO_ITS_FOR, width_chars=44, fontsize=9.8)

    y -= 0.018
    y = add_section_title(ax, left_x, y, "What it does")
    y = add_bullets(ax, left_x, y, FEATURES, width_chars=40, fontsize=9.35)

    yr = col_top
    yr = add_section_title(ax, right_x, yr, "How it works")
    yr = add_bullets(ax, right_x, yr, ARCHITECTURE, width_chars=48, fontsize=9.15, bullet_indent=0.016)

    yr -= 0.012
    yr = add_section_title(ax, right_x, yr, "How to run")
    yr = add_bullets(ax, right_x, yr, RUN_STEPS, width_chars=47, fontsize=9.3, bullet_indent=0.016)

    ax.text(
        0.07,
        0.04,
        "Evidence basis: README.md, index.html, game.js, board.js, gameLogic.js, and style.css in gomoku_game.",
        transform=ax.transAxes,
        ha="left",
        va="bottom",
        fontsize=8.2,
        color="#566573",
        family="DejaVu Sans",
    )

    fig.savefig(PDF_PATH, format="pdf", bbox_inches="tight", pad_inches=0)
    fig.savefig(PNG_PATH, format="png", bbox_inches="tight", pad_inches=0)
    plt.close(fig)

    print(PDF_PATH)
    print(PNG_PATH)


if __name__ == "__main__":
    main()

# 🚀 Aikid Academy

A free, kid-friendly website (ages **6–10**) for learning to code, solve logic
puzzles, and play with **AI** — inspired by [code.org](https://code.org).

Everything runs in the browser with **no installation and no internet needed**.
Just open it and play.

## ▶️ How to open it

**Easiest way:** double-click `index.html` — it opens in your web browser.

**Or run a tiny local server** (nicer, avoids any browser security limits):

```bash
# from inside the project folder
python3 -m http.server 8000
```
Then visit **http://localhost:8000** in your browser.

## 🌐 Publish it online (GitHub Pages)

To put the site live on the internet for free, do this **one-time** step in the
GitHub website (it only takes a few clicks — the repo owner has to do it because
it's a security setting):

1. Go to the repo on GitHub: **https://github.com/ramesh10285/Aikid**
2. Click **Settings** (top menu) → **Pages** (left sidebar).
3. Under **Build and deployment → Source**, choose **Deploy from a branch**.
4. Set **Branch** to `claude/code-org-ai-game-xcvufy` and folder to **/(root)**, click **Save**.
5. Wait ~1 minute, then refresh. GitHub shows the live link at the top:

   **https://ramesh10285.github.io/Aikid/**

That's it — the site is live and updates automatically whenever you push to the branch. 🎉

> Optional (advanced): a GitHub Actions workflow is also included
> (`.github/workflows/deploy.yml`). If you instead set the Pages **Source** to
> **GitHub Actions**, you can publish by running that workflow from the
> **Actions** tab. The "Deploy from a branch" option above is simpler and
> recommended.

## 🎮 The four activities

| Activity | What kids do | What they learn |
|---|---|---|
| 🧩 **Maze Puzzles** (`games/maze.html`) | Drag/tap blocks (Move, Turn, Repeat, If) to guide a robot through 5 mazes | Sequencing, **loops**, **conditionals** |
| 🐱 **Sprite Playground** (`games/playground.html`) | Build a script to make a cat move, jump, spin, change color & meow | Programs run **in order**, free creativity |
| 🤖 **AI Trainer** (`games/ai.html`) | Play Rock-Paper-Scissors vs a robot that **learns** their patterns | How **AI learns from data** & makes predictions |
| ⭕ **Tic-Tac-Toe vs AI** (`games/tictactoe.html`) | Play against an easy or unbeatable computer | **Game strategy** & how computers "think ahead" |

## 👩‍👧 Tips for grown-ups

- Start with **Maze Puzzles Level 1** — it only needs the "Move" block.
- In the maze, **tap a 🔁 Repeat or ❓ If block first**, then tap other blocks to
  put them *inside* it (or drag blocks onto it on a computer).
- The **AI Trainer** shows a live "Robot's Brain" panel so kids can *see* the
  computer learning — a great talking point about what AI really is.
- In **Tic-Tac-Toe**, the "🧠 Hard" robot uses the *minimax* algorithm and can
  never be beaten — a fun challenge and a lesson that a tie is the best you can do!

## 🛠️ For curious older kids / parents

It's all plain **HTML, CSS, and JavaScript** — no frameworks. Open the files in
`games/` and `js/` to read and tweak the code. The maze interpreter
(`js/maze.js`) and the Tic-Tac-Toe minimax AI are good, readable examples of
real programming ideas.

Made with ❤️ for young coders.

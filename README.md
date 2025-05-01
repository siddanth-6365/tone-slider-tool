# Tone Slider Text Tool

A simple Tool for adjusting text tone via a drag‑and‑drop grid and AI.

## 🚀 Tech Stack
- **Next.js**
- **React**
- **Radix UI** components
- **Zustand** (state management with `localStorage`)
- **Mistral.ai API** for tone adjustment

## 🔧 Setup
1. Clone and install:
   ```bash
   git clone <repo-url>
   cd <project-folder>
   npm install
   ```
2. Create a `.env.local` file:
   ```ini
   MISTRAL_API_KEY=your_key_here
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure (High Level)
```
/pages
  └─ api/ai.ts        # Next.js API route for Mistral calls
/app
  └─ index.ts          # Home layout: Header, ToneController, Toaster
/components
  ├─ commons/*        # Page header
  ├─ ui/*             # all ui components
  ├─ ToneController   # Manages input/output, undo/redo, API calls
  └─ ToneChangerGrid  # 3×3 grid for picking tone weights
/store
  └─ toneStore.ts     # Zustand slice with undo/redo & persistence
```  

## 🖱️ How It Works
1. **Input Tab**: Enter or paste source text.
2. **Tone Picker**: Drag the marker in the grid to select tone weights (concise, casual, professional, expanded).
3. **Adjust Text**: Click *Adjust Text* to POST `{ text, tones }` to `/api/ai`. The Mistral API returns the adjusted text.
4. **Output Tab**: View adjusted text rendered with Markdown. Copy or undo/redo changes.

## 🔌 API Route
- **`/api/ai`** accepts JSON `{ text, tones }` and returns `{ text: adjusted }` using `MISTRAL_API_KEY`.

## 📖 Key Decisions
- **Discrete grid** (0%, 50%, 100%) simplifies weight logic.
- **Zustand + localStorage** supports undo/redo and state persistence.
- **Radix UI** ensures consistent, lightweight styling.
- **Next.js API** secures the API key and handles CORS.

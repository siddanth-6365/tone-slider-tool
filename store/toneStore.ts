import {create} from "zustand";
import { persist } from "zustand/middleware";

export interface Tone {
  tone: string;
  weight: number;
}

interface Revision {
  input: string;
  output: string;
  tones: Tone[];
}

interface ToneState {
  inputText: string;
  outputText: string;
  tones: Tone[];
  history: Revision[];
  historyIndex: number;
  setInputText: (text: string) => void;
  setTones: (tones: Tone[]) => void;
  setOutputText: (output: string) => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
}

const INITIAL_STATE = {
  inputText: "",
  outputText: "",
  tones: [],
  history: [],
  historyIndex: -1,
};

const useToneStore = create<ToneState>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      setInputText: (text) => {
        const { history, historyIndex } = get();
        const newHistory =
          historyIndex < history.length - 1
            ? history.slice(0, historyIndex + 1)
            : history;
        set({
          inputText: text,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setTones: (tones) => {
        const { history, historyIndex, inputText } = get();
        const newHistory =
          historyIndex < history.length - 1
            ? history.slice(0, historyIndex + 1)
            : history;
        
        set({
          tones,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      setOutputText: (output) => {
        const { inputText, tones, history, historyIndex } = get();
        
        if (inputText.trim() && output.trim()) {
          const newRev = { input: inputText, output, tones };
          const baseHistory =
            historyIndex < history.length - 1
              ? history.slice(0, historyIndex + 1)
              : history;
          const updatedHistory = [...baseHistory, newRev];

          set({
            outputText: output,
            history: updatedHistory,
            historyIndex: updatedHistory.length - 1,
          });
        } else {
          set({ outputText: output });
        }
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIdx = historyIndex - 1;
          const rev = history[newIdx];
          set({
            inputText: rev.input,
            outputText: rev.output,
            tones: rev.tones,
            historyIndex: newIdx,
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIdx = historyIndex + 1;
          const rev = history[newIdx];
          set({
            inputText: rev.input,
            outputText: rev.output,
            tones: rev.tones,
            historyIndex: newIdx,
          });
        }
      },
      
      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: "tone-store", // localStorage key
    }
  )
);

export default useToneStore;
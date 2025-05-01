import React, { useCallback, useState } from "react";
import ToneChangerGrid from "./ToneChangerGrid";
import useToneStore, { Tone } from "../store/toneStore";
import { Undo2, Redo2, RefreshCw, Send, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';

const ToneController: React.FC = () => {
  const {
    inputText,
    outputText,
    tones,
    history,
    historyIndex,
    setInputText,
    setTones,
    setOutputText,
    undo,
    redo,
    reset
  } = useToneStore();

  const [isLoading, setIsLoading] = useState(false);
  const [pendingAdjustment, setPendingAdjustment] = useState(false);
  const [activeTab, setActiveTab] = useState("input");
  const [isUndoRedo, setIsUndoRedo] = useState(false);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleInputChange = useCallback(
    (text: string) => setInputText(text),
    [setInputText]
  );

  const handleToneChange = useCallback(
    (newTones: Tone[]) => {
      setTones(newTones);
      if (inputText.length > 3) {
        setPendingAdjustment(true);
      }
    },
    [setTones, inputText]
  );

  const adjustText = useCallback(async () => {
    if (inputText.length <= 3 || tones.length === 0) return;

    setIsLoading(true);
    setPendingAdjustment(false);
    setActiveTab("output");
    setIsUndoRedo(false);

    try {
      const resp = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, tones }),
      });

      if (!resp.ok) throw new Error(`Status ${resp.status}`);

      const { text: adjusted } = await resp.json();
      setOutputText(adjusted || "–");
      toast.success("Text tone adjusted successfully");
    } catch (err) {
      console.error("Tone API error:", err);
      setOutputText("Error adjusting tone");
      toast.error("Failed to adjust text tone");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, tones, setOutputText]);

  const handleUndo = () => {
    setIsUndoRedo(true);
    undo();
  };

  const handleRedo = () => {
    setIsUndoRedo(true);
    redo();
  };

  const getActiveTones = () => {
    return tones
      .filter(tone => tone.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .map(tone => ({
        name: tone.tone.charAt(0).toUpperCase() + tone.tone.slice(1),
        weight: Math.round(tone.weight * 100)
      }));
  };

  const activeTones = getActiveTones();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Left: Undo/Redo, Input & Output */}
      <Card className="flex flex-col h-full dark">
        <CardHeader className="space-y-0 pb-3 pt-4 px-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleUndo} disabled={!canUndo}>
                      <Undo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Undo</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={handleRedo} disabled={!canRedo}>
                      <Redo2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Redo</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={reset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reset everything</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-3 flex-grow flex flex-col">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col flex-grow"
          >
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="input">Input</TabsTrigger>
              <TabsTrigger value="output">Output</TabsTrigger>
            </TabsList>

            {activeTab === "input" && (
              <TabsContent value="input" className=" h-full flex flex-col flex-grow">
                <Textarea
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  disabled={isLoading}
                  className="flex-grow h-64 resize-none border border-slate-700 bg-slate-900 text-slate-100 rounded-md p-4"
                  placeholder="Enter text to adjust tone..."
                />
              </TabsContent>
            )}

            {activeTab === "output" && (
              <TabsContent
                value="output"
                className="h-full flex flex-col flex-grow !mt-0"
              >
                <div className="relative flex-grow h-64 p-4 border border-slate-700 bg-slate-900 text-slate-100 rounded-md overflow-auto">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
                      <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
                    </div>
                  ) : (
                    <ReactMarkdown>
                      {outputText}
                    </ReactMarkdown>
                  )}
                  {outputText && !isLoading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 opacity-60 hover:opacity-100"
                      onClick={() => copyToClipboard(outputText)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TabsContent>
            )}

          </Tabs>

        </CardContent>

        <CardFooter className="px-4 py-3 flex flex-col gap-3 border-t border-slate-800">
          <div className="flex flex-wrap h-8 gap-2 w-full">
            {activeTones.length > 0 ? (
              activeTones.map((tone, index) => (
                <Badge key={index} variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-200">
                  {tone.name} ({tone.weight}%)
                </Badge>
              ))
            ) : (
              <span className="text-sm text-slate-400">No tones selected</span>
            )}
          </div>

          <Button
            onClick={adjustText}
            disabled={isLoading || !pendingAdjustment || inputText.length <= 3 || tones.length === 0}
            className={`w-full ${pendingAdjustment ? 'animate-pulse bg-indigo-500 hover:bg-indigo-600' : ''}`}
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Adjusting...' : 'Adjust Text'}
          </Button>
        </CardFooter>
      </Card>

      {/* Right: Tone Picker */}
      <Card className="flex flex-col h-full dark">
        <CardHeader className="space-y-0 pb-3 pt-4 px-4">
          <h3 className="text-sm font-medium text-slate-200">Adjust Tone</h3>
        </CardHeader>

        <CardContent className="px-4 pb-0 flex-grow flex items-center justify-center">
          <ToneChangerGrid onToneChange={handleToneChange} />
        </CardContent>

        <CardFooter className="px-4 py-3  border-slate-800">
          <p className="text-xs text-center w-full text-slate-400">
            Drag the pointer to choose tone combinations or click center to reset tones
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ToneController;
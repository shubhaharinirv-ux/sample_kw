"use client";

import { useState, useEffect } from "react";
import { 
  Calculator, 
  Trash2, 
  Copy, 
  History, 
  RotateCcw, 
  Check, 
  Download, 
  Search,
  HelpCircle,
  Clock
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { pushToast } from "@/shared/lib/toast";

interface Calculation {
  id: string;
  formula: string;
  result: string;
  timestamp: Date;
}

export default function CalculatorPage() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<Calculation[]>(() => {
    const saved = localStorage.getItem("calculator_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [historySearch, setHistorySearch] = useState("");
  
  // Persist history to localStorage
  useEffect(() => {
    localStorage.setItem("calculator_history", JSON.stringify(history));
  }, [history]);

  // Safe expression evaluator
  const evaluateExpression = (expr: string): string => {
    try {
      // Replace custom operators with javascript equivalents
      let sanitized = expr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**");

      // Handle Square Roots: sqrt(x)
      // If we see √ followed by numbers/decimals, wrap them
      sanitized = sanitized.replace(/√(\d+(\.\d+)?)/g, "Math.sqrt($1)");

      // Basic security check: only allow numbers, math operators, decimals, parentheses, and Math functions
      if (/[^0-9+\-*/().\s*Math.sqrt]/g.test(sanitized)) {
        return "Error";
      }

      // Safe evaluation using Function
      // eslint-disable-next-line no-new-func
      const calcResult = new Function(`return (${sanitized})`)();
      
      if (calcResult === undefined || calcResult === null || isNaN(calcResult)) {
        return "Error";
      }
      
      if (!isFinite(calcResult)) {
        return "Cannot divide by zero";
      }

      // Format decimal places nicely
      const numResult = Number(calcResult);
      if (Number.isInteger(numResult)) {
        return numResult.toString();
      } else {
        // Limit to 8 decimal places max, trim trailing zeros
        return parseFloat(numResult.toFixed(8)).toString();
      }
    } catch (error) {
      return "Error";
    }
  };

  const handleKeyPress = (value: string) => {
    if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "⌫") {
      setInput((prev) => prev.slice(0, -1));
    } else if (value === "=") {
      if (!input) return;
      const finalResult = evaluateExpression(input);
      setResult(finalResult);
      
      if (finalResult !== "Error" && finalResult !== "Cannot divide by zero") {
        const newCalc: Calculation = {
          id: `calc-${Date.now()}`,
          formula: input,
          result: finalResult,
          timestamp: new Date()
        };
        setHistory((prev) => [newCalc, ...prev]);
        setInput(finalResult);
      } else {
        pushToast({
          title: "Calculation Error",
          description: `Invalid expression: ${input}`,
          variant: "error"
        });
      }
    } else if (value === "√") {
      // Add square root prefix
      setInput((prev) => prev + "√");
    } else {
      // Append number or operator
      setInput((prev) => prev + value);
    }
  };

  // Keyboard support listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      // Do not trigger key presses if the user is typing in a search/input field
      if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
        return;
      }

      const keyMap: Record<string, string> = {
        "0": "0", "1": "1", "2": "2", "3": "3", "4": "4",
        "5": "5", "6": "6", "7": "7", "8": "8", "9": "9",
        "+": "+", "-": "-", "*": "×", "/": "÷", ".": ".",
        "Enter": "=", "=": "=",
        "Backspace": "⌫",
        "Escape": "C",
        "^": "^",
        "%": "%"
      };

      if (e.key in keyMap) {
        e.preventDefault();
        handleKeyPress(keyMap[e.key]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [input]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    pushToast({
      title: "Copied!",
      description: "Result copied to clipboard",
      variant: "success"
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    pushToast({
      title: "Deleted",
      description: "Calculation history item removed",
      variant: "success"
    });
  };

  const clearAllHistory = () => {
    if (window.confirm("Are you sure you want to clear all calculation history?")) {
      setHistory([]);
      pushToast({
        title: "Cleared All",
        description: "Calculation history has been wiped",
        variant: "success"
      });
    }
  };

  const exportHistory = () => {
    if (history.length === 0) return;
    const content = history
      .map((h) => `[${h.timestamp.toLocaleString()}] ${h.formula} = ${h.result}`)
      .join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `calculator_history_${Date.now()}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reuseCalculation = (calc: Calculation) => {
    setInput(calc.formula);
    setResult(calc.result);
    pushToast({
      title: "Loaded formula",
      description: `Loaded: ${calc.formula}`,
      variant: "success"
    });
  };

  const filteredHistory = history.filter((item) =>
    item.formula.includes(historySearch) || item.result.includes(historySearch)
  );

  return (
    <div className="flex flex-col flex-1 h-screen bg-[#f6f7fb] py-3 mr-3 select-none">
      <div className="flex flex-1 bg-white rounded-md border border-[#E5E7EB] overflow-hidden h-full">
        
        {/* ─── LEFT PANEL (CALCULATION LOG HISTORY) ─── */}
        <aside className="w-[360px] border-r border-gray-200 flex flex-col justify-between bg-white shrink-0 select-none shadow-sm">
          <div className="flex flex-col flex-1 min-h-0">
            {/* Header */}
            <div className="p-4 border-b border-gray-150 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <History size={16} className="text-blue-500" />
                <span className="text-sm font-bold text-gray-800">Calculation Log</span>
              </div>
              
              {/* Search bar */}
              <div className="relative flex items-center bg-gray-100 rounded-lg px-2.5 py-1.5 w-full border border-transparent focus-within:border-gray-200">
                <Search className="text-gray-500 mr-2 shrink-0" size={12} />
                <input
                  type="text"
                  placeholder="Filter logs..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="bg-transparent outline-none text-xs w-full text-gray-700 placeholder-gray-500"
                />
              </div>

              {/* Log actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportHistory}
                  disabled={history.length === 0}
                  className="flex-1 text-[11px] h-7 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center gap-1"
                >
                  <Download size={12} />
                  <span>Export</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllHistory}
                  disabled={history.length === 0}
                  className="flex-1 text-[11px] h-7 text-red-600 bg-white hover:bg-red-50/50 border border-red-100 flex items-center justify-center gap-1"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fcfdfe]">
              {filteredHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 py-12">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-full mb-3 text-gray-400">
                    <History size={20} />
                  </div>
                  <h3 className="text-xs font-semibold text-gray-700">No logs</h3>
                  <p className="text-[10px] text-gray-400 max-w-[200px] mt-1">
                    Your calculated equations will stream here in real-time.
                  </p>
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <Card 
                    key={item.id} 
                    className="shadow-xs border border-gray-200 hover:border-blue-300 transition-all duration-200 group bg-white"
                  >
                    <CardContent className="p-3 flex items-center justify-between">
                      <div className="flex flex-col gap-1 min-w-0">
                        {/* Formula */}
                        <span className="text-[11px] text-gray-400 font-mono break-all">
                          {item.formula}
                        </span>
                        {/* Result */}
                        <span className="text-base font-bold text-gray-800 font-mono break-all flex items-center gap-1">
                          = {item.result}
                        </span>
                        {/* Timestamp */}
                        <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                          <Clock size={8} />
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Action buttons on card hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => reuseCalculation(item)}
                          className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Reload formula"
                        >
                          <RotateCcw size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(item.result, item.id)}
                          className="h-7 w-7 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50"
                          title="Copy result"
                        >
                          {copiedId === item.id ? (
                            <Check size={12} className="text-emerald-600" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteHistoryItem(item.id)}
                          className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-50"
                          title="Delete log"
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ─── MAIN PANEL (INTERACTIVE CALCULATOR) ─── */}
        <main className="flex-1 flex flex-col justify-center items-center bg-[#1e293b] text-white p-8 relative shadow-inner overflow-y-auto">
          {/* Decorative Background grid/glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.25),rgba(0,0,0,0))] pointer-events-none" />

          {/* Calculator Card Container */}
          <div className="w-[380px] flex flex-col gap-5 z-10">
            {/* Header title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600/20 text-[#3b82f6] flex items-center justify-center rounded-lg border border-blue-500/20">
                  <Calculator size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">Interactive Calculator</h2>
                  <p className="text-[10px] text-slate-400">Press keys or use keyboard shortcuts</p>
                </div>
              </div>
            </div>

            {/* Display screen */}
            <div className="bg-[#0f172a] rounded-2xl p-5 flex flex-col justify-end items-end h-[130px] shadow-inner border border-slate-800 break-all overflow-y-auto">
              <div className="text-slate-400 text-sm font-mono tracking-wider mb-1.5 min-h-[22px]">
                {input || "0"}
              </div>
              <div className="text-[#3b82f6] text-4xl font-bold font-mono tracking-tight">
                {result ? `= ${result}` : ""}
              </div>
            </div>

            {/* Buttons Grid */}
            <div className="grid grid-cols-4 gap-3 mt-1">
              {/* Row 1 */}
              <button
                onClick={() => handleKeyPress("C")}
                className="h-13 text-sm font-bold rounded-xl transition-all bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                C
              </button>
              <button
                onClick={() => handleKeyPress("(")}
                className="h-13 text-sm font-bold rounded-xl transition-all bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                (
              </button>
              <button
                onClick={() => handleKeyPress(")")}
                className="h-13 text-sm font-bold rounded-xl transition-all bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                )
              </button>
              <button
                onClick={() => handleKeyPress("÷")}
                className="h-13 text-lg font-bold rounded-xl transition-all bg-blue-600/80 hover:bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                ÷
              </button>

              {/* Row 2 */}
              <button
                onClick={() => handleKeyPress("7")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                7
              </button>
              <button
                onClick={() => handleKeyPress("8")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                8
              </button>
              <button
                onClick={() => handleKeyPress("9")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                9
              </button>
              <button
                onClick={() => handleKeyPress("×")}
                className="h-13 text-lg font-bold rounded-xl transition-all bg-blue-600/80 hover:bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                ×
              </button>

              {/* Row 3 */}
              <button
                onClick={() => handleKeyPress("4")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                4
              </button>
              <button
                onClick={() => handleKeyPress("5")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                5
              </button>
              <button
                onClick={() => handleKeyPress("6")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                6
              </button>
              <button
                onClick={() => handleKeyPress("-")}
                className="h-13 text-lg font-bold rounded-xl transition-all bg-blue-600/80 hover:bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                -
              </button>

              {/* Row 4 */}
              <button
                onClick={() => handleKeyPress("1")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                1
              </button>
              <button
                onClick={() => handleKeyPress("2")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                2
              </button>
              <button
                onClick={() => handleKeyPress("3")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                3
              </button>
              <button
                onClick={() => handleKeyPress("+")}
                className="h-13 text-lg font-bold rounded-xl transition-all bg-blue-600/80 hover:bg-blue-600 text-white shadow-md shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
              >
                +
              </button>

              {/* Row 5 */}
              <button
                onClick={() => handleKeyPress("0")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 col-span-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                0
              </button>
              <button
                onClick={() => handleKeyPress(".")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                .
              </button>
              <button
                onClick={() => handleKeyPress("⌫")}
                className="h-13 text-sm font-bold rounded-xl transition-all bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                ⌫
              </button>

              {/* Row 6 */}
              <button
                onClick={() => handleKeyPress("√")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                √
              </button>
              <button
                onClick={() => handleKeyPress("^")}
                className="h-13 text-base font-semibold rounded-xl transition-all bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                xʸ
              </button>
              <button
                onClick={() => handleKeyPress("=")}
                className="h-13 text-lg font-bold rounded-xl transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 col-span-2 hover:scale-[1.01] active:scale-[0.99]"
              >
                =
              </button>
            </div>

            {/* Quick Help Card */}
            <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30 text-xs text-slate-400 space-y-1 leading-relaxed mt-2">
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
                <HelpCircle className="h-4 w-4 text-blue-400" />
                <span>Keyboard Guide</span>
              </div>
              <p>• Digits, decimals, and operators work directly from your keyboard.</p>
              <p>• Press <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white text-[10px]">Enter</code> for equals, and <code className="bg-slate-900 px-1.5 py-0.5 rounded text-white text-[10px]">Esc</code> to clear.</p>
            </div>
          </div>
        </main>

      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";

const WORD_LIST = ["cigar","rebut","sissy","humph","awake","blush","focal","evoke","expat","extol","exude","eyrie","fable","facet","faint","fairy","faith","false","farce","fatal","fatty","fault","fauna","favor","feast","feats","fecal","fence","ferns","ferry","fetal","fetch","fetid","fetus","feuds","fever","fewer","fiber","fibre","ficus","field","fiend","fiery","fifes","fifth","fifty","fight","filch","filed","filer","files","filet","fille","filly","films","filmy","filth","final","finch","fined","finer","fines","finis","finite","finks","fiord","fired","fires","firms","first","fishy","fists","fitly","fiver","fives","fixed","fixer","fixes","fizzy","fjord","flack","flags","flail","flair","flake","flaky","flame","flank","flaps","flare","flash","flask","flats","flaws","fleck","flees","fleet","flesh","flick","flied","flier","flies","fling","flint","flips","flirt","float","flock","floes","flogs","flood","floof","floor","flops","flora","floss","flour","flout","flows","flubs","flues","fluff","fluid","fluke","fluky","flume","flung","flush","flute","foals","foams","foamy","focal","focus","fogey","foggy","foils","foist","folds","foley","folks","folly","fonts","foods","fools","foray","force","fords","fores","forge","forgo","forks","forte","forth","forts","forty","forum","fosse","fouls","found","fours","fowls","foxed","foxes","foyer","frail","frame","frank","fraud","frays","freak","freed","freer","frees","friar","fried","frier","fries","frill","frisk","frizz","frock","frogs","frond","front","frost","froth","frown","froze","fruit","frump","fryer","fudge","fuels","fugue","fully","fumed","fumes","funds","fungi","funks","funny","furor","furry","fused","fuses","fussy","fusty","fuzzy"];

const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

type LetterState = "default" | "miss" | "close" | "hit";

export default function WordleHintsPage() {
  const [letters, setLetters] = useState<Array<Array<{ value: string; state: LetterState }>>>([
    Array(5).fill(null).map(() => ({ value: "", state: "default" })),
    Array(5).fill(null).map(() => ({ value: "", state: "default" })),
    Array(5).fill(null).map(() => ({ value: "", state: "default" })),
    Array(5).fill(null).map(() => ({ value: "", state: "default" })),
    Array(5).fill(null).map(() => ({ value: "", state: "default" })),
    Array(5).fill(null).map(() => ({ value: "", state: "default" })),
  ]);
  const [results, setResults] = useState<{
    matches: string[];
    letterCounts: Array<{ letter: string; count: number }>;
  } | null>(null);

  const inputRefs = useRef<Array<Array<HTMLInputElement | null>>>([
    Array(5).fill(null),
    Array(5).fill(null),
    Array(5).fill(null),
    Array(5).fill(null),
    Array(5).fill(null),
    Array(5).fill(null),
  ]);

  const handleLetterChange = (rowIdx: number, colIdx: number, value: string) => {
    const upper = value.toUpperCase().slice(-1);
    if (upper && !/[A-Z]/.test(upper)) return;

    const newLetters = letters.map((row) => [...row]);
    newLetters[rowIdx][colIdx].value = upper;

    // Auto-check for matching letters in other rows
    if (upper) {
      for (let r = 0; r < newLetters.length; r++) {
        for (let c = 0; c < newLetters[r].length; c++) {
          if (r === rowIdx && c === colIdx) continue;
          if (newLetters[r][c].value === upper) {
            const sourceState = newLetters[r][c].state;
            if (sourceState === "hit") {
              if (c === colIdx) {
                newLetters[rowIdx][colIdx].state = "hit";
              } else {
                newLetters[rowIdx][colIdx].state = "close";
              }
              break;
            } else if (sourceState === "close") {
              newLetters[rowIdx][colIdx].state = "close";
              break;
            }
          }
        }
      }
    }

    setLetters(newLetters);

    // Move to next input
    if (upper && colIdx < 4) {
      inputRefs.current[rowIdx]?.[colIdx + 1]?.focus();
    }
  };

  const handleLetterClick = (rowIdx: number, colIdx: number) => {
    if (!letters[rowIdx][colIdx].value) return;

    const newLetters = letters.map((row) => [...row]);
    const currentState = newLetters[rowIdx][colIdx].state;
    const states: LetterState[] = ["default", "miss", "close", "hit"];
    const nextIdx = (states.indexOf(currentState) + 1) % states.length;
    newLetters[rowIdx][colIdx].state = states[nextIdx];

    setLetters(newLetters);
  };

  const findWords = () => {
    let filtered = WORD_LIST;

    for (let rowIdx = 0; rowIdx < 6; rowIdx++) {
      for (let colIdx = 0; colIdx < 5; colIdx++) {
        const letter = letters[rowIdx][colIdx].value.toLowerCase();
        const state = letters[rowIdx][colIdx].state;

        if (!letter) continue;

        if (state === "hit") {
          filtered = filtered.filter((word) => word[colIdx] === letter);
        } else if (state === "close") {
          filtered = filtered.filter(
            (word) => word.includes(letter) && word[colIdx] !== letter
          );
        } else if (state === "miss") {
          filtered = filtered.filter((word) => !word.includes(letter));
        }
      }
    }

    // Count letter occurrences
    const letterCounts: { [key: string]: number } = {};
    ALPHABET.forEach((letter) => {
      letterCounts[letter] = 0;
    });

    filtered.forEach((word) => {
      word.split("").forEach((letter) => {
        letterCounts[letter]++;
      });
    });

    const sortedLetters = Object.entries(letterCounts)
      .map(([letter, count]) => ({ letter, count }))
      .sort((a, b) => b.count - a.count);

    setResults({
      matches: filtered,
      letterCounts: sortedLetters.filter((l) => l.count > 0),
    });
  };

  const reset = () => {
    setLetters([
      Array(5).fill(null).map(() => ({ value: "", state: "default" })),
      Array(5).fill(null).map(() => ({ value: "", state: "default" })),
      Array(5).fill(null).map(() => ({ value: "", state: "default" })),
      Array(5).fill(null).map(() => ({ value: "", state: "default" })),
      Array(5).fill(null).map(() => ({ value: "", state: "default" })),
      Array(5).fill(null).map(() => ({ value: "", state: "default" })),
    ]);
    setResults(null);
    inputRefs.current[0]?.[0]?.focus();
  };

  const getStateColor = (state: LetterState): string => {
    switch (state) {
      case "hit":
        return "bg-green-600 text-white";
      case "close":
        return "bg-yellow-500 text-white";
      case "miss":
        return "bg-gray-600 text-white";
      default:
        return "bg-white text-gray-900 border border-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">
          Wordle Hints
        </h1>
        <p className="text-gray-600">
          Track your guesses and find matching words. Mark letters as correct
          (green), in wrong position (yellow), or not in word (gray).
        </p>
      </div>

      <div className="bg-white border border-gray-200 p-6 sm:p-8">
        <div className="space-y-4">
          {/* Input Grid */}
          <div className="space-y-2">
            {letters.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-2 justify-center">
                {row.map((cell, colIdx) => (
                  <input
                    key={`${rowIdx}-${colIdx}`}
                    ref={(el) => {
                      if (inputRefs.current[rowIdx]) {
                        inputRefs.current[rowIdx][colIdx] = el;
                      }
                    }}
                    type="text"
                    maxLength={1}
                    value={cell.value}
                    onChange={(e) =>
                      handleLetterChange(rowIdx, colIdx, e.target.value)
                    }
                    onClick={() => handleLetterClick(rowIdx, colIdx)}
                    onBlur={(e) => {
                      if (!e.target.value) {
                        const newLetters = letters.map((r) => [...r]);
                        newLetters[rowIdx][colIdx].state = "default";
                        setLetters(newLetters);
                      }
                    }}
                    className={`w-12 h-12 text-center font-bold text-lg uppercase cursor-pointer ${getStateColor(
                      cell.state
                    )} hover:shadow-md transition-shadow`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center pt-4">
            <button
              onClick={findWords}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
            >
              Find Words
            </button>
            <button
              onClick={reset}
              className="px-6 py-2 bg-gray-300 text-gray-900 font-medium rounded hover:bg-gray-400 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="mt-8 space-y-6 border-t border-gray-200 pt-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Match Count:{" "}
                <span className="text-2xl text-green-600">
                  {results.matches.length}
                </span>
              </h2>
            </div>

            {results.letterCounts.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Letter Occurrences
                </h3>
                <div className="flex flex-wrap gap-2">
                  {results.letterCounts.map((item) => (
                    <span
                      key={item.letter}
                      className="px-3 py-1 bg-blue-100 text-blue-900 rounded text-sm font-medium"
                    >
                      {item.letter.toUpperCase()} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.matches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Word Matches
                </h3>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                  {results.matches.map((word) => (
                    <span
                      key={word}
                      className="px-3 py-1 bg-cyan-100 text-cyan-900 rounded text-sm font-medium"
                    >
                      {word.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {results.matches.length === 0 && (
              <div className="p-4 bg-yellow-100 text-yellow-900 rounded">
                No matching words found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 p-6 rounded space-y-3">
        <h3 className="font-semibold text-gray-900">How to use:</h3>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Enter letters from your Wordle attempts in the grid</li>
          <li>Click a letter to cycle through states (correct, wrong position, not in word)</li>
          <li>Green = correct position, Yellow = in word but wrong position, Gray = not in word</li>
          <li>Click "Find Words" to see matching words</li>
        </ul>
      </div>
    </div>
  );
}

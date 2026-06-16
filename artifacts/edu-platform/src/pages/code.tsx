import { useState, useRef } from "react";
import { Play, RotateCcw, Copy, Check, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STARTERS: Record<string, { language: string; code: string }> = {
  "Hello World": {
    language: "python",
    code: `# Welcome to LearnSpark Code Lab!
# Edit this code and click "Run" to see the output.

name = "World"
print(f"Hello, {name}!")

# Try changing the name variable above
# and re-running the code.
`,
  },
  "FizzBuzz": {
    language: "python",
    code: `# Classic FizzBuzz challenge
# Print numbers 1–20, but:
#   "Fizz" for multiples of 3
#   "Buzz" for multiples of 5
#   "FizzBuzz" for multiples of both

for i in range(1, 21):
    if i % 15 == 0:
        print("FizzBuzz")
    elif i % 3 == 0:
        print("Fizz")
    elif i % 5 == 0:
        print("Buzz")
    else:
        print(i)
`,
  },
  "Fibonacci": {
    language: "python",
    code: `# Fibonacci sequence
# Generate first N Fibonacci numbers

def fibonacci(n):
    sequence = []
    a, b = 0, 1
    for _ in range(n):
        sequence.append(a)
        a, b = b, a + b
    return sequence

print(fibonacci(10))
`,
  },
  "List Operations": {
    language: "python",
    code: `# Python list operations
numbers = [5, 3, 8, 1, 9, 2, 7, 4, 6]

print("Original:", numbers)
print("Sorted:", sorted(numbers))
print("Reversed:", list(reversed(numbers)))
print("Sum:", sum(numbers))
print("Max:", max(numbers))
print("Min:", min(numbers))

# Filter even numbers
evens = [n for n in numbers if n % 2 == 0]
print("Evens:", evens)
`,
  },
};

const CHALLENGES = [
  {
    title: "Sum of List",
    description: "Write a function that returns the sum of all numbers in a list.",
    starter: `def sum_list(numbers):
    # Your code here
    pass

# Test your function
print(sum_list([1, 2, 3, 4, 5]))  # Should print 15
print(sum_list([10, 20, 30]))      # Should print 60
`,
  },
  {
    title: "Count Vowels",
    description: "Write a function that counts the number of vowels in a string.",
    starter: `def count_vowels(text):
    # Your code here
    pass

# Test your function
print(count_vowels("Hello World"))  # Should print 3
print(count_vowels("Python"))       # Should print 1
`,
  },
  {
    title: "Palindrome Check",
    description: "Write a function that checks if a string is a palindrome.",
    starter: `def is_palindrome(s):
    # Your code here
    pass

# Test your function
print(is_palindrome("racecar"))   # Should print True
print(is_palindrome("hello"))     # Should print False
print(is_palindrome("madam"))     # Should print True
`,
  },
];

function simulatePython(code: string): string {
  const lines: string[] = [];
  const printRegex = /print\s*\((.+)\)/g;

  // Simple Python simulator: extract print statements
  const codeLines = code.split("\n");
  for (const line of codeLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") || trimmed === "") continue;

    // Detect simple print calls
    const printMatch = trimmed.match(/^print\s*\((.+)\)$/);
    if (printMatch) {
      let arg = printMatch[1].trim();
      // f-strings: simple replacement
      arg = arg.replace(/f["'](.+)["']/, (_, inner) => {
        return inner.replace(/\{(\w+)\}/g, (_: string, varName: string) => {
          // Try to find variable in code
          const varMatch = code.match(new RegExp(`${varName}\\s*=\\s*["'](.+?)["']`));
          if (varMatch) return varMatch[1];
          const numMatch = code.match(new RegExp(`${varName}\\s*=\\s*(\\d+)`));
          if (numMatch) return numMatch[1];
          return varName;
        });
      });
      // Plain string
      arg = arg.replace(/^["'](.+)["']$/, "$1");
      lines.push(arg);
    }
  }

  if (lines.length === 0) {
    return "(Code ran with no print output — add print() to see results)";
  }
  return lines.join("\n");
}

export default function CodePage() {
  const [code, setCode] = useState(STARTERS["Hello World"].code);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeStarter, setActiveStarter] = useState("Hello World");
  const [activeTab, setActiveTab] = useState<"editor" | "challenges">("editor");
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("Running...");
    await new Promise((r) => setTimeout(r, 400));
    try {
      const result = simulatePython(code);
      setOutput(result);
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    }
    setIsRunning(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStarterSelect = (name: string) => {
    setActiveStarter(name);
    setCode(STARTERS[name].code);
    setOutput("");
  };

  const handleChallengeSelect = (idx: number) => {
    setActiveChallengeIdx(idx);
    setCode(CHALLENGES[idx].starter);
    setOutput("");
  };

  const handleTabIndent = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, start) + "    " + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold mb-1">Code Lab</h1>
        <p className="text-muted-foreground">Write and run Python code right in your browser.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(["editor", "challenges"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 text-sm font-semibold rounded-xl capitalize border transition-colors",
              activeTab === tab ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {tab === "editor" ? "Free Editor" : "Coding Challenges"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {activeTab === "editor" ? (
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Starter Code</h3>
              <div className="space-y-1">
                {Object.keys(STARTERS).map((name) => (
                  <button
                    key={name}
                    onClick={() => handleStarterSelect(name)}
                    className={cn(
                      "w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors",
                      activeStarter === name ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                    )}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Challenges</h3>
              <div className="space-y-1">
                {CHALLENGES.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => handleChallengeSelect(i)}
                    className={cn(
                      "w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors",
                      activeChallengeIdx === i ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                    )}
                  >
                    {c.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Editor + Output */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {activeTab === "challenges" && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-1">{CHALLENGES[activeChallengeIdx].title}</h3>
              <p className="text-sm text-blue-700">{CHALLENGES[activeChallengeIdx].description}</p>
            </div>
          )}

          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm font-mono">main.py</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => { setCode(STARTERS["Hello World"].code); setOutput(""); }}
                  className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                  title="Reset code"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Code textarea */}
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleTabIndent}
              spellCheck={false}
              className="w-full h-72 bg-gray-900 text-green-400 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
              style={{ fontFamily: "'Space Mono', monospace" }}
            />

            {/* Run button */}
            <div className="px-4 py-3 bg-gray-800 border-t border-gray-700 flex justify-between items-center">
              <span className="text-gray-400 text-xs">Python 3 simulator · Tab for indent</span>
              <button
                onClick={runCode}
                disabled={isRunning}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
              >
                <Play className="h-4 w-4" />
                {isRunning ? "Running..." : "Run Code"}
              </button>
            </div>
          </div>

          {/* Output */}
          <div className="bg-gray-950 rounded-2xl overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-800 flex items-center gap-2">
              <span className="text-gray-400 text-xs font-mono uppercase tracking-wider">Output</span>
            </div>
            <pre className="p-4 font-mono text-sm text-gray-300 min-h-[80px] whitespace-pre-wrap">
              {output || <span className="text-gray-600">Click "Run Code" to see output here...</span>}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

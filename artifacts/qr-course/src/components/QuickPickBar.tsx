import { useMemo } from "react";

const FAMILIES: string[][] = [
  ["=", "≠", "≈", "≡", "≅", "≜", "∝"],
  ["<", ">", "≤", "≥", "≪", "≫"],
  ["±", "∓", "·", "×", "÷", "√", "∛", "∜"],
  ["²", "³", "ⁿ", "⁰", "¹", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"],
  ["₀", "₁", "₂", "₃", "ₙ", "ₜ", "ₓ", "ᵧ"],
  ["Σ", "Π", "∑", "∏"],
  ["Δ", "δ", "∇", "∂"],
  ["∫", "∬", "∭", "∮"],
  ["lim", "→", "↦", "∞"],
  ["e", "ln", "log"],
  ["μ", "σ", "σ²", "x̄", "p̂", "s"],
  ["P(A)", "P(A|B)", "E(X)", "Var(X)"],
  ["X ∼ N(μ,σ²)", "z", "t", "χ²", "α", "β"],
  ["→", "↔", "⇒", "⇔"],
  ["¬", "∧", "∨", "⊕", "⊤", "⊥"],
  ["∀", "∃", "∄", "∴", "∵"],
  ["∈", "∉", "⊂", "⊆", "⊄", "⊇", "⊊"],
  ["∪", "∩", "∅", "∖", "Aᶜ"],
  ["ℕ", "ℤ", "ℚ", "ℝ", "ℂ", "𝔽"],
  ["π", "θ", "φ", "λ", "ω", "γ", "ε", "ρ", "τ", "η"],
  ["|x|", "n!", "⌊x⌋", "⌈x⌉", "mod"],
];

const TOKEN_REGEX = /(P\(A\|B\)|P\(A\)|E\(X\)|Var\(X\)|σ²|x̄|p̂|Aᶜ|X ∼ N\(μ,σ²\)|[^\x00-\x7F]|[<>≤≥≠≈≡=±∓·×÷√∛∜∞])/gu;

function harvest(source: string): string[] {
  if (!source) return [];
  const found = new Set<string>();
  const m = source.match(TOKEN_REGEX);
  if (m) m.forEach((s) => found.add(s));

  // Expand each match to its full family
  const expanded = new Set<string>(found);
  for (const fam of FAMILIES) {
    if (fam.some((sym) => found.has(sym))) {
      fam.forEach((sym) => expanded.add(sym));
    }
  }

  // Preserve a stable order: family-by-family, then any leftover originals
  const order: string[] = [];
  const seen = new Set<string>();
  for (const fam of FAMILIES) {
    for (const sym of fam) {
      if (expanded.has(sym) && !seen.has(sym)) {
        order.push(sym);
        seen.add(sym);
      }
    }
  }
  for (const sym of expanded) {
    if (!seen.has(sym)) {
      order.push(sym);
      seen.add(sym);
    }
  }
  return order;
}

interface QuickPickBarProps {
  source: string;
  onInsert: (symbol: string) => void;
}

export function QuickPickBar({ source, onInsert }: QuickPickBarProps) {
  const symbols = useMemo(() => harvest(source), [source]);
  if (symbols.length === 0) return null;
  return (
    <div className="bg-primary/5 border border-primary/30 rounded-md p-2 flex flex-col gap-1.5">
      <div className="text-[10px] uppercase tracking-wider text-primary/80 font-semibold px-1">
        Symbols for this question — click to insert
      </div>
      <div className="flex flex-wrap gap-1.5">
        {symbols.map((sym, i) => (
          <button
            key={`${sym}-${i}`}
            type="button"
            onClick={() => onInsert(sym)}
            className="min-w-9 h-10 px-2.5 rounded border border-primary/40 bg-white shadow-sm flex items-center justify-center font-mono text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all active:scale-95"
            data-testid={`quickpick-${sym}`}
          >
            {sym}
          </button>
        ))}
      </div>
    </div>
  );
}

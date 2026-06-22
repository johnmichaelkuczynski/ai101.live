interface MultipleChoiceProps {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function MultipleChoice({ options, value, onChange, disabled }: MultipleChoiceProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt, idx) => {
        const selected = value === opt;
        return (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            data-testid={`mc-option-${idx}`}
            className={`flex items-start gap-3 text-left p-4 rounded-md border transition-colors ${
              selected
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-input bg-card hover:bg-secondary"
            } ${disabled ? "opacity-70 cursor-default" : "cursor-pointer"}`}
          >
            <span
              className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold ${
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {LETTERS[idx] ?? idx + 1}
            </span>
            <span className="text-base leading-relaxed pt-0.5">{opt}</span>
          </button>
        );
      })}
    </div>
  );
}

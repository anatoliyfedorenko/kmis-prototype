import { useState, useRef, useEffect } from 'react';

interface Props {
  label: string;
  options: string[];
  selected: string[];
  onChange: (vals: string[]) => void;
}

export default function MultiSelect({ label, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-3 py-2 border border-gray-300 rounded bg-white text-sm min-h-[44px] flex items-center justify-between hover:border-gray-400"
        aria-expanded={open}
        aria-label={label}
      >
        <span className="truncate">
          {selected.length === 0 ? label : `${label} (${selected.length})`}
        </span>
        <span className="ml-2 text-gray-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
          {options.map(opt => (
            <label key={opt} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="mr-2 h-4 w-4"
              />
              {opt}
            </label>
          ))}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-2 text-xs text-blue-600 hover:bg-blue-50 border-t border-gray-100"
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}

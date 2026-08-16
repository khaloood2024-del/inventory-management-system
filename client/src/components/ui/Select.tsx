import { Select as BaseSelect } from "@base-ui/react/select";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

export function AppSelect({ value, onChange, options, placeholder, className }: AppSelectProps) {
  return (
    <BaseSelect.Root value={value} onValueChange={(v) => onChange(v as string)}>
      <BaseSelect.Trigger
        className={`flex items-center justify-between gap-2 rounded-full border border-card-border bg-card px-4 py-2.5 text-sm font-medium text-ink outline-none focus:border-primary-400 ${className ?? ""}`}
      >
        <BaseSelect.Value placeholder={placeholder}>
          {(v: string) => options.find((opt) => opt.value === v)?.label ?? placeholder}
        </BaseSelect.Value>
        <BaseSelect.Icon>
          <ChevronDown size={16} className="text-ink-muted" />
        </BaseSelect.Icon>
      </BaseSelect.Trigger>
      <BaseSelect.Portal>
        <BaseSelect.Positioner className="z-50" sideOffset={4}>
          <BaseSelect.Popup className="max-h-64 overflow-y-auto rounded-2xl border border-card-border bg-card p-1.5 outline-none min-w-[var(--anchor-width)]">
            <BaseSelect.List>
              {options.map((opt) => (
                <BaseSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-pointer items-center justify-between gap-2 rounded-full px-3 py-2 text-sm text-ink outline-none data-[highlighted]:bg-sidebar-hover"
                >
                  <BaseSelect.ItemText>{opt.label}</BaseSelect.ItemText>
                  <BaseSelect.ItemIndicator>
                    <Check size={14} className="text-primary-500" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}

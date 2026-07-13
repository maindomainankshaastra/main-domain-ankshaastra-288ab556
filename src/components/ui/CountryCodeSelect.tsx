import { useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export type Country = { name: string; code: string; dial: string; flag: string };

// Curated list of commonly used country dial codes
export const countries: Country[] = [
  { name: "India", code: "IN", dial: "+91", flag: "🇮🇳" },
  { name: "United States", code: "US", dial: "+1", flag: "🇺🇸" },
  { name: "United Kingdom", code: "GB", dial: "+44", flag: "🇬🇧" },
  { name: "United Arab Emirates", code: "AE", dial: "+971", flag: "🇦🇪" },
  { name: "Canada", code: "CA", dial: "+1", flag: "🇨🇦" },
  { name: "Australia", code: "AU", dial: "+61", flag: "🇦🇺" },
  { name: "Singapore", code: "SG", dial: "+65", flag: "🇸🇬" },
  { name: "Saudi Arabia", code: "SA", dial: "+966", flag: "🇸🇦" },
  { name: "Qatar", code: "QA", dial: "+974", flag: "🇶🇦" },
  { name: "Kuwait", code: "KW", dial: "+965", flag: "🇰🇼" },
  { name: "Oman", code: "OM", dial: "+968", flag: "🇴🇲" },
  { name: "Bahrain", code: "BH", dial: "+973", flag: "🇧🇭" },
  { name: "Germany", code: "DE", dial: "+49", flag: "🇩🇪" },
  { name: "France", code: "FR", dial: "+33", flag: "🇫🇷" },
  { name: "Italy", code: "IT", dial: "+39", flag: "🇮🇹" },
  { name: "Spain", code: "ES", dial: "+34", flag: "🇪🇸" },
  { name: "Netherlands", code: "NL", dial: "+31", flag: "🇳🇱" },
  { name: "Switzerland", code: "CH", dial: "+41", flag: "🇨🇭" },
  { name: "Sweden", code: "SE", dial: "+46", flag: "🇸🇪" },
  { name: "Ireland", code: "IE", dial: "+353", flag: "🇮🇪" },
  { name: "New Zealand", code: "NZ", dial: "+64", flag: "🇳🇿" },
  { name: "South Africa", code: "ZA", dial: "+27", flag: "🇿🇦" },
  { name: "Nigeria", code: "NG", dial: "+234", flag: "🇳🇬" },
  { name: "Kenya", code: "KE", dial: "+254", flag: "🇰🇪" },
  { name: "Japan", code: "JP", dial: "+81", flag: "🇯🇵" },
  { name: "South Korea", code: "KR", dial: "+82", flag: "🇰🇷" },
  { name: "China", code: "CN", dial: "+86", flag: "🇨🇳" },
  { name: "Hong Kong", code: "HK", dial: "+852", flag: "🇭🇰" },
  { name: "Malaysia", code: "MY", dial: "+60", flag: "🇲🇾" },
  { name: "Indonesia", code: "ID", dial: "+62", flag: "🇮🇩" },
  { name: "Philippines", code: "PH", dial: "+63", flag: "🇵🇭" },
  { name: "Thailand", code: "TH", dial: "+66", flag: "🇹🇭" },
  { name: "Vietnam", code: "VN", dial: "+84", flag: "🇻🇳" },
  { name: "Bangladesh", code: "BD", dial: "+880", flag: "🇧🇩" },
  { name: "Pakistan", code: "PK", dial: "+92", flag: "🇵🇰" },
  { name: "Sri Lanka", code: "LK", dial: "+94", flag: "🇱🇰" },
  { name: "Nepal", code: "NP", dial: "+977", flag: "🇳🇵" },
  { name: "Brazil", code: "BR", dial: "+55", flag: "🇧🇷" },
  { name: "Mexico", code: "MX", dial: "+52", flag: "🇲🇽" },
  { name: "Argentina", code: "AR", dial: "+54", flag: "🇦🇷" },
];

interface Props {
  value: string; // dial code e.g. "+91"
  onChange: (dial: string) => void;
}

const CountryCodeSelect = ({ value, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const selected = countries.find((c) => c.dial === value) || countries[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3 text-sm hover:bg-accent transition shrink-0"
        >
          <span className="text-base leading-none">{selected.flag}</span>
          <span className="font-medium">{selected.dial}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 opacity-50 mr-2" />
            <CommandInput placeholder="Search country..." className="border-0 focus:ring-0 h-10" />
          </div>
          <CommandList className="max-h-64">
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  value={`${c.name} ${c.dial}`}
                  onSelect={() => {
                    onChange(c.dial);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-base">{c.flag}</span>
                  <span className="flex-1 truncate">{c.name}</span>
                  <span className="text-muted-foreground text-xs">{c.dial}</span>
                  <Check className={cn("h-4 w-4 ml-1", selected.dial === c.dial ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryCodeSelect;
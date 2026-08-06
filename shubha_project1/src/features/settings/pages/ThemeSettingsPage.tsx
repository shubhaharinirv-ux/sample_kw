import React from "react";
import { SunMedium, MoonStar, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useTheme, Theme } from "@/shared/context/ThemeProvider";

type ThemeOption = {
  id: Theme;
  title: string;
  description: string;
  icon: React.ReactNode;
  swatches: string[];
  note: string;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light",
    title: "Light",
    description: "Bright, default layout ideal for well-lit environments.",
    icon: <SunMedium className="h-5 w-5 text-amber-500" aria-hidden />,
    swatches: ["#ffffff", "#f3f4f6", "#111827"],
    note: "Keeps the classic Kalai look with airy surfaces and crisp borders.",
  },
  {
    id: "dark",
    title: "Dim",
    description: "Soft bluish-gray dark theme on #1E1E2A for low-glare viewing.",
    icon: <MoonStar className="h-5 w-5 text-sky-300" aria-hidden />,
    swatches: ["#1E1E2A", "#252737", "#E5E7EB"],
    note: "Comfortable contrast for long sessions—overlays and cards stay readable.",
  },
];

export default function ThemeSettingsPage() {
  const { theme, setTheme, toggleTheme } = useTheme();

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Personalization
            </p>
            <h1 className="text-2xl font-semibold">Theme</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Switch between the default light look and the new Dim theme built on #1E1E2A with high
              readability.
            </p>
          </div>
          <Button variant="outline" onClick={toggleTheme} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Quick toggle
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {THEME_OPTIONS.map((option) => {
            const isActive = theme === option.id;
            return (
              <Card
                key={option.id}
                className={cn(
                  "h-full border transition-shadow",
                  isActive ? "border-primary ring-2 ring-primary/60 shadow-md" : "border-border"
                )}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <span className="inline-flex items-center justify-center rounded-lg bg-muted px-2.5 py-1">
                        {option.icon}
                      </span>
                      {option.title}
                    </CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-semibold border",
                      isActive
                        ? "bg-primary/10 text-primary border-primary/60"
                        : "bg-muted text-muted-foreground border-border"
                    )}
                  >
                    {isActive ? "Active" : "Available"}
                  </span>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2" aria-label={`${option.title} color preview`}>
                    {option.swatches.map((swatch) => (
                      <span
                        key={swatch}
                        className="size-9 rounded-lg border border-border shadow-xs"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.note}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {option.id === "dark"
                        ? "Dim keeps overlays, dialogs, tables, and buttons legible with soft contrast."
                        : "Light stays bright with the existing neutral surfaces and blue accents."}
                    </div>
                    <Button
                      variant={isActive ? "default" : "outline"}
                      onClick={() => setTheme(option.id)}
                      aria-pressed={isActive}
                    >
                      Use {option.title}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

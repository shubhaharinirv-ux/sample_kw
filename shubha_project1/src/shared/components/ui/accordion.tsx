import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/lib/utils"

interface AccordionContextValue {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

const AccordionContext = React.createContext<AccordionContextValue>({})

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children: React.ReactNode
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ className, type = "single", value, onValueChange, children, ...props }, ref) => {
    return (
      <AccordionContext.Provider value={{ type, value, onValueChange }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props}>
          {children}
        </div>
      </AccordionContext.Provider>
    )
  }
)
Accordion.displayName = "Accordion"

interface AccordionItemContextValue {
  isOpen: boolean
  toggle: () => void
}

const AccordionItemContext = React.createContext<AccordionItemContextValue>({
  isOpen: false,
  toggle: () => {},
})

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const { type, value: contextValue, onValueChange } = React.useContext(AccordionContext)

    const isOpen = React.useMemo(() => {
      if (type === "multiple" && Array.isArray(contextValue)) {
        return contextValue.includes(value)
      }
      return contextValue === value
    }, [type, contextValue, value])

    const toggle = React.useCallback(() => {
      if (type === "multiple" && Array.isArray(contextValue)) {
        const newValue = isOpen
          ? contextValue.filter((v) => v !== value)
          : [...contextValue, value]
        onValueChange?.(newValue)
      } else {
        onValueChange?.(isOpen ? "" : value)
      }
    }, [type, contextValue, isOpen, value, onValueChange])

    return (
      <AccordionItemContext.Provider value={{ isOpen, toggle }}>
        <div ref={ref} className={cn("border-b", className)} {...props}>
          {children}
        </div>
      </AccordionItemContext.Provider>
    )
  }
)
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen, toggle } = React.useContext(AccordionItemContext)

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline text-left w-full",
          className
        )}
        onClick={toggle}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
    )
  }
)
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AccordionContent = React.forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, ...props }, ref) => {
    const { isOpen } = React.useContext(AccordionItemContext)

    if (!isOpen) return null

    return (
      <div ref={ref} className={cn("pb-4 pt-0 text-sm", className)} {...props}>
        {children}
      </div>
    )
  }
)
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }

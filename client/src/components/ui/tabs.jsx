import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef(({ className, defaultValue, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <div
      ref={ref}
      data-active={activeTab}
      className={cn("w-full", className)}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { activeTab, setActiveTab })
        }
        return child
      })}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, activeTab, setActiveTab, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500",
      className
    )}
    {...props}
  >
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { activeTab, setActiveTab })
      }
      return child
    })}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, activeTab, setActiveTab, children, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={() => setActiveTab(value)}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      activeTab === value 
        ? "bg-white text-slate-950 shadow-sm" 
        : "hover:bg-slate-200/50 hover:text-slate-900",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, activeTab, children, ...props }, ref) => {
  if (value !== activeTab) return null

  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 animate-in fade-in zoom-in-95 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
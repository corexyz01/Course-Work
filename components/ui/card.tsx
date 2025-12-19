import * as React from "react";
import { cn } from "../../lib/cn";

export function Card(props: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-zinc-200 bg-white shadow-sm", props.className)}>{props.children}</div>;
}

export function CardHeader(props: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 px-4 py-3 md:px-5 md:py-4",
        props.className,
      )}
    >
      {props.children}
    </div>
  );
}

export function CardTitle(props: { className?: string; children: React.ReactNode }) {
  return <div className={cn("text-sm font-semibold text-zinc-900", props.className)}>{props.children}</div>;
}

export function CardContent(props: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4 md:p-5", props.className)}>{props.children}</div>;
}

import * as React from "react";
import { cn } from "../../lib/cn";

export function Table(props: { className?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("min-w-full border-separate border-spacing-0 text-sm", props.className)}>{props.children}</table>
    </div>
  );
}

export function THead(props: { children: React.ReactNode }) {
  return <thead>{props.children}</thead>;
}

export function TBody(props: { children: React.ReactNode }) {
  return <tbody className="text-sm">{props.children}</tbody>;
}

export function TR(props: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr {...props} />;
}

export function TH(props: React.ThHTMLAttributes<HTMLTableCellElement>) {
  const { className, ...rest } = props;
  return (
    <th
      className={cn(
        "border-b border-zinc-200 pb-2 text-left text-[11px] font-medium text-zinc-500 whitespace-nowrap",
        className,
      )}
      {...rest}
    />
  );
}

export function TD(props: React.TdHTMLAttributes<HTMLTableCellElement>) {
  const { className, ...rest } = props;
  return <td className={cn("border-b border-zinc-100 py-3 pr-4 align-top", className)} {...rest} />;
}

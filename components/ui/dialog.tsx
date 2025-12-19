"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

export function Dialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  if (!props.open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => props.onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-xl">
          {props.children}
        </div>
      </div>
    </div>
  );
}

export function DialogHeader(props: { className?: string; children: React.ReactNode }) {
  return <div className={cn("border-b border-zinc-200 px-5 py-4", props.className)}>{props.children}</div>;
}

export function DialogTitle(props: { className?: string; children: React.ReactNode }) {
  return <div className={cn("text-sm font-semibold text-zinc-900", props.className)}>{props.children}</div>;
}

export function DialogContent(props: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", props.className)}>{props.children}</div>;
}

export function DialogFooter(props: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex items-center justify-end gap-2 border-t border-zinc-200 px-5 py-4", props.className)}>{props.children}</div>;
}

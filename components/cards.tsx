import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function StatCard(props: { title: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="text-sm text-zinc-500">{props.title}</div>
        <div className="mt-2 text-2xl font-semibold text-zinc-900">{props.value}</div>
        {props.hint ? <div className="mt-1 text-xs text-zinc-500">{props.hint}</div> : null}
      </CardContent>
    </Card>
  );
}

export function Panel(props: { title: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        {props.right}
      </CardHeader>
      <CardContent>{props.children}</CardContent>
    </Card>
  );
}

"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { PawCounter } from "@/components/ui/PawCounter";
interface Row { id: string; amount: number; reason: string; createdAt: string; }
export function RewardsHistoryScreen() {
  const [rows,setRows]=useState<Row[]|null>(null); const [points,setPoints]=useState(0); const [error,setError]=useState<string|null>(null);
  useEffect(()=>{fetch("/api/rewards").then(async r=>{const d=await r.json(); if(!r.ok) throw new Error(d.error); return d;}).then(d=>{setRows(d.transactions);setPoints(d.pawPoints);}).catch(e=>setError(e instanceof Error?e.message:"Nie udało się wczytać historii."));},[]);
  if(error) return <Card className="mx-5 text-center text-sm text-[var(--color-ink-soft)]">{error}</Card>;
  if(!rows) return <div className="mx-5 h-48 animate-pulse rounded-[22px] bg-[var(--color-surface-muted)]"/>;
  return <div className="flex flex-col gap-3 px-5"><div className="flex items-center justify-between"><span className="text-sm text-[var(--color-ink-soft)]">Wasz stan</span><PawCounter value={points}/></div>{rows.length===0?<Card className="text-center"><p className="text-sm text-[var(--color-ink-soft)]">Pierwsze Łapki pojawią się po wspólnej aktywności.</p></Card>:rows.map(r=><Card key={r.id} className="flex items-center gap-3 py-3"><div className={`flex h-10 w-10 items-center justify-center rounded-full ${r.amount>0?"bg-[var(--color-sage-soft)]":"bg-[var(--color-cream-soft)]"}`}><span className="text-sm font-bold">{r.amount>0?`+${r.amount}`:r.amount}</span></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--color-ink)]">{r.reason}</p><p className="text-xs text-[var(--color-ink-faint)]">{new Date(r.createdAt).toLocaleDateString("pl-PL",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</p></div></Card>)}</div>;
}

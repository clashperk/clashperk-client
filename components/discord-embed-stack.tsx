"use client";

import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Flame, Gem, RefreshCw, Shield, Star, Sword } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Sample data only; names and tags are invented.
type Slot = "left" | "center" | "right";

const REST: Record<Slot, { x: string; y: number; rotate: number }> = {
  left: { x: "-116%", y: 44, rotate: -7 },
  center: { x: "-50%", y: 0, rotate: 0 },
  right: { x: "16%", y: 44, rotate: 7 },
};

const ACTIVE: Record<Slot, { x: string; y: number }> = {
  left: { x: "-108%", y: 16 },
  center: { x: "-50%", y: -8 },
  right: { x: "8%", y: 16 },
};

export function DiscordEmbedStack() {
  const [active, setActive] = useState<Slot | null>(null);
  const reduceMotion = useReducedMotion();

  const cardProps = (slot: Slot, order: number) => {
    const isActive = active === slot;
    const dimmed = active !== null && !isActive;
    const pose = isActive ? { ...ACTIVE[slot], rotate: 0 } : REST[slot];

    return {
      tabIndex: 0,
      onMouseEnter: () => setActive(slot),
      onMouseLeave: () => setActive(null),
      onFocus: () => setActive(slot),
      onBlur: () => setActive(null),
      onClick: () => setActive(isActive ? null : slot),
      initial: reduceMotion ? false : { x: "-50%", y: 40, rotate: 0, opacity: 0 },
      animate: {
        ...pose,
        scale: reduceMotion ? 1 : isActive ? 1.04 : dimmed && slot === "center" ? 0.96 : 1,
        opacity: 1,
      },
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 26,
        delay: reduceMotion || active !== null ? 0 : 0.35 + order * 0.08,
      },
      style: { zIndex: isActive ? 30 : slot === "center" ? 20 : 10 },
      className: cn(
        "absolute left-1/2 top-0 h-[300px] w-[310px] cursor-pointer rounded-2xl border border-[#e3e5e8] bg-white p-3 text-left text-[12px] leading-[1.45] text-[#313338] outline-none shadow-[0_1px_2px_rgba(13,15,13,.06),0_18px_40px_-12px_rgba(13,15,13,.18)] focus-visible:ring-2 focus-visible:ring-ring",
        slot !== "center" && "hidden sm:block",
      ),
    };
  };

  return (
    <div className="relative mx-auto h-[340px] w-full max-w-[1000px] sm:h-[360px]">
      <motion.div {...cardProps("left", 0)}>
        <Message time="12:15">
          <Embed bar="#da373c">
            <Title>Ravenhold (#8PLQ2VJ9)</Title>
            <p className="mt-1 flex items-center gap-1 font-medium text-[#060607]">
              <Gem className="size-3.5 text-[#7c5ce0]" /> 5288
            </p>
            <Label>Legend Season Logs</Label>
            <table className="mt-1 border-separate border-spacing-[3px] font-mono text-[11px]">
              <tbody>
                {[
                  ["DAY", "ATK", "DEF", "+/-", "FINAL"],
                  ["1", "+296", "-248", "+48", "5048"],
                  ["2", "+312", "-270", "+42", "5090"],
                  ["3", "+320", "-231", "+89", "5179"],
                  ["4", "+301", "-192", "+109", "5288"],
                ].map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, i) => (
                      <td key={i} className={cn(CODE, "text-right")}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <Footer>Day 4/28 · Today at 12:15</Footer>
          </Embed>
          <Buttons>
            <RefreshButton />
            <DiscordButton className="bg-[#248046]">Overview</DiscordButton>
          </Buttons>
        </Message>
      </motion.div>

      <motion.div {...cardProps("right", 2)}>
        <Message time="10:33">
          <Embed bar="#da373c">
            <Title>Thornvale (#2YV9QPLC)</Title>
            <p className="mt-1 flex items-center gap-1 font-medium text-[#060607]">
              <Gem className="size-3.5 text-[#7c5ce0]" /> 5146 · Legend I
            </p>
            <Label>Overview</Label>
            <ul className="list-inside list-disc">
              <li>3 attacks (+120 trophies)</li>
              <li>2 defenses (-58 trophies)</li>
            </ul>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Attacks</Label>
                <StatRow value="+40" stars="★★★" />
                <StatRow value="+40" stars="★★★" />
              </div>
              <div>
                <Label>Defenses</Label>
                <StatRow value="-18" stars="★★☆" />
                <StatRow value="-40" stars="★★★" />
              </div>
            </div>
            <Footer>Day 4/28 · Today at 10:33</Footer>
          </Embed>
          <Buttons>
            <RefreshButton />
            <DiscordButton className="bg-[#5865f2]">Legend Days</DiscordButton>
          </Buttons>
        </Message>
      </motion.div>

      <motion.div {...cardProps("center", 1)}>
        <Message time="Today at 20:06">
          <Embed bar="#23a55a">
            <Title>IRON WOLVES (#2QX8LP0V)</Title>
            <Label>War Against</Label>
            <p className="text-[#006ce7]">Night Raiders (#9RJ2YC8Q)</p>
            <Label>War Stats</Label>
            <div className="mt-1 grid w-fit grid-cols-[auto_20px_auto] items-center gap-x-2 gap-y-1">
              <WarStat ours="39" theirs="31" icon={<Star className="size-3.5 fill-[#f0b232] text-[#d4a017]" />} />
              <WarStat ours="15" theirs="14" icon={<Sword className="size-3.5 text-[#5c5e66]" />} />
              <WarStat ours="91.40%" theirs="83.12%" icon={<Flame className="size-3.5 text-[#e8590c]" />} />
            </div>
            <Footer>Round #3 · 06/10/26, 21:14</Footer>
          </Embed>
          <Buttons>
            <DiscordButton className="bg-[#5865f2]">
              <Sword className="size-3" /> Attacks
            </DiscordButton>
            <DiscordButton className="bg-[#da373c]">
              <Shield className="size-3" /> Defenses
            </DiscordButton>
          </Buttons>
        </Message>
      </motion.div>
    </div>
  );
}

const CODE =
  "rounded border border-[#d4d7dc] bg-[#e3e5e8] px-1.5 font-mono text-[11px] text-[#313338]";

function Message({ time, children }: { time: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full gap-2.5">
      <Image
        src="/icons/icon.svg"
        alt=""
        width={30}
        height={30}
        unoptimized
        className="size-[30px] shrink-0 rounded-full bg-[#fdeee0] p-1"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="flex items-center gap-1.5">
          <span className="text-[13px] font-medium text-[#4752c4]">ClashPerk</span>
          <span className="inline-flex items-center gap-0.5 rounded-[3px] bg-[#5865f2] py-px pl-[3px] pr-1 text-[9px] font-semibold text-white">
            <Check className="size-2.5" strokeWidth={3.5} /> APP
          </span>
          <span className="text-[10px] text-[#5c5e66]">{time}</span>
        </p>
        {children}
      </div>
    </div>
  );
}

function Embed({ bar, children }: { bar: string; children: React.ReactNode }) {
  return (
    <div
      className="mt-1.5 flex flex-1 flex-col rounded border-l-[3px] bg-[#f2f3f5] px-3 py-2.5"
      style={{ borderLeftColor: bar }}
    >
      {children}
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-semibold text-[#006ce7]">{children}</p>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 font-semibold text-[#060607]">{children}</p>;
}

function Footer({ children }: { children: React.ReactNode }) {
  return <p className="mt-auto pt-2 text-[10px] text-[#5c5e66]">{children}</p>;
}

function StatRow({ value, stars }: { value: string; stars: string }) {
  return (
    <div className="mt-1 flex gap-1">
      <span className={cn(CODE, "min-w-9 text-right")}>{value}</span>
      <span className={cn(CODE, "text-[#b7791f]")}>{stars}</span>
    </div>
  );
}

function WarStat({ ours, theirs, icon }: { ours: string; theirs: string; icon: React.ReactNode }) {
  return (
    <>
      <span className={cn(CODE, "min-w-14 text-right text-[12px]")}>{ours}</span>
      <span className="flex justify-center">{icon}</span>
      <span className={cn(CODE, "min-w-14 text-right text-[12px]")}>{theirs}</span>
    </>
  );
}

function Buttons({ children }: { children: React.ReactNode }) {
  return <div className="mt-2 flex gap-1.5">{children}</div>;
}

function DiscordButton({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md px-3 text-[11px] font-medium text-white",
        className,
      )}
    >
      {children}
    </span>
  );
}

function RefreshButton() {
  return (
    <span className="inline-flex h-7 items-center rounded-md bg-[#e3e5e8] px-3 text-[#4e5058]">
      <RefreshCw className="size-3.5" />
    </span>
  );
}

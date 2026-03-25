"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Timing Config ───────────────────────────────────────────
const SCENES = [
  { id: "intro", duration: 5000, label: "المقدمة" },
  { id: "magic", duration: 10000, label: "الربط السحري" },
  { id: "ai", duration: 10000, label: "المساعد الذكي" },
  { id: "outro", duration: 5000, label: "الخاتمة" },
];

// ─── Fade Wrapper ────────────────────────────────────────────
function SceneWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

// ─── Animated Text (slow reveal) ────────────────────────────
function SlowText({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.5, delay, ease: "easeOut" }}
    >
      {text}
    </motion.div>
  );
}

// ─── Scene 0: Intro — Contrast Split ────────────────────────
function SceneIntro() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2500);
    return () => clearTimeout(t1);
  }, []);

  return (
    <SceneWrapper>
      <div className="relative w-[900px] h-[520px] flex rounded-2xl overflow-hidden shadow-2xl shadow-black/10 border border-gray-200">
        {/* ──── Right: Winbox (Old) ──── */}
        <div className="w-1/2 h-full bg-[#e8e8e8] relative overflow-hidden border-r border-gray-300">
          {/* Title Bar */}
          <div className="flex items-center bg-[#d4d0c8] border-b border-gray-400 px-2 py-1">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm bg-[#c0c0c0] border border-gray-500 flex items-center justify-center text-[7px] text-gray-600">✕</div>
              <div className="w-3 h-3 rounded-sm bg-[#c0c0c0] border border-gray-500 flex items-center justify-center text-[7px] text-gray-600">□</div>
              <div className="w-3 h-3 rounded-sm bg-[#c0c0c0] border border-gray-500 flex items-center justify-center text-[7px] text-gray-600">─</div>
            </div>
            <span className="ml-2 text-[10px] text-gray-700 font-mono">Winbox - admin@192.168.1.1</span>
          </div>

          {/* Winbox Sidebar */}
          <div className="flex h-full">
            <div className="w-[120px] bg-[#f0ebe1] border-r border-gray-300 p-1.5 space-y-0.5 text-[9px] font-mono text-gray-700 overflow-hidden">
              {["▸ Interfaces", "▸ Wireless", "▸ Bridge", "▸ PPP", "▸ Mesh", "▸ IP", "  ▸ ARP", "  ▸ Addresses", "  ▸ DHCP Server", "  ▸ DNS", "  ▸ Firewall", "  ▸ Hotspot", "  ▸ Routes", "▸ MPLS", "▸ Routing", "▸ System", "  ▸ Clock", "  ▸ Identity", "  ▸ Logging", "  ▸ Packages", "  ▸ Scheduler", "  ▸ Scripts", "  ▸ Users", "▸ Queues", "▸ Files", "▸ Log", "▸ Tools"].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05 * i, duration: 0.3 }}
                  className="whitespace-nowrap leading-[14px] hover:bg-blue-100 px-0.5"
                >
                  {item}
                </motion.div>
              ))}
            </div>

            {/* Winbox Main Content — crowded tables */}
            <div className="flex-1 p-2 space-y-2 overflow-hidden">
              {/* Mini table 1 */}
              <div className="border border-gray-400 bg-white">
                <div className="bg-[#d4d0c8] border-b border-gray-400 px-1 py-0.5 text-[8px] font-mono text-gray-700 flex justify-between">
                  <span>Interface List</span>
                  <span>✕</span>
                </div>
                <table className="w-full text-[8px] font-mono text-gray-600">
                  <thead>
                    <tr className="bg-[#e8e8e8] border-b border-gray-300">
                      <th className="text-left px-1 py-0.5 border-r border-gray-300">#</th>
                      <th className="text-left px-1 py-0.5 border-r border-gray-300">Name</th>
                      <th className="text-left px-1 py-0.5 border-r border-gray-300">Type</th>
                      <th className="text-left px-1 py-0.5">MTU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[["0","ether1","ether","1500"],["1","ether2","ether","1500"],["2","ether3","ether","1500"],["3","wlan1","wlan","1500"],["4","bridge1","bridge","1500"],["5","pppoe-out1","pppoe","1480"]].map((r,i)=>(
                      <tr key={i} className={i%2===0?"bg-white":"bg-[#f5f5f5]"}>
                        {r.map((c,j)=>(<td key={j} className="px-1 py-0.5 border-r border-gray-200 last:border-0">{c}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mini table 2 */}
              <div className="border border-gray-400 bg-white">
                <div className="bg-[#d4d0c8] border-b border-gray-400 px-1 py-0.5 text-[8px] font-mono text-gray-700 flex justify-between">
                  <span>IP Addresses</span>
                  <span>✕</span>
                </div>
                <table className="w-full text-[8px] font-mono text-gray-600">
                  <thead>
                    <tr className="bg-[#e8e8e8] border-b border-gray-300">
                      <th className="text-left px-1 py-0.5 border-r border-gray-300">#</th>
                      <th className="text-left px-1 py-0.5 border-r border-gray-300">Address</th>
                      <th className="text-left px-1 py-0.5">Interface</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[["0","192.168.1.1/24","bridge1"],["1","10.0.0.1/24","ether1"],["2","172.16.0.1/30","pppoe-out1"]].map((r,i)=>(
                      <tr key={i} className={i%2===0?"bg-white":"bg-[#f5f5f5]"}>
                        {r.map((c,j)=>(<td key={j} className="px-1 py-0.5 border-r border-gray-200 last:border-0">{c}</td>))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Mini Firewall */}
              <div className="border border-gray-400 bg-white">
                <div className="bg-[#d4d0c8] border-b border-gray-400 px-1 py-0.5 text-[8px] font-mono text-gray-700 flex justify-between">
                  <span>Firewall Rules (27 items)</span>
                  <span>✕</span>
                </div>
                <div className="p-1 text-[7px] font-mono text-gray-500 leading-[11px]">
                  {Array.from({length:6}).map((_,i)=>(
                    <div key={i}>{i} chain=forward action=accept src=10.0.{i}.0/24</div>
                  ))}
                  <div className="text-gray-400">... 21 more rules</div>
                </div>
              </div>
            </div>
          </div>
          {/* "OLD" watermark */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.07 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <span className="text-[80px] font-black text-gray-800 -rotate-12 select-none">OLD</span>
          </motion.div>
        </div>

        {/* ──── Left: NileLink (Modern) ──── */}
        <div className="w-1/2 h-full bg-[#0f1117] relative overflow-hidden">
          <div className="flex h-full">
            <div className="w-[52px] bg-[#0a0c12] border-r border-white/5 flex flex-col items-center py-4 gap-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">NL</span>
              </div>
              {["📊","📡","🎫","👥","📦","⚙️"].map((icon,i)=>(
                <motion.div
                  key={i}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[14px] hover:bg-white/5 cursor-default"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  {icon}
                </motion.div>
              ))}
            </div>

            <div className="flex-1 p-4 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Active Users", value: "1,247", color: "from-cyan-500/20 to-cyan-500/5" },
                  { label: "Bandwidth", value: "842 Mb", color: "from-teal-500/20 to-teal-500/5" },
                  { label: "Revenue", value: "$3,520", color: "from-emerald-500/20 to-emerald-500/5" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    className={`rounded-xl p-2.5 bg-gradient-to-br ${stat.color} border border-white/5`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.15, duration: 0.8 }}
                  >
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-[9px] text-white/40 uppercase tracking-wider">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="rounded-xl border border-white/5 bg-white/[0.02] p-3 h-[120px] relative overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Traffic Overview</div>
                <svg viewBox="0 0 360 80" className="w-full h-[70px]">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00d2d3" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#00d2d3" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0,60 C30,55 60,40 90,42 C120,44 150,25 180,20 C210,15 240,30 270,22 C300,14 330,18 360,10 L360,80 L0,80 Z"
                    fill="url(#chartGrad)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1.5 }}
                  />
                  <motion.path
                    d="M0,60 C30,55 60,40 90,42 C120,44 150,25 180,20 C210,15 240,30 270,22 C300,14 330,18 360,10"
                    fill="none"
                    stroke="#00d2d3"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 2, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>

              <div className="space-y-1.5">
                {[
                  { name: "Router-Main", status: "online", ip: "192.168.1.1" },
                  { name: "AP-Floor1", status: "online", ip: "192.168.1.2" },
                  { name: "AP-Floor2", status: "online", ip: "192.168.1.3" },
                ].map((device, i) => (
                  <motion.div
                    key={device.name}
                    className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5"
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 + i * 0.2, duration: 0.6 }}
                  >
                    <motion.div
                      className="w-2 h-2 rounded-full bg-emerald-400"
                      animate={{
                        boxShadow: ["0 0 3px rgba(52,211,153,0.4)","0 0 8px rgba(52,211,153,0.8)","0 0 3px rgba(52,211,153,0.4)"],
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                    />
                    <span className="text-white/70 text-[10px] flex-1">{device.name}</span>
                    <span className="text-white/20 text-[9px] font-mono">{device.ip}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center Divider Line Glow */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] z-10">
          <motion.div
            className="w-full h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0.4] }}
            transition={{ duration: 2, delay: 0.5 }}
          />
        </div>

        {/* VS Badge */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white border-2 border-cyan-400 flex items-center justify-center shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
        >
          <span className="text-cyan-600 font-black text-xs">VS</span>
        </motion.div>
      </div>

      {/* Bottom Text */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full">
        <AnimatePresence mode="wait">
          {phase === 0 ? (
            <motion.div
              key="q"
              className="text-3xl font-bold text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1.2 }}
            >
              هل تعبت من هذا؟
            </motion.div>
          ) : (
            <motion.div
              key="a"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 1.2 }}
            >
              <span className="text-3xl font-bold text-gray-800">اختر الراحة مع </span>
              <span className="text-3xl font-black bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">NileLink</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneWrapper>
  );
}

// ─── Scene 1: Magic Connection ───────────────────────────────
function SceneMagic() {
  const [phase, setPhase] = useState<"phone" | "fly" | "done">("phone");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fly"), 4000);
    const t2 = setTimeout(() => setPhase("done"), 7000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const scriptLine = '/tool fetch url="https://nilelink.net/api/setup?token=NL-7X9K2P" mode=https';

  return (
    <SceneWrapper>
      <div className="relative w-[900px] h-[520px] flex items-center justify-between px-16">

        {/* ──── Phone ──── */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
        >
          <div className="w-[200px] h-[400px] rounded-[32px] border-[3px] border-gray-300 bg-white shadow-xl overflow-hidden relative">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-200 rounded-b-2xl" />
            {/* Screen Content */}
            <div className="mt-8 p-4">
              {/* NileLink Header in Phone */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <span className="text-white text-[7px] font-bold">NL</span>
                </div>
                <span className="text-gray-800 text-xs font-semibold">NileLink</span>
              </div>

              <div className="text-[10px] text-gray-500 mb-3">الربط السريع</div>

              {/* Router Selection */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 mb-3">
                <div className="text-[9px] text-gray-400 mb-1">Router</div>
                <div className="text-[11px] text-gray-700 font-medium">MikroTik RB4011</div>
              </div>

              {/* Token */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 mb-4">
                <div className="text-[9px] text-gray-400 mb-1">Token</div>
                <div className="text-[11px] text-cyan-600 font-mono font-bold">NL-7X9K2P</div>
              </div>

              {/* Generate Button */}
              <motion.div
                className="w-full py-2.5 rounded-xl text-center text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #00d2d3, #0abde3)" }}
                animate={phase === "phone" ? {
                  boxShadow: ["0 0 0px rgba(0,210,211,0)","0 4px 20px rgba(0,210,211,0.3)","0 0 0px rgba(0,210,211,0)"],
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                توليد السكربت
              </motion.div>

              {/* Script Output */}
              <motion.div
                className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 p-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                <div className="text-[7px] text-cyan-700 font-mono leading-[12px] break-all">
                  {scriptLine}
                </div>
              </motion.div>
            </div>
          </div>
          {/* Hand shape below phone */}
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-4xl select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            🤲
          </motion.div>
        </motion.div>

        {/* ──── Flying Script ──── */}
        <AnimatePresence>
          {phase === "fly" && (
            <motion.div
              className="absolute z-30"
              initial={{ left: "30%", top: "55%", opacity: 1, scale: 1 }}
              animate={{
                left: ["30%", "50%", "68%"],
                top: ["55%", "35%", "45%"],
                scale: [1, 1.15, 0.7],
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.8, ease: "easeInOut" }}
            >
              <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-[9px] font-mono shadow-lg shadow-cyan-500/30 whitespace-nowrap">
                {scriptLine.substring(0, 40)}...
              </div>
              {/* Trail particles */}
              {[0,1,2,3].map(i => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-cyan-400"
                  style={{ left: -8 * (i+1), top: "50%" }}
                  animate={{ opacity: [0.8, 0], scale: [1, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ──── Router ──── */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        >
          {/* Connection Rings */}
          <AnimatePresence>
            {phase === "done" && [0,1,2].map(ring => (
              <motion.div
                key={ring}
                className="absolute -inset-4 rounded-2xl border-2 border-cyan-400"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.5 + ring * 0.4, opacity: 0 }}
                transition={{ duration: 1.5, delay: ring * 0.2, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>

          <motion.div
            className="w-[220px] h-[140px] rounded-2xl bg-gray-100 border-2 border-gray-200 shadow-xl flex flex-col items-center justify-center relative overflow-hidden"
            animate={phase === "done" ? {
              borderColor: ["#e5e7eb", "#00d2d3", "#00d2d3"],
              boxShadow: ["0 0 0px rgba(0,210,211,0)", "0 0 40px rgba(0,210,211,0.4)", "0 0 20px rgba(0,210,211,0.2)"],
            } : {}}
            transition={{ duration: 1.5 }}
          >
            {/* Router Visual */}
            <div className="w-[180px] h-[50px] rounded-lg bg-gray-800 relative mb-2">
              {/* Ports */}
              <div className="absolute bottom-1 left-2 flex gap-1">
                {Array.from({length: 8}).map((_,i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-4 rounded-sm border border-gray-600"
                    animate={phase === "done" ? {
                      backgroundColor: ["#374151", "#00d2d3", "#374151"],
                    } : { backgroundColor: "#374151" }}
                    transition={{ duration: 0.5, delay: i * 0.08, repeat: phase === "done" ? Infinity : 0, repeatDelay: 1 }}
                  />
                ))}
              </div>
              {/* Power LED */}
              <motion.div
                className="absolute top-1.5 right-2 w-2 h-2 rounded-full"
                animate={phase === "done" ? {
                  backgroundColor: ["#10b981", "#34d399", "#10b981"],
                  boxShadow: ["0 0 4px #10b981", "0 0 10px #34d399", "0 0 4px #10b981"],
                } : { backgroundColor: "#6b7280" }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <div className="text-[10px] text-gray-500 font-medium">MikroTik RB4011</div>
            <div className="text-[8px] text-gray-400">RouterBOARD</div>

            {/* Connected Badge */}
            <AnimatePresence>
              {phase === "done" && (
                <motion.div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-lg"
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  ✓ متصل
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Text */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 1.2 }}
      >
        <span className="text-2xl font-bold text-gray-800">انسخ الكود.. وسنكمل نحن الباقي</span>
      </motion.div>
    </SceneWrapper>
  );
}

// ─── Scene 2: AI Assistant ───────────────────────────────────
function SceneAI() {
  const messages = [
    { from: "user", name: "محمد", text: "الإنترنت بطيء عندي", time: "2:14 PM" },
    { from: "ai", name: "NileLink AI", text: "أهلاً يا محمد، لقد فحصت حسابك وتبين أن باقتك انتهت منذ ساعة. هل تريد تجديدها الآن؟", time: "2:14 PM" },
    { from: "user", name: "محمد", text: "أيوا جددها", time: "2:14 PM" },
    { from: "ai", name: "NileLink AI", text: "تم تجديد باقة 50Mbps الشهرية بنجاح ✓\nرصيدك المتبقي: 450 جنيه", time: "2:14 PM" },
  ];

  const [visibleMessages, setVisibleMessages] = useState(0);
  const [showTagline, setShowTagline] = useState(false);

  useEffect(() => {
    messages.forEach((_, i) => {
      setTimeout(() => setVisibleMessages(i + 1), 1500 + i * 2000);
    });
    setTimeout(() => setShowTagline(true), 1500 + messages.length * 2000);
  }, []);

  return (
    <SceneWrapper>
      <div className="relative w-[900px] h-[520px] flex items-center justify-center">
        {/* Hotspot Login Page Background */}
        <motion.div
          className="w-[800px] h-[480px] rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-xl overflow-hidden relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Fake Hotspot Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-teal-500 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white text-[10px] font-bold">NL</span>
              </div>
              <span className="text-white font-semibold text-sm">NileLink Hotspot</span>
            </div>
            <div className="flex items-center gap-2 text-white/70 text-xs">
              <span>WiFi: NileLink-Guest</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            </div>
          </div>

          <div className="flex h-[calc(100%-56px)]">
            {/* Left: Login Form Area */}
            <div className="w-1/2 p-6 flex flex-col justify-center border-r border-gray-100">
              <div className="text-lg font-semibold text-gray-800 mb-1">مرحباً بك</div>
              <div className="text-xs text-gray-400 mb-6">أدخل كود الواي فاي للاتصال</div>
              <div className="space-y-3">
                <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
                  <div className="text-[9px] text-gray-400 mb-1">Voucher Code</div>
                  <div className="text-gray-300 text-sm">••••••••</div>
                </div>
                <div className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white text-center text-sm font-bold">
                  اتصل الآن
                </div>
              </div>
            </div>

            {/* Right: AI Chat */}
            <div className="w-1/2 flex flex-col bg-gray-50/50">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <motion.div
                  className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center"
                  animate={{
                    boxShadow: ["0 0 0px rgba(0,210,211,0)","0 0 12px rgba(0,210,211,0.4)","0 0 0px rgba(0,210,211,0)"],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-white text-[9px] font-bold">AI</span>
                </motion.div>
                <div>
                  <div className="text-xs font-semibold text-gray-700">المساعد الذكي</div>
                  <div className="text-[9px] text-emerald-500 flex items-center gap-1">
                    <motion.div
                      className="w-1 h-1 rounded-full bg-emerald-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    /> متصل
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 space-y-2.5 overflow-hidden" dir="rtl">
                {messages.slice(0, visibleMessages).map((msg, i) => (
                  <motion.div
                    key={i}
                    className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      msg.from === "user"
                        ? "bg-cyan-500 text-white rounded-br-md"
                        : "bg-white border border-gray-100 text-gray-700 rounded-bl-md shadow-sm"
                    }`}>
                      {msg.from === "ai" && (
                        <div className="text-[8px] text-cyan-500 font-semibold mb-0.5">{msg.name}</div>
                      )}
                      <div className="text-[11px] leading-[18px] whitespace-pre-line">{msg.text}</div>
                    </div>
                    <div className="text-[8px] text-gray-300 mt-0.5 px-1">{msg.time}</div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {visibleMessages > 0 && visibleMessages < messages.length && visibleMessages % 2 === 0 && (
                  <motion.div
                    className="flex items-start"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
                      <div className="flex gap-1">
                        {[0,1,2].map(d => (
                          <motion.div
                            key={d}
                            className="w-1.5 h-1.5 rounded-full bg-gray-300"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Text */}
      <AnimatePresence>
        {showTagline && (
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <span className="text-2xl font-bold text-gray-800">الـ AI يرد على مشتركينك.. </span>
            <span className="text-2xl font-black bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">وأنت تجمع الأرباح</span>
          </motion.div>
        )}
      </AnimatePresence>
    </SceneWrapper>
  );
}

// ─── Scene 3: Outro — Brand Finale ───────────────────────────
function SceneOutro() {
  return (
    <SceneWrapper>
      <div className="relative flex flex-col items-center justify-center">
        {/* Logo */}
        <motion.div
          className="relative"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, type: "spring", damping: 15 }}
        >
          {/* Logo Icon */}
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-xl"
            animate={{
              boxShadow: [
                "0 10px 30px rgba(0,210,211,0.2)",
                "0 10px 50px rgba(0,210,211,0.4)",
                "0 10px 30px rgba(0,210,211,0.2)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-white text-3xl font-black">NL</span>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            className="text-5xl font-black text-center mb-2"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
              NileLink
            </span>
          </motion.div>

          {/* Tagline */}
          <motion.div
            className="text-xl text-gray-500 text-center font-medium tracking-wide"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
          >
            أسهل طريقة لإدارة شبكاتك
          </motion.div>

          {/* Light Sweep */}
          <motion.div
            className="absolute -inset-32 pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="absolute inset-y-0 w-40"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(0,210,211,0.08), transparent)",
              }}
              initial={{ left: "-20%" }}
              animate={{ left: "120%" }}
              transition={{ duration: 3, delay: 1.8, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>

        {/* Dashboard Preview (slow pan) — small strip below */}
        <motion.div
          className="mt-12 w-[700px] h-[100px] rounded-xl border border-gray-200 overflow-hidden shadow-lg relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1.2 }}
        >
          <motion.div
            className="absolute inset-0 flex gap-2 p-2"
            animate={{ x: [0, -100, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Mini dashboard cards */}
            {[
              { label: "أكواد مطبوعة", value: "2,845", icon: "🎫" },
              { label: "راوترات متصلة", value: "12", icon: "📡" },
              { label: "مشتركين نشطين", value: "1,247", icon: "👥" },
              { label: "الإيرادات", value: "$4,200", icon: "💰" },
              { label: "الأجهزة", value: "38", icon: "📱" },
            ].map((card, i) => (
              <div
                key={card.label}
                className="min-w-[130px] h-full rounded-lg border border-gray-100 bg-white p-3 flex flex-col justify-center"
              >
                <div className="text-lg mb-0.5">{card.icon}</div>
                <div className="text-sm font-bold text-gray-800">{card.value}</div>
                <div className="text-[9px] text-gray-400">{card.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Subtle CTA */}
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          <div className="text-sm text-gray-400 tracking-wider">
            nilelink.net
          </div>
        </motion.div>
      </div>
    </SceneWrapper>
  );
}

// ─── Scene Nav ───────────────────────────────────────────────
function SceneNav({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="absolute top-5 left-1/2 -translate-x-1/2 z-50 flex gap-2">
      {SCENES.map((scene, i) => (
        <button
          key={scene.id}
          onClick={() => onSelect(i)}
          className={`px-4 py-1.5 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
            current === i
              ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {scene.label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function PromoVideo() {
  const [currentScene, setCurrentScene] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!autoPlay) return;
    timerRef.current = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % SCENES.length);
    }, SCENES[currentScene].duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentScene, autoPlay]);

  const handleSelect = (i: number) => {
    setCurrentScene(i);
    setAutoPlay(false);
  };

  const scenes = [
    <SceneIntro key="intro" />,
    <SceneMagic key="magic" />,
    <SceneAI key="ai" />,
    <SceneOutro key="outro" />,
  ];

  return (
    <div className="relative w-screen h-screen bg-white overflow-hidden select-none" dir="rtl">
      {/* Nav */}
      <SceneNav current={currentScene} onSelect={handleSelect} />

      {/* Auto-play Toggle */}
      <button
        onClick={() => setAutoPlay((p) => !p)}
        className={`absolute top-5 left-5 z-50 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
          autoPlay
            ? "bg-cyan-50 text-cyan-600 border-cyan-200"
            : "bg-gray-50 text-gray-400 border-gray-200"
        }`}
      >
        {autoPlay ? "⏸ تشغيل تلقائي" : "▶ تشغيل تلقائي"}
      </button>

      {/* Progress Bar */}
      {autoPlay && (
        <div className="absolute bottom-0 left-0 right-0 h-1 z-50 bg-gray-100">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-teal-400"
            key={currentScene}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: SCENES[currentScene].duration / 1000,
              ease: "linear",
            }}
          />
        </div>
      )}

      {/* Scenes */}
      <AnimatePresence mode="wait">{scenes[currentScene]}</AnimatePresence>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamingText } from '../StreamingText';

export function Scene5({ setCursorPos, setIsClicking }: { setCursorPos: (pos: {x: string, y: string}) => void, setIsClicking: (val: boolean) => void }) {
  const [phase, setPhase] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState("");

  useEffect(() => {
    setCursorPos({ x: '40vw', y: '65vh' });

    const t1 = setTimeout(() => setPhase(1), 500);

    const t2 = setTimeout(() => {
      setCursorPos({ x: '50vw', y: '60vh' });
    }, 2000);

    const t3 = setTimeout(() => {
      setTypedAnswer("Because it has a sensor.");
    }, 3000);

    const t4 = setTimeout(() => {
      setCursorPos({ x: '70vw', y: '60vh' });
    }, 3500);

    const t5 = setTimeout(() => {
      setIsClicking(true);
    }, 4200);

    const t6 = setTimeout(() => {
      setIsClicking(false);
      setPhase(2);
    }, 4500);

    const t7 = setTimeout(() => setPhase(3), 6000);
    const t8 = setTimeout(() => {
      setPhase(4);
      setTypedAnswer("");
    }, 7000);

    // Type a strong conceptual answer, in chunks.
    const t9 = setTimeout(() => setTypedAnswer("A thermostat follows a fixed rule a"), 8200);
    const t10 = setTimeout(() => setTypedAnswer("A thermostat follows a fixed rule a human wrote — it just"), 8900);
    const t11 = setTimeout(() => setTypedAnswer("A thermostat follows a fixed rule a human wrote — it just compares the temperature to a threshold."), 9700);
    const t12 = setTimeout(() => setTypedAnswer("A thermostat follows a fixed rule a human wrote — it just compares the temperature to a threshold. It never learns from data, so it's automation, not intelligence."), 10600);

    const t13 = setTimeout(() => {
      setCursorPos({ x: '70vw', y: '60vh' }); // Move to Submit
    }, 10800);

    const t14 = setTimeout(() => setIsClicking(true), 11200);
    const t15 = setTimeout(() => {
      setIsClicking(false);
      setPhase(5);
    }, 11500);

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
      clearTimeout(t5); clearTimeout(t6); clearTimeout(t7); clearTimeout(t8);
      clearTimeout(t9); clearTimeout(t10); clearTimeout(t11); clearTimeout(t12);
      clearTimeout(t13); clearTimeout(t14); clearTimeout(t15);
    };
  }, [setCursorPos, setIsClicking]);

  return (
    <motion.div 
      className="absolute inset-0 w-full h-full bg-background p-12 overflow-hidden flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence>
        {phase === 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-8 right-12 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center space-x-2"
          >
            <span>↓</span>
            <span>Difficulty adjusted to <span className="font-semibold">Very easy</span></span>
          </motion.div>
        )}
        {phase === 5 && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-8 right-12 z-50 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center space-x-2"
          >
            <span>↑</span>
            <span>Difficulty adjusted to <span className="font-semibold">Easy</span></span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto w-full">
        <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-4">Topic Practice</div>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-serif text-primary mb-2">What AI is (and isn't)</h1>
            <div className="text-sm text-muted-foreground">Week 1 · 1 prior attempt · 100% accuracy · <span className="text-emerald-600 font-semibold">STRONG</span></div>
          </div>
          <div className="text-sm font-medium border border-border px-3 py-1 rounded-md bg-white">
            Session score: {phase < 2 ? '0/0' : phase < 5 ? '0/1' : '1/2'}
          </div>
        </div>

        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
          <div className="p-8 flex-1 border-b border-border text-lg text-primary font-medium leading-relaxed">
            {phase >= 1 && phase < 4 && (
              <StreamingText text="In your own words, what is the core difference between automation and artificial intelligence?" delay={0} />
            )}
            {phase >= 4 && (
              <StreamingText text="A thermostat switches the heat on at a set temperature. Explain why that makes it automation rather than artificial intelligence." delay={0} />
            )}
          </div>
          
          <div className="p-6 bg-muted/20">
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 relative">
                <div className="w-full min-h-14 bg-white border border-border rounded-lg px-4 py-3 flex items-center shadow-inner text-base leading-relaxed">
                  {typedAnswer || <span className="text-muted-foreground text-sm">Type your answer here...</span>}
                  {((phase >= 1 && phase < 2) || (phase >= 4 && phase < 5)) && <motion.div className="w-0.5 h-6 bg-primary ml-1 shrink-0" animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} />}
                </div>
              </div>
              <div className={`px-8 h-14 rounded-lg flex items-center justify-center font-medium text-white transition-all shrink-0 ${phase === 2 || phase === 5 ? 'bg-primary/50' : 'bg-primary cursor-pointer'}`}>
                Submit
              </div>
            </div>

            <AnimatePresence mode="popLayout">
              {phase >= 2 && phase < 4 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-red-50 border border-red-100 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 text-red-600 font-bold text-sm mb-2 uppercase tracking-wide">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs">✕</div>
                    <span>Not quite</span>
                  </div>
                  <div className="text-sm text-red-900 leading-relaxed">
                    <StreamingText text="Having a sensor isn't what makes something intelligent — automation can use sensors too. The real distinction is whether the behavior was learned from data or written as a fixed rule by a human. Try framing it that way." delay={0} />
                  </div>
                </motion.div>
              )}
              {phase >= 5 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 bg-emerald-50 border border-emerald-100 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 text-emerald-600 font-bold text-sm mb-2 uppercase tracking-wide">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">✓</div>
                    <span>Correct!</span>
                  </div>
                  <div className="text-sm text-emerald-900 leading-relaxed">
                    <StreamingText text="Exactly. A thermostat applies a fixed, human-written rule and never changes its behavior based on experience. Intelligence, by contrast, learns its behavior from patterns in data — that's the line you drew." delay={0} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4 border rounded-md p-3 bg-secondary/50">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Answering tips</div>
              <div className="flex flex-wrap gap-1.5">
                {['Answer in your own words', 'Name the key distinction', 'Give a concrete example', 'Two or three sentences is plenty'].map(tip => (
                  <div key={tip} className="px-2.5 h-7 bg-white border border-border rounded-full flex items-center justify-center text-xs shadow-sm text-foreground/70">
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

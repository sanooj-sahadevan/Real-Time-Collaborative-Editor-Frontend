import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, PenLine } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AuthLayout: React.FC<{ children: React.ReactNode, title: string, subtitle: string }> = ({ children, title, subtitle }) => {
  return (
    <div className="grid min-h-screen bg-[#f6f3ed] lg:grid-cols-[minmax(380px,0.82fr)_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#202b2f] p-12 text-[#fffaf0] lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[2.5rem] border-[#e08a18]/20" />
        <div><Link to="/" className="mb-20 flex items-center gap-3 text-[#fffaf0]"><span className="grid h-9 w-9 place-items-center rounded-[10px] bg-[#e08a18] font-serif text-lg font-bold text-[#202b2f]">P</span><span className="font-serif text-xl font-semibold">Papertrail</span></Link><div className="max-w-sm"><p className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f3bb5d]"><PenLine size={14} /> Collaborative writing</p><h1 className="font-serif text-5xl leading-[1.08]">Make room for good ideas.</h1><p className="mt-6 text-base leading-7 text-[#b8c3c1]">A calm, connected workspace for books that become better with every voice.</p></div></div>
        <div className="flex items-center gap-2 text-sm text-[#82908f]"><BookOpen size={16} /> Your next chapter starts here.</div>
      </aside>
      <main className="flex items-center justify-center px-5 py-10 sm:px-10"><motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-full max-w-lg"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-[#7b8385] hover:text-[#20252b] lg:hidden"><ArrowLeft size={16} /> Papertrail</Link><div className="mb-8"><h2 className="font-serif text-4xl font-semibold text-[#20252b]">{title}</h2><p className="mt-2 text-[#7b8385]">{subtitle}</p></div>{children}</motion.div></main>
      </div>
  );
};

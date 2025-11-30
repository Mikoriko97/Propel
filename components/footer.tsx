'use client';

import { Twitter, Github, MessageCircle, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 px-6 mt-24">
      <div className="max-w-7xl mx-auto">
        <div className="glass rounded-2xl px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-foreground/60 text-sm">
            © 2025 Propel. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://x.com/Mikoriko97"
              className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center hover:border-primary/50 transition-all group"
            >
              <Twitter className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
            </a>
            <a
              href="https://github.com/Mikoriko97/Propel"
              className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center hover:border-primary/50 transition-all group"
            >
              <Github className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
            </a>
            <a
              href="https://discord.gg/6n5Y765f"
              className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center hover:border-primary/50 transition-all group"
            >
              <MessageCircle className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
            </a>
            <a
              href="mailto:mikola19121997@gmail.com"
              className="w-10 h-10 rounded-xl glass-strong flex items-center justify-center hover:border-primary/50 transition-all group"
            >
              <Mail className="w-5 h-5 text-foreground/60 group-hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { Heart, ShieldCheck, HelpCircle, Trophy, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background text-muted py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white/20" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Digital<span className="text-primary">Heroes</span>
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed max-w-md">
              A subscription platform for golfers combining rolling score tracking, monthly number-match jackpot draws, and transparent charitable impact. Minimum 10% of every fee goes directly to partner charities.
            </p>
            <div className="flex items-center gap-4 text-xs text-support font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-support" /> Guaranteed 10%+ Charity Share
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-support" /> Audited Monthly Draws
              </span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/charities" className="hover:text-secondary transition-colors">
                  Featured Charities
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-secondary transition-colors">
                  Draw Mechanics & Rules
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-secondary transition-colors">
                  Past Draw Results
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-secondary transition-colors">
                  Subscribe & Play
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Guarantee */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-4">
              Transparency
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-muted">Fixed £5 Prize Split / Sub</span>
              </li>
              <li>
                <span className="text-muted">40% / 35% / 25% Tier Split</span>
              </li>
              <li>
                <span className="text-muted">100% Jackpot Rollover Guarantee</span>
              </li>
              <li>
                <span className="text-muted">Score Proof Verification Gate</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© {new Date().getFullYear()} SwingShift. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built for golfers making a real difference.
          </p>
        </div>
      </div>
    </footer>
  );
}

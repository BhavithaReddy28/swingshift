import Link from "next/link";
import { Heart, ShieldCheck, HelpCircle, Trophy, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070A10] text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white fill-white/20" />
              </div>
              <span className="font-display font-bold text-lg text-white">
                Digital<span className="text-orange-500">Heroes</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-md">
              A subscription platform for golfers combining rolling score tracking, monthly number-match jackpot draws, and transparent charitable impact. Minimum 10% of every fee goes directly to partner charities.
            </p>
            <div className="flex items-center gap-4 text-xs text-teal-400 font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-400" /> Guaranteed 10%+ Charity Share
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-4 h-4 text-teal-400" /> Audited Monthly Draws
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
                <Link href="/charities" className="hover:text-orange-400 transition-colors">
                  Featured Charities
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-orange-400 transition-colors">
                  Draw Mechanics & Rules
                </Link>
              </li>
              <li>
                <Link href="/results" className="hover:text-orange-400 transition-colors">
                  Past Draw Results
                </Link>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-orange-400 transition-colors">
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
                <span className="text-gray-400">Fixed £5 Prize Split / Sub</span>
              </li>
              <li>
                <span className="text-gray-400">40% / 35% / 25% Tier Split</span>
              </li>
              <li>
                <span className="text-gray-400">100% Jackpot Rollover Guarantee</span>
              </li>
              <li>
                <span className="text-gray-400">Score Proof Verification Gate</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} Digital Heroes. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Built for golfers making a real difference.
          </p>
        </div>
      </div>
    </footer>
  );
}

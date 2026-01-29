import Link from "next/link";
import { Icons } from "./icons";
import { FaTiktok, FaYoutube, FaFacebook } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background/50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Icons.logo className="w-auto h-7" />
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Edumate Pro. All rights reserved.</p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
             <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary transition-colors">Courses</Link>
             <Link href="/tutors" className="text-sm text-muted-foreground hover:text-primary transition-colors">Tutors</Link>
             <Link href="/community" className="text-sm text-muted-foreground hover:text-primary transition-colors">Community</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}

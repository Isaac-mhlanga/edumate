import Link from "next/link";
import { Icons } from "./icons";
import { FaTiktok, FaYoutube, FaFacebook } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
                <Icons.logo className="h-8 w-auto" />
                <p className="text-sm text-muted-foreground">The future of learning is here. Edumate Pro combines cutting-edge technology with expert-led instruction.</p>
                <div className="flex space-x-4">
                    <a href="#" className="text-muted-foreground hover:text-primary"><FaTiktok /></a>
                    <a href="#" className="text-muted-foreground hover:text-primary"><FaYoutube /></a>
                    <a href="#" className="text-muted-foreground hover:text-primary"><FaFacebook /></a>
                </div>
            </div>
            <div>
                <h4 className="font-semibold text-foreground mb-4">Explore</h4>
                <nav className="flex flex-col space-y-2">
                    <Link href="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
                    <Link href="/courses" className="text-sm text-muted-foreground hover:text-primary">Courses</Link>
                    <Link href="/tutors" className="text-sm text-muted-foreground hover:text-primary">Tutors</Link>
                    <Link href="/community" className="text-sm text-muted-foreground hover:text-primary">Community</Link>
                </nav>
            </div>
             <div>
                <h4 className="font-semibold text-foreground mb-4">Resources</h4>
                <nav className="flex flex-col space-y-2">
                    <Link href="/high-school" className="text-sm text-muted-foreground hover:text-primary">High School</Link>
                    <Link href="/varsity" className="text-sm text-muted-foreground hover:text-primary">Varsity</Link>
                </nav>
            </div>
             <div>
                <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                <nav className="flex flex-col space-y-2">
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                </nav>
            </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/20 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Edumate Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

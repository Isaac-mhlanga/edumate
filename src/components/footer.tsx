
import Link from "next/link";
import { Icons } from "./icons";
import { FaTiktok, FaYoutube, FaFacebook } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-border/20 bg-background/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2 md:col-span-1 space-y-4">
                <Icons.logo className="h-8 w-auto" />
                <p className="text-sm text-muted-foreground">Empowering students to excel in high school subjects through comprehensive video courses and interactive learning.</p>
            </div>
            <div>
                <h4 className="font-semibold text-foreground mb-4">Subjects</h4>
                <nav className="flex flex-col space-y-2">
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Mathematics</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Science</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">English</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">History</Link>
                </nav>
            </div>
             <div>
                <h4 className="font-semibold text-foreground mb-4">Support</h4>
                <nav className="flex flex-col space-y-2">
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Help Center</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Tutorials</Link>
                </nav>
            </div>
             <div>
                <h4 className="font-semibold text-foreground mb-4">Company</h4>
                <nav className="flex flex-col space-y-2">
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">About Us</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
                </nav>
            </div>
            <div>
                <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
                <div className="flex space-x-2">
                    <a href="#" className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="TikTok"><FaTiktok /></a>
                    <a href="https://www.youtube.com/@EdumatePro" target="_blank" rel="noopener noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="YouTube"><FaYoutube /></a>
                    <a href="#" className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Facebook"><FaFacebook /></a>
                </div>
            </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/20 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Edumate Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

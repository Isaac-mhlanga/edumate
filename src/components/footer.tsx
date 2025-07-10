
import { Icons } from "./icons";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Edumate Pro</span>
            </Link>
            <p className="mt-4 text-muted-foreground text-sm">
              Future-proofing skills for the next generation of leaders.
            </p>
          </div>
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-semibold">Company</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">About</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Press</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Resources</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Help Center</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Legal</h4>
              <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Edumate Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

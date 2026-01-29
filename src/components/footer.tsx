import Link from "next/link";
import { Icons } from "./icons";
import { FaTiktok, FaYoutube, FaFacebook } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur-sm py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1 col-span-2 md:col-span-3 lg:col-span-1">
             <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Icons.logo className="w-auto h-8" />
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              Empowering students to excel in high school subjects through comprehensive video courses and interactive learning.
            </p>
          </div>
          
          {/* Links Sections */}
          {[
            {
              title: 'Subjects',
              links: ['Mathematics', 'Science', 'English', 'History', 'Languages']
            },
            {
              title: 'Support',
              links: ['Help Center', 'Contact Us', 'FAQ', 'Tutorials']
            },
            {
              title: 'Company',
              links: ['About Us', 'Careers', 'Privacy Policy', 'Terms of Service']
            }
          ].map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold text-primary mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-muted-foreground hover:text-primary transition-colors duration-300 text-left">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

           {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-semibold text-primary mb-4">Follow Us</h3>
            <div className="flex space-x-3">
                <Link href="https://www.tiktok.com/@edumate.pro?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <FaTiktok className="h-5 w-5" />
                </Link>
                <Link href="https://www.youtube.com/channel/UCG91mxIVykFs-0L5FZNk01g" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <FaYoutube className="h-5 w-5" />
                </Link>
                 <Link href="https://www.facebook.com/facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <FaFacebook className="h-5 w-5" />
                </Link>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} EDUMATE. All rights reserved. Made with love for students.</p>
        </div>
      </div>
    </footer>
  );
}


import Link from "next/link";
import { Icons } from "./icons";

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
             <Link href="/" className="flex items-center gap-2.5 mb-4">
              <Icons.logo className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                EDUMATE
              </h3>
            </Link>
            <p className="text-gray-300 leading-relaxed">
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
          ].map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold text-teal-400 mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link href="#" className="text-gray-300 hover:text-emerald-400 transition-colors duration-300 text-left">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} EDUMATE. All rights reserved. Made with love for students.</p>
        </div>
      </div>
    </footer>
  );
}

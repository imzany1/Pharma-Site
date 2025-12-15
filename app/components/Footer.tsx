import Link from "next/link"
import { Pill, Mail, MapPin, Phone, Linkedin, Twitter, Facebook } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground border-t border-border">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pill className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-foreground">PharmaCorp</span>
          </div>
          <p className="text-sm leading-relaxed">
            Advancing healthcare through innovation and dedication. Trusted by millions worldwide.
          </p>
          <div className="flex gap-4 pt-2">
            <Link href="#" className="hover:text-primary transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              <Facebook className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Company</h3>
          <ul className="space-y-2">
            <li><Link href="/about" className="text-sm hover:text-primary transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="text-sm hover:text-primary transition-colors">Careers</Link></li>
            <li><Link href="/news" className="text-sm hover:text-primary transition-colors">News & Media</Link></li>
            <li><Link href="/contact" className="text-sm hover:text-primary transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-semibold text-foreground mb-4">Our Focus</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="text-sm hover:text-primary transition-colors">Research</Link></li>
            <li><Link href="#" className="text-sm hover:text-primary transition-colors">Development</Link></li>
            <li><Link href="#" className="text-sm hover:text-primary transition-colors">Therapeutics</Link></li>
            <li><Link href="#" className="text-sm hover:text-primary transition-colors">Global Health</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground mb-4">Contact</h3>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-primary mt-0.5" />
            <span className="text-sm">123 Innovation Drive,<br />Tech Valley, CA 94043</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-primary" />
            <span className="text-sm">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-primary" />
            <span className="text-sm">contact@pharmacorp.com</span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border/50">
        <div className="container mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} PharmaCorp. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

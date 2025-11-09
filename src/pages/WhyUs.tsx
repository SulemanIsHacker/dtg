import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { MessageCircle, Shield, RefreshCcw, CheckCircle, DollarSign, Package, Globe, Lock, Users as UsersIcon, Zap, Star } from "lucide-react";
import capcutPro from "@/assets/capcut-pro.jpg";
import canvaPro from "@/assets/canva-pro.jpg";
import jasperAi from "@/assets/jasper-ai.jpg";
import chatgptPlus from "@/assets/chatgpt-plus.jpg";
import notionPro from "@/assets/notion-pro.jpg";
import { Seo } from "@/components/Seo";

const testimonials = [
  {
    name: "Ayesha K.",
    feedback: "I got instant access to premium tools at a fraction of the price. Super trustworthy and responsive support!",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
  },
  {
    name: "Ali R.",
    feedback: "The best place for genuine subscriptions. No scams, no hassle. Highly recommended!",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
  },
  {
    name: "Sara M.",
    feedback: "I was skeptical at first, but DAILYTECH TOOLS SOLUTIONS delivered exactly as promised. Will buy again!",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 4.8,
  },
];

const WhyUs = () => (
  <>
    <Seo 
      title="Why Choose DAILYTECH TOOLS SOLUTIONS? | Genuine AI & SEO Tools"
      description="Discover why DAILYTECH TOOLS SOLUTIONS is the trusted choice for premium AI and SEO tools. 100% genuine software, 24/7 WhatsApp support, instant delivery, and comprehensive support."
      canonicalPath="/why-us"
    />
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header />
      {/* Hero Section */}
      <section className="py-16 px-4 bg-background text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          Your Tools. Our Trust.
        </h1>
        <p className="text-lg md:text-xl mb-8 text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Official AI & SEO tools. Affordable prices. Real support.
        </p>
        <Button 
          className="text-lg px-8 py-4 shadow-md hover:scale-105 transition-transform bg-primary text-primary-foreground font-bold rounded-full"
          size="lg"
          onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
        >
          Contact Us
        </Button>
      </section>

      {/* Problem → Solution Section */}
      <section className="py-12 px-4 bg-card">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Problem */}
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>The Problem</h2>
            <ul className="space-y-4 text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <li className="flex items-center gap-3"><Shield className="w-6 h-6 text-muted-foreground" /> Fake tools, ghost sellers</li>
              <li className="flex items-center gap-3"><RefreshCcw className="w-6 h-6 text-muted-foreground" /> Tools stop working in 2 days</li>
              <li className="flex items-center gap-3"><Lock className="w-6 h-6 text-muted-foreground" /> No support, no replacement</li>
              <li className="flex items-center gap-3"><Globe className="w-6 h-6 text-muted-foreground" /> Confusion & zero trust</li>
            </ul>
          </div>
          {/* Solution */}
          <div>
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>Our Solution</h2>
            <ul className="space-y-4 text-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <li className="flex items-center gap-3"><CheckCircle className="w-6 h-6 text-primary" /> 100% Official Licenses</li>
              <li className="flex items-center gap-3"><Zap className="w-6 h-6 text-primary" /> Instant Delivery</li>
              <li className="flex items-center gap-3"><RefreshCcw className="w-6 h-6 text-primary" /> Replacement or Support Guarantee</li>
              <li className="flex items-center gap-3"><MessageCircle className="w-6 h-6 text-primary" /> Real-time WhatsApp Support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* What Makes Us Different (USP Section) */}
      <section className="py-16 px-4 bg-background">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          What Sets DAILYTECH TOOLS SOLUTIONS Apart?
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center text-center border border-border">
            <Shield className="w-8 h-8 mb-2 text-primary bg-card rounded-full" />
            <span className="font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Official Tools Only</span>
            <span className="text-muted-foreground text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>No grey market. No cracked software.</span>
          </div>
          <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center text-center border border-border">
            <MessageCircle className="w-8 h-8 mb-2 text-primary bg-card rounded-full" />
            <span className="font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>24/7 WhatsApp Support</span>
            <span className="text-muted-foreground text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>You'll always have help when you need it.</span>
          </div>
          <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center text-center border border-border">
            <DollarSign className="w-8 h-8 mb-2 text-primary bg-card rounded-full" />
            <span className="font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Affordable Bundles</span>
            <span className="text-muted-foreground text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Tools starting from just ₹499/month.</span>
          </div>
          <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center text-center border border-border">
            <RefreshCcw className="w-8 h-8 mb-2 text-primary bg-card rounded-full" />
            <span className="font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Instant Replacement</span>
            <span className="text-muted-foreground text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Something stopped? We fix or replace—fast.</span>
          </div>
        </div>
      </section>

      {/* Visual Trust Section (Testimonials/Stats) */}
      <section className="py-16 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-4 mb-2">
                <UsersIcon className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>500+ Users</span>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <Package className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>30+ Tools</span>
              </div>
              <div className="flex items-center gap-4">
                <Star className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>100% Uptime Support</span>
              </div>
            </div>
            {/* Screenshots/Proofs Placeholder */}
            <div className="flex gap-4">
              <img 
                src={capcutPro} 
                alt="CapCut Pro interface screenshot showing premium features" 
                className="w-28 h-20 object-cover rounded-lg shadow border-2 border-card"
                loading="lazy"
                decoding="async"
              />
              <img 
                src={canvaPro} 
                alt="Canva Pro dashboard with premium templates and features" 
                className="w-28 h-20 object-cover rounded-lg shadow border-2 border-card"
                loading="lazy"
                decoding="async"
              />
              <img 
                src={chatgptPlus} 
                alt="ChatGPT Plus interface showing advanced AI capabilities" 
                className="w-28 h-20 object-cover rounded-lg shadow border-2 border-card"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-background rounded-xl p-6 shadow flex flex-col items-center text-center border border-border">
                <img 
                  src={t.avatar} 
                  alt={`${t.name} - Satisfied DAILYTECH TOOLS SOLUTIONS customer`} 
                  className="w-14 h-14 rounded-full mb-2 object-cover border-2 border-primary"
                  loading="lazy"
                  decoding="async"
                />
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: Math.floor(t.rating) }).map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                  {t.rating % 1 !== 0 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 opacity-60" />}
                </div>
                <p className="text-muted-foreground text-sm mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>" {t.feedback} "</p>
                <span className="font-semibold text-primary">{t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emotional CTA Section */}
      <section className="py-16 px-4 flex flex-col items-center justify-center bg-card text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-foreground" style={{ fontFamily: 'Montserrat, sans-serif' }}>
          DAILYTECH TOOLS SOLUTIONS = Your Digital Catalyst
        </h2>
        <p className="text-lg md:text-xl mb-8 text-muted-foreground" style={{ fontFamily: 'Poppins, sans-serif' }}>
          We don't just sell tools — we unlock your digital growth.<br/>
          Whether you're a freelancer, student, or content creator — DAILYTECH TOOLS SOLUTIONS gives you the power to create without limits.
        </p>
        <Button 
          className="text-lg px-8 py-4 shadow-lg hover:scale-105 transition-transform bg-primary text-primary-foreground font-bold rounded-full"
          size="lg"
          onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
        >
          Get Access Now → WhatsApp
        </Button>
      </section>
    </div>
  </>
);

export default WhyUs;

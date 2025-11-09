import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users } from "lucide-react";
import { Seo } from "@/components/Seo";

const owners = [
  {
    name: "Suleman Shahzad",
    role: "Co-Founder & Growth Lead",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    bio: "Suleman is passionate about making premium digital tools accessible to everyone. He leads growth and customer success at DAILYTECH TOOLS SOLUTIONS."
  },
  {
    name: "Abdul Qadeer",
    role: "Co-Founder & Operations Lead",
    avatar: "https://randomuser.me/api/portraits/men/76.jpg",
    bio: "Abdul ensures every tool and subscription is genuine, secure, and delivered with care. He manages operations and partnerships."
  }
];

const AboutUs = () => {
  return (
    <>
      <Seo 
        title="About DAILYTECH TOOLS SOLUTIONS | Your Trusted Digital Tools Partner"
        description="Learn about DAILYTECH TOOLS SOLUTIONS's mission to provide genuine premium AI and SEO tools at affordable prices. Discover our commitment to quality, support, and customer satisfaction."
        canonicalPath="/about"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <main className="flex-1 w-full">
          <section className="py-16 px-4 bg-background text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-primary to-brand-teal bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              About DAILYTECH TOOLS SOLUTIONS
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: 'Poppins, sans-serif' }}>
              DAILYTECH TOOLS SOLUTIONS was founded by two friends with a mission: to make official AI, SEO, and creative tools affordable and accessible for everyone in Pakistan and beyond. We believe in trust, transparency, and real support—no scams, no fake tools, just genuine value.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-8 mt-12">
              {owners.map((owner, i) => (
                <Card key={i} className="bg-card rounded-xl shadow-lg border border-border w-full max-w-xs mx-auto">
                  <CardContent className="flex flex-col items-center p-6">
                    <img src={owner.avatar} alt={owner.name} className="w-20 h-20 rounded-full mb-4 object-cover border-2 border-primary" />
                    <h3 className="font-bold text-xl mb-1 text-primary" style={{ fontFamily: 'Montserrat, sans-serif' }}>{owner.name}</h3>
                    <span className="text-sm text-muted-foreground mb-2">{owner.role}</span>
                    <p className="text-sm text-muted-foreground text-center mb-2">{owner.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-16 max-w-2xl mx-auto bg-card rounded-xl p-8 shadow border border-border">
              <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
              <p className="text-base text-muted-foreground mb-2">We started DAILYTECH TOOLS SOLUTIONS to solve a real problem: overpriced subscriptions, unreliable sellers, and lack of support in the digital tools market. Our goal is to empower freelancers, students, agencies, and creators with genuine, affordable access to the best tools—backed by real people and comprehensive support.</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <Shield className="w-6 h-6 text-primary" />
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default AboutUs;

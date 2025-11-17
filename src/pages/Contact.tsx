import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Seo } from "@/components/Seo";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = `Name: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\nMessage: ${formData.message}`;
    window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleWhatsAppContact = () => {
    const message = "Hi! I'd like to get in touch about your premium tools. Can you help me?";
    window.open(`https://wa.me/2348141988239?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <Seo 
        title="Contact Us | DAILYTECH TOOLS SOLUTIONS - Get Premium Tools Support"
        description="Contact DAILYTECH TOOLS SOLUTIONS for premium AI and SEO tools support. Get instant help via WhatsApp or email. 24/7 customer service available."
        canonicalPath="/contact"
        keywords="contact dailytech tools solutions, premium tools support, customer service, whatsapp support, AI tools help"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-background via-background to-card">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions about our premium tools? Need support? We're here to help you 24/7.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <CardTitle>WhatsApp Support (Main)</CardTitle>
                  <CardDescription>Primary support line</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    +234 814 198 8239
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get instant help and support for all your tool-related questions.
                  </p>
                  <Button onClick={handleWhatsAppContact} className="w-full bg-green-600 hover:bg-green-700">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <CardTitle>WhatsApp Support (Backup)</CardTitle>
                  <CardDescription>Alternative support line</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    +234 9139063677
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Use this number if the main line is busy.
                  </p>
                  <Button 
                    onClick={() => {
                      const message = "Hi! I'd like to get in touch about your premium tools. Can you help me?";
                      window.open(`https://wa.me/2349139063677?text=${encodeURIComponent(message)}`, '_blank');
                    }} 
                    variant="outline" 
                    className="w-full border-green-400 text-green-600 hover:bg-green-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>Email Support</CardTitle>
                  <CardDescription>Detailed inquiries via email</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    For detailed questions or business inquiries.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="mailto:support@toolsystore.com">
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-blue-500" />
                  </div>
                  <CardTitle>Phone Support</CardTitle>
                  <CardDescription>Direct phone assistance</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Call us for immediate assistance with your tools.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a href="tel:+2348141988239">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Send us a Message</CardTitle>
                  <CardDescription className="text-center">
                    Fill out the form below and we'll get back to you via WhatsApp
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Full Name
                        </label>
                        <Input
                          id="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address
                        </label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">
                        Subject
                      </label>
                      <Input
                        id="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        placeholder="What's this about?"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message
                      </label>
                      <Textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Tell us how we can help you..."
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg">
                      <Send className="w-4 h-4 mr-2" />
                      Send via WhatsApp
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Business Hours */}
            <div className="mt-16 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-semibold">Business Hours</h3>
              </div>
              <p className="text-muted-foreground">
                Our support team is available Monday to Friday 9 AM to 6 PM (WAT). For urgent issues, WhatsApp support is available 24/7.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;

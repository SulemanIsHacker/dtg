import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Truck, 
  FileText, 
  Camera, 
  Lock, 
  Users, 
  MessageCircle, 
  Star,
  Zap,
  Link,
  ArrowUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Heart,
  Award,
  Globe,
  Phone,
  Mail,
  Send,
  Download,
  Eye,
  ThumbsUp,
  CreditCard,
  RefreshCw,
  UserCheck,
  FileCheck,
  Timer,
  Sparkles
} from "lucide-react";
import { Seo } from "@/components/Seo";

const RefundPolicy = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [refundForm, setRefundForm] = useState({
    name: '',
    email: '',
    orderId: '',
    reason: '',
    description: '',
    proof: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Basic validation
      if (!refundForm.name || !refundForm.email || !refundForm.orderId || !refundForm.reason || !refundForm.description) {
        setSubmitStatus('error');
        alert('Please fill in all required fields.');
        return;
      }
      
      // Proof files are optional but recommended
      // if (!refundForm.proof || refundForm.proof.length === 0) {
      //   setSubmitStatus('error');
      //   alert('Please upload proof of the issue.');
      //   return;
      // }
      
      // Simulate API call (replace with actual API endpoint)
      const formData = new FormData();
      formData.append('name', refundForm.name);
      formData.append('email', refundForm.email);
      formData.append('orderId', refundForm.orderId);
      formData.append('reason', refundForm.reason);
      formData.append('description', refundForm.description);
      
      // Add proof files
      if (refundForm.proof) {
        for (let i = 0; i < refundForm.proof.length; i++) {
          formData.append('proof', refundForm.proof[i]);
        }
      }
      
      // Make actual API call
      const response = await fetch('/api/refund-request', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit refund request');
      }
      
      const result = await response.json();
      
      console.log('Refund request submitted successfully:', result);
      
      // Send notification webhook
      try {
        await fetch('/api/webhooks/refund-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticketId: result.ticketId,
            name: refundForm.name,
            email: refundForm.email,
            orderId: refundForm.orderId,
            reason: refundForm.reason,
            description: refundForm.description,
            proofCount: refundForm.proof?.length || 0
          })
        });
      } catch (webhookError) {
        console.error('Failed to send notification:', webhookError);
        // Don't fail the main request if webhook fails
      }
      
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setRefundForm({
        name: '',
        email: '',
        orderId: '',
        reason: '',
        description: '',
        proof: null
      });
      
    } catch (error) {
      console.error('Error submitting refund request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Seo 
        title="Refund Policy & Terms | DAILYTECH TOOLS SOLUTIONS - Premium Digital Tools"
        description="Comprehensive refund policy and terms for premium AI and SEO tools. Instant delivery and 24/7 support with full transparency."
        canonicalPath="/refund-policy"
        keywords="refund policy, terms conditions, premium tools, quality guarantee, customer support, digital tools"
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 md:py-24 px-4 bg-gradient-to-br from-background via-background to-card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-brand-teal/5"></div>
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <div className={`w-24 h-24 bg-gradient-to-br from-primary/20 to-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}>
              <Heart className="w-12 h-12 text-primary" />
            </div>
            <h1 className={`text-4xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary to-brand-teal bg-clip-text text-transparent transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              Customer Satisfaction is Our #1 Priority
            </h1>
            <p className={`text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto transition-all duration-1000 delay-400 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              We provide premium digital tools with complete transparency, instant delivery, and comprehensive support. 
              Your satisfaction is our priority with our comprehensive support policy.
            </p>
            <div className={`flex flex-wrap justify-center gap-4 mt-8 transition-all duration-1000 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
                Quality Support
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-2" />
                Instant Delivery
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <MessageCircle className="w-4 h-4 mr-2" />
                24/7 Support
              </Badge>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-12 px-4 bg-gradient-to-r from-primary/5 to-brand-teal/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
                <p className="text-muted-foreground text-sm">Only verified, high-quality digital tools from trusted sources</p>
              </div>
              <div className="text-center p-6 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="w-16 h-16 bg-brand-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-brand-teal" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Instant Delivery</h3>
                <p className="text-muted-foreground text-sm">Get your tools within 5-10 minutes of payment confirmation</p>
              </div>
              <div className="text-center p-6 bg-card/50 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="w-16 h-16 bg-brand-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-brand-purple" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                <p className="text-muted-foreground text-sm">Your data is protected with enterprise-grade security</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comprehensive Policy Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Comprehensive Terms & Conditions
                </h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transparent policies designed to protect both you and us, ensuring a smooth experience for everyone.
              </p>
            </div>

            <div className="space-y-8">
              {/* Policy 1: Guarantee & Warranty */}
              <Card className="border-l-4 border-l-primary/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">1. Guarantee & Warranty Policy</CardTitle>
                      <CardDescription className="text-base">
                        Your satisfaction is our top priority with comprehensive coverage
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">Private Access Tools</h4>
                  <p className="text-muted-foreground">
                        Every private tool includes comprehensive support. If the tool stops working 
                        due to our fault, we provide immediate replacement or appropriate resolution within 24-48 hours.
                      </p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-amber-800 dark:text-amber-200 text-sm">
                          <strong>Important:</strong> Misuse or breaking usage rules immediately voids our responsibility.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy 2: Delivery Policy */}
              <Card className="border-l-4 border-l-brand-teal/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-brand-teal" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">2. Delivery Policy</CardTitle>
                      <CardDescription className="text-base">
                        Lightning-fast delivery with guaranteed timeframes
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-brand-teal/5 rounded-lg p-4 border border-brand-teal/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Timer className="w-4 h-4 text-brand-teal" />
                        <h4 className="font-semibold text-brand-teal">Standard Delivery</h4>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        <strong>5-10 minutes</strong> after payment confirmation via WhatsApp
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 mb-2">
                        <RefreshCw className="w-4 h-4 text-red-600" />
                        <h4 className="font-semibold text-red-600">Late Delivery</h4>
                      </div>
                      <p className="text-red-800 dark:text-red-200 text-sm">
                        If delivery exceeds <strong>24 hours</strong>, you're eligible for a <strong>100% refund</strong>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> All products are digital-only. No physical items are shipped.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Policy 3: Refund & Replacement */}
              <Card className="border-l-4 border-l-brand-purple/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <CreditCard className="w-6 h-6 text-brand-purple" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">3. Refund & Replacement Policy</CardTitle>
                      <CardDescription className="text-base">
                        Clear conditions for refunds and replacements
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-green-600 dark:text-green-400">
                        ✅ Refunds/Replacements are provided if:
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">Technical issue verified by our support team</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">Clear screenshot or video proof is provided</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">The tool has been used according to rules & instructions</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">The malfunction is from our side (not device/browser issue)</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg mb-4 text-red-600 dark:text-red-400">
                        ❌ No Refund/Replacement will be provided if:
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">The tool is no longer needed</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">Complaint is vague, unverifiable, or lacks proof</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">Misuse, lack of understanding, or device/browser conflicts</p>
                        </div>
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">Rules and instructions were ignored or broken</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy 4: Proof Requirements */}
              <Card className="border-l-4 border-l-amber-500/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">4. Proof of Technical Issues</CardTitle>
                      <CardDescription className="text-base">
                        Required documentation for all refund claims
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                      <div className="flex items-start gap-2">
                        <FileCheck className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Required Documentation</h4>
                          <ul className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
                            <li>• Clear screenshot or screen recording of the issue</li>
                            <li>• Proof must be provided within the warranty period</li>
                            <li>• Claims without visual proof will be rejected automatically</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy 5: Security & Privacy */}
              <Card className="border-l-4 border-l-blue-500/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">5. Security & Privacy Policy</CardTitle>
                      <CardDescription className="text-base">
                        Your data protection and account security
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Our Responsibility</h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        We are responsible only if you follow our instructions carefully and the issue originates from our platform/account.
                      </p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                      <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">We are NOT responsible if:</h4>
                      <ul className="text-red-800 dark:text-red-200 text-sm space-y-1">
                        <li>• Account details are shared with unauthorized people</li>
                        <li>• VPNs, third-party tools, or suspicious logins trigger restrictions</li>
                        <li>• Multiple unauthorized logins cause account bans</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Policy 6: Support & Resolution */}
              <Card className="border-l-4 border-l-green-500/50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">6. Support & Resolution</CardTitle>
                      <CardDescription className="text-base">
                        24/7 support with guaranteed response times
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Response Time</h4>
                      </div>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        <strong>24-48 hours</strong> for all queries and support requests
                      </p>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-2 mb-2">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-green-800 dark:text-green-200">Resolution Time</h4>
                      </div>
                      <p className="text-green-800 dark:text-green-200 text-sm">
                        <strong>2-4 hours</strong> during business hours for technical issues
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Refund Request Form */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-brand-teal/5">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Request a Refund
                </h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                If you're eligible for a refund, please fill out the form below with all required information and proof.
              </p>
            </div>

            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">Refund Request Form</CardTitle>
                <CardDescription>
                  Please provide accurate information to expedite your refund process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRefundSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Full Name *</label>
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={refundForm.name}
                        onChange={(e) => setRefundForm({...refundForm, name: e.target.value})}
                        required
                        className="border-primary/20 focus:border-primary transition-all duration-200 hover:border-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address *</label>
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={refundForm.email}
                        onChange={(e) => setRefundForm({...refundForm, email: e.target.value})}
                        required
                        className="border-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Order ID / Transaction ID *</label>
                    <Input
                      type="text"
                      placeholder="Enter your order or transaction ID"
                      value={refundForm.orderId}
                      onChange={(e) => setRefundForm({...refundForm, orderId: e.target.value})}
                      required
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason for Refund *</label>
                    <div className="relative">
                      <select
                        value={refundForm.reason}
                        onChange={(e) => setRefundForm({...refundForm, reason: e.target.value})}
                        required
                        className="w-full px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background text-foreground appearance-none cursor-pointer transition-all duration-200 hover:border-primary/40"
                      >
                        <option value="" className="text-muted-foreground">Select a reason</option>
                        <option value="technical-issue" className="text-foreground">Technical Issue</option>
                        <option value="not-as-described" className="text-foreground">Product Not As Described</option>
                        <option value="delivery-delay" className="text-foreground">Delivery Delay</option>
                        <option value="duplicate-purchase" className="text-foreground">Duplicate Purchase</option>
                        <option value="account-issue" className="text-foreground">Account Access Issue</option>
                        <option value="billing-error" className="text-foreground">Billing Error</option>
                        <option value="other" className="text-foreground">Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Detailed Description *</label>
                    <Textarea
                      placeholder="Please provide a detailed description of the issue. Include any error messages, screenshots, or other relevant information."
                      value={refundForm.description}
                      onChange={(e) => setRefundForm({...refundForm, description: e.target.value})}
                      required
                      rows={4}
                      className="border-primary/20 focus:border-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Proof of Issue (Screenshots/Videos) *</label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Camera className="w-8 h-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 font-medium">
                          Upload screenshots or videos showing the issue
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Supported formats: JPG, PNG, GIF, MP4, MOV (Max 10MB each)
                        </p>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          multiple
                          className="hidden"
                          id="proof-upload"
                          onChange={(e) => setRefundForm({...refundForm, proof: e.target.files})}
                        />
                        <label
                          htmlFor="proof-upload"
                          className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 cursor-pointer transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Choose Files
                        </label>
                      </div>
                    </div>
                    {refundForm.proof && refundForm.proof.length > 0 && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-800 dark:text-green-200 font-medium">
                            {refundForm.proof.length} file(s) selected
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">Important Notes</h4>
                        <ul className="text-amber-800 dark:text-amber-200 text-sm space-y-1">
                          <li>• Refund processing takes 2-5 business days</li>
                          <li>• All claims are verified by our support team</li>
                          <li>• False claims may result in account suspension</li>
                          <li>• Refunds are processed to the original payment method</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Status Messages */}
                  {submitStatus === 'success' && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-green-800 dark:text-green-200">Refund Request Submitted Successfully!</h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            We have received your refund request. Our support team will review it and respond within 24-48 hours. 
                            You will receive an email confirmation shortly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-3">
                        <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-semibold text-red-800 dark:text-red-200">Submission Failed</h4>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            There was an error submitting your refund request. Please try again or contact our support team directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-primary hover:bg-primary/90 text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Refund Request
                      </>
                    )}
            </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact & Support */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-brand-teal/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Get in Touch
                </h2>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Need help? Have questions? Our support team is here to assist you 24/7.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">WhatsApp Support</h3>
                <p className="text-muted-foreground text-sm mb-4">24/7 instant support</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Now
                </Button>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email Support</h3>
                <p className="text-muted-foreground text-sm mb-4">support@toolsy.store</p>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
                <p className="text-muted-foreground text-sm mb-4">Real-time assistance</p>
                <Button variant="outline" className="w-full">
                  <Globe className="w-4 h-4 mr-2" />
                  Start Chat
                </Button>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone Support</h3>
                <p className="text-muted-foreground text-sm mb-4">Our support team is available Monday to Friday 9 AM to 6 PM (WAT). For urgent issues, WhatsApp support is available 24/7.</p>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
              </Card>
            </div>

            {/* Social Media Links */}
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-6">Follow Us for Updates</h3>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" size="lg" className="h-16 px-8 hover:bg-green-600 hover:text-white transition-colors">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Channel
              </Button>
                <Button variant="outline" size="lg" className="h-16 px-8 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-colors">
                  <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded mr-2"></div>
                  Instagram
              </Button>
                <Button variant="outline" size="lg" className="h-16 px-8 hover:bg-blue-600 hover:text-white transition-colors">
                  <div className="w-5 h-5 bg-blue-600 rounded mr-2"></div>
                  Facebook
              </Button>
                <Button variant="outline" size="lg" className="h-16 px-8 hover:bg-black hover:text-white transition-colors">
                  <div className="w-5 h-5 bg-black rounded mr-2"></div>
                  TikTok
              </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Scroll to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors z-50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};

export default RefundPolicy;
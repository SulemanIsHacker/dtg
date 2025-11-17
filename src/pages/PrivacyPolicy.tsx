import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Database, Globe, Mail, Phone, Calendar } from "lucide-react";
import { Seo } from "@/components/Seo";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <>
      <Seo 
        title="Privacy Policy | DAILYTECH TOOLS SOLUTIONS - Your Data Protection"
        description="Learn how DAILYTECH TOOLS SOLUTIONS protects your privacy and handles your personal information. Read our comprehensive privacy policy to understand your rights and our data practices."
        canonicalPath="/privacy-policy"
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-background"
      >
        <Header />
        
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last Updated: January 15, 2025
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Version 1.0
              </Badge>
            </div>
          </div>

          {/* Quick Navigation */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Quick Navigation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => document.getElementById('information-collection')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="text-left">
                    <div className="font-medium">Information We Collect</div>
                    <div className="text-sm text-muted-foreground">What data we gather and why</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => document.getElementById('how-we-use')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="text-left">
                    <div className="font-medium">How We Use Your Data</div>
                    <div className="text-sm text-muted-foreground">Purposes and legal basis</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => document.getElementById('data-sharing')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="text-left">
                    <div className="font-medium">Data Sharing</div>
                    <div className="text-sm text-muted-foreground">When and with whom we share</div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => document.getElementById('your-rights')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="text-left">
                    <div className="font-medium">Your Rights</div>
                    <div className="text-sm text-muted-foreground">Control over your data</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle>Introduction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Welcome to DAILYTECH TOOLS SOLUTIONS ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our services, or interact with us.
                </p>
                <p>
                  By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card id="information-collection">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Contact Information:</strong> Name, email address, phone number</li>
                    <li>• <strong>Account Information:</strong> Username, password, profile details</li>
                    <li>• <strong>Payment Information:</strong> Billing address, payment method details</li>
                    <li>• <strong>Communication Data:</strong> Messages, feedback, testimonials</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Automatically Collected Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Device Information:</strong> IP address, browser type, operating system</li>
                    <li>• <strong>Usage Data:</strong> Pages visited, time spent, click patterns</li>
                    <li>• <strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
                    <li>• <strong>Location Data:</strong> General location based on IP address</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Third-Party Information</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• <strong>Social Media:</strong> Information from social media platforms when you connect accounts</li>
                    <li>• <strong>Analytics:</strong> Data from Google Analytics and similar services</li>
                    <li>• <strong>Payment Processors:</strong> Transaction data from payment providers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card id="how-we-use">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Service Provision</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Process orders and payments</li>
                      <li>• Provide customer support</li>
                      <li>• Send order confirmations</li>
                      <li>• Manage your account</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Communication</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Respond to inquiries</li>
                      <li>• Send newsletters (with consent)</li>
                      <li>• Provide updates about services</li>
                      <li>• Share promotional offers</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Improvement</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Analyze website usage</li>
                      <li>• Improve user experience</li>
                      <li>• Develop new features</li>
                      <li>• Conduct research</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Legal Compliance</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Comply with laws</li>
                      <li>• Prevent fraud</li>
                      <li>• Enforce terms of service</li>
                      <li>• Protect rights and safety</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card id="data-sharing">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Data Sharing and Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Service Providers</h3>
                    <p className="text-sm text-muted-foreground">
                      We work with trusted third-party service providers who assist us in operating our website, processing payments, and providing customer support. These providers are contractually obligated to protect your information.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Legal Requirements</h3>
                    <p className="text-sm text-muted-foreground">
                      We may disclose your information if required by law, court order, or government request, or to protect our rights, property, or safety.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Business Transfers</h3>
                    <p className="text-sm text-muted-foreground">
                      In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">With Your Consent</h3>
                    <p className="text-sm text-muted-foreground">
                      We may share your information with third parties when you explicitly consent to such sharing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Technical Measures</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• SSL/TLS encryption</li>
                      <li>• Secure data storage</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Organizational Measures</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• Employee training</li>
                      <li>• Data access policies</li>
                      <li>• Incident response procedures</li>
                      <li>• Regular policy reviews</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card id="your-rights">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Your Rights and Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p>You have certain rights regarding your personal information:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Access and Control</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Access:</strong> Request a copy of your data</li>
                      <li>• <strong>Correction:</strong> Update inaccurate information</li>
                      <li>• <strong>Deletion:</strong> Request data removal</li>
                      <li>• <strong>Portability:</strong> Export your data</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Communication Preferences</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Opt-out:</strong> Unsubscribe from emails</li>
                      <li>• <strong>Preferences:</strong> Manage communication settings</li>
                      <li>• <strong>Cookies:</strong> Control cookie settings</li>
                      <li>• <strong>Marketing:</strong> Limit marketing communications</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">How to Exercise Your Rights</h3>
                  <p className="text-sm mb-3">
                    To exercise any of these rights, please contact us using the information provided below. We will respond to your request within 30 days.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('mailto:privacy@toolsystore.com', '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      Email Us
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use cookies and similar tracking technologies to enhance your experience on our website.</p>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Types of Cookies We Use</h3>
                    <ul className="space-y-2 text-sm">
                      <li>• <strong>Essential Cookies:</strong> Required for website functionality</li>
                      <li>• <strong>Analytics Cookies:</strong> Help us understand website usage</li>
                      <li>• <strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                      <li>• <strong>Marketing Cookies:</strong> Used for advertising purposes</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Managing Cookies</h3>
                    <p className="text-sm text-muted-foreground">
                      You can control cookies through your browser settings. However, disabling certain cookies may affect website functionality.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Children's Privacy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
                </p>
              </CardContent>
            </Card>

            {/* International Transfers */}
            <Card>
              <CardHeader>
                <CardTitle>International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards to protect your information.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Email:</strong> privacy@toolsystore.com</p>
                      <p><strong>WhatsApp (Main):</strong> +234 814 198 8239</p>
                      <p><strong>WhatsApp (Backup):</strong> +234 9139063677</p>
                      <p><strong>Address:</strong> DAILYTECH TOOLS SOLUTIONS, Pakistan</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Data Protection Officer</h3>
                    <div className="space-y-2 text-sm">
                      <p>For privacy-related inquiries, you can also contact our Data Protection Officer at the same email address.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    onClick={() => window.open('mailto:privacy@toolsystore.com', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email Privacy Team
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open('https://wa.me/2348141988239', '_blank')}
                    className="flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    WhatsApp Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer CTA */}
          <div className="mt-16 text-center bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're here to help! If you have any questions about our privacy practices or need to exercise your rights, don't hesitate to reach out to us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.open('mailto:privacy@toolsystore.com', '_blank')}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                Contact Privacy Team
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate(-1)}
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default PrivacyPolicy;

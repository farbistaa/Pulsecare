// client/src/pages/PrivacyPolicy.tsx
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Globe, Phone, ArrowUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Privacy Policy & Compliance
          </h1>
          <p className="text-gray-600">
            PulseCare's commitment to data protection and international compliance standards
          </p>
          <div className="flex gap-2 mt-4">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">GDPR Compliant</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm">HIPAA Secure</span>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-sm">WHO Guidelines</span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded text-sm">BD DSA 2018</span>
          </div>
        </div>

        <div className="space-y-8">
          {/* GDPR Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                GDPR Compliance (EU General Data Protection Regulation)
              </CardTitle>
              <CardDescription>
                We comply with EU data protection standards for all users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Data Rights</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Right to access your personal data</li>
                    <li>• Right to rectification and erasure</li>
                    <li>• Right to data portability</li>
                    <li>• Right to object to processing</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Legal Basis</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Consent for blood donation matching</li>
                    <li>• Legitimate interest for emergency services</li>
                    <li>• Vital interests for life-saving activities</li>
                    <li>• Legal compliance for health records</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Contact our Data Protection Officer at <strong>dpo@pulsecare.bd</strong> for any GDPR-related inquiries.
              </p>
            </CardContent>
          </Card>

          {/* HIPAA Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                HIPAA Compliance (Health Insurance Portability and Accountability Act)
              </CardTitle>
              <CardDescription>
                Protecting health information with US healthcare standards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Security Measures</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• AES-256 encryption for all data</li>
                    <li>• Secure data transmission (TLS 1.3)</li>
                    <li>• Access controls and audit logs</li>
                    <li>• Regular security assessments</li>
                  </ul>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">PHI Protection</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Protected health information safeguards</li>
                    <li>• Minimum necessary rule compliance</li>
                    <li>• Business associate agreements</li>
                    <li>• Breach notification procedures</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Our HIPAA Security Officer ensures continuous compliance monitoring and incident response.
              </p>
            </CardContent>
          </Card>

          {/* WHO Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                WHO Guidelines Adherence
              </CardTitle>
              <CardDescription>
                Following World Health Organization recommended standards for blood safety
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Blood Safety Standards</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Voluntary non-remunerated blood donation</li>
                    <li>• Donor screening and selection criteria</li>
                    <li>• Safe blood collection practices</li>
                    <li>• Quality management systems</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Information Management</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Donor registration and tracking</li>
                    <li>• Blood inventory management</li>
                    <li>• Traceability and recall procedures</li>
                    <li>• Adverse event reporting</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bangladesh Digital Security Act */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-orange-600" />
                Bangladesh Digital Security Act 2018
              </CardTitle>
              <CardDescription>
                Compliance with national digital security and privacy laws
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Digital Security</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Secure digital infrastructure</li>
                    <li>• Protection against cyber threats</li>
                    <li>• Data localization requirements</li>
                    <li>• Incident reporting to authorities</li>
                  </ul>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">User Rights</h4>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li>• Right to digital privacy</li>
                    <li>• Protection from digital harassment</li>
                    <li>• Consent for data processing</li>
                    <li>• Notification of data breaches</li>
                  </ul>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Registered with Bangladesh Computer Council and compliant with local data protection laws.
              </p>
            </CardContent>
          </Card>

          {/* Data Processing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-gray-600" />
                Data Processing & Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <h4>What We Collect:</h4>
                <ul>
                  <li>Personal identification (name, age, contact information)</li>
                  <li>Health information (blood group, donation history, medical eligibility)</li>
                  <li>Location data (for matching donors with recipients)</li>
                  <li>Communication preferences and platform usage</li>
                </ul>

                <h4>How We Use Data:</h4>
                <ul>
                  <li>Facilitate blood donation matching and emergency requests</li>
                  <li>Maintain donor eligibility and safety records</li>
                  <li>Improve platform functionality and user experience</li>
                  <li>Comply with health authority reporting requirements</li>
                </ul>

                <h4>Data Retention:</h4>
                <ul>
                  <li>Active user data: Retained while account is active</li>
                  <li>Health records: 7 years as per medical record requirements</li>
                  <li>Communication logs: 2 years for quality assurance</li>
                  <li>Anonymized analytics: Indefinitely for research purposes</li>
                </ul>

                <h4>International Transfers:</h4>
                <p>
                  Data is primarily stored within Bangladesh. Any international transfers 
                  are conducted with appropriate safeguards including Standard Contractual 
                  Clauses and adequacy decisions.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact & Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Data Protection Officer</h4>
                  <p className="text-sm text-gray-600">
                    Email: dpo@pulsecare.bd<br />
                    Phone: +880 1XXX-XXXXXX<br />
                    Address: Dhaka, Bangladesh
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Supervisory Authority</h4>
                  <p className="text-sm text-gray-600">
                    Bangladesh Computer Council<br />
                    Directorate General of Health Services<br />
                    Ministry of Health and Family Welfare
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Last Updated:</strong> January 29, 2025<br />
                  <strong>Version:</strong> 2.0<br />
                  We reserve the right to update this policy. Users will be notified of material changes.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Top Button */}
          <div className="flex justify-center mt-8">
            <Button
              onClick={scrollToTop}
              variant="outline"
              size="lg"
              className="bg-white hover:bg-red-50 border-red-200 hover:border-red-300 text-red-600 hover:text-red-700 shadow-lg w-16 h-16 rounded-full p-0"
              title="Back to Top"
            >
              <ArrowUp className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
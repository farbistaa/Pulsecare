// client/src/pages/terms.tsx
import { useState } from 'react';
import { 
  Shield, Users, Heart, FileText, Clock, Globe, Mail, Phone, MapPin, 
  Home, CheckCircle, AlertTriangle 
} from 'lucide-react';
import { Link } from 'wouter';

const TermsPage: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  
  const toggleSection = (index: number) => {
    if (expandedSections.includes(index)) {
      setExpandedSections(expandedSections.filter(i => i !== index));
    } else {
      setExpandedSections([...expandedSections, index]);
    }
  };

  const sections = [
    {
      title: "1. Eligibility",
      icon: Users,
      content: (
        <div className="space-y-4 text-gray-700">
          <p>To use PulseCare services, you must meet the following eligibility requirements:</p>
          <ul className="space-y-3 pl-6 list-disc">
            <li>
              <span className="font-medium">Age Requirement:</span> You must be at least 18 years old to register as a blood donor. 
              This is in accordance with international blood donation standards and local regulations in Bangladesh.
            </li>
            <li>
              <span className="font-medium">Accurate Information:</span> You must provide complete, accurate, and up-to-date information during registration. 
              This includes but is not limited to your full name, contact details, blood type, medical history, and availability status.
            </li>
            <li>
              <span className="font-medium">Medical Compliance:</span> By using this Platform, you confirm that you meet all medical and legal requirements 
              for blood donation as stipulated by the World Health Organization (WHO) and the Bangladesh Directorate General of Health Services (DGHS).
            </li>
            <li>
              <span className="font-medium">Legal Capacity:</span> You must have the legal capacity to enter into binding agreements under the laws of Bangladesh.
            </li>
          </ul>
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> PulseCare reserves the right to verify the information provided and may request additional documentation 
              to confirm eligibility at any time.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "2. Services Provided",
      icon: Heart,
      content: (
        <div className="space-y-4 text-gray-700">
          <p>PulseCare is a digital platform designed to facilitate blood donation and transfusion processes. Our services include:</p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Core Services:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                <span className="font-medium">Donor Registration:</span> Comprehensive registration system for voluntary blood donors, 
                including health screening questionnaires and eligibility verification.
              </li>
              <li>
                <span className="font-medium">Recipient Matching:</span> Intelligent matching algorithm that connects blood seekers 
                with compatible donors based on blood type, location, availability, and urgency level.
              </li>
              <li>
                <span className="font-medium">Emergency Requests:</span> Priority handling of urgent blood requests with real-time 
                notifications to available donors in the vicinity.
              </li>
              <li>
                <span className="font-medium">Communication System:</span> Secure messaging platform for coordination between donors, 
                recipients, healthcare facilities, and administrators.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Additional Features:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>Donor availability tracking and scheduling</li>
              <li>Blood donation history and impact metrics</li>
              <li>Health reminders and donation eligibility notifications</li>
              <li>Integration with healthcare facilities for verification</li>
            </ul>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">Important Disclaimer</p>
                <p className="text-yellow-700 text-sm mt-1">
                  PulseCare is a technology platform that facilitates connections between donors and recipients. 
                  We are not a medical service provider, blood bank, or healthcare facility. 
                  All blood donations and transfusions must be conducted through licensed medical facilities 
                  following proper medical protocols.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "3. User Responsibilities",
      icon: Shield,
      content: (
        <div className="space-y-4 text-gray-700">
          <p>As a user of PulseCare, you have the following responsibilities:</p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Information Accuracy:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                You are solely responsible for the accuracy and completeness of all information provided to the Platform, 
                including personal details, medical history, blood type, contact information, and availability status.
              </li>
              <li>
                You must promptly update your information if there are any changes, particularly regarding your health status, 
                contact details, or donation eligibility.
              </li>
              <li>
                You must not withhold any information that could affect the safety of blood donation or transfusion.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Platform Usage:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                You agree to use the Platform only for its intended purpose: facilitating voluntary blood donation and seeking blood donors.
              </li>
              <li>
                You must not use the Platform for any fraudulent, unlawful, or abusive purposes, including but not limited to:
                <ul className="list-disc pl-5 mt-1">
                  <li>Submitting false or misleading donation requests</li>
                  <li>Impersonating other users or medical professionals</li>
                  <li>Harassing, spamming, or intimidating other users</li>
                  <li>Using the Platform for commercial gain without authorization</li>
                </ul>
              </li>
              <li>
                You must respect the privacy and confidentiality of other users and not misuse their contact information.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Account Security:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                You are responsible for maintaining the confidentiality of your account credentials and must not share them with others.
              </li>
              <li>
                You must immediately notify PulseCare if you suspect any unauthorized access to your account.
              </li>
              <li>
                You are responsible for all activities that occur under your account.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Consequences of Violation:</strong> Failure to comply with these responsibilities may result in account suspension, 
              termination, and potential legal action.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "4. Public Information & Liability Disclaimer",
      icon: Globe,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Information Visibility:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                <span className="font-medium">Donor Information:</span> To facilitate matching, certain donor information will be visible to blood seekers, including:
                <ul className="list-disc pl-5 mt-1">
                  <li>Full name (as provided during registration)</li>
                  <li>Blood type and Rh factor</li>
                  <li>General location (district level, not exact address)</li>
                  <li>Availability status and last donation date</li>
                  <li>Contact preferences (email/phone)</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Seeker Information:</span> Blood seekers' information will be visible to matched donors, including:
                <ul className="list-disc pl-5 mt-1">
                  <li>Patient's first name and age</li>
                  <li>Required blood type and quantity</li>
                  <li>Medical facility name and location</li>
                  <li>Urgency level and required date</li>
                  <li>Contact person details</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Information Protection:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Sensitive information such as exact addresses, detailed medical history, and national identification numbers 
                will not be publicly displayed and will only be shared with authorized medical personnel when necessary.
              </li>
              <li>
                We strongly discourage users from sharing unnecessary personal information in public communication channels 
                within the Platform.
              </li>
              <li>
                Users must not share other users' personal information outside the Platform without explicit consent.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Liability Disclaimer:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare is not responsible for any misuse, abuse, or third-party exploitation of publicly available user information.
              </li>
              <li>
                PulseCare does not verify the identity or credentials of all users beyond the registration process. 
                Users are encouraged to exercise caution when interacting with others through the Platform.
              </li>
              <li>
                PulseCare is not liable for any damages resulting from the disclosure of information by users themselves 
                or through breaches of user accounts.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Recommendation:</strong> For additional privacy, users may choose to use a nickname or partial name 
              instead of their full legal name in their public profile.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "5. No Medical or Emergency Guarantee",
      icon: Heart,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Platform Limitations:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare is a digital facilitation platform only and does not provide medical services, diagnosis, treatment, or advice.
              </li>
              <li>
                We do not guarantee the availability of donors at any given time. Donor participation is voluntary and subject to individual circumstances.
              </li>
              <li>
                We do not guarantee the medical suitability of any donor for a specific recipient. Final medical clearance must be obtained from licensed healthcare professionals.
              </li>
              <li>
                We do not guarantee the success of any blood donation or transfusion process. Many factors beyond our control may affect outcomes.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Emergency Situations:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                While PulseCare prioritizes emergency requests, we cannot guarantee immediate response or fulfillment of urgent blood needs.
              </li>
              <li>
                In life-threatening emergencies, users should contact local emergency services (999 in Bangladesh) and proceed to the nearest medical facility immediately.
              </li>
              <li>
                PulseCare should not be used as the sole means of securing blood in critical situations. Traditional channels through hospitals and blood banks should also be utilized.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Liability Exclusions:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare is not liable for:
                <ul className="list-disc pl-5 mt-1">
                  <li>Any medical complications arising from blood donation or transfusion</li>
                  <li>Delays in donor response or blood delivery</li>
                  <li>Cancellations by donors or recipients</li>
                  <li>Failure to secure a compatible donor</li>
                  <li>Any direct, indirect, incidental, or consequential damages resulting from the use of the Platform</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Critical Notice</p>
                <p className="text-red-700 text-sm mt-1">
                  Use of PulseCare is at your own risk. In all medical matters, consult with qualified healthcare professionals. 
                  The Platform does not replace professional medical advice or emergency services.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "6. Compliance & Data Protection",
      icon: Shield,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Regulatory Compliance:</h4>
            <p>PulseCare is committed to operating in full compliance with all applicable laws and regulations:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">GDPR</p>
                    <p className="text-sm text-gray-600">EU General Data Protection Regulation</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">HIPAA</p>
                    <p className="text-sm text-gray-600">US Health Insurance Portability and Accountability Act</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">WHO Guidelines</p>
                    <p className="text-sm text-gray-600">World Health Organization Blood Safety Standards</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Bangladesh DSA</p>
                    <p className="text-sm text-gray-600">Digital Security Act 2018</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Data Protection Measures:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                <span className="font-medium">Encryption:</span> All data transmitted to and from the Platform is encrypted using industry-standard protocols (TLS 1.3).
              </li>
              <li>
                <span className="font-medium">storage:</span> Personal and medical data is stored in secure, encrypted databases with access restricted to authorized personnel only.
              </li>
              <li>
                <span className="font-medium">Access Control:</span> Role-based access control ensures that users can only access information necessary for their role.
              </li>
              <li>
                <span className="font-medium">Retention:</span> Data is retained only for as long as necessary to provide services and comply with legal obligations.
              </li>
              <li>
                <span className="font-medium">Breach Notification:</span> In the event of a data breach, affected users will be notified within 72 hours as required by law.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">User Rights:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>Right to access personal data held by PulseCare</li>
              <li>Right to rectify inaccurate personal data</li>
              <li>Right to request deletion of personal data (subject to legal obligations)</li>
              <li>Right to restrict processing of personal data</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Data Protection Officer:</strong> For any data protection concerns or to exercise your rights, 
              please contact our Data Protection Officer at dpo@pulsecare.bd.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "7. Platform Usage Rules",
      icon: FileText,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Prohibited Activities:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                <span className="font-medium">False Information:</span> Submitting false or misleading blood requests, donor registrations, or medical information.
              </li>
              <li>
                <span className="font-medium">Impersonation:</span> Creating accounts or posing as another person, entity, or medical professional without authorization.
              </li>
              <li>
                <span className="font-medium">Unauthorized Access:</span> Attempting to hack, disrupt, or misuse the Platform through any means, including:
                <ul className="list-disc pl-5 mt-1">
                  <li>Introducing malware or malicious code</li>
                  <li>Overwhelming the system with requests (DDoS attacks)</li>
                  <li>Probing for security vulnerabilities</li>
                  <li>Accessing areas of the Platform without proper authorization</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Commercial Exploitation:</span> Using the Platform for commercial purposes without written consent, including:
                <ul className="list-disc pl-5 mt-1">
                  <li>Selling blood or blood products</li>
                  <li>Advertising unrelated products or services</li>
                  <li>Collecting user data for marketing purposes</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Harassment:</span> Engaging in behavior that harasses, abuses, or intimidates other users.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Content Guidelines:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>All content shared on the Platform must be respectful, appropriate, and relevant to blood donation.</li>
              <li>Users must not share content that is:
                <ul className="list-disc pl-5 mt-1">
                  <li>Defamatory, libelous, or slanderous</li>
                  <li>Obscene, pornographic, or sexually explicit</li>
                  <li>Discriminatory or hateful</li>
                  <li>Violent or threatening</li>
                  <li>In violation of any applicable law</li>
                </ul>
              </li>
              <li>Users must respect copyright and intellectual property rights when sharing content.</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Enforcement:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare administrators may suspend or terminate accounts for violations of these rules without prior notice.
              </li>
              <li>
                Violations may also be reported to relevant law enforcement authorities.
              </li>
              <li>
                Users may appeal account suspensions or terminations by contacting support@pulsecare.bd within 30 days.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Reporting Violations:</strong> Users can report violations by using the "Report" feature within the Platform 
              or by emailing abuse@pulsecare.bd with details of the violation.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "8. Intellectual Property",
      icon: Shield,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Platform Ownership:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                All content, software, designs, text, graphics, logos, images, and other materials on the PulseCare Platform 
                are owned by or licensed to PulseCare and are protected by copyright, trademark, and other intellectual property laws.
              </li>
              <li>
                The PulseCare name, logo, and all related trademarks and service marks are the exclusive property of PulseCare.
              </li>
              <li>
                The look and feel of the Platform, including all custom graphics, button icons, and scripts, are the property of PulseCare.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">User License:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Users are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Platform 
                for personal, non-commercial purposes related to blood donation.
              </li>
              <li>
                This license does not include:
                <ul className="list-disc pl-5 mt-1">
                  <li>The right to modify, adapt, or create derivative works of the Platform</li>
                  <li>The right to reverse engineer, decompile, or disassemble the Platform</li>
                  <li>The right to rent, lease, or sublicense the Platform</li>
                  <li>The right to use the Platform for commercial purposes without authorization</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">User-Generated Content:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Users retain ownership of the content they submit to the Platform (such as profile information, donation requests, and messages).
              </li>
              <li>
                By submitting content, users grant PulseCare a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, 
                and display such content solely for the purpose of operating and improving the Platform.
              </li>
              <li>
                Users represent and warrant that they have all necessary rights to grant this license and that their content does not infringe on any third-party rights.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Third-Party Content:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                The Platform may contain links to third-party websites or resources. PulseCare is not responsible for and does not endorse such third-party content.
              </li>
              <li>
                Any use of third-party content is at the user's own risk and subject to the third-party's terms and conditions.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Infringement Claims:</strong> To report intellectual property infringement, please contact 
              legal@pulsecare.bd with detailed information about the allegedly infringing material.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "9. Limitation of Liability",
      icon: Shield,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">General Disclaimer:</h4>
            <p>
              The PulseCare Platform is provided on an "as is" and "as available" basis without any warranties of any kind, 
              either express or implied. PulseCare disclaims all warranties, including but not limited to:
            </p>
            <ul className="space-y-2 pl-6 list-disc">
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties of non-infringement</li>
              <li>Warranties arising from course of dealing or usage of trade</li>
              <li>Warranties that the Platform will be uninterrupted, timely, secure, or error-free</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Exclusion of Damages:</h4>
            <p>
              To the fullest extent permitted by law, PulseCare, its affiliates, officers, employees, agents, partners, and licensors 
              shall not be liable for:
            </p>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                <span className="font-medium">Direct Damages:</span> Any direct damages arising from your use of or inability to use the Platform.
              </li>
              <li>
                <span className="font-medium">Indirect Damages:</span> Any indirect, incidental, special, consequential, or punitive damages, 
                including but not limited to:
                <ul className="list-disc pl-5 mt-1">
                  <li>Loss of profits, revenue, or data</li>
                  <li>Personal injury or property damage</li>
                  <li>Emotional distress</li>
                  <li>Damage to reputation</li>
                  <li>Loss of business opportunities</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">Third-Party Actions:</span> Any damages resulting from actions of third parties, including other users.
              </li>
              <li>
                <span className="font-medium">Technical Issues:</span> Any damages resulting from technical failures, network outages, 
                or other issues beyond PulseCare's reasonable control.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Limitation Period:</h4>
            <p>
              Any claim or cause of action arising out of or related to these Terms or the Platform must be filed within one (1) year 
              after such claim or cause of action arose, regardless of any statute of limitations to the contrary.
            </p>
          </div>
          
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-800">Important Legal Notice</p>
                <p className="text-red-700 text-sm mt-1">
                  Some jurisdictions do not allow the exclusion of certain warranties or the limitation or exclusion of liability 
                  for consequential or incidental damages. In these jurisdictions, our liability shall be limited to the maximum 
                  extent permitted by law.
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "10. Termination",
      icon: Clock,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Termination by User:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Users may terminate their account at any time by:
                <ul className="list-disc pl-5 mt-1">
                  <li>Accessing the account settings and selecting "Delete Account"</li>
                  <li>Contacting support@pulsecare.bd with a termination request</li>
                </ul>
              </li>
              <li>
                Upon termination, users will lose access to the Platform and all associated data, subject to our data retention policies.
              </li>
              <li>
                Certain information may be retained as required by law or for legitimate business purposes, including:
                <ul className="list-disc pl-5 mt-1">
                  <li>Transaction records for financial and legal compliance</li>
                  <li>Communication logs for security and abuse prevention</li>
                  <li>Aggregated anonymized data for analytics and improvement</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Termination by PulseCare:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare may suspend or terminate a user's account at any time, with or without cause, including but not limited to:
                <ul className="list-disc pl-5 mt-1">
                  <li>Breach of these Terms or any other policies</li>
                  <li>Violation of applicable laws or regulations</li>
                  <li>Activity that may expose PulseCare to legal liability</li>
                  <li>Requests from law enforcement or government agencies</li>
                  <li>Suspicious or fraudulent activity</li>
                  <li>Inactivity for an extended period (12 months or more)</li>
                </ul>
              </li>
              <li>
                PulseCare will provide notice of termination when feasible, except in cases where immediate action is required 
                to prevent harm, comply with legal obligations, or protect the integrity of the Platform.
              </li>
              <li>
                Upon termination, PulseCare may:
                <ul className="list-disc pl-5 mt-1">
                  <li>Remove or disable access to user content</li>
                  <li>Block the user's IP address or device</li>
                  <li>Retain user information as required by law</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Effect of Termination:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Upon termination, all rights and licenses granted to the user under these Terms will immediately cease.
              </li>
              <li>
                Sections of these Terms that by their nature should survive termination shall continue to apply, including but not limited to:
                <ul className="list-disc pl-5 mt-1">
                  <li>Intellectual Property Rights (Section 8)</li>
                  <li>Limitation of Liability (Section 9)</li>
                  <li>Indemnification (Section 13)</li>
                  <li>Governing Law (Section 14)</li>
                </ul>
              </li>
              <li>
                PulseCare shall not be liable to users or any third party for any termination of access to the Platform.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Account Reactivation:</strong> In some cases, terminated accounts may be reactivated at PulseCare's discretion. 
              Users may request reactivation by contacting support@pulsecare.bd within 30 days of termination.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "11. Governing Law",
      icon: Globe,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Applicable Law:</h4>
            <p>
              These Terms and any disputes arising from or related to these Terms or the Platform shall be governed by and construed 
              in accordance with the laws of the People's Republic of Bangladesh, without regard to its conflict of law principles.
            </p>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Jurisdiction and Venue:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Any legal action or proceeding arising under these Terms will be brought exclusively in the courts of Dhaka, Bangladesh.
              </li>
              <li>
                Users irrevocably consent to the exclusive jurisdiction and venue of these courts.
              </li>
              <li>
                Users waive any objection to inconvenient forum and agree not to plead or claim that such forum is inconvenient.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">International Users:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare makes the Platform available in Bangladesh and internationally. However, access from jurisdictions where 
                the Platform or its content is illegal is prohibited.
              </li>
              <li>
                Users are responsible for compliance with local laws when accessing and using the Platform.
              </li>
              <li>
                If these Terms are found to be unenforceable in any jurisdiction, such unenforceability shall not affect the 
                enforceability of the remaining provisions.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Legal Compliance:</strong> PulseCare complies with applicable laws in the jurisdictions where it operates. 
              Users may be required to provide additional information or consent to comply with local regulations.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "12. Amendments",
      icon: Clock,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Right to Modify:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare reserves the right to modify these Terms at any time in its sole discretion.
              </li>
              <li>
                Modifications may be made to:
                <ul className="list-disc pl-5 mt-1">
                  <li>Reflect changes in the law or regulatory requirements</li>
                  <li>Accommodate changes to the Platform or services</li>
                  <li>Address new technologies or industry practices</li>
                  <li>Clarify or correct ambiguities in the existing Terms</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Notification of Changes:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                PulseCare will provide notice of material changes to these Terms by:
                <ul className="list-disc pl-5 mt-1">
                  <li>Posting the updated Terms on the Platform with a new "Last Updated" date</li>
                  <li>Sending an email notification to registered users</li>
                  <li>Displaying a prominent notice within the Platform</li>
                </ul>
              </li>
              <li>
                The date of the last revision will be indicated at the top of these Terms.
              </li>
              <li>
                Users are responsible for reviewing these Terms periodically to stay informed of changes.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Effect of Amendments:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Updated Terms become effective immediately upon posting unless otherwise specified.
              </li>
              <li>
                Continued use of the Platform after changes have been made constitutes acceptance of the updated Terms.
              </li>
              <li>
                If users do not agree to the updated Terms, they must:
                <ul className="list-disc pl-5 mt-1">
                  <li>Cease using the Platform immediately</li>
                  <li>Terminate their account as described in Section 10</li>
                </ul>
              </li>
              <li>
                For material changes that significantly affect users' rights, PulseCare may provide additional notice and 
                an opportunity to opt out of certain changes where feasible.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Historical Versions:</strong> Users may request copies of previous versions of these Terms by 
              contacting legal@pulsecare.bd. Archived versions will be retained for compliance purposes.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "13. User-Generated Content & Indemnity",
      icon: FileText,
      content: (
        <div className="space-y-4 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">User-Generated Content:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                <span className="font-medium">Definition:</span> User-Generated Content (UGC) includes any information, 
                data, text, software, music, sound, photographs, graphics, videos, messages, or other materials that users 
                submit, post, or display on the Platform.
              </li>
              <li>
                <span className="font-medium">Examples of UGC:</span>
                <ul className="list-disc pl-5 mt-1">
                  <li>Donor profiles and medical information</li>
                  <li>Blood requests and patient details</li>
                  <li>Messages between users</li>
                  <li>Testimonials and reviews</li>
                  <li>Forum posts and comments</li>
                </ul>
              </li>
              <li>
                <span className="font-medium">User Warranties:</span> By submitting UGC, users represent and warrant that:
                <ul className="list-disc pl-5 mt-1">
                  <li>They own or have the necessary rights to submit the content</li>
                  <li>The content is accurate, complete, and not misleading</li>
                  <li>The content does not violate any law or regulation</li>
                  <li>The content does not infringe on any third-party rights</li>
                  <li>The content is not defamatory, libelous, or obscene</li>
                  <li>The content does not contain viruses or malicious code</li>
                </ul>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">License to User Content:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                By submitting UGC, users grant PulseCare a worldwide, non-exclusive, royalty-free, perpetual, irrevocable, 
                and sublicensable license to use, reproduce, modify, adapt, publish, translate, create derivative works from, 
                distribute, and display such content.
              </li>
              <li>
                This license is granted solely for the purpose of operating, developing, providing, promoting, and improving 
                the Platform and PulseCare's services.
              </li>
              <li>
                Users acknowledge that PulseCare may not review all UGC and is not responsible for the accuracy, reliability, 
                or legality of UGC.
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Indemnification:</h4>
            <ul className="space-y-2 pl-6 list-disc">
              <li>
                Users agree to indemnify, defend, and hold harmless PulseCare, its affiliates, officers, employees, agents, 
                partners, and licensors from and against any claims, damages, liabilities, costs, and expenses (including 
                reasonable attorneys' fees) arising from or related to:
                <ul className="list-disc pl-5 mt-1">
                  <li>User's use of or access to the Platform</li>
                  <li>User's violation of these Terms or any other policies</li>
                  <li>User's violation of any third-party rights, including intellectual property rights</li>
                  <li>User's submission of UGC that infringes on any rights</li>
                  <li>User's interaction with other users</li>
                  <li>User's violation of applicable laws or regulations</li>
                </ul>
              </li>
              <li>
                PulseCare reserves the right to assume the exclusive defense and control of any matter subject to indemnification, 
                in which case users will cooperate with PulseCare in asserting any available defenses.
              </li>
            </ul>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Content Removal:</strong> PulseCare reserves the right (but not the obligation) to review, remove, 
              or disable access to any UGC that it believes in its sole discretion violates these Terms or is otherwise objectionable.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "14. Governing Law",
      icon: Globe,
      content: (
        <div className="space-y-4 text-gray-700">
          <p>
            This section is intentionally left blank as it duplicates Section 11. Please refer to Section 11 for complete 
            information regarding governing law and jurisdiction.
          </p>
        </div>
      )
    },
    {
      title: "15. Amendments",
      icon: Clock,
      content: (
        <div className="space-y-4 text-gray-700">
          <p>
            This section is intentionally left blank as it duplicates Section 12. Please refer to Section 12 for complete 
            information regarding amendments to these Terms.
          </p>
        </div>
      )
    },
    {
      title: "16. Contact Information",
      icon: Mail,
      content: (
        <div className="space-y-6 text-gray-700">
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">General Inquiries:</h4>
            <p>
              For general questions about PulseCare or these Terms, please contact our support team:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-gray-900">support@pulsecare.bd</p>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-gray-900">+880 1XXX-XXXXXX</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Data Protection Officer:</h4>
            <p>
              For data protection concerns, privacy questions, or to exercise your data rights:
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">dpo@pulsecare.bd</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Legal Department:</h4>
            <p>
              For legal inquiries, intellectual property matters, or formal notices:
            </p>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Email</p>
                  <p className="text-gray-900">legal@pulsecare.bd</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Physical Address:</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="bg-gray-100 p-2 rounded-lg mt-1">
                  <MapPin className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Headquarters</p>
                  <p className="text-gray-900">
                    PulseCare Technologies Limited<br />
                    123 Healthcare Avenue<br />
                    Dhaka, Bangladesh<br />
                    Postal Code: 1200
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border-l-4 border-gray-300 p-4 rounded">
            <p className="text-sm text-gray-600">
              <strong>Response Time:</strong> We strive to respond to all inquiries within 3 business days. For urgent matters, 
              please indicate "URGENT" in your email subject line.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 px-4 shadow-lg">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-red-600 p-3 rounded-lg">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Terms & Conditions</h1>
                <p className="text-gray-300 mt-1">Effective Date: January 29, 2026 | Version: 1.0</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Introduction */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-start gap-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-3">Welcome to PulseCare</h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms and Conditions ("Terms") govern your use of the PulseCare Blood and Donor Management Platform 
                  ("Platform," "we," "us," or "our"). By registering, accessing, or using PulseCare, you agree to be legally 
                  bound by these Terms. If you do not agree, please discontinue use of the Platform immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Sections */}
          <div className="divide-y divide-gray-200">
            {sections.map((section, index) => (
              <div key={index} className="transition-all duration-300">
                <button
                  onClick={() => toggleSection(index)}
                  className="group w-full p-6 flex justify-between items-center text-left bg-gradient-to-r from-transparent via-transparent to-transparent hover:from-red-50 hover:via-red-100/30 hover:to-red-50 transition-all duration-300 ease-in-out"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg group-hover:bg-red-100 transition-colors">
                      <section.icon className="h-5 w-5 text-gray-700 group-hover:text-red-600 transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-red-700 transition-colors">{section.title}</h3>
                  </div>
                  <div className="text-gray-400 group-hover:text-red-600 transition-colors">
                    {expandedSections.includes(index) ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>
                
                {expandedSections.includes(index) && (
                  <div className="px-6 pb-6">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>© 2026 PulseCare. All rights reserved.</p>
          <p className="mt-1">Compliant with GDPR, HIPAA & Bangladesh Digital Security Act 2018</p>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
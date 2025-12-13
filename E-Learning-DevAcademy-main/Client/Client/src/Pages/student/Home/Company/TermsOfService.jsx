import React from 'react';
import { BookOpen, FileText, Shield, Users, CreditCard, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function TermsOfService() {
  const lastUpdated = "December 9, 2024";

  const sections = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Account Registration & Use",
      content: [
        {
          subtitle: "Eligibility",
          text: "You must be at least 13 years old to create an account. If you're under 18, you need parental consent. You're responsible for maintaining account security and all activities under your account."
        },
        {
          subtitle: "Account Responsibility",
          text: "You agree to provide accurate information during registration and keep it updated. You must not share your login credentials or allow others to access your account. Notify us immediately of any unauthorized access."
        },
        {
          subtitle: "Prohibited Activities",
          text: "You may not use the platform for illegal activities, distribute malware, attempt to hack or disrupt services, impersonate others, or engage in harassment or discriminatory behavior."
        }
      ]
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: "Payment & Refunds",
      content: [
        {
          subtitle: "Course Pricing",
          text: "All course prices are listed in Indian Rupees (INR) and include applicable taxes. Prices are subject to change, but enrolled students will not be affected by future price changes."
        },
        {
          subtitle: "Payment Processing",
          text: "Payments are processed securely through Razorpay. DevAcademy does not store your complete payment card information. All transactions are encrypted and comply with PCI DSS standards."
        },
        {
          subtitle: "Refund Policy",
          text: "We offer a 30-day money-back guarantee for most courses. To be eligible, you must have completed less than 30% of the course content. Refunds are processed within 7-10 business days to your original payment method through Razorpay."
        },
        {
          subtitle: "One-Time Purchase",
          text: "All courses are purchased individually with lifetime access. There are no recurring subscription fees. Once you enroll in a course, you have permanent access to all course materials and updates."
        }
      ]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Course Content & Intellectual Property",
      content: [
        {
          subtitle: "License to Access",
          text: "Upon enrollment, you receive a limited, non-exclusive, non-transferable license to access course content for personal, non-commercial use only."
        },
        {
          subtitle: "Content Ownership",
          text: "All course materials, including videos, documents, code, and assessments, are owned by DevAcademy or our instructors and protected by copyright laws."
        },
        {
          subtitle: "Prohibited Uses",
          text: "You may not download, copy, reproduce, distribute, or sell any course content. You may not create derivative works or use content for commercial purposes without written permission."
        },
        {
          subtitle: "User-Generated Content",
          text: "When you post reviews, comments, or questions, you grant DevAcademy a perpetual, royalty-free license to use, display, and distribute this content across our platform."
        }
      ]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Instructor Terms",
      content: [
        {
          subtitle: "Approval Process",
          text: "All instructors must apply and be approved by DevAcademy. We review credentials, teaching experience, and proposed course content. Approval typically takes 3-5 business days."
        },
        {
          subtitle: "Content Quality",
          text: "Instructors must maintain high-quality standards, provide accurate information, and keep course content updated. DevAcademy reserves the right to remove content that doesn't meet our standards."
        },
        {
          subtitle: "Revenue Sharing",
          text: "Instructors receive 70% of net revenue from their courses after platform fees and payment processing charges. Payments are processed monthly, 30 days after earnings are finalized."
        },
        {
          subtitle: "Content Rights",
          text: "Instructors grant DevAcademy a non-exclusive license to host, distribute, and promote their courses. Instructors retain ownership but cannot remove courses with active students without notice."
        }
      ]
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Certificates & Credentials",
      content: [
        {
          subtitle: "Certificate Issuance",
          text: "Certificates are issued upon successful course completion. To earn a certificate, you must complete all lectures in the course. Once all lectures are marked as complete, your certificate will be automatically generated and available in your account."
        },
        {
          subtitle: "Certificate Validity",
          text: "Our certificates verify that you completed all course lectures and materials. They are not accredited academic degrees or professional certifications unless explicitly stated. Certificates serve as proof of course completion."
        },
        {
          subtitle: "Verification",
          text: "All certificates include unique verification codes that employers or institutions can use to confirm authenticity on our website. Each certificate is permanently stored in your account and can be downloaded anytime."
        }
      ]
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "No Guarantee of Results",
          text: "While we strive for quality, we don't guarantee specific outcomes, job placement, salary increases, or career advancement from taking our courses."
        },
        {
          subtitle: "Service Availability",
          text: "We aim for 99.9% uptime but don't guarantee uninterrupted service. We may perform maintenance, updates, or experience technical issues that temporarily affect access."
        },
        {
          subtitle: "Third-Party Links",
          text: "Our platform may contain links to external websites. We're not responsible for the content, privacy practices, or availability of third-party sites."
        },
        {
          subtitle: "Limitation of Liability",
          text: "DevAcademy's total liability for any claim is limited to the amount you paid for the specific course or service in question, not to exceed ₹10,000."
        }
      ]
    },
    {
      icon: <XCircle className="w-8 h-8" />,
      title: "Termination",
      content: [
        {
          subtitle: "Your Right to Terminate",
          text: "You can delete your account anytime from settings. Upon deletion, you'll lose access to all enrolled courses, progress data, and certificates."
        },
        {
          subtitle: "Our Right to Terminate",
          text: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse the platform. Serious violations may result in immediate termination without refund."
        },
        {
          subtitle: "Effect of Termination",
          text: "Upon termination, your license to access course content immediately ends. We may retain certain data as required by law or legitimate business purposes."
        }
      ]
    }
  ];

  const quickFacts = [
    { label: "Refund Window", value: "30 Days", icon: <CreditCard className="w-5 h-5" /> },
    { label: "Support Response", value: "24-48 Hours", icon: <Users className="w-5 h-5" /> },
    { label: "Course Access", value: "Lifetime", icon: <CheckCircle className="w-5 h-5" /> },
    { label: "Certificate Validity", value: "Permanent", icon: <FileText className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
     

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto text-center">
          <FileText className="w-20 h-20 text-white mx-auto mb-6" />
          <h1 className="text-6xl font-bold mb-6 text-white">
            Terms of Service
          </h1>
          <p className="text-2xl text-purple-100 max-w-3xl mx-auto mb-4">
            Please read these terms carefully before using DevAcademy's services.
          </p>
          <p className="text-purple-200">Last Updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Quick Facts */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Quick Facts</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {quickFacts.map((fact, idx) => (
                <div key={idx} className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl">
                  <div className="flex justify-center text-purple-600 mb-3">{fact.icon}</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{fact.value}</div>
                  <div className="text-sm text-gray-600">{fact.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-12">
            <h2 className="text-3xl font-bold mb-6">Welcome to DevAcademy</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              These Terms of Service ("Terms") govern your access to and use of DevAcademy's website, mobile applications, and services (collectively, the "Platform"). By creating an account or using our Platform, you agree to be bound by these Terms.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              If you don't agree with any part of these Terms, please don't use our Platform. We may update these Terms periodically, and continued use after changes constitutes acceptance of the new Terms.
            </p>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-6">
              <p className="text-gray-700">
                <strong>⚠️ Important:</strong> These Terms include important information about your legal rights, remedies, and obligations. Please read them carefully.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-12">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded-3xl shadow-xl p-8 lg:p-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center text-white">
                  {section.icon}
                </div>
                <h2 className="text-3xl font-bold">{section.title}</h2>
              </div>
              
              <div className="space-y-6">
                {section.content.map((item, itemIdx) => (
                  <div key={itemIdx} className="pl-4 border-l-4 border-purple-200">
                    <h3 className="text-xl font-bold mb-2 text-purple-600">{item.subtitle}</h3>
                    <p className="text-gray-700 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Governing Law */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold mb-6">Governing Law & Disputes</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                These Terms are governed by the laws of India, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Platform shall be subject to the exclusive jurisdiction of courts in Nagpur, Maharashtra.
              </p>
              <p>
                <strong>Dispute Resolution:</strong> Before filing any legal action, you agree to first contact us to attempt to resolve the dispute informally. If we can't resolve it within 30 days, either party may pursue formal legal action.
              </p>
              <p>
                <strong>Arbitration:</strong> For disputes exceeding ₹1,00,000, both parties agree to resolve through binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.
              </p>
            </div>
          </div>
        </div>
      </section>

     

      {/* Acceptance Notice */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
            <p className="text-gray-700">
              <strong>By using DevAcademy, you acknowledge that:</strong> You have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. You are legally able to enter into binding contracts. You will use the Platform in compliance with all applicable laws and regulations.
            </p>
          </div>
        </div>
      </section>

     
    </div>
  );
}
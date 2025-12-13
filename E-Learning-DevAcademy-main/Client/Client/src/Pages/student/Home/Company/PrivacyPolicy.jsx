import React from 'react';
import { BookOpen, Shield, Lock, Eye, Database, UserCheck, Bell, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  const lastUpdated = "December 10, 2024";

  const sections = [
    {
      icon: <Database className="w-8 h-8" />,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "When you register on DevAcademy, we collect your name, email address, password, and profile photo. If you enroll in paid courses, we collect billing information through Razorpay, our secure payment processor."
        },
        {
          subtitle: "Learning Data",
          text: "We track your course enrollment, lecture completion progress, and certificates earned to provide your learning dashboard and determine certificate eligibility. Your progress is automatically saved as you complete each lecture."
        },
        {
          subtitle: "Technical Data",
          text: "We automatically collect device information, IP address, browser type, and usage patterns to ensure platform security and optimize performance."
        }
      ]
    },
    {
      icon: <Eye className="w-8 h-8" />,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your information to provide access to courses, track your lecture completion progress, generate certificates when you complete all lectures, and communicate important updates about your enrollment."
        },
        {
          subtitle: "Personalization",
          text: "Your learning data helps us recommend relevant courses and customize your dashboard based on your enrolled courses and completion status."
        },
        {
          subtitle: "Communication",
          text: "We send you course updates, new content notifications, certificate availability alerts, and important platform announcements. You can opt-out of promotional emails anytime from your account settings."
        },
        {
          subtitle: "Platform Improvement",
          text: "We analyze aggregated, anonymized data to improve course quality, identify popular topics, and enhance the overall learning experience."
        }
      ]
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All sensitive data is encrypted both in transit (using SSL/TLS) and at rest. Your password is hashed using industry-standard algorithms and cannot be retrieved by our team."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls ensuring only authorized personnel can access user data, and only when necessary for support or maintenance."
        },
        {
          subtitle: "Regular Audits",
          text: "Our security practices undergo regular third-party audits and penetration testing to identify and address potential vulnerabilities."
        }
      ]
    },
    {
      icon: <UserCheck className="w-8 h-8" />,
      title: "Your Rights",
      content: [
        {
          subtitle: "Access & Download",
          text: "You can access and download all your personal data at any time through your account settings. This includes your profile, course history, and certificates."
        },
        {
          subtitle: "Correction",
          text: "You have the right to update or correct any inaccurate personal information in your profile settings."
        },
        {
          subtitle: "Deletion",
          text: "You can request deletion of your account and personal data. Note that some information may be retained for legal compliance (e.g., transaction records)."
        },
        {
          subtitle: "Data Portability",
          text: "You can export your data in machine-readable formats to transfer to other services."
        }
      ]
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Third-Party Services",
      content: [
        {
          subtitle: "Payment Processors",
          text: "We use Razorpay as our secure payment gateway to process transactions. Your payment information is never stored on our servers. Razorpay handles all payment data in compliance with PCI DSS standards."
        },
        {
          subtitle: "Analytics",
          text: "We use analytics services to understand how users interact with our platform. These services may use cookies and similar tracking technologies to help us improve user experience."
        },
        {
          subtitle: "Content Delivery",
          text: "Course videos and materials are hosted on secure cloud services to ensure fast, reliable delivery to students worldwide."
        }
      ]
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use cookies to maintain your login session, remember your preferences, and ensure platform functionality."
        },
        {
          subtitle: "Analytics Cookies",
          text: "These help us understand how users navigate our platform and which features are most valuable."
        },
        {
          subtitle: "Marketing Cookies",
          text: "With your consent, we use cookies to show relevant advertisements and track campaign effectiveness. You can disable these in your browser settings."
        }
      ]
    }
  ];

  const highlights = [
    "We never sell your personal data to third parties",
    "You control your data and can delete it anytime",
    "Payment information is securely handled by Razorpay",
    "We're transparent about how we use your information"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
     

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto text-center">
          <Shield className="w-20 h-20 text-white mx-auto mb-6" />
          <h1 className="text-6xl font-bold mb-6 text-white">
            Privacy Policy
          </h1>
          <p className="text-2xl text-purple-100 max-w-3xl mx-auto mb-4">
            Your privacy is our priority. Learn how we collect, use, and protect your data.
          </p>
          <p className="text-purple-200">Last Updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Key Highlights */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Key Highlights</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <p className="text-gray-700 font-medium">{highlight}</p>
                </div>
              ))}
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

      

      {/* Footer Note */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <p className="text-gray-700">
              <strong>Note:</strong> This privacy policy may be updated periodically to reflect changes in our practices or legal requirements. We'll notify you of significant changes via email or prominent notice on our platform. Your continued use of DevAcademy after such changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </div>
      </section>

      
    </div>
  );
}
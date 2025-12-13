import React, { useState } from 'react';
import { BookOpen, Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Briefcase, FileQuestion, X } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateMessageMutation } from '@/features/api/authApi';


export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const [submitted, setSubmitted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [createMessage,{data,isLoading,isError}]=useCreateMessageMutation();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault(); // prevent page reload

 try {
    await createMessage(formData).unwrap();

    // Show success toast
    toast.success("Message sent successfully!");

    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      category: 'general',
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    toast.error("Failed to send message. Please try again.");
  }
};


  const helpTopics = [
  {
    icon: <BookOpen className="w-6 h-6 text-purple-600" />,
    title: "Getting Started",
    description: "Learn how to sign up, login, and start your first course."
  },
  {
    icon: <FileQuestion className="w-6 h-6 text-purple-600" />,
    title: "Course Enrollment",
    description: "Step-by-step guide on enrolling in courses and tracking progress."
  },
  {
    icon: <Mail className="w-6 h-6 text-purple-600" />,
    title: "Contact Support",
    description: "Reach us via email for any queries at devacademy2025@gmail.com."
  },
  {
    icon: <Phone className="w-6 h-6 text-purple-600" />,
    title: "Call Us",
    description: "Quick support over phone: +91 12345 67890 (Mon-Fri, 10AM-6PM)."
  }
];

  const contactInfo = [
    {
      icon: <Mail className="w-8 h-8" />,
      title: "Email Us",
      info: "devacademy2025@gmail.com",
      description: "We'll respond within 24-48 hours",
      color: "purple"
    },
    {
      icon: <Phone className="w-8 h-8" />,
      title: "Call Us",
      info: "+91 12345 67890",
      description: "Mon-Fri, 10AM-6PM IST",
      color: "blue"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Location",
      info: "123 Learning Street",
      description: "Demo City, India - 000000",
      color: "green"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Support Hours",
      info: "Mon-Fri: 10AM-6PM",
      description: "Email support available 24/7",
      color: "orange"
    }
  ];

  const faqs = [
    {
      question: "How do I enroll in a course?",
      answer: "Simply browse our courses, select the one you want, and click 'Enroll Now'. You'll be guided through the payment process."
    },
    {
      question: "Do you offer certificates?",
      answer: "Yes! Upon completing a course, you'll receive a verified certificate that you can share on LinkedIn and your resume."
    },
    {
      question: "Can I get a refund?",
      answer: "We offer a 30-day money-back guarantee if you're not satisfied with your course purchase."
    },
    {
      question: "How do I become an instructor?",
      answer: "Click on 'Become an Instructor' in the footer, fill out the application, and our team will review it within 3-5 business days."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">


      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Have questions? We're here to help! Reach out to us and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                <div className={`text-${item.color}-600 mb-4`}>{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-lg font-semibold text-gray-900 mb-1">{item.info}</p>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-colors"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="instructor">Become an Instructor</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-colors"
                    placeholder="How can we help?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-600 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <button
                  onClick={handleSubmit}
                  className=" cursor-pointer w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>

                {submitted && (
                  <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 rounded-lg">
                    ✓ Message sent successfully! We'll get back to you soon.
                  </div>
                )}
              </div>
            </div>

            {/* Map & Additional Info */}
            <div className="space-y-8">
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Our Office</h3>
                <div className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center mb-6">
                  <MapPin className="w-16 h-16 text-gray-400" />
                </div>
                <p className="text-gray-700 mb-4">
                  Visit us at our Demo City office during business hours. We'd love to meet you in person and discuss how DevAcademy can help you achieve your learning goals.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold">Address</p>
                      <p className="text-gray-600">123 Learning Street, Demo City, India - 000000</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold">Business Hours</p>
                      <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                      <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-blue-400 rounded-3xl shadow-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Need Immediate Help?</h3>
                <p className="mb-6 text-green-100">
                  Check out our Help Center for instant answers to common questions, or chat with our support team.
                </p>
                <button   onClick={() => setHelpOpen(true)}  className=" cursor-pointer w-full px-6 py-3 bg-white text-purple-600 rounded-lg font-bold hover:shadow-xl transition-all">
                  Visit Help Center
                </button>
              </div>


         {helpOpen && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 relative">
      {/* Close button */}
      <button
        onClick={() => setHelpOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        <X className="w-6 h-6 cursor-pointer" />
      </button>

      <h3 className="text-2xl font-bold mb-4">Help Center</h3>
      <p className="text-gray-600 mb-6">
        Find answers to common questions or contact our support team.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpTopics.map((topic, index) => (
          <div
            key={index}
            className="bg-gray-100 rounded-2xl p-4 flex items-start gap-4 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="mt-1">{topic.icon}</div>
            <div>
              <p className="font-semibold">{topic.title}</p>
              <p className="text-sm">{topic.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

            </div>

          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Quick answers to common questions</p>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold mb-3 text-gray-900">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}









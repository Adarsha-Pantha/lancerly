"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "support@lancerly.com",
    href: "mailto:support@lancerly.com"
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+1 (555) 123-4567",
    href: "tel:+15551234567"
  },
  {
    icon: MapPin,
    label: "Office",
    value: "123 Tech Street, San Francisco, CA 94105",
    href: "#"
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-white to-mint/5">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Link 
              href="/landing"
              className="inline-flex items-center gap-2 text-slate-blue hover:text-mint transition-colors mb-8"
            >
              <ArrowLeft size={20} />
              Back to Home
            </Link>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold text-slate-blue mb-6"
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-slate-blue/70 max-w-3xl mx-auto leading-relaxed"
            >
              Have questions about Lancerly? We're here to help. Reach out to our team and 
              we'll get back to you as soon as possible.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold text-slate-blue mb-6">Send us a Message</h2>
                
                <form className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-blue mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-mint/20 focus:border-mint bg-white"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-blue mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-mint/20 focus:border-mint bg-white"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-blue mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-mint/20 focus:border-mint bg-white"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-blue mb-2">
                      Subject
                    </label>
                    <select className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-mint/20 focus:border-mint bg-white">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Billing Question</option>
                      <option>Partnership</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-blue mb-2">
                      Message
                    </label>
                    <textarea
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-mint/20 focus:border-mint bg-white resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-blue mb-6">Contact Information</h2>
                <div className="space-y-4">
                  {contactInfo.map((info, i) => (
                    <div key={info.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-mint/10 rounded-lg flex items-center justify-center text-mint flex-shrink-0">
                        <info.icon size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-blue">{info.label}</p>
                        {info.href.startsWith('#') ? (
                          <p className="text-slate-blue/70">{info.value}</p>
                        ) : (
                          <a 
                            href={info.href}
                            className="text-slate-blue/70 hover:text-mint transition-colors"
                          >
                            {info.value}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-blue mb-4">Office Hours</h3>
                <div className="space-y-2 text-slate-blue/70">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                  <p>Saturday: 10:00 AM - 4:00 PM PST</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-blue mb-4">Response Time</h3>
                <div className="space-y-2 text-slate-blue/70">
                  <p>Email: Within 24 hours</p>
                  <p>Phone: Immediate during business hours</p>
                  <p>Support Tickets: Within 4-6 hours</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-slate-blue mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-slate-blue/70">Quick answers to common questions</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                question: "How do I get started on Lancerly?",
                answer: "Simply sign up for a free account, complete your profile, and you can start browsing projects or posting work immediately."
              },
              {
                question: "What are the fees for using Lancerly?",
                answer: "We charge a small commission on completed projects. Freelancers pay 10% and clients pay 3% on successful project completion."
              },
              {
                question: "How does the escrow system work?",
                answer: "Funds are held in secure escrow until work is approved. This protects both freelancers and clients throughout the project."
              },
              {
                question: "Can I work internationally?",
                answer: "Yes! Lancerly connects freelancers and clients from around the world. We support multiple currencies and payment methods."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 rounded-lg p-6 border border-slate-200"
              >
                <h3 className="font-semibold text-slate-blue mb-2">{faq.question}</h3>
                <p className="text-slate-blue/70">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

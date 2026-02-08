import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { Phone, Clock, Video, MessageSquare, ArrowRight, Sparkles } from "lucide-react";

const whatsappPackages = [
  { questions: "3 Ques", price: "₹497" },
  { questions: "6 Ques", price: "₹777" },
  { questions: "10 Ques", price: "₹1111" },
];

const audioCallPackages = [
  { duration: "45 min", price: "₹1987" },
  { duration: "60 min", price: "₹2496" },
  { duration: "75 min", price: "₹3108" },
];

const videoCallPackages = [
  { duration: "45 min", price: "₹3648" },
  { duration: "60 min", price: "₹4297" },
  { duration: "75 min", price: "₹4986" },
];

const ConsultationPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-12 pb-16 bg-gradient-to-br from-brown-dark via-brown to-brown-dark relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-white/10 border border-white/20 text-amber-200 text-sm mb-4">
              Rate Card
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
              Book Your <span className="text-gradient-amber">Consultation</span>
            </h1>
            <p className="font-body text-xl text-white/80 mb-4">
              Personalized guidance through Numerology & Lal Kitab Remedies by Himansshu Agarwal Ji
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 border border-white/20 text-amber-200">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Consultation Scheduled Within 48-72 Hours</span>
            </div>
            <p className="mt-4 text-white/70 text-sm">
              After payment confirmation, our team will contact you within 24 hours to confirm your time slot.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-24 bg-gradient-to-b from-brown-dark via-[hsl(220,13%,12%)] to-[hsl(220,13%,10%)] relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-0 w-1 h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent" />
          <div className="absolute top-1/3 right-0 w-1 h-32 bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* WhatsApp Notes Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-[hsl(220,13%,16%)] to-[hsl(220,13%,12%)] rounded-3xl p-8 border border-white/10 hover:border-primary/30 transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 mb-4">
                    <MessageSquare className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    WhatsApp Notes
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50" />
                    <span className="text-amber-300 text-sm font-medium">Lal Kitab Remedies Included</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50" />
                  </div>
                </div>

                <div className="space-y-4">
                  {whatsappPackages.map((pkg, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-white/80 font-medium">{pkg.questions}</span>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-primary/60" />
                        <span className="text-xl font-bold text-gradient-amber">{pkg.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/payment?type=whatsapp"
                  className="mt-8 block w-full text-center py-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg shadow-green-500/20"
                >
                  Book WhatsApp Notes
                </Link>
              </div>
            </motion.div>

            {/* Audio Call Card - Featured */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="relative group lg:-mt-4 lg:mb-4"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold z-10 shadow-lg shadow-primary/30">
                <Sparkles className="w-4 h-4 inline mr-1" />
                Most Popular
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-[hsl(220,13%,18%)] to-[hsl(220,13%,14%)] rounded-3xl p-8 border-2 border-primary/40 hover:border-primary/60 transition-all duration-300 shadow-2xl shadow-primary/10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    1:1 Audio Call
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50" />
                    <span className="text-amber-300 text-sm font-medium">Lal Kitab Remedies Included</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50" />
                  </div>
                </div>

                <div className="space-y-4">
                  {audioCallPackages.map((pkg, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-white/80 font-medium">{pkg.duration}</span>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-primary/60" />
                        <span className="text-xl font-bold text-gradient-amber">{pkg.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/payment?type=audio"
                  className="mt-8 block w-full text-center py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                >
                  Book Audio Call
                </Link>
              </div>
            </motion.div>

            {/* Video Call Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-gradient-to-br from-[hsl(220,13%,16%)] to-[hsl(220,13%,12%)] rounded-3xl p-8 border border-white/10 hover:border-blue-400/30 transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/10 mb-4">
                    <Video className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white mb-2">
                    1:1 Video Call
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-400/50" />
                    <span className="text-amber-300 text-sm font-medium">Lal Kitab Remedies Included</span>
                    <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-400/50" />
                  </div>
                </div>

                <div className="space-y-4">
                  {videoCallPackages.map((pkg, idx) => (
                    <div key={idx} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                      <span className="text-white/80 font-medium">{pkg.duration}</span>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-blue-400/60" />
                        <span className="text-xl font-bold text-gradient-amber">{pkg.price}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  to="/payment?type=video"
                  className="mt-8 block w-full text-center py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/20"
                >
                  Book Video Call
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-[hsl(220,13%,10%)]">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4">
              How It <span className="text-gradient-amber">Works</span>
            </h2>
            <p className="font-body text-xl text-white/70">
              Book your consultation in 3 simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Choose Your Package",
                description: "Select a consultation type that fits your needs.",
              },
              {
                step: "02",
                title: "Make Payment",
                description: "Complete secure payment to confirm your booking.",
              },
              {
                step: "03",
                title: "Get Your Consultation",
                description: "Receive personalized guidance within 48-72 hours.",
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center relative"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/30">
                    <span className="font-display text-2xl font-bold text-gradient-amber">{item.step}</span>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-16 w-12 h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-white/60">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brown-dark to-[hsl(220,13%,10%)]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Have Questions?
            </h2>
            <p className="text-white/70 mb-8">
              Contact us before booking if you need any clarification about our consultation services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/919667305577"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300"
              >
                <MessageSquare className="w-5 h-5" />
                Chat on WhatsApp
              </a>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold border-2 border-white/20 text-white hover:bg-white/10 transition-all duration-300"
              >
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ConsultationPage;
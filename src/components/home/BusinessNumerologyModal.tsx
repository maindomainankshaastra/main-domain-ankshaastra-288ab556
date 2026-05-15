import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, CheckCircle, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { pricing, formatINR } from "@/config/pricing";

const businessServices = [
  { title: "Business Name Correction", price: formatINR(pricing.business.nameCorrection) },
  { title: "Business Phone Number", price: formatINR(pricing.business.phoneNumber) },
  { title: "Brand Tagline Correction", price: formatINR(pricing.business.tagline) },
  { title: "Business Partner Compatibility", price: formatINR(pricing.business.partnerCompat) },
  { title: "Director Name Compatibility", price: formatINR(pricing.business.directorCompat) },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessNumerologyModal = ({ isOpen, onClose }: Props) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50 max-h-[80vh] overflow-y-auto"
          >
            <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative gradient-primary p-6 text-center">
                <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">Business Numerology</h2>
                <p className="text-white/80 text-sm mt-1">Strategic alignment for your brand & business</p>
              </div>

              {/* Services List */}
              <div className="p-6 space-y-3">
                {businessServices.map((s) => (
                  <div key={s.title} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-foreground text-sm font-medium">{s.title}</span>
                    </div>
                    <span className="text-primary font-bold text-sm whitespace-nowrap">{s.price}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="p-6 pt-0">
                <Link to="/consultation" onClick={onClose}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 py-3.5">
                  Book Consultation <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BusinessNumerologyModal;

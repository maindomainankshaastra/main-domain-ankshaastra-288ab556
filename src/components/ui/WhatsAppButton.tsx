import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const WhatsAppButton = () => {
  return (
    <motion.a
      href="https://wa.me/919667305577?text=Hi, I would like to know more about your services."
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      aria-label="Chat on WhatsApp"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </motion.a>
  );
};

export default WhatsAppButton;
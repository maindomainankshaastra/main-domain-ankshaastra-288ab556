import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEOHead from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  Phone, 
  Video, 
  MessageSquare,
  User,
  Palette,
  Mail,
  Car,
  Smartphone,
  Home,
  Baby,
  Heart,
  Building2,
  Paintbrush,
  Tag,
  Users,
  DollarSign,
  UserCheck,
  Calendar,
  Landmark,
  MapPin,
  Armchair,
  Grid3X3,
  Store,
  Building,
  ArrowRight,
  CheckCircle
} from "lucide-react";

const serviceCategories = [
  {
    id: "remedial",
    title: "Remedial Guidance (1:1 Call Consultation)",
    description: "Personal guidance and clarity through direct consultation with Himansshu Agarwal Ji.",
    icon: Phone,
    color: "from-orange to-amber",
    services: [
      {
        title: "3 Questions (WhatsApp)",
        description: "A focused WhatsApp-based consultation where you can ask three specific questions and receive concise, practical numerology guidance.",
        price: "₹987",
        link: "/payment"
      },
      {
        title: "6 Questions (WhatsApp)",
        description: "A deeper WhatsApp consultation allowing six structured questions, ideal for clients seeking clarity across multiple concerns.",
        price: "₹1,487",
        link: "/payment"
      },
      {
        title: "1:1 Audio Call",
        description: "A private audio call designed for detailed discussion while maintaining flexibility and confidentiality.",
        price: "₹1,987",
        link: "/consultation"
      },
      {
        title: "1:1 Video Call",
        description: "A face-to-face consultation for deeper engagement, visual explanations, and interactive guidance.",
        price: "₹3,648",
        link: "/consultation"
      }
    ]
  },
  {
    id: "personal",
    title: "Personal Numerology & Identity Alignment",
    description: "Aligning personal identity elements with numerological principles for smoother life progress.",
    icon: User,
    color: "from-blue-500 to-cyan-500",
    services: [
      {
        title: "Name Correction",
        description: "Analysis and correction of name vibration to support smoother personal and professional progress.",
        price: "₹1,997",
        link: "https://www.ankshaastra.empower.com",
        external: true
      },
      {
        title: "Lucky Number & Color Analysis",
        description: "Identification of supportive numbers and colors aligned with birth details for daily harmony.",
        price: "₹999",
        link: "/payment"
      },
      {
        title: "Lucky Email ID",
        description: "Evaluation of email ID vibration for better communication and professional credibility.",
        price: "₹799",
        link: "/payment"
      },
      {
        title: "Vehicle Number Check",
        description: "Compatibility analysis of vehicle numbers for comfort, safety, and daily harmony.",
        price: "₹599",
        link: "/payment"
      },
      {
        title: "Mobile Number Check",
        description: "Assessment of mobile number vibration and its influence on communication and opportunities.",
        price: "₹599",
        link: "/payment"
      },
      {
        title: "Flat / Plot Number Analysis",
        description: "Suitability analysis of residential numbers before purchase or occupancy.",
        price: "₹899",
        link: "/payment"
      }
    ]
  },
  {
    id: "family",
    title: "Baby, Family & Relationship Guide",
    description: "Designed for family planning, relationships, and emotional harmony.",
    icon: Baby,
    color: "from-pink-500 to-rose-500",
    services: [
      {
        title: "C-Section Baby Dates",
        description: "Numerology-based guidance for selecting supportive C-section birth dates within medically approved range.",
        price: "Custom",
        link: "/payment"
      },
      {
        title: "Perfect Baby Name",
        description: "Carefully aligned baby name suggestions based on numerology principles for foundational harmony.",
        price: "₹2,497",
        link: "/payment"
      },
      {
        title: "Relationship Compatibility",
        description: "Analysis of emotional dynamics and compatibility between partners for healthier communication.",
        price: "₹1,499",
        link: "/payment"
      }
    ]
  },
  {
    id: "business",
    title: "Business and Brand Numerology",
    description: "Business growth, branding, and stability through strategic numerology alignment.",
    icon: Building2,
    color: "from-emerald-500 to-teal-500",
    services: [
      {
        title: "Business Name Correction",
        description: "Strategic analysis to identify misalignment and suggest corrected options for brand resonance.",
        price: "₹3,878",
        link: "/payment"
      },
      {
        title: "Brand Logo Color Suggestion",
        description: "Numerology-guided color recommendations ensuring visual identity aligns with brand vibration.",
        price: "₹1,999",
        link: "/payment"
      },
      {
        title: "Business Phone Number",
        description: "Selection or evaluation of business phone numbers aligned with brand numerology.",
        price: "₹799",
        link: "/payment"
      },
      {
        title: "Brand Tagline Correction",
        description: "Analysis of brand taglines to ensure wording aligns with business intent and positioning.",
        price: "₹1,499",
        link: "/payment"
      },
      {
        title: "Business Partner Compatibility",
        description: "Compatibility analysis between business partners' names for smoother collaboration.",
        price: "₹1,999",
        link: "/payment"
      },
      {
        title: "Product Pricing Alignment",
        description: "Numerology-based pricing guidance to align product prices with brand vibration.",
        price: "₹999",
        link: "/payment"
      },
      {
        title: "Director Name Compatibility",
        description: "Evaluation of director or leadership names to assess alignment with company vibration.",
        price: "₹1,499",
        link: "/payment"
      }
    ]
  },
  {
    id: "dates",
    title: "Company & Financial Date Selection",
    description: "Support important business and financial decisions with auspicious date selection.",
    icon: Calendar,
    color: "from-violet-500 to-purple-500",
    services: [
      {
        title: "Company Registration Date",
        description: "Selection of supportive dates for company registration to encourage smoother beginnings.",
        price: "₹1,999",
        link: "/payment"
      },
      {
        title: "Bank Account Opening Date",
        description: "Numerology-based date selection for opening business bank accounts, supporting financial flow.",
        price: "₹999",
        link: "/payment"
      },
      {
        title: "Land Purchase Date",
        description: "Guidance on selecting favourable dates for land or property purchase for stability.",
        price: "₹1,499",
        link: "/payment"
      }
    ]
  },
  {
    id: "vastu",
    title: "Office Vastu & Spatial Numerology",
    description: "Integration of numerology with workspace planning for improved productivity.",
    icon: Armchair,
    color: "from-amber-500 to-yellow-500",
    services: [
      {
        title: "CEO/MD Cabin Direction",
        description: "Guidance on cabin direction and seating alignment to support leadership clarity and authority.",
        price: "₹2,499",
        link: "/payment"
      },
      {
        title: "Manager Seating Direction",
        description: "Numerology-based seating recommendations for key managers to improve efficiency.",
        price: "₹1,999",
        link: "/payment"
      },
      {
        title: "Cash Counter Direction",
        description: "Alignment of cash counters and billing areas to support smoother financial transactions.",
        price: "₹1,499",
        link: "/payment"
      },
      {
        title: "Office Interior Colors",
        description: "Color recommendations for office interiors aligned with numerology for focus and balance.",
        price: "₹2,499",
        link: "/payment"
      },
      {
        title: "Department Seating Alignment",
        description: "Structured seating alignment for departments to reduce friction and improve workflow.",
        price: "₹3,999",
        link: "/payment"
      }
    ]
  },
  {
    id: "property",
    title: "Property, Space & Event Numerology",
    description: "Analysis of spaces used for business or events for better visibility and growth.",
    icon: Building,
    color: "from-slate-500 to-gray-600",
    services: [
      {
        title: "Plot Number Analysis",
        description: "Numerological evaluation of plot numbers to assess suitability and long-term alignment.",
        price: "₹1,499",
        link: "/payment"
      },
      {
        title: "Exhibition Stall Number",
        description: "Analysis of exhibition stall numbers to support visibility and business opportunities.",
        price: "₹999",
        link: "/payment"
      },
      {
        title: "Commercial Space Analysis",
        description: "Assessment of commercial spaces through numerology to evaluate suitability for operations.",
        price: "₹2,499",
        link: "/payment"
      }
    ]
  }
];

const ServicesPage = () => {
  return (
    <Layout>
      <SEOHead title="Numerology Services" description="Explore our numerology services including name correction, baby name selection, C-section date analysis, mobile numerology, and office vastu by Himansshu Agarwal Ji." canonical="/services" />
      {/* Hero Section */}
      <section className="py-16 gradient-hero">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium mb-6">
              Our Services
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Transform Your Life with{" "}
              <span className="text-amber-light">Numerology</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Comprehensive numerology solutions designed for clarity, alignment, and positive transformation
              across all aspects of life and business.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="section-padding">
        <div className="section-container">
          {serviceCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="mb-16 last:mb-0"
            >
              {/* Category Header */}
              <div className="flex items-start gap-4 mb-8">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                  <category.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                    {category.title}
                  </h2>
                  <p className="text-muted-foreground max-w-2xl">
                    {category.description}
                  </p>
                </div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-0 md:pl-18">
                {category.services.map((service, serviceIndex) => (
                  <motion.div
                    key={service.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: serviceIndex * 0.05 }}
                    className="card-service group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-display text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {service.title}
                      </h3>
                      <span className="text-primary font-bold whitespace-nowrap ml-2">
                        {service.price}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>
                    {service.external ? (
                      <a
                        href={service.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    ) : (
                      <Link
                        to={service.link}
                        className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:gap-3 transition-all"
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-muted">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Not Sure Which Service is Right for You?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Book a quick consultation call and we'll guide you to the perfect solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/consultation" className="btn-primary inline-flex items-center justify-center gap-2">
                Book Consultation
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="https://wa.me/919667305557"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline inline-flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default ServicesPage;
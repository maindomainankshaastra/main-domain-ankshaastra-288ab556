import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, Filter, Star, Search } from "lucide-react";
import { pricing, formatINR } from "@/config/pricing";

const products = [
  {
    id: 1,
    name: "Natural Blue Sapphire",
    category: "Gemstones",
    price: formatINR(pricing.shop.blueSapphire),
    originalPrice: formatINR(pricing.shop.blueSapphireOriginal),
    rating: 4.9,
    reviews: 124,
    image: "💎",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Sri Yantra (Gold Plated)",
    category: "Yantras",
    price: formatINR(pricing.shop.sriYantra),
    originalPrice: formatINR(pricing.shop.sriYantraOriginal),
    rating: 4.8,
    reviews: 89,
    image: "🔯",
    badge: null,
  },
  {
    id: 3,
    name: "Natural Pearl (Moti)",
    category: "Gemstones",
    price: formatINR(pricing.shop.pearl),
    originalPrice: formatINR(pricing.shop.pearlOriginal),
    rating: 4.7,
    reviews: 67,
    image: "🔮",
    badge: "New",
  },
  {
    id: 4,
    name: "Rudraksha Mala (108 Beads)",
    category: "Spiritual",
    price: formatINR(pricing.shop.rudraksha),
    originalPrice: formatINR(pricing.shop.rudrakshaOriginal),
    rating: 4.9,
    reviews: 156,
    image: "📿",
    badge: null,
  },
  {
    id: 5,
    name: "Navratna Ring (9 Gems)",
    category: "Jewelry",
    price: formatINR(pricing.shop.navratna),
    originalPrice: formatINR(pricing.shop.navratnaOriginal),
    rating: 4.8,
    reviews: 45,
    image: "💍",
    badge: "Premium",
  },
  {
    id: 6,
    name: "Complete Vedic Astrology Book",
    category: "Books",
    price: formatINR(pricing.shop.vedicBook),
    originalPrice: formatINR(pricing.shop.vedicBookOriginal),
    rating: 4.6,
    reviews: 234,
    image: "📚",
    badge: null,
  },
  {
    id: 7,
    name: "Natural Yellow Sapphire",
    category: "Gemstones",
    price: formatINR(pricing.shop.yellowSapphire),
    originalPrice: formatINR(pricing.shop.yellowSapphireOriginal),
    rating: 4.9,
    reviews: 98,
    image: "💎",
    badge: null,
  },
  {
    id: 8,
    name: "Shree Lakshmi Yantra",
    category: "Yantras",
    price: formatINR(pricing.shop.lakshmiYantra),
    originalPrice: formatINR(pricing.shop.lakshmiYantraOriginal),
    rating: 4.7,
    reviews: 112,
    image: "🔯",
    badge: "Popular",
  },
];

const categories = ["All", "Gemstones", "Yantras", "Spiritual", "Jewelry", "Books"];

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "All" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="pt-12 pb-16 gradient-hero">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-muted border border-border text-secondary text-sm mb-4">
              Spiritual Shop
            </span>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
              Sacred <span className="text-gradient-gold">Products</span>
            </h1>
            <p className="font-elegant text-xl text-muted-foreground">
              Authentic gemstones, yantras, and spiritual products energized with Vedic mantras
            </p>
          </motion.div>
        </div>
      </section>

      {/* Shop Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group card-mystical overflow-hidden hover:border-primary/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative aspect-square bg-muted flex items-center justify-center">
                  <span className="text-6xl">{product.image}</span>
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                      {product.badge}
                    </span>
                  )}
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5">
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                  <h3 className="font-display text-lg font-semibold text-foreground mt-1 mb-2 group-hover:text-secondary transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-secondary text-secondary" />
                      <span className="text-sm text-foreground">{product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-foreground">{product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">{product.originalPrice}</span>
                    </div>
                    <button className="w-10 h-10 rounded-full gradient-cosmic flex items-center justify-center hover:scale-110 transition-transform">
                      <ShoppingCart className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-midnight">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: "💎", title: "100% Authentic", description: "Certified gemstones" },
              { icon: "🔒", title: "Secure Payment", description: "Multiple options" },
              { icon: "🚚", title: "Free Shipping", description: `Orders above ${formatINR(pricing.shop.freeShippingThreshold)}` },
              { icon: "↩️", title: "Easy Returns", description: "7-day return policy" },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h4 className="font-display text-lg font-semibold text-foreground mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ShopPage;
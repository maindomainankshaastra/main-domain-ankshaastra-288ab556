"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var Layout_1 = require("@/components/layout/Layout");
var SEOHead_1 = require("@/components/SEOHead");
var react_router_dom_1 = require("react-router-dom");
var pricing_1 = require("@/config/pricing");
var business_1 = require("@/config/business");
var servicePages_1 = require("@/data/servicePages");
var lucide_react_1 = require("lucide-react");
/* ─── Service icon map for decorative per-card icons ─── */
var serviceIconMap = {
    "1:1 Audio Call": lucide_react_1.Phone,
    "1:1 Video Call": lucide_react_1.Video,
    "Name Correction": lucide_react_1.Sparkles,
    "Lucky Vehicle Number": lucide_react_1.Car,
    "Lucky Mobile Number": lucide_react_1.Smartphone,
    "Lucky Flat / Plot Number": lucide_react_1.Home,
    "C-Section Baby Dates": lucide_react_1.Calendar,
    "Perfect Baby Name": lucide_react_1.Baby,
    "Relationship Analysis": lucide_react_1.Heart,
    "Pyaar Shaastra Report": lucide_react_1.Heart,
    "Business Name Correction": lucide_react_1.Building2,
    "Business Phone Number": lucide_react_1.Phone,
    "Brand Tagline Correction": lucide_react_1.Tag,
    "Business Partner Compatibility": lucide_react_1.Users,
    "Director Name Compatibility": lucide_react_1.UserCheck,
    "Company Registration Date": lucide_react_1.Landmark,
    "Bank Account Opening Date": lucide_react_1.Calendar,
    "Land Purchase Date": lucide_react_1.MapPin,
    "CEO/MD Cabin Sitting": lucide_react_1.Crown,
    "Management Sitting": lucide_react_1.Armchair,
    "Cash Counter Direction": lucide_react_1.Store,
    "Office Interior Colors": lucide_react_1.Paintbrush,
    "Departmental Sitting": lucide_react_1.Grid3X3,
    "Plot Number Analysis": lucide_react_1.MapPin,
    "Exhibition Stall Number": lucide_react_1.Store,
    "Commercial Space Analysis": lucide_react_1.Building,
};
var DEFAULT_CATEGORY = "Other";
var badgeText = function (title) {
    if (title === "Name Correction")
        return "Popular";
    if (title.includes("Report"))
        return "New";
    return "Book";
};
var getServiceLink = function (service) {
    if (service._pageRoute)
        return service._pageRoute;
    switch (service.title) {
        case "Name Correction":
            return "/services/name-correction";
        case "Pyaar Shaastra Report":
            return "/reports/pyaar-shastra";
        case "Perfect Baby Name":
            return "/services/baby-name";
        case "C-Section Baby Dates":
            return "/services/csection-dates";
        case "Name Correction Blueprint":
            return "/reports/name-correction-blueprint";
        case "Personalized Kundali":
            return "/reports/personalized-kundali";
        case "Varshphal Report 2026":
            return "/services/varshphal-report";
        case "Mobile Numerology":
            return "/services/mobile-numerology";
        case "Office Vastu":
            return "/services/office-vastu";
        default:
            return "/payment?service=".concat(encodeURIComponent(service.title), "&amount=").concat(service.price);
    }
};
var getServiceTarget = function (title) {
    return ["Perfect Baby Name", "C-Section Baby Dates"].includes(title) ? "_blank" : "_self";
};
var createCategories = function (services) {
    var groups = services.reduce(function (acc, service) {
        var _a, _b;
        var category = ((_a = service.category) === null || _a === void 0 ? void 0 : _a.trim()) || DEFAULT_CATEGORY;
        ((_b = acc[category]) !== null && _b !== void 0 ? _b : (acc[category] = [])).push(service);
        return acc;
    }, {});
    return Object.entries(groups).map(function (_a) {
        var category = _a[0], services = _a[1];
        return ({
            id: category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            title: category,
            services: services,
        });
    });
};
var serviceCardFromRecord = function (service, index) {
    var _a;
    return ({
        title: service.title,
        description: service.description || "Browse this service and move forward with secure booking.",
        price: (0, pricing_1.formatINR)(service.price),
        rawPrice: service.price,
        link: getServiceLink(service),
        badge: badgeText(service.title),
        external: getServiceTarget(service.title) === "_blank",
        _categoryId: ((_a = service.category) === null || _a === void 0 ? void 0 : _a.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")) || DEFAULT_CATEGORY.toLowerCase(),
    });
};
/* ─────────────── Service Card (clean reference style) ─────────────── */
var ServiceCard = function (_a) {
    var service = _a.service, index = _a.index;
    var ServiceIcon = serviceIconMap[service.title] || lucide_react_1.Sparkles;
    var inner = (<framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (index % 8) * 0.05, duration: 0.4 }} className="group relative h-full flex flex-col bg-card border border-accent/40 rounded-2xl p-6 hover:shadow-lg hover:-translate-y-1 hover:border-primary/40 transition-all duration-300">
      {/* Badge */}
      <span className="absolute top-4 right-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
        {service.highlight && <lucide_react_1.Zap className="w-3 h-3"/>}
        {service.badge || (service.highlight ? "Popular" : "Book")}
      </span>

      {/* Circular icon */}
      <div className="w-16 h-16 rounded-full border-2 border-accent flex items-center justify-center mb-5 group-hover:border-primary group-hover:bg-primary/5 transition-all">
        <ServiceIcon className="w-7 h-7 text-primary" strokeWidth={1.5}/>
      </div>

      {/* Title */}
      <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight pr-16">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-grow">
        {service.description}
      </p>

      {/* Price */}
      <div className="font-display text-lg font-bold text-foreground mb-4">
        {service.price}
      </div>

      {/* CTA */}
      <button className="w-full py-2.5 rounded-lg border-2 border-primary text-primary text-sm font-semibold uppercase tracking-wider group-hover:bg-primary group-hover:text-primary-foreground transition-all inline-flex items-center justify-center gap-2">
        Book Now
        {service.external ? <lucide_react_1.ExternalLink className="w-3.5 h-3.5"/> : <lucide_react_1.ArrowRight className="w-3.5 h-3.5"/>}
      </button>
    </framer_motion_1.motion.div>);
    var paymentLink = service.external
        ? service.link
        : service.link === "/payment"
            ? "/payment?service=".concat(encodeURIComponent(service.title), "&amount=").concat(service.rawPrice || 0)
            : service.link;
    if (service.external) {
        return <a href={service.link} target="_blank" rel="noopener noreferrer" className="block h-full">{inner}</a>;
    }
    return <react_router_dom_1.Link to={paymentLink} className="block h-full">{inner}</react_router_dom_1.Link>;
};
/* ─────────────── Main Page ─────────────── */
var ServicesPage = function () {
    var _a = (0, react_1.useState)([]), services = _a[0], setServices = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)("all"), activeTab = _d[0], setActiveTab = _d[1];
    var _e = (0, react_1.useState)(""), searchQuery = _e[0], setSearchQuery = _e[1];
    (0, react_1.useEffect)(function () {
        var controller = new AbortController();
        var loadServices = function () { return __awaiter(void 0, void 0, void 0, function () {
            var response, payload, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        setLoading(true);
                        setError(null);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        return [4 /*yield*/, fetch("/api/services", { signal: controller.signal })];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Server error: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3:
                        payload = _a.sent();
                        setServices((payload.services || []));
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _a.sent();
                        if (controller.signal.aborted)
                            return [2 /*return*/];
                        setError(err_1 instanceof Error ? err_1.message : "Unable to load services");
                        return [3 /*break*/, 6];
                    case 5:
                        if (!controller.signal.aborted)
                            setLoading(false);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        loadServices();
        return function () { return controller.abort(); };
    }, []);
    var staticServicePages = (0, react_1.useMemo)(function () {
        return servicePages_1.existingServicePages.map(function (page) { return ({
            id: "page-".concat(page.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
            title: page.title,
            description: page.description,
            category: page.category,
            price: page.price,
            gst_rate: page.gst_rate,
            is_active: true,
            _pageRoute: page.route,
        }); });
    }, []);
    var mergedServices = (0, react_1.useMemo)(function () {
        var activeServices = services.filter(function (service) { return service.is_active; });
        var pageServices = staticServicePages.filter(function (page) { return !activeServices.some(function (service) { return service.title === page.title; }); });
        return __spreadArray(__spreadArray([], activeServices, true), pageServices, true);
    }, [services, staticServicePages]);
    var categories = (0, react_1.useMemo)(function () { return createCategories(mergedServices); }, [mergedServices]);
    var totalServices = mergedServices.length;
    var tabs = __spreadArray([{ id: "all", title: "All" }], categories.map(function (c) { return ({ id: c.id, title: c.title }); }), true);
    var visibleServices = (0, react_1.useMemo)(function () {
        var all = mergedServices.map(serviceCardFromRecord);
        var byTab = activeTab === "all" ? all : all.filter(function (s) { return s._categoryId === activeTab; });
        var q = searchQuery.trim().toLowerCase();
        return q
            ? byTab.filter(function (s) {
                return s.title.toLowerCase().includes(q) ||
                    s.description.toLowerCase().includes(q);
            })
            : byTab;
    }, [activeTab, searchQuery, mergedServices]);
    return (<Layout_1.default>
      <SEOHead_1.default title="Numerology Services" description="Explore our numerology services including name correction, baby name selection, C-section date analysis, mobile numerology, and office vastu by Himansshu Agarwal Ji." canonical="/services"/>

      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="absolute inset-0 gradient-hero"/>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.18),transparent_70%)]"/>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle,hsl(var(--amber-light)/0.12),transparent_70%)]"/>
        </div>
        <div className="absolute inset-0 opacity-[0.03] bg-grid-pattern"/>

        {/* Sacred geometry */}
        <framer_motion_1.motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[300px] h-[300px] border border-white/[0.04] rounded-full hidden lg:block"/>
        <framer_motion_1.motion.div animate={{ rotate: -360 }} transition={{ duration: 90, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[220px] h-[220px] border border-white/[0.06] rounded-full hidden lg:block"/>

        <div className="section-container relative z-10">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="text-center max-w-3xl mx-auto">
            <framer_motion_1.motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] text-amber-light text-sm font-semibold mb-6 tracking-wider uppercase">
              <lucide_react_1.Sparkles className="w-3.5 h-3.5"/>
              {totalServices}+ Services Available
            </framer_motion_1.motion.span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Transform Your Life with{" "}
              <span className="text-amber-light">Sacred Numerology</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed mb-10">
              Comprehensive numerology solutions designed for clarity, alignment, and positive transformation across all aspects of life and business.
            </p>
            <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center justify-center gap-8 md:gap-12">
              {[
            { label: "Categories", value: "".concat(categories.length) },
            { label: "Services", value: "".concat(totalServices, "+") },
            { label: "Consultations", value: "5000+" }
        ].map(function (stat) { return (<div key={stat.label} className="text-center">
                  <div className="font-display text-2xl md:text-3xl font-bold text-primary-foreground">{stat.value}</div>
                  <div className="text-xs md:text-sm text-primary-foreground/50 mt-1">{stat.label}</div>
                </div>); })}
            </framer_motion_1.motion.div>
          </framer_motion_1.motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"/>
      </section>

      {/* ── Services (filterable grid) ── */}
      <section className="relative py-16 md:py-20 lg:py-24 bg-cream">
        <div className="section-container relative z-10">
          {/* Centered heading */}
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-foreground">Our </span>
              <span className="text-primary italic">Services</span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the service that fits your needs and start your journey toward clarity
            </p>
          </framer_motion_1.motion.div>

          {/* Filter tabs with underline */}
          <div className="flex flex-wrap items-center justify-center gap-1 md:gap-2 mb-12 border-b border-border">
            {tabs.map(function (tab) { return (<button key={tab.id} onClick={function () { return setActiveTab(tab.id); }} className={"relative px-4 md:px-6 py-3 text-sm md:text-base font-semibold transition-colors ".concat(activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                {tab.title}
                {activeTab === tab.id && (<framer_motion_1.motion.span layoutId="services-active-tab" className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full"/>)}
              </button>); })}
          </div>

          {/* Search bar */}
          <div className="max-w-xl mx-auto mb-10">
            <div className="relative">
              <lucide_react_1.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"/>
              <input type="text" value={searchQuery} onChange={function (e) { return setSearchQuery(e.target.value); }} placeholder="Search services by name or description..." aria-label="Search services" className="w-full pl-12 pr-12 py-3.5 rounded-full bg-card border border-accent/40 text-foreground placeholder:text-muted-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"/>
              {searchQuery && (<button type="button" onClick={function () { return setSearchQuery(""); }} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent/40 transition-colors">
                  <lucide_react_1.X className="w-4 h-4"/>
                </button>)}
            </div>
            {searchQuery && (<p className="text-center text-sm text-muted-foreground mt-3">
                {visibleServices.length} {visibleServices.length === 1 ? "result" : "results"} for "{searchQuery}"
              </p>)}
          </div>

          {/* Cards grid */}
          {loading ? (<div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Loading available services...</p>
            </div>) : error ? (<div className="text-center py-16">
              <p className="text-destructive text-lg">{error}</p>
            </div>) : (<>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {visibleServices.map(function (service, i) { return (<ServiceCard key={"".concat(service._categoryId, "-").concat(service.title)} service={service} index={i}/>); })}
              </div>

              {visibleServices.length === 0 && (<div className="text-center py-16">
                  <p className="text-muted-foreground text-lg">No services found. Try a different search or category.</p>
                </div>)}
            </>)}
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="absolute inset-0 gradient-hero"/>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[radial-gradient(ellipse,hsl(var(--amber)/0.15),transparent_70%)]"/>
        </div>
        <div className="section-container relative z-10">
          <framer_motion_1.motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-amber-light text-sm font-medium mb-6">
              <lucide_react_1.Sparkles className="w-3.5 h-3.5"/>
              Need Guidance?
            </span>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Not Sure Which Service is{" "}
              <span className="text-amber-light">Right for You?</span>
            </h2>
            <p className="text-lg text-primary-foreground/60 mb-10 max-w-2xl mx-auto">
              Book a quick consultation call and we'll guide you to the perfect solution for your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <react_router_dom_1.Link to="/consultation" className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-orange-dark text-primary-foreground font-bold px-8 py-4 rounded-xl shadow-[0_8px_30px_hsl(var(--orange)/0.3)] hover:shadow-[0_12px_40px_hsl(var(--orange)/0.4)] hover:-translate-y-0.5 transition-all duration-300">
                Book Consultation
                <lucide_react_1.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
              </react_router_dom_1.Link>
              <a href={(0, business_1.whatsappHref)()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-primary-foreground/20 text-primary-foreground font-bold hover:bg-primary-foreground/10 transition-all duration-300">
                <lucide_react_1.MessageSquare className="w-5 h-5"/>
                WhatsApp Us
              </a>
            </div>
          </framer_motion_1.motion.div>
        </div>
      </section>
    </Layout_1.default>);
};
exports.default = ServicesPage;

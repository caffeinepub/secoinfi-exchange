import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Award,
  BarChart2,
  ChevronRight,
  Eye,
  Lock,
  Package,
  Shield,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { AppRole } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useProfile } from "../hooks/useQueries";

const buyerBenefits = [
  {
    icon: TrendingUp,
    title: "Sellers Compete for You",
    desc: "Multiple sellers battle in real-time fixtures to give you the best price–quality bundle.",
  },
  {
    icon: Eye,
    title: "Transparent Savings",
    desc: "Always see the spread between minimum price and max MRP — know exactly what you save.",
  },
  {
    icon: Lock,
    title: "Total Privacy",
    desc: "Your identity and contact details are never shared with sellers. Secoinfi stands as your broker.",
  },
  {
    icon: Shield,
    title: "Tamper-Evident Logs",
    desc: "Anonymous hashes and Merkle-based session logging let you verify transactions without exposing details.",
  },
];

const sellerBenefits = [
  {
    icon: Package,
    title: "Zero Inventory Risk",
    desc: "Operate as a pure dropship / on-demand provider — no need to hold inventory for low-demand products.",
  },
  {
    icon: Users,
    title: "Shared Buyer Pool",
    desc: "Access aggregated buyer demand from Secoinfi without building your own e-commerce stack.",
  },
  {
    icon: Award,
    title: "Merit-Based Orders",
    desc: "The leaderboard and fixture system rewards your best offers with more orders.",
  },
  {
    icon: BarChart2,
    title: "Compliance Handled",
    desc: "Central brokerage manages buyer privacy, contracts, and dispute frameworks for you.",
  },
];

export default function LandingPage() {
  const { data: profile } = useProfile();
  const { identity } = useInternetIdentity();
  const role = profile?.role;

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section
        className="relative min-h-[85vh] flex items-center"
        data-ocid="landing.section"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(0.66 0.14 185) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <Badge
              variant="outline"
              className="mb-6 border-primary/40 text-primary"
            >
              <Zap className="w-3 h-3 mr-1" /> Brokered Marketplace
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] mb-6 tracking-tight">
              Sellers compete.
              <br />
              <span className="text-primary">Buyers win.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-xl leading-relaxed">
              Secoinfi acts as your broker — sellers battle in structured{" "}
              <strong className="text-foreground">Fixtures</strong> to deliver
              the best bundle of price, quality, and service. Your identity
              stays protected throughout.
            </p>
            <div className="flex flex-wrap gap-4">
              {!identity && (
                <>
                  <Button
                    asChild
                    size="lg"
                    className="gap-2"
                    data-ocid="landing.primary_button"
                  >
                    <Link to="/register/buyer">
                      Get Best Deals <ChevronRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="gap-2 border-border/60"
                    data-ocid="landing.secondary_button"
                  >
                    <Link to="/register/seller">Sell on Exchange</Link>
                  </Button>
                </>
              )}
              {role === AppRole.BUYER && (
                <Button asChild size="lg" data-ocid="landing.primary_button">
                  <Link to="/buyer/dashboard">
                    My Dashboard <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
              {role === AppRole.SELLER && (
                <Button asChild size="lg" data-ocid="landing.primary_button">
                  <Link to="/seller/dashboard">
                    Seller Dashboard <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
              {role === AppRole.ADMIN && (
                <Button asChild size="lg" data-ocid="landing.primary_button">
                  <Link to="/admin">
                    Admin Panel <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              )}
              <Button
                asChild
                size="lg"
                variant="ghost"
                data-ocid="landing.secondary_button"
              >
                <Link to="/fixtures">View Fixtures</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-y border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-6 grid grid-cols-3 md:grid-cols-3 gap-8">
          {[
            { label: "Protected Buyers", value: "Anonymous" },
            { label: "Competing Sellers", value: "Fixture-Based" },
            { label: "Tamper-Evident", value: "Merkle Logs" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Buyer Benefits */}
      <section className="py-24" data-ocid="landing.section">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
              For Buyers (Collectors)
            </Badge>
            <h2 className="text-3xl font-bold">
              Shop with confidence, never compromise
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {buyerBenefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-border/60 rounded-xl p-6 hover:border-primary/40 transition-colors"
              >
                <b.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
          {!identity && (
            <div className="mt-10">
              <Button asChild size="lg" data-ocid="landing.primary_button">
                <Link to="/register/buyer">
                  Register as Buyer <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Seller Benefits */}
      <section className="py-24 bg-card/30" data-ocid="landing.section">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12"
          >
            <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">
              For Sellers (Providers)
            </Badge>
            <h2 className="text-3xl font-bold">
              Compete on merit, scale without limits
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellerBenefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-card border border-border/60 rounded-xl p-6 hover:border-accent/40 transition-colors"
              >
                <b.icon className="w-8 h-8 text-accent mb-4" />
                <h3 className="font-semibold mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.desc}
                </p>
              </motion.div>
            ))}
          </div>
          {!identity && (
            <div className="mt-10">
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-accent/40 text-accent hover:bg-accent/10"
                data-ocid="landing.secondary_button"
              >
                <Link to="/register/seller">
                  Onboard as Seller <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

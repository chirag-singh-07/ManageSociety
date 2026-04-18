import { motion } from 'framer-motion'
import './App.css'

const revealUp = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.12,
    },
  },
}

const features = [
  {
    title: 'Unified Billing Engine',
    desc: 'Auto-generate monthly invoices, track partial payments, and send reminders without manual follow-ups.',
  },
  {
    title: 'Resident App + Admin Console',
    desc: 'Give residents a fast mobile experience while committees and managers control operations from one dashboard.',
  },
  {
    title: 'Complaint Workflow Automation',
    desc: 'Assign tickets by category, set SLAs, and monitor open issues with transparent status updates.',
  },
  {
    title: 'Notice Broadcasting',
    desc: 'Push announcements instantly to all flats or selected towers with delivery visibility.',
  },
  {
    title: 'Role & Access Controls',
    desc: 'Define permissions across super-admin, admin staff, and resident roles with audit logs.',
  },
  {
    title: 'Analytics & Insights',
    desc: 'Track revenue collection, service quality, and operational performance on live dashboards.',
  },
]

const integrations = [
  'UPI & Card Payments',
  'WhatsApp Notifications',
  'Email Alerts',
  'Cloud File Storage',
  'Accounting Export',
  'REST API Access',
]

const pricing = [
  {
    name: 'Starter',
    price: '₹2,499',
    cycle: '/month',
    subtitle: 'For small communities',
    points: ['Up to 100 units', 'Billing + complaints', 'Email support'],
    cta: 'Start Starter Plan',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹5,499',
    cycle: '/month',
    subtitle: 'Best for active societies',
    points: ['Up to 500 units', 'Automation workflows', 'Priority support'],
    cta: 'Choose Growth',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    cycle: '',
    subtitle: 'For large multi-society ops',
    points: ['Unlimited units', 'Advanced integrations', 'Dedicated success manager'],
    cta: 'Talk to Sales',
    highlight: false,
  },
]

const faqs = [
  {
    q: 'How long does onboarding take?',
    a: 'Most societies go live in 3-7 days with member import, billing setup, and admin training included.',
  },
  {
    q: 'Can residents pay maintenance online?',
    a: 'Yes. Residents can pay via UPI, cards, and net banking with instant status updates inside the app.',
  },
  {
    q: 'Is data secure and role-restricted?',
    a: 'Yes. Data is encrypted and access is controlled through role-based permissions and action-level audit logs.',
  },
]

const stats = [
  { value: '1,500+', label: 'Societies Managed' },
  { value: '3.1M+', label: 'Transactions Processed' },
  { value: '99.9%', label: 'Platform Uptime' },
  { value: '42%', label: 'Avg. Admin Time Saved' },
]

function App() {
  return (
    <div className="website">
      <header className="nav">
        <a href="#" className="logo">
          ManageSociety
        </a>
        <nav className="menu">
          <a href="#features">Features</a>
          <a href="#integrations">Integrations</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>
        <button className="btn ghost">Book Demo</button>
      </header>

      <motion.section className="hero" initial="hidden" animate="visible" variants={stagger}>
        <motion.p variants={revealUp} className="eyebrow">
          BLUEPRINT FOR SMART COMMUNITIES
        </motion.p>
        <motion.h1 variants={revealUp}>
          Run your society like a modern digital business
        </motion.h1>
        <motion.p variants={revealUp} className="lead">
          ManageSociety centralizes billing, resident communication, issue resolution, and operations analytics
          in one reliable platform for committees and managers.
        </motion.p>
        <motion.div variants={revealUp} className="hero-actions">
          <button className="btn primary">Start Free Trial</button>
          <button className="btn secondary">Watch Product Tour</button>
        </motion.div>

        <motion.div variants={stagger} className="stats">
          {stats.map((item) => (
            <motion.article key={item.label} variants={revealUp} className="stat">
              <p className="num">{item.value}</p>
              <p className="txt">{item.label}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="trust-strip"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
      >
        <motion.p variants={revealUp}>Trusted by gated communities, apartment associations, and township operators.</motion.p>
      </motion.section>

      <motion.section
        id="features"
        className="section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 variants={revealUp}>Built for every daily society workflow</motion.h2>
        <motion.p variants={revealUp} className="section-copy">
          Replace fragmented tools and spreadsheet chaos with a single command center for your operations team.
        </motion.p>
        <motion.div variants={stagger} className="feature-grid">
          {features.map((feature) => (
            <motion.article
              key={feature.title}
              variants={revealUp}
              className="card feature-card"
              whileHover={{ y: -6, transition: { duration: 0.22 } }}
            >
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="section workflow"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 variants={revealUp}>How teams go live in under a week</motion.h2>
        <motion.div variants={stagger} className="timeline">
          <motion.article variants={revealUp} className="card">
            <span>01</span>
            <h3>Import and Configure</h3>
            <p>Upload resident/unit data, set maintenance rules, and define team access in guided setup.</p>
          </motion.article>
          <motion.article variants={revealUp} className="card">
            <span>02</span>
            <h3>Launch Resident App</h3>
            <p>Residents receive instant access for payments, complaint tracking, notices, and profile updates.</p>
          </motion.article>
          <motion.article variants={revealUp} className="card">
            <span>03</span>
            <h3>Scale with Insights</h3>
            <p>Use reports and operational dashboards to improve service response and payment collections.</p>
          </motion.article>
        </motion.div>
      </motion.section>

      <motion.section
        id="integrations"
        className="section integrations"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 variants={revealUp}>Integrates with the tools you already use</motion.h2>
        <motion.div variants={stagger} className="integration-grid">
          {integrations.map((name) => (
            <motion.div key={name} variants={revealUp} className="integration-pill">
              {name}
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="pricing"
        className="section pricing"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 variants={revealUp}>Simple pricing that scales with your society</motion.h2>
        <motion.div variants={stagger} className="pricing-grid">
          {pricing.map((plan) => (
            <motion.article
              key={plan.name}
              variants={revealUp}
              className={`card price-card${plan.highlight ? ' highlight' : ''}`}
            >
              <p className="plan">{plan.name}</p>
              <p className="price">
                {plan.price}
                <span>{plan.cycle}</span>
              </p>
              <p className="plan-copy">{plan.subtitle}</p>
              <ul>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <button className={`btn ${plan.highlight ? 'primary' : 'secondary'}`}>{plan.cta}</button>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="faq"
        className="section faq"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 variants={revealUp}>Frequently asked questions</motion.h2>
        <motion.div variants={stagger} className="faq-grid">
          {faqs.map((item) => (
            <motion.article key={item.q} variants={revealUp} className="card faq-card">
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="cta"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <h2>Ready to modernize your society operations?</h2>
        <p>Move from reactive management to streamlined, transparent, and resident-first operations.</p>
        <div className="cta-actions">
          <button className="btn primary">Get Started</button>
          <button className="btn secondary">Schedule a Demo</button>
        </div>
      </motion.section>

      <footer className="footer">
        <div>
          <p className="foot-brand">ManageSociety</p>
          <p>Purpose-built platform for community management teams.</p>
        </div>
        <div className="foot-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </div>
      </footer>
    </div>
  )
}

export default App

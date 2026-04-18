import { motion } from 'framer-motion'
import './App.css'

const fadeInUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
}

const featureList = [
  {
    title: 'Automated Billing',
    description:
      'Send monthly dues, collect payments online, and track pending balances without spreadsheets.',
  },
  {
    title: 'Resident Communication',
    description:
      'Broadcast notices, maintenance updates, and emergency alerts instantly to all residents.',
  },
  {
    title: 'Complaint Management',
    description:
      'Create clear complaint workflows with assignment, follow-ups, and closure tracking in one place.',
  },
  {
    title: 'Role-Based Access',
    description:
      'Secure dashboards for admin, society managers, and residents with strict permission control.',
  },
]

const stats = [
  { label: 'Societies Onboarded', value: '1,200+' },
  { label: 'Monthly Transactions', value: '2.4M+' },
  { label: 'Resident Satisfaction', value: '96%' },
]

const steps = [
  {
    title: 'Set Up Your Society',
    description:
      'Import flats, members, and existing records in minutes with guided onboarding.',
  },
  {
    title: 'Run Daily Operations',
    description:
      'Handle billing, complaints, notices, and approvals from one clean dashboard.',
  },
  {
    title: 'Scale With Confidence',
    description:
      'Use analytics and audit logs to improve operations and keep every action traceable.',
  },
]

const testimonials = [
  {
    quote:
      'ManageSociety cut our admin workload by almost half in the first month. Billing follow-ups became effortless.',
    author: 'Ritika Sharma',
    role: 'Committee Head, GreenView Heights',
  },
  {
    quote:
      'Our residents now receive notices and updates instantly. Communication issues dropped dramatically.',
    author: 'Aman Verma',
    role: 'Society Manager, Maple Residency',
  },
]

function App() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <a className="brand" href="#">
          ManageSociety
        </a>
        <nav className="nav-links">
          <a href="#features">Features</a>
          <a href="#workflow">How It Works</a>
          <a href="#testimonials">Reviews</a>
        </nav>
        <button className="outline-btn">Book Demo</button>
      </header>

      <motion.section
        className="hero-section"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.p variants={fadeInUp} className="tagline">
          Society operations made effortless
        </motion.p>
        <motion.h1 variants={fadeInUp}>
          The operating system for modern residential communities
        </motion.h1>
        <motion.p variants={fadeInUp} className="hero-copy">
          From billing and resident communication to complaint resolution and
          analytics, ManageSociety helps your team run everything faster with
          zero chaos.
        </motion.p>

        <motion.div variants={fadeInUp} className="hero-actions">
          <button className="primary-btn">Start Free Trial</button>
          <button className="ghost-btn">See Live Product Tour</button>
        </motion.div>

        <motion.div variants={stagger} className="stats-grid">
          {stats.map((item) => (
            <motion.article key={item.label} variants={fadeInUp} className="stat-card">
              <p className="stat-value">{item.value}</p>
              <p className="stat-label">{item.label}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="features"
        className="content-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 variants={fadeInUp}>Everything your society needs in one platform</motion.h2>
        <motion.div variants={stagger} className="feature-grid">
          {featureList.map((feature) => (
            <motion.article
              key={feature.title}
              variants={fadeInUp}
              className="feature-card"
              whileHover={{ y: -6, transition: { duration: 0.24 } }}
            >
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="workflow"
        className="content-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <motion.h2 variants={fadeInUp}>From setup to scale in 3 clear steps</motion.h2>
        <motion.div variants={stagger} className="step-grid">
          {steps.map((step, index) => (
            <motion.article key={step.title} variants={fadeInUp} className="step-card">
              <span className="step-index">0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        id="testimonials"
        className="content-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={stagger}
      >
        <motion.h2 variants={fadeInUp}>Trusted by high-performing society teams</motion.h2>
        <motion.div variants={stagger} className="testimonial-grid">
          {testimonials.map((item) => (
            <motion.article key={item.author} variants={fadeInUp} className="testimonial-card">
              <p className="quote">"{item.quote}"</p>
              <p className="author">{item.author}</p>
              <p className="role">{item.role}</p>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        className="cta-section"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2>Ready to simplify society management?</h2>
        <p>
          Launch your digital society stack today and give every resident a
          smoother living experience.
        </p>
        <button className="primary-btn">Get Started Now</button>
      </motion.section>

      <footer className="footer">
        <p>ManageSociety</p>
        <p>Built for smarter communities</p>
      </footer>
    </div>
  )
}

export default App

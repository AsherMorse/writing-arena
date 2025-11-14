# Writing Arena V2 - Feature Roadmap

## Branch: `v2-features`

This document outlines the planned features for V2 development, prioritized by impact and aligned with the PRD's Learning Science foundations.

---

## 🎯 V2 Goals

1. **Add data persistence** - Users can track progress over time
2. **Implement peer feedback** - Core learning science feature (ES=0.75)
3. **Build mastery classification** - Cognitive diagnostic modeling
4. **Add authentication** - Real user accounts and security
5. **Create teacher tools** - Classroom management dashboard

**Target Timeline:** 8-12 weeks  
**Target PRD Coverage:** 60-70%

---

## 📋 Feature Priorities

### Phase 1: Foundation (Weeks 1-3)

#### 🗄️ Database & Persistence
**Priority: CRITICAL**
- [ ] PostgreSQL database setup
- [ ] User table schema
- [ ] Session/match history table
- [ ] Progress tracking table
- [ ] Writing portfolio storage
- [ ] Prisma ORM integration
- [ ] Database migrations system

**Impact:** Enables everything else. Without this, nothing persists.

#### 🔐 Authentication System
**Priority: CRITICAL**
- [ ] NextAuth.js integration
- [ ] Email/password authentication
- [ ] OAuth providers (Google, Clever for schools)
- [ ] User registration flow
- [ ] Password reset
- [ ] Session management
- [ ] Protected routes
- [ ] User profiles

**Impact:** Required for real deployment. Enables user tracking.

**Deliverable:** Users can create accounts, log in, and their progress saves.

---

### Phase 2: Peer Feedback (Weeks 4-6)

#### 💬 Peer Feedback System
**Priority: HIGH** (ES=0.75 from research)
- [ ] 2-minute feedback phase after writing
- [ ] TAG protocol implementation (Tell, Ask, Give)
- [ ] Two Stars and a Wish protocol
- [ ] Mastery-based sentence frames
- [ ] Anonymous peer pairing
- [ ] Feedback quality scoring (0-3 points)
- [ ] AI moderation of peer feedback
- [ ] Reciprocal feedback exchanges
- [ ] Feedback training system (4-week sequence)
- [ ] Platform-guided modeling week 1
- [ ] Guided practice weeks 2-3
- [ ] Independent feedback week 4+

**Impact:** Major learning science upgrade. Peer feedback has huge effect size.

#### 🤝 Peer Matching Algorithm
- [ ] Mastery-level pairing
- [ ] Anonymous vs identified options
- [ ] Rotation to avoid same partners
- [ ] Quality-based matching (reward good feedback providers)

**Deliverable:** Complete peer feedback loop integrated into all matches.

---

### Phase 3: Advanced Assessment (Weeks 7-9)

#### 🧠 Cognitive Diagnostic Modeling
**Priority: HIGH** (Core to mastery-based approach)
- [ ] Q-matrix specification implementation
- [ ] Feature extraction from writing samples
- [ ] Bayesian probability calculations (P(mastered | features))
- [ ] EAP classification (0.8 threshold)
- [ ] 5-attribute mastery tracking (CON, ORG, GRM, VOC, MCH)
- [ ] Dynamic regrouping after 10 sessions
- [ ] Classification consistency monitoring
- [ ] Uncertainty tracking with confidence intervals

**Impact:** Enables true mastery-based progression and grouping.

#### 📊 Enhanced Rubrics
- [ ] 6-level mastery rubrics (Emerging → Expert)
- [ ] Trait-specific descriptors per level
- [ ] Developmental progression mapping
- [ ] T-unit analysis for grammar trait
- [ ] Type-token ratio for vocabulary
- [ ] Coherence analysis for organization

**Deliverable:** Precise skill classification and adaptive scaffolding.

---

### Phase 4: Learning Science (Weeks 10-12)

#### 📅 Spaced Repetition System
**Priority: MEDIUM** (Retention critical)
- [ ] Spacing algorithm (10-20% retention interval)
- [ ] Adaptive scheduling per trait
- [ ] Successive relearning tracking
- [ ] Session reminder system
- [ ] Optimal spacing calculations
- [ ] Retrieval practice prompts
- [ ] Distributed practice enforcement

**Impact:** Moves from short-term gains to durable learning.

#### 🧭 Metacognitive Scaffolding
- [ ] Planning strategy prompts (pre-writing)
- [ ] Monitoring checklists (during writing)
- [ ] Evaluation reflections (post-writing)
- [ ] Goal-setting interface
- [ ] Strategy selection guidance
- [ ] Self-assessment against rubrics
- [ ] Revision planning tools

**Impact:** Develops self-regulated learners.

**Deliverable:** Complete learning science implementation with spacing and metacognition.

---

## 🎨 V2 Enhancement Features

### Visual & UX Improvements
- [ ] Enhanced visual prompt library (100+ images)
- [ ] Image zoom and pan controls
- [ ] Annotation tools for images
- [ ] Character customization shop
- [ ] Trait-specific accessories
- [ ] Pet companion unlocks
- [ ] Level-up animation sequences
- [ ] Achievement unlock animations
- [ ] Sound effects and audio (optional toggle)

### Social Features
- [ ] Friend list and friend requests
- [ ] Squad formation (writing teams)
- [ ] Challenge system (1v1 challenges)
- [ ] Spectator mode for matches
- [ ] Writing replay system
- [ ] Social sharing to external platforms
- [ ] Community showcase gallery
- [ ] Player profiles (public/private)

### Advanced Competitive
- [ ] Weekly leaderboards
- [ ] Seasonal rankings (reset every 3 months)
- [ ] Global rankings by trait
- [ ] School/district leaderboards
- [ ] Tournament brackets
- [ ] Prize pools and special rewards
- [ ] Hall of Fame
- [ ] Combo system for bonus points
- [ ] Ultimate abilities at high ranks

---

## 👨‍🏫 Teacher Platform (V2.5)

### Teacher Dashboard
- [ ] Class roster management
- [ ] Student progress overview
- [ ] Individual student analytics
- [ ] Assignment creation and tracking
- [ ] Rubric customization
- [ ] Override AI classifications
- [ ] Review disputed feedback
- [ ] Export reports and data

### Classroom Tools
- [ ] Bulk student accounts creation
- [ ] Class-wide tournaments
- [ ] Curriculum integration
- [ ] Standards alignment tracking
- [ ] Parent communication tools
- [ ] Grade export functionality

---

## 📱 Multi-Platform (V3.0)

### Progressive Web App
- [ ] Offline mode with sync
- [ ] Install prompt
- [ ] Push notifications
- [ ] Background sync
- [ ] Service worker caching

### Native Mobile Apps
- [ ] iOS app (React Native/Swift)
- [ ] Android app (React Native/Kotlin)
- [ ] Touch-optimized UI
- [ ] Mobile-specific features

---

## 🎓 Capstone Project (V3.5)

### Op-Ed Writing Pathway
- [ ] Extended writing sessions (30+ minutes)
- [ ] Multi-stage revision process
- [ ] Editor review simulation
- [ ] Citation and research tools
- [ ] Publication submission interface
- [ ] Real newspaper partnerships
- [ ] Published work showcase

---

## 📊 Success Metrics for V2

### User Engagement
- [ ] Track daily active users
- [ ] Monitor session completion rates
- [ ] Measure streak maintenance (60%+ target)
- [ ] Survey intrinsic motivation (≥4.5/7)

### Learning Outcomes
- [ ] Pre/post writing quality assessment
- [ ] Trait-specific mastery progression (70%+ advance on 3+ traits)
- [ ] Transfer task performance (80%+ quality maintained)
- [ ] Writing fluency increase (15%+ words/session)

### System Quality
- [ ] AI feedback accuracy (κ ≥ 0.70 for mechanics)
- [ ] Classification consistency (85%+ same classification)
- [ ] Peer feedback quality evolution (1.5 → 2.3/3.0)
- [ ] Revision implementation rate (60%+ feedback used)

### Equity & Inclusion
- [ ] Universal design effectiveness (all subgroups within 0.15 SD)
- [ ] Cognitive load equity (no 20%+ higher load for any group)
- [ ] Motivation equity across demographics
- [ ] Growth mindset equity

---

## 🛠️ Technical Upgrades for V2

### Backend Infrastructure
- [ ] PostgreSQL database deployment
- [ ] Redis caching layer
- [ ] WebSocket server for real-time
- [ ] Queue system for async processing
- [ ] Job scheduler for spaced repetition
- [ ] Email service integration
- [ ] File storage (S3/similar) for images

### DevOps
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing suite
- [ ] Staging environment
- [ ] Production deployment (Vercel/AWS)
- [ ] Monitoring and alerting
- [ ] Error tracking (Sentry)
- [ ] Analytics integration

### Security & Compliance
- [ ] FERPA compliance implementation
- [ ] COPPA compliance (parental consent)
- [ ] Data encryption at rest
- [ ] Audit logging
- [ ] Penetration testing
- [ ] Security headers
- [ ] Rate limiting
- [ ] Content moderation AI

---

## 💰 V2 Cost Estimates

### Development
- **Developer Time:** 400-500 hours
- **Rate (assuming $50-100/hr):** $20,000 - $50,000

### Infrastructure (Monthly)
- **Database (PostgreSQL):** $20-50
- **Redis Cache:** $10-30
- **Hosting (Vercel/AWS):** $50-200
- **Claude API (100 students):** $150-300
- **Email Service:** $10-20
- **File Storage:** $10-30
- **Total:** $250-630/month

### One-Time Costs
- **Security audit:** $2,000-5,000
- **Legal (privacy policy, terms):** $1,000-3,000
- **Design assets (images):** $500-2,000

---

## 🗓️ V2 Development Schedule

### Sprint 1-2 (Weeks 1-2): Foundation
- Set up PostgreSQL database
- Implement Prisma ORM
- Create user authentication
- Build basic user profiles

### Sprint 3-4 (Weeks 3-4): Data Persistence
- Session storage implementation
- Progress tracking system
- Portfolio database schema
- Historical data queries

### Sprint 5-6 (Weeks 5-6): Peer Feedback
- Peer pairing algorithm
- TAG protocol UI
- Feedback quality scoring
- Training sequence implementation

### Sprint 7-8 (Weeks 7-8): Advanced Assessment
- Q-matrix specification
- Feature extraction implementation
- Mastery classification algorithm
- Dynamic regrouping logic

### Sprint 9-10 (Weeks 9-10): Learning Science
- Spaced repetition scheduling
- Metacognitive prompts
- Retrieval practice system
- Scaffolding progression

### Sprint 11-12 (Weeks 11-12): Polish & Launch
- Teacher dashboard MVP
- Achievement system
- Bug fixes and optimization
- Beta testing and refinement

---

## 📚 Documentation Needed for V2

- [ ] Database schema documentation
- [ ] API documentation (endpoints, payloads)
- [ ] Component library documentation
- [ ] Teacher user guide
- [ ] Student user guide
- [ ] Administrator guide
- [ ] Privacy policy
- [ ] Terms of service
- [ ] Accessibility statement
- [ ] Deployment guide

---

## 🤔 Open Questions for V2

### Product Decisions
1. Should we allow custom prompts from teachers?
2. What's the minimum viable teacher dashboard?
3. How do we handle class roster imports?
4. What privacy controls do parents need?
5. Should students see their own mastery classifications?

### Technical Decisions
1. WebSocket vs polling for real-time updates?
2. Monorepo or separate repos for mobile?
3. Self-hosted vs managed database?
4. Which email service provider?
5. Image CDN strategy?

### Business Decisions
1. Pricing model (freemium, subscription, per-student)?
2. School vs individual accounts?
3. Minimum viable scale for launch?
4. Partnership strategy for newspapers (capstone)?
5. Grant funding vs venture funding?

---

## 🎁 V2 Branch Created

**Branch name:** `v2-features`

To start working on V2:
```bash
git checkout v2-features
```

All V1 code is safely preserved on `main` branch for demos and testing.

---

## 🌟 Vision Statement

**V1** provides the engaging game mechanics and core writing practice.

**V2** will add the deep learning science that makes it truly transformative:
- Peer collaboration
- Mastery-based progression
- Spaced learning for retention
- Metacognitive development
- Data-driven insights

**V3+** will scale to classrooms, schools, and districts with full teacher tools and advanced features.

**The journey continues!** 🚀


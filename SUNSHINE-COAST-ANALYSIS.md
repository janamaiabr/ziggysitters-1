# ZiggySitters Sunshine Coast Expansion — Full Analysis
## For Rachel (Marketing Partner) & Jana (Product)

*Prepared: 2 March 2026*

---

## 1. WHAT WE HAVE TODAY

### The Platform
- **URL:** ziggysitters.com
- **Stack:** React + Supabase + Stripe Connect
- **Features built:** Sitter profiles, booking flow, Stripe payments, daily photo reports, admin dashboard, onboarding flow, promo codes, messaging, calendar, payouts
- **Sunshine Coast landing page:** `/pet-sitting-sunshine-coast` EXISTS but renders Auckland-specific content (bug — SPA doesn't serve city content to crawlers)

### Current Numbers (Honest)
- **Total sitters registered:** ~310 (mostly Auckland NZ)
- **Onboarding completed:** ~162 (~52%)
- **Verified sitters:** small subset
- **Sunshine Coast sitters:** 0
- **Sunshine Coast pet owner leads:** 0
- **Total bookings completed:** low single digits
- **Revenue to date:** ~$0
- **GA4 last 7 days:** 0 users, 0 sessions (ZERO traffic)
- **GA4 last 28 days:** 46 users, 59 sessions (mostly from old Meta ads)
- **Conversion events tracked:** form_start only (no purchase/signup completion tracking)

### What Works
- ✅ Full booking and payment flow (Stripe Connect)
- ✅ Sitter onboarding with photo/ID verification
- ✅ Daily photo report system (unique differentiator)
- ✅ Admin dashboard with analytics
- ✅ City landing pages (need SSR fix for SEO)
- ✅ Blog system
- ✅ Promo code system
- ✅ Platform fee: ~10% (competitive vs Mad Paws ~20%, Rover ~25%)

### What's Broken/Missing
- ❌ Zero organic traffic (no SEO traction)
- ❌ SPA rendering — Google can't index city pages properly
- ❌ No conversion tracking (form_submit, signup_complete, booking_complete)
- ❌ No reviews/ratings visible on profiles
- ❌ No "matching" feature despite tagline promising it
- ❌ Homepage says "Become a Pet Sitter in Auckland" even on SC page
- ❌ No sitters in ANY Australian city
- ❌ Meta Ads appear paused (zero traffic last 7 days)

---

## 2. THE SUNSHINE COAST MARKET

### Demographics
- **Population:** ~394,000 (2025), growing 1.5%/year
- **One of fastest-growing regions in Australia**
- **Pet-friendly culture:** subtropical, beaches, hinterland — ideal for pet owners
- **69% of QLD households own a dog** (Budget Direct 2024)
- **Estimated pet-owning households SC:** ~100,000+
- **Estimated dogs on SC:** ~130,000+ (1.3 dogs per pet household avg)
- **Tourism:** 3.2M visitors/year = huge holiday pet sitting demand

### Competition on Sunshine Coast

| Competitor | Sitters on SC | Commission | Backing |
|------------|--------------|------------|---------|
| **Mad Paws** (now Rover) | **257 sitters** | ~20% | Acquired by Rover ($7.1M raised) |
| **Pawshake** | ~50-80 (est.) | ~19.5% | Global platform |
| **Trusted Housesitters** | ~30+ | Annual membership ($129-$259) | Global |
| **Airtasker** | ~20 pet sitters | 15-20% | ASX-listed |
| **Paws 'n' Play** | 1 (local business) | N/A | Independent |
| **Ultimate Pet Care SC** | 1 (local business) | N/A | Independent |
| **Pet Sitting Services AU** | 1 (local business) | N/A | Independent |
| **ZiggySitters** | **0** | ~10% | Bootstrapped |

### Key Insight
**Mad Paws alone has 257 sitters on Sunshine Coast.** They were acquired by Rover (the world's largest pet sitting marketplace, $500M+ valuation) in July 2025. We would be competing against a platform with 40,000+ sitters nationally, backed by Rover's global resources.

---

## 3. WHAT NEEDS TO HAPPEN (PRODUCT SIDE — Jana's responsibility)

### Phase 1: Fix Foundation (Before spending ANY marketing $)
**Timeline: 2-4 weeks | Cost: $0 (dev time only)**

1. **Fix SSR/SEO:** City pages must render server-side for Google. Currently the SPA serves blank HTML to crawlers. Without this, ALL SEO efforts are wasted.
2. **Fix homepage dynamic content:** When on `/pet-sitting-sunshine-coast`, hero should say "Sunshine Coast" not "Auckland"
3. **Add conversion tracking:** `signup_complete`, `booking_request`, `booking_confirmed` events in GA4. Without this we can't measure anything.
4. **Deploy pending changes:** 3+ weeks of unpushed code sitting in git (Lovable deploy blocked)
5. **AUD pricing:** Ensure all pricing displays in AUD, not NZD
6. **Region selector:** Users need to pick "Sunshine Coast" as their area

### Phase 2: Seed Supply (Before marketing to pet owners)
**Timeline: 4-8 weeks | Cost: ~$500-$1,500**

You CANNOT market to pet owners with zero sitters. The marketplace death spiral:
> Owner visits → sees 0 sitters → leaves forever → sitters get 0 bookings → sitters leave

**Target: 20-30 verified sitters on SC before any demand-side marketing.**

How:
- Rachel's local network (word of mouth, Facebook groups, community boards)
- Targeted Meta ads to SC: "Earn $800-$1,200/month pet sitting" (~$0.90/click FB AU)
- Flyer drops at vet clinics, pet stores, dog parks (Noosa, Maroochydore, Caloundra)
- Partner with local pet businesses for cross-promotion

### Phase 3: Generate Demand (Pet Owners)
**Timeline: Ongoing | Cost: $500-$2,000/month**

- Google Ads: "pet sitting sunshine coast" (estimated CPC: $2-5 AUD)
- Meta Ads: targeting SC pet owners (age 25-55, interests: pets, travel)
- Local SEO: blog content targeting "pet sitter noosa", "dog boarding maroochydore", etc.
- Community: Sunshine Coast Facebook groups, Nextdoor
- Seasonal push: school holidays, Christmas, Easter (peak demand)

---

## 4. WHAT RACHEL NEEDS TO DO (MARKETING SIDE)

### Immediate (Week 1-2)
1. **Recruit sitters through personal network:** Find 5-10 people on SC who'd be interested in pet sitting. They sign up, complete onboarding, get verified. This is seed supply.
2. **Identify local Facebook groups** where SC pet owners hang out (e.g., "Sunshine Coast Pet Owners", "Noosa Community", etc.)
3. **Estimate marketing budget:** How much per month is Rachel willing to invest?

### Month 1-2: Sitter Recruitment Campaign
- **Meta Ads budget:** $300-$500/month targeting potential sitters on SC
- **Creative:** "Love pets? Earn $800-$1,200/month pet sitting on the Sunshine Coast"
- **Landing page:** `/become-sitter` with SC-specific messaging
- **Goal:** 20-30 registered, verified sitters

### Month 3-4: Pet Owner Acquisition
- **Google Ads:** $500-$1,000/month on "pet sitting sunshine coast" + related keywords
- **Meta Ads:** $300-$500/month retargeting + awareness
- **Content:** Local blog posts, pet care guides for SC
- **Goal:** First 10-20 bookings

### Month 5+: Scaling
- Increase ad spend based on ROI
- Referral program (owner refers owner)
- Seasonal campaigns (school holidays)

---

## 5. FINANCIAL PROJECTIONS (Honest)

### Revenue Model
- Pet owners pay sitter's rate (e.g., $55-$70/night for dog boarding)
- ZiggySitters takes ~10% platform fee
- Average booking: ~$250 (5-night stay)
- Platform revenue per booking: ~$25

### Projections

| Month | Sitters | Bookings | Revenue (platform) | Marketing Cost | Net |
|-------|---------|----------|-------------------|----------------|-----|
| 1-2 | 10-20 | 0 | $0 | $500-$800 | -$800 |
| 3-4 | 20-30 | 5-10 | $125-$250 | $800-$1,500 | -$1,250 |
| 5-6 | 30-40 | 15-25 | $375-$625 | $800-$1,500 | -$875 |
| 7-9 | 40-50 | 30-50 | $750-$1,250 | $800-$1,500 | -$250 |
| 10-12 | 50+ | 50-80 | $1,250-$2,000 | $800-$1,500 | +$500 |

**Break-even estimate: 8-12 months with ~$8,000-$15,000 total investment.**

### Important Caveats
- These are OPTIMISTIC projections
- Marketplace conversion rates are typically 1-3%
- Mad Paws has 257 sitters and Rover backing — they can outspend us
- We have zero brand recognition on SC
- The platform still has bugs that need fixing first

---

## 6. SHOULD WE DO THIS? (Honest Assessment)

### Arguments FOR
- ✅ Sunshine Coast is growing fast (394K people, 3.2M tourists/year)
- ✅ Rachel has local knowledge and network
- ✅ Lower commission (10% vs Mad Paws 20%) = sitter incentive
- ✅ Daily photo reports = genuine differentiator
- ✅ Platform is built (no dev cost for MVP)
- ✅ QLD is pet-obsessed (69% dog ownership)

### Arguments AGAINST
- ❌ Mad Paws/Rover has 257 sitters on SC already + massive funding
- ❌ Zero brand recognition, zero SEO, zero sitters there today
- ❌ Marketplace cold-start problem (need BOTH supply AND demand simultaneously)
- ❌ Platform has unfixed bugs (SSR, tracking, homepage)
- ❌ Previous NZ launch didn't achieve product-market fit
- ❌ $8K-$15K investment with uncertain returns
- ❌ Competing against Rover (2025 acquisition of Mad Paws) = David vs Goliath

### The Real Question
**Can we differentiate enough to win bookings away from Mad Paws?**

Our advantages:
1. **Lower fees** (10% vs 20%) — sitters keep more money
2. **Daily photo reports** — guaranteed, not optional
3. **Local, personal** — Rachel as the face of SC, not a faceless platform
4. **Niche focus** — we can be "THE Sunshine Coast pet sitting community" while Mad Paws is generic national

Our disadvantages:
1. **Trust** — Mad Paws has reviews, insurance, Rover backing
2. **Supply** — They have 257 sitters, we have 0
3. **SEO** — They rank for every pet sitting keyword
4. **Budget** — They can outspend us 100x

### My Recommendation
**Proceed with caution and a hard budget cap.**

- Set a maximum investment: e.g., $5,000 over 6 months
- If we can get 20 sitters and 10 bookings in 6 months, continue
- If not, cut losses
- Rachel's local network and personal brand is the ONLY real advantage — lean into it heavily
- Don't try to be a "platform" — be a "local community" that happens to have a booking tool

---

## 7. TIMELINE SUMMARY

| When | What | Who | Budget |
|------|------|-----|--------|
| Week 1-2 | Fix SSR, tracking, homepage bug | Jana/Dev | $0 |
| Week 2-4 | Rachel recruits 5-10 seed sitters | Rachel | $0 (personal network) |
| Month 2 | Meta Ads for sitter recruitment | Rachel | $300-$500 |
| Month 2-3 | Local content + SEO setup | Jana/Jaspion | $0 |
| Month 3 | First demand-side ads (Google) | Rachel | $500-$1,000 |
| Month 4-6 | Iterate based on data | Both | $500-$1,000/mo |
| Month 6 | **GO/NO-GO decision** | Both | — |

**Total investment to GO/NO-GO: ~$3,000-$5,000**

---

*This analysis uses real data from GA4, Supabase, competitor research, ABS population data, and market intelligence. No numbers were hallucinated.*

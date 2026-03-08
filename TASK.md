# ZiggySitters Senior/High-Needs Pet Care Feature Sprint

## Context
ZiggySitters is a pet sitting marketplace (React + Vite + Supabase + Stripe). Currently focused on NZ (Auckland, Hamilton). Adding Sunshine Coast AU market and senior/high-needs pet specialisation.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind + shadcn/ui
- Backend: Supabase (PostgreSQL + Auth + Edge Functions)
- Payments: Stripe
- Hosting: Vercel

## Tasks (in order)

### 1. Turn Off Young Dog Walkers
- Edit `src/config/features.ts`: set `YOUNG_DOG_WALKERS: false`
- Write a test that verifies the feature flag is false

### 2. Pet Health Profile
Add medical/health fields to pet profiles for senior and high-needs pets.

**Database migration (create `supabase/migrations/` if needed):**
```sql
ALTER TABLE pets ADD COLUMN IF NOT EXISTS is_senior boolean DEFAULT false;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS health_conditions text[] DEFAULT '{}';
ALTER TABLE pets ADD COLUMN IF NOT EXISTS medications jsonb DEFAULT '[]';
-- medications format: [{name, dosage, frequency, instructions}]
ALTER TABLE pets ADD COLUMN IF NOT EXISTS special_needs text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_vet_name text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS emergency_vet_phone text;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS mobility_level text CHECK (mobility_level IN ('full', 'limited', 'assisted', 'minimal'));
ALTER TABLE pets ADD COLUMN IF NOT EXISTS dietary_requirements text;
```

**Frontend:**
- Update `src/components/PetsManagement.tsx` to include health fields in the pet form
- Add a "Health & Special Needs" section with:
  - Toggle: "Is this a senior pet?"
  - Multi-select chips: health conditions (arthritis, diabetes, heart condition, anxiety, vision impaired, hearing impaired, post-surgical, other)
  - Medications list: add/remove medications with name, dosage, frequency, instructions
  - Free text: special needs notes
  - Emergency vet: name + phone
  - Select: mobility level
  - Free text: dietary requirements
- Update Supabase types in `src/integrations/supabase/types.ts` to match new columns

**Tests:** Write tests for the pet health form validation (medications must have name+dosage, emergency vet phone format, etc.)

### 3. Sitter Competency Tags
Add skill/certification tags to sitter profiles.

**Database migration:**
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS competency_tags text[] DEFAULT '{}';
-- tags: medication_admin, first_aid_certified, senior_pet_experience, anxiety_specialist, post_surgical_care, diabetic_pet_care, mobility_assistance
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS police_check_status text CHECK (police_check_status IN ('not_submitted', 'pending', 'verified', 'expired')) DEFAULT 'not_submitted';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS police_check_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS home_visit_notes text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_source text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS references_count integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_completed boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_notes text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interview_date date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vetting_status text CHECK (vetting_status IN ('pending', 'in_progress', 'approved', 'rejected')) DEFAULT 'pending';
```

**Frontend:**
- Update sitter onboarding to include competency tag selection
- Update sitter profile display to show competency badges
- Update `EnhancedSitterCard.tsx` to show relevant competency badges

**Tests:** Test that competency tags render correctly, that sitter cards show badges

### 4. Sitter Vetting Pipeline (Admin)
Create a new admin page for managing sitter vetting.

**Create `src/pages/AdminSitterVetting.tsx`:**
- Table view of all sitters with vetting status columns:
  - Name, referral source, police check status, home visit, references count, interview, overall vetting status
- Filter by vetting status (pending/in_progress/approved/rejected)
- Click to expand: edit interview notes, mark home visit complete, update police check, add reference count
- Color-coded status badges (red=pending, yellow=in_progress, green=approved)

**Add route in App.tsx** at `/admin/sitter-vetting`
**Add link in AdminNav/AdminSidebar**

**Tests:** Test the vetting status filtering, test status badge rendering

### 5. Vet Clinic CRM (Admin)
Track veterinary clinic relationships.

**Database migration:**
```sql
CREATE TABLE IF NOT EXISTS vet_clinic_contacts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_name text NOT NULL,
  contact_person text,
  phone text,
  email text,
  address text,
  suburb text,
  first_visit_date date,
  last_contact_date date,
  next_follow_up_date date,
  referral_count integer DEFAULT 0,
  relationship_status text CHECK (relationship_status IN ('prospect', 'contacted', 'met', 'active_referrer', 'inactive')) DEFAULT 'prospect',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Create `src/pages/AdminVetClinics.tsx`:**
- Table with all clinics, sortable by next follow-up date
- Add/edit clinic form (dialog)
- Status badges for relationship status
- Referral count display
- "Overdue follow-up" highlight (past next_follow_up_date)

**Add route + nav link**

**Tests:** Test add/edit form, test overdue highlight logic

### 6. Post-Booking Follow-Up
Automated email 24h after booking ends.

**Create `src/components/admin/PostBookingFollowUp.tsx`:**
- Admin view showing bookings that ended in last 48h
- Status: follow-up sent / pending / skipped
- Template preview

**Database migration:**
```sql
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_sent boolean DEFAULT false;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_sent_at timestamptz;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS follow_up_response text;
```

**Tests:** Test follow-up status display, test date logic (24h after end_date)

### 7. KPI Dashboard (Admin)
Create `src/pages/AdminKPIDashboard.tsx`:

Display these 6 KPIs:
1. **Repeat Booking Rate** (target >50%): % of clients who booked more than once
2. **Daily Update Compliance** (target >80%): % of bookings where daily_reports_completed >= daily_reports_required
3. **Vet Referral Conversion**: bookings where referral source = vet clinic / total vet referrals
4. **Client LTV** (target >$800): average total spend per client
5. **Sitter Churn** (target <20%): sitters inactive >90 days / total sitters
6. **NPS** (target >70): from reviews (5-star=promoter, 3-star=passive, 1-2=detractor)

Each KPI shows: current value, target, trend arrow (up/down), color (green if hitting target, red if not)

**Add route at `/admin/kpis` + nav link**

**Tests:** Test KPI calculation logic (mock data), test color coding

### 8. Sunshine Coast Landing Page
- Update `src/pages/PetSittingSunshineCoast.tsx` to focus on senior/high-needs pet positioning
- Add content about: medication administration, senior pet specialists, emergency protocols, daily updates
- Add Sunshine Coast specific suburbs (Maroochydore, Buderim, Noosa, Caloundra, Coolum, Mooloolaba, Nambour)
- SEO: title "Senior & High-Needs Pet Sitting | Sunshine Coast" 
- Link from main nav alongside NZ cities

**Tests:** Test that SC page renders with correct SEO meta tags

## Important Rules
- ALL code must have tests (TDD approach: write test first, then implementation)
- Use existing patterns from the codebase (shadcn/ui components, Supabase client patterns)
- Do NOT touch existing functionality that works
- Supabase migrations go in `supabase/migrations/` with timestamp prefix
- Follow existing code style (TypeScript, functional components, hooks)
- Admin pages follow existing AdminLayout pattern

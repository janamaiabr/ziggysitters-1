# ZiggySitters Launch Readiness Checklist

## ✅ COMPLETED (Code-Level Fixes)

### SEO & Indexing
- ✅ Created comprehensive sitemap.xml with all major pages
- ✅ Updated robots.txt with sitemap reference
- ✅ Enhanced SEOHead component with full Open Graph and Twitter Card support
- ✅ Added structured data (JSON-LD) for LocalBusiness and FAQ pages
- ✅ Added canonical tags to all pages
- ✅ Improved meta descriptions with geo-targeting
- ✅ Enhanced robots meta tags for better crawler control

### Content & Trust
- ✅ Privacy Policy exists with comprehensive data storage/retention disclosure
- ✅ Terms of Service exists with clear marketplace terms
- ✅ Created comprehensive FAQ page with structured data
- ✅ Daily photo updates feature clearly explained in FAQ
- ✅ Insurance and sitter vetting process documented in FAQ
- ✅ Footer includes Privacy Policy and Terms of Service links

### Payments & Bookings
- ✅ Currency fixed to NZD throughout the application
- ✅ GST display clarified in service descriptions
- ✅ Platform fee (10%) clearly stated

### Accessibility & UX
- ✅ Enhanced focus states for all interactive elements
- ✅ Improved keyboard navigation support
- ✅ Added focus-visible styles with proper ring indicators
- ✅ Color contrast improved in design system
- ✅ Alt text patterns established (check all images manually)

### Error Handling
- ✅ Enhanced 404 page with navigation options
- ✅ Created 500 error page with retry functionality
- ✅ Both error pages use proper SEO metadata

## ⚠️ REQUIRES EXTERNAL SETUP

### 1. Google Search Console & Bing Webmaster Tools
**Priority: HIGH**

#### Google Search Console Setup:
1. Go to https://search.google.com/search-console
2. Add property: ziggysitters.com
3. Verify ownership via:
   - HTML file upload, OR
   - DNS TXT record, OR
   - Google Analytics (if already set up)
4. Submit sitemap: https://ziggysitters.com/sitemap.xml
5. Monitor for crawl errors and coverage issues

#### Bing Webmaster Tools Setup:
1. Go to https://www.bing.com/webmasters
2. Add site: ziggysitters.com
3. Verify ownership
4. Submit sitemap: https://ziggysitters.com/sitemap.xml
5. Import data from Google Search Console (if available)

### 2. Email Infrastructure (DNS Records)
**Priority: HIGH**

#### SPF Record
Add this TXT record to your DNS:
```
Name: @
Type: TXT
Value: v=spf1 include:_spf.resend.com ~all
```

#### DKIM Record
Get your DKIM record from Resend dashboard:
1. Log in to https://resend.com
2. Go to Domains > Your Domain
3. Copy the DKIM TXT record
4. Add it to your DNS

#### DMARC Record
Add this TXT record to your DNS:
```
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=quarantine; rua=mailto:hello@ziggysitters.com
```

**Verification:**
- Test emails using https://www.mail-tester.com
- Check records with https://mxtoolbox.com

### 3. Stripe Live Mode
**Priority: HIGH**

Current Status: Using test mode

#### Steps to Enable Live Mode:
1. Log in to Stripe Dashboard
2. Activate your account (complete business verification)
3. Switch to Live mode
4. Create new Live API keys
5. Update secrets in Lovable:
   - `STRIPE_SECRET_KEY` (live key)
6. Test a small live transaction
7. Set up webhooks for production (if needed in future):
   - Endpoint: https://[your-supabase-project].functions.supabase.co/stripe-webhook
   - Events: checkout.session.completed, payment_intent.succeeded

### 4. Analytics Setup
**Priority: MEDIUM**

#### Google Analytics 4 (GA4):
1. Create GA4 property at https://analytics.google.com
2. Get Measurement ID (G-XXXXXXXXXX)
3. Add to your site:
   ```html
   <!-- Add to index.html head -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

#### Meta Pixel Setup:
Already integrated in code. To activate:
1. Go to https://business.facebook.com
2. Events Manager > Create Pixel
3. Get Pixel ID
4. Add to index.html head:
   ```html
   <script>
     !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
     n.callMethod.apply(n,arguments):n.queue.push(arguments)};
     if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
     n.queue=[];t=b.createElement(e);t.async=!0;
     t.src=v;s=b.getElementsByTagName(e)[0];
     s.parentNode.insertBefore(t,s)}(window, document,'script',
     'https://connect.facebook.net/en_US/fbevents.js');
     fbq('init', 'YOUR_PIXEL_ID');
     fbq('track', 'PageView');
   </script>
   ```

### 5. Performance Optimization
**Priority: MEDIUM**

#### Image Optimization:
- [ ] Compress hero images (target: <200KB)
- [ ] Convert to WebP format where supported
- [ ] Use responsive images with srcset
- [ ] Implement lazy loading for below-fold images
- [ ] Current hero-image.jpg should be optimized

#### Tools to Use:
- TinyPNG (https://tinypng.com) for compression
- Squoosh (https://squoosh.app) for WebP conversion
- Lighthouse in Chrome DevTools for performance audits

**Target Metrics:**
- Largest Contentful Paint (LCP): < 2.5s
- First Input Delay (FID): < 100ms
- Cumulative Layout Shift (CLS): < 0.1

### 6. Google Business Profile
**Priority: MEDIUM**

1. Go to https://business.google.com
2. Create business profile
3. Add details:
   - Business name: ZiggySitters
   - Category: Pet Sitting Service
   - Service area: Auckland, New Zealand
   - Website: https://ziggysitters.com
   - Phone number
   - Hours of operation
4. Verify ownership
5. Add photos and services
6. Link to website in profile

### 7. Uptime Monitoring
**Priority: MEDIUM**

#### Recommended: UptimeRobot
1. Sign up at https://uptimerobot.com (Free tier available)
2. Add monitor:
   - Monitor Type: HTTPS
   - URL: https://ziggysitters.com
   - Monitoring Interval: 5 minutes
3. Set up alerts:
   - Email: hello@ziggysitters.com
   - SMS (optional)

#### Alternative: Pingdom, StatusCake, or Better Stack

### 8. Security Enhancements
**Priority: HIGH**

#### CAPTCHA Implementation (Contact Form):
Current: No CAPTCHA on contact form

**Recommended: Cloudflare Turnstile (Free)**
1. Go to Cloudflare Dashboard > Turnstile
2. Create new site key
3. Add to contact form
4. Alternatively: Google reCAPTCHA v3

#### Rate Limiting:
Needs to be implemented in Supabase Edge Functions
- Add rate limiting to auth endpoints
- Limit: 5 login attempts per 15 minutes per IP
- Implement in edge function middleware

#### Security Headers:
Add to hosting configuration:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com;
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### 9. Email Verification Flow
**Priority: HIGH**

Current: Basic auth flow exists

Ensure:
- [ ] Email verification required before booking
- [ ] Resend verification email functionality
- [ ] Clear messaging about verification status
- [ ] Verified badge on profiles

### 10. Cookie Consent
**Priority: MEDIUM**

Needs: Cookie consent banner

**Recommended Implementation:**
1. Use cookie-consent library
2. Categories: Essential, Analytics, Marketing
3. Store consent in localStorage
4. Update Privacy Policy with cookie details
5. Provide cookie preferences management

### 11. Booking Form Enhancements
**Priority: MEDIUM**

Current: Basic validation exists

**To Improve:**
- [ ] Add inline validation for all fields
- [ ] Suburb autocomplete working (already implemented)
- [ ] Phone number format validation
- [ ] Date range picker with disabled past dates
- [ ] Clear error messages for each field
- [ ] Success confirmation with booking reference

### 12. Email Templates
**Priority: HIGH**

Current: Basic templates exist

**Templates to Review/Create:**
- ✅ Booking notification (exists)
- ✅ Booking acceptance (exists)
- ✅ Booking cancellation (exists)
- ✅ Daily report sent (exists)
- ✅ Welcome email (exists)
- ⚠️ Daily report reminder (needs testing)
- ⚠️ Penalty notification (needs testing)
- ❌ Booking confirmed with .ics calendar attachment (missing)
- ❌ Receipt/invoice email (missing)

### 13. LocalBusiness Schema Enhancement
**Priority: LOW**

Already implemented on homepage. Consider adding:
- Review aggregation to schema
- Price range
- Service specific landing pages for major suburbs:
  - /sitters/ponsonby
  - /sitters/remuera
  - /sitters/mt-eden
  - etc.

## 📋 Pre-Launch Testing Checklist

### Functional Testing:
- [ ] Complete booking flow (Pet Owner)
- [ ] Complete sitter onboarding
- [ ] Payment processing (test mode)
- [ ] Daily report submission
- [ ] Message sending/receiving
- [ ] Profile editing
- [ ] Search and filters
- [ ] Mobile responsiveness

### Email Testing:
- [ ] Verify all transactional emails deliver
- [ ] Check email formatting on different clients
- [ ] Test SPF/DKIM/DMARC with mail-tester.com

### Cross-Browser Testing:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Performance Testing:
- [ ] Run Lighthouse audit (target: 90+ score)
- [ ] Test on 3G/4G connection
- [ ] Check image loading times
- [ ] Verify no console errors

## 🚀 Launch Day Tasks

1. ✅ DNS records configured (SPF, DKIM, DMARC)
2. ✅ Google Search Console verified and sitemap submitted
3. ✅ Analytics tracking confirmed live
4. ✅ Stripe live mode enabled
5. ✅ Uptime monitoring active
6. ✅ All email templates tested
7. ✅ Security headers configured
8. ✅ Cookie consent banner active
9. ✅ Test booking completed successfully
10. ✅ Admin dashboard accessible

## 📞 Support Contacts

- Technical Issues: support@ziggysitters.co.nz
- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/support
- DNS/Hosting Support: [Your DNS provider]

---

**Last Updated:** 2025-10-12

**Note:** This checklist should be reviewed weekly leading up to launch and updated as items are completed.

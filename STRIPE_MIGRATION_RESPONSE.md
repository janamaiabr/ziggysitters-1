# Stripe Migration - Response Guide

## Summary
We discovered that 12 sitters have Stripe account IDs from an old Stripe platform that's no longer accessible with our current API keys. This was causing "internal errors" when they tried to complete Stripe setup or add services.

## What Was Implemented

### 1. Admin Stripe Reset Tool (`/admin/stripe-reset`)
- Lists all 12 affected sitters
- Allows bulk email notification to all affected sitters
- Allows individual or bulk reset of Stripe accounts
- Accessible via Admin Dashboard → "Stripe Migration" tab

### 2. Automated Email Notification
New edge function: `send-stripe-reset-notification`
- Professional email explaining the situation
- Step-by-step instructions for reconnecting
- Branded, well-designed HTML email
- Sent to all affected sitters at once

### 3. Self-Healing Error Handling
Updated both Stripe Connect functions to automatically detect and fix this issue:
- `stripe-connect-account-status` - Auto-resets when detecting old platform accounts
- `stripe-connect-onboarding` - Creates new accounts when old ones fail

**This prevents the issue from recurring** - if anyone has an old account ID, it will be automatically cleared and they'll be prompted to reconnect.

## Affected Sitters (12 Total)

1. **Caroline Mitchell** - caromitch@gmail.com (onboarded)
2. Sandra Magee - sandrajeanmagee@gmail.com (onboarded, enabled)
3. Manpreet Kaur - krish.diljit15@icloud.com (onboarded, not enabled)
4. Jana Maia - janamaia@gmail.com (onboarded, enabled)
5. Arushi Passi - passiarushi@gmail.com (onboarded, not enabled)
6. Annie Winter - anniewinter26@gmail.com (not onboarded)
7. Komalpreet Kaur - komalpreet08042001@gmail.com (not onboarded)
8. Josefina Olivares - olivares.josefina@gmail.com (onboarded, not enabled)
9. Marianna Monte - mariannamonte54@gmail.com (onboarded, not enabled)
10. Viviana Zuluaga - zuluagamarcela0@gmail.com (onboarded, not enabled)
11. Sophia Ridings - sophiaridings87@gmail.com (onboarded)
12. Ekaterina Voskresenskaia - katerina.tehnolg@gmail.com (not onboarded, enabled)

## What to Tell Caroline Specifically

**Option 1: Quick Response (if she messages again soon)**
> "Hi Caroline! We've just fixed the issue - it was on our end, not yours. We recently upgraded our payment system and your old account connection needs to be reset. 
>
> Can you please:
> 1. Go to your Profile → Payments tab
> 2. Click "Connect with Stripe" 
> 3. Complete the setup again (you'll need to re-enter your bank details)
>
> This should only take 2-3 minutes. Let me know if you have any issues!"

**Option 2: If you're sending the bulk email**
> "Hi Caroline! We've identified and fixed the technical issue you were experiencing. You should have received an email with detailed instructions on how to reconnect your payment account - it's a quick 2-3 minute process. Check your inbox (and spam folder just in case) for an email from ZiggySitters. Let me know if you need any help!"

## Action Steps

1. **Go to Admin Dashboard** → Stripe Migration tab (`/admin/stripe-reset`)

2. **Review the list** of 12 affected sitters

3. **Send the bulk email** by clicking "Send Email to All"
   - This will send a professional, detailed email to all 12 sitters
   - Email explains what happened and provides step-by-step instructions
   - Includes direct link to profile payments page

4. **Monitor responses** - sitters will start reconnecting their accounts

5. **Optional: Individual follow-up** to Caroline since she already contacted you

## Technical Details

**Why This Happened:**
- You switched Stripe API keys (moved to a new Stripe platform)
- The old `stripe_account_id` values in the database were created on the previous platform
- When these sitters tried to use Stripe features, the API rejected their old account IDs
- This appeared as "internal errors" to users

**How It's Fixed Now:**
- Automatic detection and reset when old accounts are encountered
- Clear error messages guiding users to reconnect
- Admin tool for bulk management
- Automated email notifications

**Prevention:**
- Self-healing code now automatically handles this
- If any future API key changes happen, the system will auto-detect and fix
- Better error messages guide users to solutions

## Email Content Preview

The automated email includes:
- ⚠️ Clear "Action Required" warning
- ✅ Explanation of what happened (platform upgrade)
- 📋 6-step illustrated guide
- 🔗 Direct link to payments page
- 💪 Benefits of the new platform
- 📧 Support contact information
- 🎨 Professional, branded HTML design

## Next Steps After Sending Email

1. **Wait 24-48 hours** for sitters to reconnect
2. **Check the admin tool** to see who's reconnected (list will shrink)
3. **Follow up individually** with anyone who hasn't reconnected after 2-3 days
4. **Monitor support messages** for anyone having trouble

## Support Script (If They Have Issues)

If a sitter messages saying they're having trouble:

> "I can help you with that! Here's what to do:
> 1. Go to ziggysitters.com and log in
> 2. Click on your name (top right) → Profile
> 3. Click the "Payments" tab
> 4. Click the blue "Connect with Stripe" button
> 5. A new tab will open - complete all the fields
> 6. Once done, return to your profile and refresh
> 
> The whole process takes about 2-3 minutes. Let me know if you get stuck on any step!"

## Monitoring Success

Check `/admin/stripe-reset` to see:
- How many sitters still need to reconnect (list count)
- Who has successfully reconnected (they'll disappear from the list)
- Any ongoing issues

When the list shows "0 affected sitters" - you're done!

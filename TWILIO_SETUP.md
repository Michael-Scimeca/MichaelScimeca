# Twilio SMS Notification Setup Guide

This guide will help you set up real-time SMS notifications on your website using Twilio.

## Features

- ✨ Real-time SMS notifications displayed at the bottom of your website
- 📱 Beautiful notification UI with phone number formatting
- 🔄 Auto-dismissing notifications after 10 seconds
- 🌐 Server-Sent Events (SSE) for instant updates
- 💾 In-memory message storage (last 50 messages)

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com/try-twilio)
2. A Twilio phone number capable of receiving SMS
3. Your website must be publicly accessible (for Twilio webhooks)

## Step 1: Get Twilio Credentials

1. Log in to your [Twilio Console](https://console.twilio.com/)
2. Find your **Account SID** and **Auth Token** on the dashboard
3. Get or purchase a Twilio phone number from the [Phone Numbers section](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)

## Step 2: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Twilio credentials in `.env.local`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+15551234567
   ```

## Step 3: Deploy Your Website

Your website needs to be publicly accessible for Twilio to send webhooks. You can deploy to:

- **Vercel** (recommended for Next.js):
  ```bash
  npm install -g vercel
  vercel
  ```

- **Netlify**
- **AWS**
- Any other hosting platform

Make sure to add your environment variables to your hosting platform's settings!

## Step 4: Configure Twilio Webhook

1. Go to your [Twilio Phone Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/incoming)
2. Click on your phone number
3. Scroll down to "Messaging Configuration"
4. Under "A MESSAGE COMES IN", configure:
   - **Webhook**: `https://your-domain.com/api/twilio/webhook`
   - **HTTP Method**: `POST`
5. Click **Save**

## Step 5: Test It Out!

Send a text message to your Twilio phone number. The message should appear as a notification at the bottom-right of your website in real-time! 🎉

## How It Works

### Architecture

```
SMS → Twilio → Webhook (/api/twilio/webhook) → In-Memory Store → SSE (/api/messages/stream) → Browser
```

1. **Someone texts your Twilio number** → Twilio receives the SMS
2. **Twilio sends a webhook** → POST request to `/api/twilio/webhook`
3. **Webhook stores the message** → Added to in-memory array
4. **Message is broadcast** → Emitted to all connected SSE clients
5. **Browser receives update** → SmsNotification component displays it

### Files Created

- `app/api/twilio/webhook/route.ts` - Receives incoming SMS from Twilio
- `app/api/messages/stream/route.ts` - Server-Sent Events endpoint for real-time updates
- `app/components/SmsNotification.tsx` - React component for displaying notifications

## Security Considerations

### Enable Webhook Signature Verification (Recommended)

To ensure webhook requests actually come from Twilio, uncomment the verification code in `app/api/twilio/webhook/route.ts`:

```typescript
const twilioSignature = request.headers.get('x-twilio-signature') || '';
const url = new URL(request.url).toString();
const params: { [key: string]: string } = {};
formData.forEach((value, key) => {
  params[key] = value.toString();
});

if (!twilio.validateRequest(
  process.env.TWILIO_AUTH_TOKEN!,
  twilioSignature,
  url,
  params
)) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
}
```

### Add Rate Limiting

Consider adding rate limiting to prevent abuse:

```bash
npm install @vercel/rate-limit
```

### Use a Database (Production)

For production use, replace the in-memory store with a database:
- PostgreSQL (with Vercel Postgres)
- MongoDB
- Redis
- Supabase

## Customization

### Change Notification Duration

Edit `app/components/SmsNotification.tsx`:

```typescript
// Auto-hide after 10 seconds (change to your preferred duration)
setTimeout(() => {
  hideNotification(message.id);
}, 10000); // Change this value (in milliseconds)
```

### Customize Notification Appearance

Edit the Tailwind classes in `SmsNotification.tsx` to match your design:

```typescript
className="bg-white rounded-lg shadow-2xl border border-gray-200"
```

### Auto-Reply to Messages

Edit `app/api/twilio/webhook/route.ts`:

```typescript
const twiml = new twilio.twiml.MessagingResponse();
twiml.message('Thanks for texting! I\'ll get back to you soon.');
```

## Troubleshooting

### Messages Not Showing Up?

1. **Check Twilio webhook logs**: Go to Twilio Console → Monitor → Logs → Webhooks
2. **Check your server logs**: Look for errors in your deployment logs
3. **Verify webhook URL**: Make sure it's pointing to the correct domain
4. **Test the webhook manually**: Use a tool like Postman to send a POST request

### SSE Connection Issues?

1. **Check browser console**: Look for connection errors
2. **Verify route is accessible**: Visit `/api/messages/stream` in your browser
3. **Check for connection timeouts**: Some hosting platforms have connection limits

### Environment Variables Not Working?

1. Make sure `.env.local` is in your project root
2. Restart your development server after changing environment variables
3. For production, ensure environment variables are set in your hosting platform

## Local Development Testing

To test webhooks locally, use [ngrok](https://ngrok.com/):

1. Install ngrok:
   ```bash
   npm install -g ngrok
   ```

2. Start your Next.js dev server:
   ```bash
   npm run dev
   ```

3. In a new terminal, start ngrok:
   ```bash
   ngrok http 3000
   ```

4. Copy the HTTPS URL from ngrok (e.g., `https://abc123.ngrok.io`)
5. Use this URL in your Twilio webhook configuration: `https://abc123.ngrok.io/api/twilio/webhook`

## Additional Resources

- [Twilio SMS Documentation](https://www.twilio.com/docs/sms)
- [Twilio Webhooks](https://www.twilio.com/docs/usage/webhooks)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

## Support

If you need help:
1. Check Twilio Console logs for webhook errors
2. Review browser console for client-side errors
3. Check your server/deployment logs

---

**Happy texting! 📱✨**






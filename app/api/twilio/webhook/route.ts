import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { addMessage } from '../../../../lib/messageStore';

export async function POST(request: NextRequest) {
  try {
    // Get form data from Twilio webhook
    const formData = await request.formData();
    const from = formData.get('From') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;

    // Optional: Verify the request is actually from Twilio
    // Uncomment if you want to add signature verification
    // const twilioSignature = request.headers.get('x-twilio-signature') || '';
    // const url = new URL(request.url).toString();
    // const params: { [key: string]: string } = {};
    // formData.forEach((value, key) => {
    //   params[key] = value.toString();
    // });
    // 
    // if (!twilio.validateRequest(
    //   process.env.TWILIO_AUTH_TOKEN!,
    //   twilioSignature,
    //   url,
    //   params
    // )) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    // }

    // Store the message
    const message = {
      id: messageSid,
      from,
      body,
      timestamp: Date.now()
    };

    // Add to store and notify all listeners
    addMessage(message);

    console.log('✅ New SMS received and broadcast:', message);

    // Respond with TwiML (optional - you can customize the response)
    const twiml = new twilio.twiml.MessagingResponse();
    // twiml.message('Thanks for texting! Your message will appear on the website.');

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


// Quick test script to simulate a Twilio webhook
// Run this while your dev server is running

const testWebhook = async () => {
  const webhookUrl = 'http://localhost:3000/api/twilio/webhook';
  
  // Simulate Twilio's POST request
  const formData = new URLSearchParams({
    From: '+15551234567',
    Body: 'Test message from script!',
    MessageSid: 'SM' + Date.now()
  });

  try {
    console.log('Sending test webhook to:', webhookUrl);
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response:', text);
    
    if (response.ok) {
      console.log('✅ Webhook is working! Check your browser for the notification.');
    } else {
      console.log('❌ Webhook failed. Check the error above.');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure npm run dev is running!');
  }
};

testWebhook();






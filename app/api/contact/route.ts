import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Helper to ensure Resend API key is available
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, subject, message } = await req.json();

    if (!process.env.RESEND_API_KEY) {
      console.error("Missing RESEND_API_KEY");
      return NextResponse.json(
        { error: "Server configuration error: Missing API Key" }, 
        { status: 500 }
      );
    }

    const data = await resend.emails.send({
      from: 'PharmaCorp Contact <onboarding@resend.dev>', // Default Resend testing domain
      to: ['hussainabbas7492@gmail.com'], // Using user's confirmed Resend email
      replyTo: email, // Allow replying directly to the user
      subject: `[Contact Form] ${subject} - ${firstName} ${lastName}`,
      html: `
        <h1>New Contact Message</h1>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message}</p>
      `
    });

    if (data.error) {
        console.error("Resend Error:", data.error);
        return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

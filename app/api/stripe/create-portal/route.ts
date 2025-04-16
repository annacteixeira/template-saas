import { auth } from "@/app/lib/auth";
import { db } from "@/app/lib/firebase";
import { NextRequest, NextResponse } from "next/server";
import stripe from "@/app/lib/stripe";

export async function POST(req: NextRequest) {
  let session;
  try {
    session = await auth();
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData || !userData.stripeCustomerId) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const customerId = userData.stripeCustomerId;

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${req.headers.get("origin")}/dashboard`,
    });

    return NextResponse.json({ url: portalSession.url }, { status: 200 });
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
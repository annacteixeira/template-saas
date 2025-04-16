  import stripe from "@/app/lib/stripe";
  import { auth } from "@/app/lib/auth";
  import { error } from "console";
  import { getOrCreateCustomer } from "@/app/server/stripe/get-customer-id";
  import { NextRequest, NextResponse } from "next/server";

  export async function POST(req: NextRequest) {
    const { testeId } = await req.json(); // obs: tudo que é passado por aqui pode ser acessado por usuários mal intencionados

    const session = await auth();
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;
    const price = process.env.STRIPE_PRODUCT_PRICE_ID;

    if(!userId || !userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const customerId = await getOrCreateCustomer(userId, userEmail);

    if(!price) {
      return NextResponse.json({ error: "Price not found" }, { status: 500 });
    }

    const metadata = {
      testeId,
    }

    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [{ price, quantity: 1 }],
        mode: "payment",
        payment_method_types: ["card", "boleto"],
        success_url: `${req.headers.get("origin")}/success`,
        cancel_url: `${req.headers.get("origin")}/`,
        customer: customerId,
        metadata,
      });

      if(!session.url){
        return NextResponse.json({ error: "Session URL not found" }, { status: 500 });
      }

      return NextResponse.json({ sessionId: session.id }, { status: 200 });

    } catch(error) {
        console.error(error);
        return NextResponse.error();
    }
  }
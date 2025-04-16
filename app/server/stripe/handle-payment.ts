import { db } from "@/app/lib/firebase";
import "server-only";
import Stripe from "stripe";

export async function handleStripePayment(event: Stripe.CheckoutSessionCompletedEvent) {
  if (event.data.object.payment_status === "paid") {
    const metadata = event.data.object.metadata;

    console.log("Pagamento realizado com sucesso. Enviar um e-mail e liberar acesso ao usuário");

    const userId = metadata?.userId;

    if (!userId) {
      console.error("User ID not found!");
      return;
    }

    await db.collection("users").doc(userId).update({
      stripeSubsctiptionId: event.data.object.subscription,
      subscriptionStatus: "active",
    })
  }
}
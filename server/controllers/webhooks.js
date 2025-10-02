import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebHooks = async (request, response) => {
    console.log("🔔 Webhook received:", request.method, request.url);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("✅ Webhook event parsed successfully:", event.type);
    } catch (error) {
        console.error("❌ Webhook parsing error:", error.message);
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;
                console.log("💳 Checkout session completed:", session.id);

                const { transactionId, appId } = session.metadata || {};
                console.log("📋 Transaction metadata:", { transactionId, appId });
                
                if (appId !== "QuickGPT") {
                    console.log("❌ Invalid app ID:", appId);
                    return response.json({ received: true, message: "Invalid app" });
                }

                // find transaction
                const transaction = await Transaction.findOne({
                    _id: transactionId,
                    isPaid: false,
                });

                if (!transaction) {
                    console.log("❌ Transaction not found or already paid:", transactionId);
                    break;
                }
                
                console.log("✅ Transaction found:", {
                    id: transaction._id,
                    userId: transaction.userId,
                    credits: transaction.credits,
                    amount: transaction.amount
                });

                // update user credits
                console.log("🔄 Updating user credits...");
                const updatedUser = await User.findByIdAndUpdate(
                    transaction.userId,
                    { $inc: { credits: transaction.credits } },
                    { new: true }
                );

                if (!updatedUser) {
                    console.error(`❌ User not found for transaction ${transactionId}`);
                    return response.status(404).json({ received: false, message: "User not found" });
                }

                console.log("✅ User credits updated:", {
                    userId: updatedUser._id,
                    creditsAdded: transaction.credits,
                    newTotal: updatedUser.credits
                });

                // mark transaction as paid
                transaction.isPaid = true;
                await transaction.save();

                console.log(`🎉 Transaction completed successfully! User ${updatedUser._id} credited with ${transaction.credits}. New total: ${updatedUser.credits}`);
                break;
            }
            default:
                console.log("Unhandled event type:", event.type);
                break;
        }

        response.json({ received: true });
    } catch (error) {
        console.error("Webhook processing error:", error);
        response.status(500).send("Internal server error");
    }
};

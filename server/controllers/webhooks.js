import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebHooks = async (request, response) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return response.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object;

                const { transactionId, appId } = session.metadata || {};
                if (appId !== "QuickGPT") {
                    return response.json({ received: true, message: "Invalid app" });
                }

                // find transaction
                const transaction = await Transaction.findOne({
                    _id: transactionId,
                    isPaid: false,
                });

                if (!transaction) {
                    console.log("Transaction not found or already paid");
                    break;
                }

                // update user credits
                const updatedUser = await User.findByIdAndUpdate(
                    transaction.userId,
                    { $inc: { credits: transaction.credits } },
                    { new: true }
                );

                // mark transaction as paid
                transaction.isPaid = true;
                await transaction.save();

                console.log(`✅ User ${updatedUser._id} credited with ${transaction.credits}`);
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

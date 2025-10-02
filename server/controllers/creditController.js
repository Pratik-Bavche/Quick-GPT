import Transaction from "../models/Transaction.js"
import Stripe from 'stripe'

const plans=[
    {
        _id: "basic",
        name: "Basic",
        price: 10,
        credits: 100,
        features: ['100 text generations', '50 image generations', 'Standard support', 'Access to basic models']
    },
    {
        _id: "pro",
        name: "Pro",
        price: 20,
        credits: 500,
        features: ['500 text generations', '200 image generations', 'Priority support', 'Access to pro models', 'Faster response time']
    },
    {
        _id: "premium",
        name: "Premium",
        price: 30,
        credits: 1000,
        features: ['1000 text generations', '500 image generations', '24/7 VIP support', 'Access to premium models', 'Dedicated account manager']
    }
]


//API controller to get all plans
export const getPlans=async (req,res) => {
    try {
        res.json({success:true,plans})
    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//API controller to purchase plan
export const purchasePlan=async (req,res) => {
    try {
        const {planId}=req.body;
        const userId=req.user._id;
        const plan=plans.find(plan=>plan._id===planId);

        if(!plan)
        {
            return res.json({success:false,message:"Invalid plan"})
        }

        //Craete new transaction
        const transaction=await Transaction.create({
            userId:userId,
            planId:plan._id,
            amount:plan.price,
            credits:plan.credits,
            isPaid:false
        })

        const session = await stripe.checkout.sessions.create({
        line_items: [
                {
                    price_data: {
                        currency:"usd",
                        unit_amount:plan.price*100,
                        product_data:{
                            name:plan.name,
                        },
                    },
                    quantity: 1,
                },
        ],
        mode: 'payment',
        success_url: `http://localhost:5173/loading`,
        cancel_url:`http://localhost:5173`,
        metadata:{transactionId:transaction._id.toString(),appId:'QuickGPT'},
        expires_at:Math.floor(Date.now()/1000)+30*60,//expire in 30 minutes
        });

        res.json({success:true,url:session.url})

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}

//API controller to check and update credits manually
export const checkCredits=async (req,res) => {
    try {
        const userId=req.user._id;
        
        // Find any unpaid transactions for this user
        const unpaidTransactions = await Transaction.find({
            userId: userId,
            isPaid: false
        });

        if (unpaidTransactions.length === 0) {
            return res.json({success: true, message: "No pending transactions", creditsUpdated: false});
        }

        // Check if any of these transactions have been paid via Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        let totalCreditsToAdd = 0;
        let updatedTransactions = [];

        for (const transaction of unpaidTransactions) {
            try {
                // Check if the session was completed
                const sessions = await stripe.checkout.sessions.list({
                    limit: 100,
                    created: {
                        gte: Math.floor((transaction.createdAt.getTime() - 60000) / 1000) // 1 minute before transaction creation
                    }
                });

                const completedSession = sessions.data.find(session => 
                    session.metadata?.transactionId === transaction._id.toString() &&
                    session.payment_status === 'paid'
                );

                if (completedSession) {
                    totalCreditsToAdd += transaction.credits;
                    transaction.isPaid = true;
                    updatedTransactions.push(transaction);
                }
            } catch (stripeError) {
                console.error("Error checking Stripe session:", stripeError);
            }
        }

        if (totalCreditsToAdd > 0) {
            // Update user credits
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $inc: { credits: totalCreditsToAdd } },
                { new: true }
            );

            // Save updated transactions
            await Promise.all(updatedTransactions.map(t => t.save()));

            console.log(`✅ Manual credit update: User ${userId} credited with ${totalCreditsToAdd} credits. New total: ${updatedUser.credits}`);
            
            return res.json({
                success: true, 
                message: `Credits updated! Added ${totalCreditsToAdd} credits`,
                creditsUpdated: true,
                newCredits: updatedUser.credits
            });
        }

        res.json({success: true, message: "No completed payments found", creditsUpdated: false});

    } catch (error) {
        console.error("Error checking credits:", error);
        res.json({success: false, message: error.message});
    }
}
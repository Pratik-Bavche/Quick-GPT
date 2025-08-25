import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import chatRouter from './routes/chatRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import creditRouter from './routes/creditRoutes.js';
import { stripeWebHooks } from './controllers/webhooks.js';

const app= express();

await connectDB();

//stripe webhook

app.post('/api/stripe',express.raw({type:'application/json'}),stripeWebHooks)

//middleware
app.use(cors());
app.use(express.json());
app.use('/api/chat',chatRouter);
app.use('/api/message',messageRouter)
app.use('/api/credit',creditRouter)

//routes
app.get('/',(req,res)=>{
    return res.send("Server is live");
})
app.use('/api/user',userRouter)

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

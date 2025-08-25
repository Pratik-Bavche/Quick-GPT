import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imagekit.js"
import openai from "../configs/openai.js"

// Text-based AI Chat Message Controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;


         //check credits
        if (req.user.credits < 1) {
        return res.json({success:false,message:"You dont have enough credits to use this feature"});
        }



        const {chatId, prompt}= req.body

        const chat = await Chat.findOne({userId, _id: chatId})
        chat.messages.push({role: "user", content: prompt, timestamp: Date.now(),isImage: false})

        const {choices} = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages: [
                {
                    role: "user",
                    content:prompt,
                },
            ],
        });

        const replay={...choices[0].message,timestamp:Date.now(),isImage:false}
        res.json({success:true,replay})

        chat.messages.push(replay)
        await chat.save();
        
        await User.updateOne({_id:userId},{$inc:{credits:-1}})} 

        catch (error) {
            res.json({success:false,message:error.message})
        }

}

//Image generation message controller
export const imageMessageController=async (req,res) => {
    try {
        const userId=req.user._id;
        //check credits
        if(req.user.credits<2)
        {
            res.json({success:false,message:"You dont have enough credits to use this feature"})
        }
        const {prompt,chatId,isPublished}=req.body;

        //Find chat
        const chat=await Chat.findOne({userId, _id:chatId});

        //push user message
        chat.messages.push({role: "user",
             content: prompt, 
             timestamp: Date.now(),
             isImage: false});

             //Encode the prompt
             const encodedPrompt=encodeURIComponent(prompt);

             //Construct imagekit AI generation URL
             const generatedImageUrl=`${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/QuickGPT/${Date.now()}.png?tr=w=800,h=800`;

             //fetching image from imagekit
             const aiImageResponse=await axios.get(generatedImageUrl,{responseType:"arraybuffer"})

             //convert to Base64
             const base64Image=`data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`

             //upload image on imagekit
             const uploadResponse=await imagekit.upload({
                file:base64Image,
                fileName:`${Date.now()}.png`,
                folder:"QuickGPT"
             })

             const replay={
                role:'assistant',
                content:uploadResponse.url,
                timestamp:Date.now(),
                isImage:true,
                isPublished
            }
             res.json({success:true,replay})
             chat.messages.push(replay)
             await chat.save();
             await User.updateOne({_id:userId},{$inc:{credits:-2}})

    } catch (error) {
        res.json({success:false,message:error.message})
    }
}
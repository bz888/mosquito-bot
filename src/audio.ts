import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI();

const speechFile = path.resolve("./speech.mp3");

async function main() {
    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: "Hey there! How's it going? I've been pretty busy lately with a new project that's been taking up a lot of my time. So, what have you been up to these past few days? Anything new and interesting happening in your life?\n" +
            "\n" +
            "Oh, by the way, I recently started working on a voice command prompt system integrated with a TUI application. It's quite technical but really exciting. Have you picked up any new hobbies or activities lately?\n" +
            "\n" +
            "That's awesome! Congrats on the new job! What's your role there? Project management sounds like a lot of responsibility. My new project involves using a combination of Python and Go for the backend, and it's been quite a learning experience. Do you find project management challenging?\n" +
            "\n" +
            "Classic rock is a great choice! Playing the guitar sounds fun. I used to play a bit myself, though it's been a while. As for me, I've been getting into climbing more seriously. It's a great workout and a lot of fun. By the way, how's the transition to your new job environment going?\n" +
            "\n" +
            "Climbing sounds intense! The transition has been smooth so far, but there's a lot to learn. How do you balance your time with all these activities? Staying organized can be tough, but I find that using a planner and setting clear goals helps a lot. Oh, and before I forget, are you still into hiking? I remember you used to enjoy it.\n" +
            "\n" +
            "Not recently, but I've been planning to go on one soon. There's a trail nearby that I've been wanting to explore. Maybe we could go together sometime. What do you think?",
    });

    console.log(speechFile);

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
}

main().then(() => {
    console.log("done")
});
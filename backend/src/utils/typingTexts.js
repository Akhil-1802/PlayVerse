const typingTexts = {
  30: [
    "The quick brown fox jumps over the lazy dog near the riverbank every single morning.",
    "Coding is the art of telling a computer what to do in a language it understands well.",
    "Practice makes perfect and every keystroke brings you closer to mastery of the keyboard.",
    "The sun sets slowly behind the mountains casting long golden shadows across the valley.",
    "Speed and accuracy are both important when it comes to becoming a great typist overall.",
  ],
  45: [
    "A good programmer writes code that humans can read and machines can execute without any errors. Clean code is not just about functionality but also about clarity and simplicity in design.",
    "The internet has transformed the way people communicate, learn, and share information across the globe. It connects billions of people and enables collaboration on an unprecedented scale.",
    "Typing fast is a skill that takes time and dedication to develop properly. The more you practice on a daily basis, the more natural and effortless it will eventually become for you.",
    "Mountains have always inspired humans with their grandeur and mystery. Climbers from around the world travel great distances just to stand at the summit and look out over the horizon.",
    "Music is a universal language that transcends borders and cultures. It has the power to evoke deep emotions and bring people together in ways that words alone cannot always achieve.",
  ],
  60: [
    "The history of computing is a fascinating journey that spans several decades of innovation and discovery. From the earliest mechanical calculators to modern supercomputers, each generation of technology has built upon the last. Today we carry more computing power in our pockets than was used to send humans to the moon, and the pace of progress shows no signs of slowing down anytime soon.",
    "Learning to type quickly and accurately is one of the most valuable skills you can develop in the modern world. Whether you are writing emails, coding software, or creating documents, the ability to translate your thoughts into text without friction makes you significantly more productive. Start slow, focus on accuracy first, and speed will naturally follow with consistent daily practice.",
    "The ocean covers more than seventy percent of the Earth's surface and remains one of the least explored frontiers on our planet. Beneath the waves lies an entire world of extraordinary creatures, ancient shipwrecks, and geological formations that scientists are only beginning to understand. Every deep sea expedition reveals new species and challenges our assumptions about life on Earth.",
    "Artificial intelligence is reshaping industries at a pace that few could have predicted even a decade ago. From healthcare diagnostics to autonomous vehicles, the applications of machine learning are vast and growing rapidly. As these systems become more capable, society must grapple with important questions about ethics, accountability, and the future of human work in an increasingly automated world.",
    "Great literature has the power to transport readers to different times, places, and perspectives. Through the pages of a well-crafted novel, we can experience lives vastly different from our own and develop empathy for people we might never meet. Reading regularly not only expands your vocabulary and knowledge but also sharpens your ability to think critically and communicate more effectively.",
  ],
};

const getTypingText = (duration) => {
  const texts = typingTexts[duration];
  return texts[Math.floor(Math.random() * texts.length)];
};

module.exports = { getTypingText };

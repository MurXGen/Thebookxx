// QuickReads by TheBookX — micro-learning dataset.
// Each entry references an existing book by its bookId (from utils/book.js).
// Frames are original, paraphrased insights (no verbatim copyrighted text).
// Add more books over time; the module + reader are fully data-driven.

export const QUICKREAD_PRICE = 29;
export const QUICKREAD_FREE_FRAMES = 10; // frames readable before the paywall

// Mindset — Carol S. Dweck. Shared by both catalogue entries for this title
// (bk-151 and bk-417) so the QuickReads badge shows on either detail page.
const MINDSET_FRAMES = [
  {
    id: "md-1",
    title: "The Two Mindsets",
    content:
      "Dweck's research reveals two ways of seeing ability. A fixed mindset believes talents are set in stone; a growth mindset believes they can be developed. Which one you hold quietly shapes your whole life.",
  },
  {
    id: "md-2",
    title: "The Fixed Mindset",
    content:
      "In a fixed mindset, intelligence and talent feel like a fixed hand you're dealt. Every situation becomes a test of whether you're smart or not, so you spend energy proving yourself rather than improving.",
  },
  {
    id: "md-3",
    title: "The Growth Mindset",
    content:
      "In a growth mindset, abilities are a starting point that can grow through effort, strategy, and help. You focus on learning rather than looking good, and challenges become fuel instead of threats.",
  },
  {
    id: "md-4",
    title: "It's About Beliefs",
    content:
      "The power isn't in your actual ability but in what you believe about it. The same event — a hard class, a setback — means opportunity to one mindset and disaster to the other.",
  },
  {
    id: "md-5",
    title: "The Power of Yet",
    content:
      "'I can't do this' becomes 'I can't do this yet.' That small word turns a verdict into a stage in a journey, keeping the door to growth wide open.",
  },
  {
    id: "md-6",
    title: "Effort Is the Path to Mastery",
    content:
      "Growth-minded people see effort as what makes you smart or skilled. Fixed-minded people see effort as proof you lack talent — a belief that quietly caps their potential.",
  },
  {
    id: "md-7",
    title: "Failure Is Information",
    content:
      "In a growth mindset, failure is something you do, not something you are. It's painful but instructive — a source of lessons rather than a label you must hide.",
  },
  {
    id: "md-8",
    title: "Challenges Are Opportunities",
    content:
      "A fixed mindset avoids hard things to protect its image. A growth mindset seeks them out, because stretching beyond the comfortable is exactly where growth happens.",
  },
  {
    id: "md-9",
    title: "The Brain Can Grow",
    content:
      "The brain is more malleable than we once believed; it forms new connections with practice. Understanding that you can literally get smarter changes how you approach difficulty.",
  },
  {
    id: "md-10",
    title: "Praise the Process",
    content:
      "Praising effort, strategy, and persistence builds a growth mindset. Praising raw talent — 'you're so smart' — quietly teaches people to fear challenges that might expose them.",
  },
  {
    id: "md-11",
    title: "The Danger of the Smart Label",
    content:
      "Children praised for being smart often avoid hard tasks to protect the label. Those praised for effort choose challenges and learn more — the label becomes a cage.",
  },
  {
    id: "md-12",
    title: "How Each Mindset Meets Failure",
    content:
      "Fixed-minded people crumble or make excuses after a setback. Growth-minded people ask what they can learn and try a new approach. Same failure, opposite response.",
  },
  {
    id: "md-13",
    title: "Talent Is a Starting Point",
    content:
      "Natural ability is real, but it's where you begin, not where you must end. History is full of late bloomers who outgrew more 'gifted' peers through sustained effort.",
  },
  {
    id: "md-14",
    title: "Improving Beats Comparing",
    content:
      "The fixed mindset measures itself against others; the growth mindset measures itself against its own past. Competing with yesterday's you is a far healthier game.",
  },
  {
    id: "md-15",
    title: "Handling Criticism",
    content:
      "A fixed mindset hears criticism as an attack on identity. A growth mindset treats useful feedback as free coaching — information to get better, not a wound to defend.",
  },
  {
    id: "md-16",
    title: "Others' Success",
    content:
      "When someone else shines, the fixed mindset feels threatened while the growth mindset feels inspired. One sees a rival; the other sees a roadmap.",
  },
  {
    id: "md-17",
    title: "The Effort Myth",
    content:
      "Many believe that if you're truly talented, things should come easily. In reality, even the most gifted reach greatness through years of demanding, deliberate work.",
  },
  {
    id: "md-18",
    title: "Confidence vs. Growth",
    content:
      "You don't need constant confidence to grow — you need willingness to learn. Growth-minded people thrive even during the wobbly stretch when they're not yet good.",
  },
  {
    id: "md-19",
    title: "Mindset in Relationships",
    content:
      "A fixed mindset expects the perfect partner and effortless harmony; when problems arise, it blames. A growth mindset sees relationships as something two people build and repair together.",
  },
  {
    id: "md-20",
    title: "Love Takes Work",
    content:
      "Believing good relationships shouldn't require effort quietly dooms them. Lasting bonds grow through communication, compromise, and the willingness to work through conflict.",
  },
  {
    id: "md-21",
    title: "Mindset in Parenting",
    content:
      "Children absorb the mindset around them. The messages we send about success, failure, and effort teach kids whether to protect an image or embrace learning.",
  },
  {
    id: "md-22",
    title: "What to Tell Children",
    content:
      "Focus feedback on choices, strategies, and effort — 'you worked hard on that' — rather than fixed traits. It teaches kids that growth is always in their hands.",
  },
  {
    id: "md-23",
    title: "Mindset in Sports",
    content:
      "The 'natural' is a seductive but misleading idea. Champions are usually made by character, coachability, and relentless practice more than by raw physical gifts.",
  },
  {
    id: "md-24",
    title: "Mindset in Business",
    content:
      "Companies built on fixed-mindset genius-worship often stagnate. Growth-minded organizations prize learning, development, and honest feedback over protecting egos.",
  },
  {
    id: "md-25",
    title: "CEO Disease",
    content:
      "Leaders craving constant validation surround themselves with yes-men and punish bad news. The need to look infallible blinds them to the problems they most need to see.",
  },
  {
    id: "md-26",
    title: "Growth-Minded Leaders",
    content:
      "The best leaders see themselves as constant learners who develop others. They welcome hard truths and treat their organization as something always capable of improving.",
  },
  {
    id: "md-27",
    title: "The False Growth Mindset",
    content:
      "Claiming a growth mindset isn't the same as living one. It's not just about praising effort — it's about actually learning from setbacks and trying new strategies when stuck.",
  },
  {
    id: "md-28",
    title: "Effort Alone Isn't Enough",
    content:
      "Growth mindset isn't 'try harder' on repeat. When an approach isn't working, real growth means seeking new methods, feedback, and resources — not just grinding harder.",
  },
  {
    id: "md-29",
    title: "Mindsets Can Change",
    content:
      "Your mindset isn't permanent. Simply learning that abilities can grow begins to shift how you interpret challenges, effort, and failure.",
  },
  {
    id: "md-30",
    title: "Spot Your Triggers",
    content:
      "Notice the moments that flip you into a fixed mindset — a big challenge, harsh criticism, someone outperforming you. Awareness is the first step to responding differently.",
  },
  {
    id: "md-31",
    title: "Name the Fixed-Mindset Voice",
    content:
      "Dweck suggests giving your fixed-mindset persona a name so you can recognize it. When it whispers 'don't risk it, you'll look dumb,' you can hear it as a voice, not the truth.",
  },
  {
    id: "md-32",
    title: "Talk Back to It",
    content:
      "When the fixed-mindset voice appears, answer it with a growth response. 'What if I fail?' becomes 'Most successful people failed first — this is how I learn.'",
  },
  {
    id: "md-33",
    title: "Set Learning Goals",
    content:
      "Aim to get better, not just to prove you're good. Learning goals keep you moving forward even when performance dips, because progress is the real target.",
  },
  {
    id: "md-34",
    title: "Process Over Outcome",
    content:
      "Judge yourself by the quality of your effort and strategy, not only the score. Focusing on the process keeps motivation alive across the inevitable ups and downs.",
  },
  {
    id: "md-35",
    title: "Great Teachers and Mentors",
    content:
      "The most effective teachers hold high standards and believe every student can reach them. They combine challenge with support, expecting growth and helping it happen.",
  },
  {
    id: "md-36",
    title: "Low Effort as Self-Protection",
    content:
      "Holding back lets you blame the loss on not trying rather than on your ability. It feels safe, but it guarantees you never discover what you could have become.",
  },
  {
    id: "md-37",
    title: "Growth Mindset and Resilience",
    content:
      "Believing you can improve makes setbacks survivable. Resilience isn't never falling — it's the confidence that you can learn your way back up.",
  },
  {
    id: "md-38",
    title: "Depression and Mindset",
    content:
      "Even in low moods, growth-minded people are more likely to keep taking action and problem-solving. The belief that things can change is itself a form of protection.",
  },
  {
    id: "md-39",
    title: "A Journey, Not a Switch",
    content:
      "No one is purely growth-minded all the time. Moving toward growth is ongoing work — a series of choices to stay curious, keep learning, and try again.",
  },
  {
    id: "md-40",
    title: "Choose Growth Daily",
    content:
      "Mindset is a choice you renew in each challenge, criticism, and setback. Choose to see effort as the path and failure as feedback, and your potential keeps expanding.",
  },
  {
    id: "md-41",
    title: "Growth Mindset in New Skills",
    content:
      "Starting something new means being bad at it first. A growth mindset lets you tolerate the awkward beginner stage long enough to actually improve.",
  },
  {
    id: "md-42",
    title: "Embrace Desirable Difficulty",
    content:
      "Learning that feels a little hard tends to stick. Seek the productive struggle instead of the easy repetition that only feels like progress.",
  },
  {
    id: "md-43",
    title: "Use Feedback Loops",
    content:
      "Growth needs information. Build in regular, honest feedback so you can see what's working and adjust — improvement without feedback is mostly guessing.",
  },
  {
    id: "md-44",
    title: "Reframe the Word Failure",
    content:
      "In a growth mindset, 'failure' is just data about what to try next. Swapping the meaning of the word changes how you respond to every setback.",
  },
  {
    id: "md-45",
    title: "Learn From Role Models",
    content:
      "Study the people you admire and you'll usually find years of struggle behind the success. Their journey, not just their result, is the real lesson.",
  },
  {
    id: "md-46",
    title: "Mindset Fuels Creativity",
    content:
      "Creativity thrives when failure feels safe. A growth mindset gives you permission to experiment, be wrong, and try again — the raw material of new ideas.",
  },
  {
    id: "md-47",
    title: "Beware the Natural-Talent Story",
    content:
      "Calling someone a natural hides the effort behind their skill and discourages everyone else. Value the work, not just the apparent gift.",
  },
  {
    id: "md-48",
    title: "Mindset and Stress",
    content:
      "Seeing a challenge as a threat spikes stress; seeing it as an opportunity to grow changes how your body and mind respond. Framing is powerful.",
  },
  {
    id: "md-49",
    title: "Cultivate Curiosity",
    content:
      "Curiosity turns problems into puzzles. Asking 'how does this work?' or 'what can I learn here?' keeps the growth mindset alive.",
  },
  {
    id: "md-50",
    title: "Persistence Over Perfection",
    content:
      "Growth isn't about flawless performance; it's about continuing after imperfect ones. Showing up again is the behavior that compounds into skill.",
  },
  {
    id: "md-51",
    title: "Mindset in Teams",
    content:
      "Teams with a growth culture share information, admit mistakes, and improve together. Fixed-mindset cultures hide errors and stall. Culture is collective mindset.",
  },
  {
    id: "md-52",
    title: "Self-Compassion Powers Growth",
    content:
      "Harsh self-criticism triggers the fixed mindset's fear. Treating yourself with kindness after a setback makes it easier to learn and try again.",
  },
  {
    id: "md-53",
    title: "Become a Lifelong Learner",
    content:
      "The growth mindset, lived over years, turns life itself into a school. Stay curious, keep stretching, and you never stop becoming more capable.",
  },
];

export const quickReads = {
  // Ikigai — Héctor García & Francesc Miralles
  "bk-391": {
    bookId: "bk-391",
    tagline: "The Japanese secret to a long, joyful, purposeful life",
    updated: "2026-07",
    frames: [
      {
        id: "ik-1",
        title: "What Ikigai Really Means",
        content:
          "Ikigai is your reason to get out of bed each morning — the quiet sense of purpose that makes daily life feel worth living. It rarely arrives as one grand goal; it lives in small, meaningful moments.",
      },
      {
        id: "ik-2",
        title: "The Four Overlapping Circles",
        content:
          "Your ikigai sits where four things meet: what you love, what you're good at, what the world needs, and what you can be paid for. The sweet spot is the overlap of all four.",
      },
      {
        id: "ik-3",
        title: "Never Truly Retire",
        content:
          "In Okinawa there's no exact word for 'retirement.' Staying engaged in work you love — even informally — keeps the mind sharp and the spirit alive well into old age.",
      },
      {
        id: "ik-4",
        title: "Keep Moving, Always",
        content:
          "The longest-living people don't hit the gym — they simply never stop moving. Gardening, walking, and daily chores keep the body active without effort or pressure.",
      },
      {
        id: "ik-5",
        title: "Hara Hachi Bu",
        content:
          "Okinawans eat until they're about 80% full, then stop. Leaving a little room prevents overeating and is one of their simplest longevity habits.",
      },
      {
        id: "ik-6",
        title: "The Power of Moai",
        content:
          "A moai is a lifelong circle of friends who support each other. Strong, dependable community is one of the biggest predictors of a long, happy life.",
      },
      {
        id: "ik-7",
        title: "Find Your Flow",
        content:
          "Flow is the state of being so absorbed in an activity that time disappears. The more hours you spend in flow, the more fulfilled and alive you feel.",
      },
      {
        id: "ik-8",
        title: "Concentrate on One Thing",
        content:
          "Flow thrives on single-tasking. Remove distractions, choose one meaningful task, and give it your full attention to unlock deep focus.",
      },
      {
        id: "ik-9",
        title: "Choose Tasks Just Beyond Your Skill",
        content:
          "Boredom comes from tasks too easy; anxiety from tasks too hard. Pick challenges slightly above your current ability to stay in the flow zone.",
      },
      {
        id: "ik-10",
        title: "Slow Down to Live More",
        content:
          "A gentler pace isn't laziness — it's presence. Slowing down lets you notice, savour, and actually experience your one precious life.",
      },
      {
        id: "ik-11",
        title: "Wabi-Sabi: Beauty in Imperfection",
        content:
          "Wabi-sabi teaches us to find beauty in things that are imperfect, incomplete, and impermanent — including ourselves. Perfection isn't the goal; appreciation is.",
      },
      {
        id: "ik-12",
        title: "Ichigo Ichie: This Moment, Once",
        content:
          "Every moment happens only once and will never return. Treating experiences as unrepeatable makes ordinary days feel precious.",
      },
      {
        id: "ik-13",
        title: "Purpose Protects Your Health",
        content:
          "People with a clear sense of purpose tend to live longer and recover faster. Meaning isn't just emotional — it's physically protective.",
      },
      {
        id: "ik-14",
        title: "Stress Ages You",
        content:
          "Chronic stress accelerates cellular ageing. Managing stress through rest, nature, and community is as important as any diet.",
      },
      {
        id: "ik-15",
        title: "A Little Stress Is Good",
        content:
          "Not all stress harms you. Small, manageable challenges keep you resilient — it's constant, unmanaged pressure that wears you down.",
      },
      {
        id: "ik-16",
        title: "Rainbow of Vegetables",
        content:
          "Okinawan diets are rich in colourful vegetables, tofu, and fish. Eating a wide variety of plants gives the body a broad range of antioxidants.",
      },
      {
        id: "ik-17",
        title: "Green Tea Ritual",
        content:
          "Daily green tea is a longevity staple — full of antioxidants and enjoyed slowly, turning a simple drink into a mindful pause.",
      },
      {
        id: "ik-18",
        title: "Sit Less, Stand More",
        content:
          "Prolonged sitting quietly harms health. Build small movements into your day — stand, stretch, and walk often rather than staying still for hours.",
      },
      {
        id: "ik-19",
        title: "The Antifragile Mindset",
        content:
          "Some things gain strength from stress and shocks. Build a life with buffers and variety so setbacks make you stronger instead of breaking you.",
      },
      {
        id: "ik-20",
        title: "Don't Put All Eggs in One Basket",
        content:
          "Diversify your income, skills, friendships, and interests. Redundancy protects you when any single area of life takes a hit.",
      },
      {
        id: "ik-21",
        title: "Small Steps, Big Change",
        content:
          "Radical change often fails; gentle, consistent steps last. Improve a little each day and let time compound the results.",
      },
      {
        id: "ik-22",
        title: "Stay Curious",
        content:
          "A curious mind keeps learning, and a learning mind stays young. Keep asking questions and trying new things at every age.",
      },
      {
        id: "ik-23",
        title: "Smile and Stay Sociable",
        content:
          "Okinawan elders greet life with warmth and humour. A friendly, optimistic attitude strengthens bonds and buffers hard times.",
      },
      {
        id: "ik-24",
        title: "Reconnect With Nature",
        content:
          "Humans are wired for the natural world. Regular time outdoors restores calm, focus, and a sense of belonging.",
      },
      {
        id: "ik-25",
        title: "Gratitude Every Day",
        content:
          "Simple daily gratitude — for the sun, a meal, a friend — trains the mind to notice what's good and quietly lifts your baseline happiness.",
      },
      {
        id: "ik-26",
        title: "Live in the Present",
        content:
          "Regret lives in the past and worry in the future. Ikigai is found by fully inhabiting the moment you're actually in.",
      },
      {
        id: "ik-27",
        title: "Follow Your Curiosity, Not Just Passion",
        content:
          "You don't need one burning passion. Following gentle curiosities, one after another, can lead you to your ikigai over time.",
      },
      {
        id: "ik-28",
        title: "Master Something Slowly",
        content:
          "Deep mastery takes patient, repeated practice. The Japanese honour the long apprenticeship — devotion to craft is itself a source of meaning.",
      },
      {
        id: "ik-29",
        title: "The 10-Minute Start",
        content:
          "When motivation is low, commit to just a few minutes. Starting is the hardest part — momentum and flow usually follow once you begin.",
      },
      {
        id: "ik-30",
        title: "Rituals Over Willpower",
        content:
          "Relying on willpower is exhausting. Build simple daily rituals so good behaviour happens automatically, without a fight.",
      },
      {
        id: "ik-31",
        title: "Design a Distraction-Free Space",
        content:
          "Your environment shapes your focus. Clear your space of interruptions so deep work and flow can happen naturally.",
      },
      {
        id: "ik-32",
        title: "Movement as Medicine",
        content:
          "Gentle daily practices like radio taiso (warm-up exercises), yoga, or tai chi keep joints supple and the mind steady.",
      },
      {
        id: "ik-33",
        title: "Rest Is Productive",
        content:
          "Longevity isn't relentless hustle. Adequate sleep and genuine rest are when the body repairs and the mind consolidates.",
      },
      {
        id: "ik-34",
        title: "Meaningful Work Beats Easy Work",
        content:
          "Work that feels meaningful energises you even when it's hard. Seek contribution, not just comfort.",
      },
      {
        id: "ik-35",
        title: "Belong to Something Bigger",
        content:
          "Feeling part of a family, community, or cause gives daily effort a deeper 'why' — and a why makes almost any 'how' bearable.",
      },
      {
        id: "ik-36",
        title: "Accept What You Can't Control",
        content:
          "Much suffering comes from fighting reality. Accepting what you cannot change frees your energy for what you can.",
      },
      {
        id: "ik-37",
        title: "Keep Your Mind Active",
        content:
          "The brain, like a muscle, needs exercise. Reading, games, conversation, and new skills protect memory and sharpness with age.",
      },
      {
        id: "ik-38",
        title: "Eat Slowly and Mindfully",
        content:
          "Slowing down at meals improves digestion and helps you notice fullness before you overeat. How you eat matters as much as what.",
      },
      {
        id: "ik-39",
        title: "Optimism Is a Skill",
        content:
          "A hopeful outlook can be practised. Focus on possibilities and small wins, and resilience grows over time.",
      },
      {
        id: "ik-40",
        title: "Simplicity Brings Peace",
        content:
          "A simpler life — fewer possessions, fewer commitments — leaves more room for what truly matters and lowers everyday stress.",
      },
      {
        id: "ik-41",
        title: "The Discipline of Devotion",
        content:
          "True experts commit to their craft daily, not just when inspired. Showing up consistently is what turns interest into ikigai.",
      },
      {
        id: "ik-42",
        title: "Friends Are Longevity Medicine",
        content:
          "Deep friendships lower stress and give life meaning. Investing in relationships may add more years than any supplement.",
      },
      {
        id: "ik-43",
        title: "Have Something to Look Forward To",
        content:
          "A future plan — a trip, a project, a gathering — pulls you forward and keeps each day energised with anticipation.",
      },
      {
        id: "ik-44",
        title: "Purpose Over Pleasure Alone",
        content:
          "Chasing only pleasure fades fast. A life of purpose delivers a steadier, deeper satisfaction that pleasure alone can't match.",
      },
      {
        id: "ik-45",
        title: "Learn From Elders",
        content:
          "The centenarians of Okinawa show that presence, community, and simple routines matter more than any single miracle habit.",
      },
      {
        id: "ik-46",
        title: "Turn Work Into Play",
        content:
          "When you love the process, work stops feeling like work. Finding joy in the doing is a hallmark of people with strong ikigai.",
      },
      {
        id: "ik-47",
        title: "Micro-Flow in Daily Chores",
        content:
          "Even routine tasks can become flow if you do them with full attention and care. Everyday life is full of hidden opportunities to focus.",
      },
      {
        id: "ik-48",
        title: "Resilience Through Community",
        content:
          "When hardship strikes, a strong social circle carries you through. No one builds a long, happy life entirely alone.",
      },
      {
        id: "ik-49",
        title: "Let Go of Perfectionism",
        content:
          "Waiting for perfect conditions keeps you stuck. Begin imperfectly, adjust as you go, and let progress replace perfection.",
      },
      {
        id: "ik-50",
        title: "Savour Small Pleasures",
        content:
          "A warm cup of tea, morning sunlight, a good conversation — noticing tiny joys daily is a practical path to lasting contentment.",
      },
      {
        id: "ik-51",
        title: "Stay Physically Independent",
        content:
          "Simple mobility and strength let elders keep doing what they love. Protecting your body's independence protects your joy.",
      },
      {
        id: "ik-52",
        title: "Meaning Makes Adversity Bearable",
        content:
          "When you know your 'why', even painful seasons carry purpose. Meaning transforms suffering into something you can endure and grow from.",
      },
      {
        id: "ik-53",
        title: "Begin Where You Are",
        content:
          "You don't need to move to Japan to live with ikigai. Start today with small changes in movement, diet, focus, and connection.",
      },
      {
        id: "ik-54",
        title: "A Life Worth Living",
        content:
          "Ikigai isn't a destination but a way of living — engaged, connected, present, and purposeful. Tend it daily and it tends to you.",
      },
    ],
  },

  // Atomic Habits — James Clear
  "bk-005": {
    bookId: "bk-005",
    tagline: "Tiny changes, remarkable results — build good habits, break bad ones",
    updated: "2026-07",
    frames: [
      {
        id: "ah-1",
        title: "The 1% Rule",
        content:
          "Habits are the compound interest of self-improvement. Getting just 1% better each day barely shows up daily, but over a year those tiny gains stack into a nearly 37x improvement.",
      },
      {
        id: "ah-2",
        title: "Success Is the Product of Daily Habits",
        content:
          "You do not rise to the level of your goals; you fall to the level of your systems. What you repeat quietly shapes who you become far more than what you occasionally intend.",
      },
      {
        id: "ah-3",
        title: "The Plateau of Latent Potential",
        content:
          "Progress often feels invisible at first, like ice slowly warming until it suddenly melts at zero. Results lag behind effort — the work isn't wasted, it's being stored.",
      },
      {
        id: "ah-4",
        title: "Forget Goals, Build Systems",
        content:
          "Goals set the direction; systems drive the progress. Winners and losers often share the same goals — the difference is the system of daily behaviors they run.",
      },
      {
        id: "ah-5",
        title: "Identity-Based Habits",
        content:
          "Lasting change starts with identity, not outcomes. Instead of 'I want to run a marathon,' become 'I am a runner.' Every action is a vote for the kind of person you wish to be.",
      },
      {
        id: "ah-6",
        title: "Three Layers of Change",
        content:
          "Change happens at three levels: outcomes (what you get), processes (what you do), and identity (what you believe). Most people start with outcomes; the durable path starts with identity.",
      },
      {
        id: "ah-7",
        title: "The Habit Loop",
        content:
          "Every habit runs through four stages: cue, craving, response, and reward. The cue notices a reward, the craving wants it, the response pursues it, and the reward satisfies and teaches you to repeat it.",
      },
      {
        id: "ah-8",
        title: "The Four Laws of Behavior Change",
        content:
          "To build a good habit: make it obvious, make it attractive, make it easy, and make it satisfying. To break a bad one, invert each law.",
      },
      {
        id: "ah-9",
        title: "Law 1 — Make It Obvious",
        content:
          "You can't change a habit you're not aware of. Bring hidden routines into the light so you can decide whether they still serve you.",
      },
      {
        id: "ah-10",
        title: "The Habits Scorecard",
        content:
          "List your daily actions and mark each as positive, negative, or neutral. Awareness alone — noticing without judging — is the first step to changing behavior.",
      },
      {
        id: "ah-11",
        title: "Implementation Intentions",
        content:
          "Be specific: 'I will [behavior] at [time] in [location].' Pinning a habit to a clear time and place makes you far more likely to follow through than vague good intentions.",
      },
      {
        id: "ah-12",
        title: "Habit Stacking",
        content:
          "Anchor a new habit to an existing one: 'After I pour my morning coffee, I will meditate for one minute.' Your current routine becomes the cue for the next.",
      },
      {
        id: "ah-13",
        title: "Design Your Environment",
        content:
          "Environment is the invisible hand that shapes behavior. Make the cues of good habits visible and obvious — a book on the pillow, a water bottle on the desk — and behavior follows.",
      },
      {
        id: "ah-14",
        title: "Law 2 — Make It Attractive",
        content:
          "The more appealing an action, the more likely it becomes a habit. We're driven by the anticipation of reward, so learn to make good habits feel enticing.",
      },
      {
        id: "ah-15",
        title: "Temptation Bundling",
        content:
          "Pair something you need to do with something you want to do — only listen to your favorite podcast while exercising. The craving for one pulls you into the other.",
      },
      {
        id: "ah-16",
        title: "Join the Right Culture",
        content:
          "We copy the habits of the close, the many, and the powerful. Surround yourself with people for whom your desired behavior is the normal behavior.",
      },
      {
        id: "ah-17",
        title: "Reframe Your Mindset",
        content:
          "Swap 'I have to' for 'I get to.' Highlighting the benefit — energy, mastery, freedom — makes hard habits feel like opportunities rather than burdens.",
      },
      {
        id: "ah-18",
        title: "Law 3 — Make It Easy",
        content:
          "Habits form through repetition, not perfection. It's the frequency of practice, not the time spent, that builds the automatic behavior.",
      },
      {
        id: "ah-19",
        title: "Reduce the Friction",
        content:
          "We gravitate to the option requiring least effort. Remove steps between you and good habits, and add steps in front of bad ones.",
      },
      {
        id: "ah-20",
        title: "The Two-Minute Rule",
        content:
          "Scale any new habit down until it takes two minutes: 'read one page,' 'do one push-up.' Master showing up first; you can't improve a habit that doesn't exist.",
      },
      {
        id: "ah-21",
        title: "Master the Art of Showing Up",
        content:
          "A habit must be established before it can be improved. Standardize the behavior first, then optimize it. Consistency beats intensity.",
      },
      {
        id: "ah-22",
        title: "Automate and Commit",
        content:
          "Use commitment devices and one-time actions — auto-transfers to savings, deleting the app — to lock in future behavior when your willpower is weakest.",
      },
      {
        id: "ah-23",
        title: "Law 4 — Make It Satisfying",
        content:
          "What is immediately rewarded is repeated; what is immediately punished is avoided. The catch: good habits often pay off later, bad ones feel good now.",
      },
      {
        id: "ah-24",
        title: "Add an Immediate Reward",
        content:
          "Give delayed-payoff habits a small, instant reward so the ending feels satisfying. The last part of any experience shapes whether you come back.",
      },
      {
        id: "ah-25",
        title: "Habit Tracking",
        content:
          "Keep a simple record — a calendar, a checklist. Tracking is obvious, attractive, and satisfying at once, and 'don't break the chain' becomes its own motivation.",
      },
      {
        id: "ah-26",
        title: "Never Miss Twice",
        content:
          "Missing once is an accident; missing twice is the start of a new habit. When you slip, get back on track immediately — the lost day matters less than the streak of recovery.",
      },
      {
        id: "ah-27",
        title: "Accountability and Contracts",
        content:
          "We care what others think. A habit contract or an accountability partner adds an immediate social cost to slipping, making bad habits unsatisfying.",
      },
      {
        id: "ah-28",
        title: "How to Break a Bad Habit",
        content:
          "Invert the four laws: make it invisible, make it unattractive, make it difficult, and make it unsatisfying. Remove the cue and you remove the habit's fuel.",
      },
      {
        id: "ah-29",
        title: "The Goldilocks Rule",
        content:
          "Motivation peaks when a task is just manageably hard — not too easy, not too hard. Working at the edge of your ability keeps you engaged and improving.",
      },
      {
        id: "ah-30",
        title: "The Downside of Good Habits",
        content:
          "Once a habit is automatic, you stop paying attention and mistakes creep in. Pair habits with deliberate practice, reflection, and review to keep improving.",
      },
      {
        id: "ah-31",
        title: "Reflection and Review",
        content:
          "Periodically ask what's working and what isn't. Regular review keeps your habits aligned with the identity and outcomes you actually want.",
      },
      {
        id: "ah-32",
        title: "Play to Your Strengths",
        content:
          "Genes and temperament don't decide your fate, but they do point to your best game. Choose habits and fields where the odds are in your favor and consistency feels natural.",
      },
      {
        id: "ah-33",
        title: "Motivation Is Overrated",
        content:
          "Willpower is unreliable; environment is dependable. Shape your surroundings so the good choice is the default and you'll rely far less on discipline.",
      },
      {
        id: "ah-34",
        title: "The Valley of Disappointment",
        content:
          "Effort compounds slowly, then suddenly. Most people quit in the valley where results haven't caught up — stay patient and let the breakthrough arrive.",
      },
      {
        id: "ah-35",
        title: "Small Habits, Big Identity",
        content:
          "Each repetition is evidence of a new identity. The goal isn't to read a book but to become a reader; not to run but to become a runner.",
      },
      {
        id: "ah-36",
        title: "Make Good Cues Visible",
        content:
          "If you want a habit to be a big part of your life, make its cue a big part of your environment. Design your space so the right behavior is the obvious one.",
      },
      {
        id: "ah-37",
        title: "Standardize, Then Optimize",
        content:
          "First make the behavior consistent, then work on making it better. You can't refine a routine that isn't happening reliably yet.",
      },
      {
        id: "ah-38",
        title: "Systems Beat Willpower",
        content:
          "Disciplined people aren't superhuman; they structure their lives so they don't need heroic willpower. They remove temptation instead of resisting it.",
      },
      {
        id: "ah-39",
        title: "Habits + Deliberate Practice = Mastery",
        content:
          "Automating the basics frees your attention for the next level. Habits and intentional refinement work together to build real expertise over time.",
      },
      {
        id: "ah-40",
        title: "Small Changes, Remarkable Results",
        content:
          "You don't need to overhaul your life — you need to master tiny behaviors that compound. Atomic habits are small in size but powerful in the long run.",
      },
      {
        id: "ah-41",
        title: "Motion vs. Action",
        content:
          "Planning, researching, and preparing feel productive but are only motion. Action is the behavior that delivers a result. Don't let endless motion become a way of avoiding the work.",
      },
      {
        id: "ah-42",
        title: "Decisive Moments",
        content:
          "Small choices — putting on your shoes, opening the laptop — set the path for the next hour. Win these tiny forks in the road and good behavior tends to follow.",
      },
      {
        id: "ah-43",
        title: "The Cardinal Rule",
        content:
          "Behaviors that are rewarded get repeated; behaviors that are punished get avoided. To keep a habit, make sure its ending feels good.",
      },
      {
        id: "ah-44",
        title: "Pointing and Calling",
        content:
          "Saying an action out loud raises it from unconscious to conscious. Naming what you're about to do — 'I'm about to eat this cookie I don't need' — helps you choose deliberately.",
      },
      {
        id: "ah-45",
        title: "The Diderot Effect",
        content:
          "One purchase or habit often triggers a chain of others. Notice these spirals — they can build good routines or quietly pull you into bad ones.",
      },
      {
        id: "ah-46",
        title: "A Pre-Habit Ritual",
        content:
          "Attach a consistent ritual to a habit you want to build — the same music before deep work. Over time the ritual itself cues you into the right state.",
      },
      {
        id: "ah-47",
        title: "One Space, One Use",
        content:
          "Each context becomes linked to a behavior. When possible, give habits their own space — a desk only for work, a chair only for reading — so the environment does the reminding.",
      },
      {
        id: "ah-48",
        title: "Reset the Room",
        content:
          "Return your space to its ready state after use, so the cue for the next good habit is always primed. A prepared environment makes the right action the easy one.",
      },
      {
        id: "ah-49",
        title: "Never Zero",
        content:
          "On bad days, do a scaled-down version rather than nothing — one push-up, one sentence. Showing up in miniature protects the identity and the streak.",
      },
      {
        id: "ah-50",
        title: "Increase Friction for Bad Habits",
        content:
          "Add steps between you and the behaviors you want less of — unplug the TV, log out of the app. Every bit of friction makes the bad habit a little less likely.",
      },
      {
        id: "ah-51",
        title: "Habits and Identity Feed Each Other",
        content:
          "Habits shape your identity, and your identity shapes your habits. The loop can lift you up or drag you down — aim it toward who you want to become.",
      },
      {
        id: "ah-52",
        title: "Walk Slowly, Never Backward",
        content:
          "Progress can be slow, but it's still progress as long as you don't reverse. Prioritize not breaking the chain over moving fast.",
      },
      {
        id: "ah-53",
        title: "Score the System, Not the Goal",
        content:
          "Instead of asking 'did I hit the goal,' ask 'did I run my system today.' Consistent process is what eventually produces the outcome.",
      },
      {
        id: "ah-54",
        title: "Optimize the Ending",
        content:
          "We remember experiences by their peak and their end. Finish habits on a good note and you'll be more eager to return to them tomorrow.",
      },
      {
        id: "ah-55",
        title: "Small Wins Build Momentum",
        content:
          "Each completed habit is a small win that fuels the next. Momentum, not motivation, is what carries you through the long middle.",
      },
      {
        id: "ah-56",
        title: "Consistency Compounds",
        content:
          "The results you want are a lagging measure of the habits you keep. Stay consistent and the compounding takes care of the rest.",
      },
    ],
  },

  // The Psychology of Money — Morgan Housel
  "bk-006": {
    bookId: "bk-006",
    tagline: "Timeless lessons on wealth, greed, and happiness",
    updated: "2026-07",
    frames: [
      {
        id: "pm-1",
        title: "Behavior Beats Brains",
        content:
          "Doing well with money has little to do with how smart you are and a lot to do with how you behave. Financial success is a soft skill, not a technical one.",
      },
      {
        id: "pm-2",
        title: "No One Is Crazy",
        content:
          "Everyone makes money decisions that look reasonable through the lens of their own life experience. Your view of money was shaped by a world very different from someone else's.",
      },
      {
        id: "pm-3",
        title: "You've Seen a Sliver of the World",
        content:
          "Each of us has lived through a tiny fraction of economic history yet feels we understand how money works. Humility about what you don't know is a financial advantage.",
      },
      {
        id: "pm-4",
        title: "Luck and Risk Are Siblings",
        content:
          "Every outcome is shaped by forces beyond effort. Luck and risk are two sides of the same coin — respect both, and be careful how confidently you judge success or failure.",
      },
      {
        id: "pm-5",
        title: "Be Careful Who You Praise",
        content:
          "Since luck plays such a role, avoid worshipping winners or condemning losers too quickly. Focus on broad patterns of behavior rather than individual extremes.",
      },
      {
        id: "pm-6",
        title: "Never Enough",
        content:
          "The hardest financial skill is getting the goalpost to stop moving. When ambition outpaces contentment, people risk what they have and need for what they don't.",
      },
      {
        id: "pm-7",
        title: "Know Your Enough",
        content:
          "There is no reason to risk what you have and need for what you don't have and don't need. Defining 'enough' protects you from the greed that ruins even the wealthy.",
      },
      {
        id: "pm-8",
        title: "Confounding Compounding",
        content:
          "Warren Buffett built the vast majority of his fortune after age 60. The secret isn't stellar returns — it's good returns sustained for an extraordinarily long time.",
      },
      {
        id: "pm-9",
        title: "Time Is the Engine",
        content:
          "Compounding feels unimpressive in the moment because it doesn't reward intelligence, only patience. Let time, not cleverness, do the heavy lifting.",
      },
      {
        id: "pm-10",
        title: "Getting vs. Staying Wealthy",
        content:
          "Getting money takes optimism and risk-taking. Keeping it takes the opposite: humility, frugality, and a healthy fear of losing what you've built.",
      },
      {
        id: "pm-11",
        title: "Survival Is Everything",
        content:
          "The single most important financial skill is staying in the game long enough for compounding to work. Avoid ruin, and time will reward you.",
      },
      {
        id: "pm-12",
        title: "Optimistic and Paranoid at Once",
        content:
          "Plan on the future being bright, while staying paranoid about the setbacks that could stop you from reaching it. Save like a pessimist, invest like an optimist.",
      },
      {
        id: "pm-13",
        title: "Tails Drive Everything",
        content:
          "A small number of events account for the majority of outcomes. You can be wrong most of the time and still do great if you're right on the few things that matter.",
      },
      {
        id: "pm-14",
        title: "Freedom Is the Real Dividend",
        content:
          "The highest form of wealth is control over your time — the ability to wake up and do what you want, with whom you want, for as long as you want.",
      },
      {
        id: "pm-15",
        title: "The Man in the Car Paradox",
        content:
          "No one is as impressed by your possessions as you are. People see the fancy car and imagine themselves in it — they rarely admire the owner.",
      },
      {
        id: "pm-16",
        title: "Wealth Is What You Don't See",
        content:
          "Wealth is the nice cars not bought and the money not spent. It's the assets you haven't converted into stuff — which is exactly why it stays hidden.",
      },
      {
        id: "pm-17",
        title: "Rich Is Not Wealthy",
        content:
          "Rich is a current income; wealth is savings and options for the future. Spending to look rich is often the fastest way to never become wealthy.",
      },
      {
        id: "pm-18",
        title: "Save Money — Full Stop",
        content:
          "Your savings rate matters more than your income or returns. Wealth is the gap between your ego and your income; save the difference and you don't need a specific reason.",
      },
      {
        id: "pm-19",
        title: "Savings Buy Flexibility",
        content:
          "Money saved gives you control over your time and the ability to wait for better opportunities. Flexibility is a return that never shows up on a spreadsheet.",
      },
      {
        id: "pm-20",
        title: "Reasonable Beats Rational",
        content:
          "Don't aim to be coldly rational; aim to be reasonable. A plan you can stick with emotionally beats an optimal one you'll abandon under pressure.",
      },
      {
        id: "pm-21",
        title: "Surprise — History Isn't a Map",
        content:
          "The most important events are the ones no one saw coming. History is a study of change, so relying on the past to predict the future can mislead you.",
      },
      {
        id: "pm-22",
        title: "Room for Error",
        content:
          "A margin of safety lets you endure the unexpected long enough for the odds to work in your favor. Plan on your plan not going according to plan.",
      },
      {
        id: "pm-23",
        title: "You Will Change",
        content:
          "We underestimate how much our goals and desires will shift over time. Avoid extreme financial choices at any end, and leave room for the person you'll become.",
      },
      {
        id: "pm-24",
        title: "Nothing Is Free",
        content:
          "Market returns have a price: volatility, fear, and uncertainty. Treat that price as a fee for admission, not a fine to be avoided — then you can hold on through the dips.",
      },
      {
        id: "pm-25",
        title: "Find the Price, Pay It",
        content:
          "Every worthwhile outcome has a cost, often paid in patience and discomfort. Identify the true price of your goals and be willing to pay it.",
      },
      {
        id: "pm-26",
        title: "You and Me Play Different Games",
        content:
          "Investors have different goals and time horizons, so a price that's reckless for you may be reasonable for someone else. Don't take cues from players in a different game.",
      },
      {
        id: "pm-27",
        title: "Define Your Own Game",
        content:
          "Know your time horizon and your objectives, and ignore the noise of people chasing something else. Clarity about your game keeps you from being pulled off course.",
      },
      {
        id: "pm-28",
        title: "The Seduction of Pessimism",
        content:
          "Pessimism sounds smart and grabs attention; optimism sounds like a sales pitch. Yet progress compounds quietly while setbacks make headlines — weigh them accordingly.",
      },
      {
        id: "pm-29",
        title: "Optimism Is the Realistic Bet",
        content:
          "Over the long run, the odds favor things getting better. Save for the worst, but invest with faith that human ingenuity keeps moving forward.",
      },
      {
        id: "pm-30",
        title: "When You'll Believe Anything",
        content:
          "Appealing stories can beat cold statistics, especially when we want them to be true. The more you want something to be true, the more careful you should be.",
      },
      {
        id: "pm-31",
        title: "Everyone Has Blind Spots",
        content:
          "We build complete-feeling narratives out of incomplete information to make a confusing world feel sensible. Stay aware of the gaps in your own story.",
      },
      {
        id: "pm-32",
        title: "Wealth Is Options, Not Objects",
        content:
          "The point of money isn't to buy more things; it's to buy freedom, security, and choices. Measure wealth by the options it gives you, not the stuff it buys.",
      },
      {
        id: "pm-33",
        title: "Manage Money to Sleep Well",
        content:
          "The best financial plan is the one that lets you rest at night, not the one that maximizes returns on paper. Peace of mind is a legitimate return.",
      },
      {
        id: "pm-34",
        title: "Independence as the Goal",
        content:
          "For many, using money to gain control over their time is the highest ambition. Aim for independence rather than an ever-larger number.",
      },
      {
        id: "pm-35",
        title: "Avoid Extremes",
        content:
          "Extreme frugality and extreme risk both tend to backfire as life changes. Aim for a sustainable middle you can carry through decades.",
      },
      {
        id: "pm-36",
        title: "Long Tails and Patience",
        content:
          "Most of your lifetime returns will come from a handful of moments and decisions. Stay invested and patient so you're present when they arrive.",
      },
      {
        id: "pm-37",
        title: "Enough Is a Superpower",
        content:
          "Contentment is the rare skill that protects wealth from greed. Knowing when to stop is worth more than knowing how to earn more.",
      },
      {
        id: "pm-38",
        title: "Housel's Own Approach",
        content:
          "The author keeps it simple: a high savings rate, low-cost index funds, and a long time horizon. Boring, consistent behavior beats clever, fragile strategies.",
      },
      {
        id: "pm-39",
        title: "Behavior Over Formulas",
        content:
          "Personal finance is more personal than finance. Spreadsheets tell you what you should do; psychology decides what you actually do.",
      },
      {
        id: "pm-40",
        title: "Do Well by Behaving Well",
        content:
          "Humility, patience, frugality, and room for error compound into wealth and peace. Master your behavior and the math tends to take care of itself.",
      },
      {
        id: "pm-41",
        title: "Doing Nothing Is a Strategy",
        content:
          "In investing, activity often destroys value. The ability to sit still and let compounding work is one of the most underrated financial skills.",
      },
      {
        id: "pm-42",
        title: "Envy Is Expensive",
        content:
          "Comparing yourself to richer people is a battle you can't win — there's always someone ahead. Envy pushes you toward risk and spending you'd otherwise avoid.",
      },
      {
        id: "pm-43",
        title: "Patience Is an Edge",
        content:
          "When everyone else is impatient, patience becomes a genuine advantage. A long time horizon lets you ride out the storms that shake others out.",
      },
      {
        id: "pm-44",
        title: "The Value of Optionality",
        content:
          "Money's quiet power is the options it preserves — the ability to change course, wait, or say no. Flexibility is worth more than it looks on a balance sheet.",
      },
      {
        id: "pm-45",
        title: "Liquidity Is Oxygen",
        content:
          "Cash can feel like dead weight until the moment you need it. Keeping a buffer means you're never a forced seller at the worst possible time.",
      },
      {
        id: "pm-46",
        title: "Avoid Ruin at All Costs",
        content:
          "Nothing else matters if you're knocked out of the game. Protect against the catastrophic loss even if it means giving up some upside.",
      },
      {
        id: "pm-47",
        title: "Beware Forecasts",
        content:
          "Confident predictions about markets and the economy are mostly entertainment. Build a plan that survives being wrong rather than one that needs to be right.",
      },
      {
        id: "pm-48",
        title: "The Biggest Risks Are Unseen",
        content:
          "The events that matter most are the ones nobody is talking about, because if everyone saw them coming they'd already be priced in. Leave room for surprises.",
      },
      {
        id: "pm-49",
        title: "Time Is the Great Multiplier",
        content:
          "Small, steady returns over a very long horizon beat spectacular returns that don't last. Give your money decades, not months.",
      },
      {
        id: "pm-50",
        title: "Money Buys Fewer Worries",
        content:
          "Beyond the basics, extra money mostly buys reduced anxiety, not extra joy. A calmer mind is one of wealth's most valuable dividends.",
      },
      {
        id: "pm-51",
        title: "Ignore the Noise",
        content:
          "The financial world is a constant stream of urgent-sounding updates that rarely matter to a long-term plan. Tuning out the noise is a superpower.",
      },
      {
        id: "pm-52",
        title: "Respect Your Emotions",
        content:
          "You are not a spreadsheet. Build a plan you can stick with when you're scared or greedy, because that's when real decisions get made.",
      },
      {
        id: "pm-53",
        title: "Keeping Up Is Costly",
        content:
          "Matching the lifestyle of higher earners quietly drains your future. The urge to keep up is one of the most expensive habits there is.",
      },
      {
        id: "pm-54",
        title: "Simple Beats Smart",
        content:
          "Complex strategies feel sophisticated but often underperform and are harder to stick with. A simple plan you actually follow wins over a clever one you abandon.",
      },
      {
        id: "pm-55",
        title: "Let Compounding Run Uninterrupted",
        content:
          "The magic of compounding depends on never breaking the chain. Cashing out early or panicking resets the clock on your most powerful advantage.",
      },
      {
        id: "pm-56",
        title: "Define Success on Your Terms",
        content:
          "Financial success isn't a universal number; it's whatever gives you independence and peace. Chase your own definition, not someone else's scoreboard.",
      },
      {
        id: "pm-57",
        title: "Save for Flexibility, Not a Goal",
        content:
          "You don't need a specific reason to save. Savings buy you the freedom to handle surprises and seize opportunities you can't yet imagine.",
      },
      {
        id: "pm-58",
        title: "Behavior Is the Whole Game",
        content:
          "In the end, doing well with money comes down to how you behave under uncertainty. Master patience, humility, and restraint, and you've mastered the game.",
      },
    ],
  },

  // The Art of Clarity — Murthy Thevar
  "bk-002": {
    bookId: "bk-002",
    tagline: "Think clearly, stop overthinking, and decide with confidence",
    updated: "2026-07",
    frames: [
      {
        id: "ac-1",
        title: "Clarity Is a Skill",
        content:
          "Clear thinking isn't a gift some people are born with — it's a skill you can practice. Like a muscle, your mind gets sharper the more deliberately you train it.",
      },
      {
        id: "ac-2",
        title: "Confusion Is the Real Enemy",
        content:
          "Most stuck moments aren't a lack of options but a lack of clarity. When the mind is foggy, every choice feels heavy. Clear the fog and the path reveals itself.",
      },
      {
        id: "ac-3",
        title: "Overthinking in Disguise",
        content:
          "Overthinking feels like progress but is often fear wearing the mask of preparation. Endless analysis rarely produces answers — it only produces exhaustion.",
      },
      {
        id: "ac-4",
        title: "The Cost of a Cluttered Mind",
        content:
          "A mind crowded with unfinished thoughts has no room to think well. Mental clutter drains energy, delays decisions, and steals the calm you need to act.",
      },
      {
        id: "ac-5",
        title: "Name the Thought to Tame It",
        content:
          "Vague worry loops forever; a named worry can be examined. Put the swirling thought into plain words and it loses much of its power over you.",
      },
      {
        id: "ac-6",
        title: "Write to Think",
        content:
          "Thinking in your head is messy; thinking on paper is clear. Writing forces one thought at a time, turning a tangled knot into a straight line.",
      },
      {
        id: "ac-7",
        title: "Find the Real Question",
        content:
          "Half of clarity is asking the right question. Before chasing answers, pause and make sure you're solving the problem that actually matters.",
      },
      {
        id: "ac-8",
        title: "Separate Facts from Stories",
        content:
          "Much of our stress comes from the stories we add to the facts. Notice what actually happened, then question the interpretation you attached to it.",
      },
      {
        id: "ac-9",
        title: "Clarity Comes from Action",
        content:
          "You can't think your way to full certainty. Often the fog only lifts once you take a small step — action gives you the information thinking never could.",
      },
      {
        id: "ac-10",
        title: "One Decision at a Time",
        content:
          "The mind jams when it tries to solve everything at once. Isolate a single decision, give it your full attention, and let the rest wait its turn.",
      },
      {
        id: "ac-11",
        title: "Done Is a Form of Clarity",
        content:
          "Finishing a task frees the mental space it was occupying. Completion, even of small things, quiets the noise and restores focus.",
      },
      {
        id: "ac-12",
        title: "The 10-10-10 Lens",
        content:
          "Ask how a choice will feel in ten minutes, ten months, and ten years. Zooming out shrinks momentary panic and reveals what truly matters.",
      },
      {
        id: "ac-13",
        title: "Reduce Inputs, Reduce Noise",
        content:
          "A mind fed endless notifications, opinions, and feeds cannot hear itself think. Cut the inputs and clarity returns almost on its own.",
      },
      {
        id: "ac-14",
        title: "Say No to Protect Focus",
        content:
          "Every yes is a no to something else. Guarding your attention with a firm no is how you keep space for what deserves your best thinking.",
      },
      {
        id: "ac-15",
        title: "Define What Matters Most",
        content:
          "Clarity begins with knowing your priorities. When you're certain what matters, hundreds of smaller choices answer themselves.",
      },
      {
        id: "ac-16",
        title: "Values as Your Compass",
        content:
          "When decisions feel impossible, return to your core values. They act as a compass that points the way even when the map is unclear.",
      },
      {
        id: "ac-17",
        title: "Simplify Before You Optimize",
        content:
          "Don't polish what shouldn't exist. Remove the unnecessary first; a simpler situation is almost always a clearer one.",
      },
      {
        id: "ac-18",
        title: "Think in First Principles",
        content:
          "Strip a problem down to what you know is true, then rebuild from there. Reasoning from the essentials cuts through inherited assumptions.",
      },
      {
        id: "ac-19",
        title: "Urgent Is Not Important",
        content:
          "Urgency shouts; importance whispers. Clarity is choosing the important over the merely loud, even when the loud feels more pressing.",
      },
      {
        id: "ac-20",
        title: "The Power of One Priority",
        content:
          "Trying to make everything a priority means nothing is. Choose the single most important thing and let it organize your day.",
      },
      {
        id: "ac-21",
        title: "Purpose Beats Motivation",
        content:
          "Motivation fades; a clear purpose endures. When you know why something matters, you no longer need to feel like doing it to do it.",
      },
      {
        id: "ac-22",
        title: "Create Space for the Mind",
        content:
          "Insight rarely comes in a crowded moment. Silence, walks, and unhurried time give thoughts the room they need to settle and connect.",
      },
      {
        id: "ac-23",
        title: "Awareness Precedes Change",
        content:
          "You cannot fix what you cannot see. Simply noticing your patterns — without judgment — is the first and most important step toward clarity.",
      },
      {
        id: "ac-24",
        title: "Watch Your Self-Talk",
        content:
          "The voice in your head sets the weather of your mind. Speak to yourself with honesty and kindness, and your thinking clears.",
      },
      {
        id: "ac-25",
        title: "Perfectionism Is Fear",
        content:
          "Waiting for the perfect answer is often fear in disguise. Perfection delays; clarity accepts that a good decision now beats a flawless one never.",
      },
      {
        id: "ac-26",
        title: "Progress Over Perfection",
        content:
          "Movement creates clarity that standing still never will. Aim for the next honest step, not the final flawless outcome.",
      },
      {
        id: "ac-27",
        title: "Most Decisions Are Reversible",
        content:
          "We treat choices as permanent when most can be adjusted. Knowing you can course-correct makes deciding lighter and faster.",
      },
      {
        id: "ac-28",
        title: "Too Many Options Cloud the Mind",
        content:
          "Abundance of choice breeds paralysis. Narrow the field deliberately; fewer, better options make for clearer decisions.",
      },
      {
        id: "ac-29",
        title: "Constraints Create Clarity",
        content:
          "Limits focus the mind. A deadline, a budget, or a single rule can turn an overwhelming problem into a solvable one.",
      },
      {
        id: "ac-30",
        title: "Decide, Then Adjust",
        content:
          "Make the best call with what you know, then let reality teach you. Trusting a decision and refining it beats endlessly hedging.",
      },
      {
        id: "ac-31",
        title: "Clarity Is Subtraction",
        content:
          "You rarely need to add more to think clearly — you need to remove. Take away the noise, the extra options, the unnecessary, and clarity remains.",
      },
      {
        id: "ac-32",
        title: "Focus Is Choosing What to Ignore",
        content:
          "Attention is finite. Deciding what to leave out is just as important as deciding what to pursue, and often harder.",
      },
      {
        id: "ac-33",
        title: "Protect Your Clearest Hours",
        content:
          "For most people the mind is sharpest early, before the day fills with noise. Spend your best hours on your most important thinking.",
      },
      {
        id: "ac-34",
        title: "Clarity Is Physical Too",
        content:
          "Sleep, movement, and breath shape the mind more than we admit. A rested, well-oxygenated brain simply thinks more clearly.",
      },
      {
        id: "ac-35",
        title: "Talk It Out",
        content:
          "Explaining a problem aloud, even to yourself, exposes the gaps in your thinking. Speaking often reveals the answer that silence hid.",
      },
      {
        id: "ac-36",
        title: "Beware Borrowed Opinions",
        content:
          "It's easy to adopt views you never examined. Clarity means thinking your own thoughts rather than repeating the crowd's.",
      },
      {
        id: "ac-37",
        title: "Honesty Sharpens Thinking",
        content:
          "Clarity and self-deception cannot share the same mind. The more honest you are about what you feel and want, the clearer your decisions become.",
      },
      {
        id: "ac-38",
        title: "Calm Confidence",
        content:
          "A clear mind doesn't rush or panic. When you've thought something through honestly, you can act with a steady, quiet confidence.",
      },
      {
        id: "ac-39",
        title: "Trust the Process of Clarity",
        content:
          "Clarity is rarely instant; it emerges as you write, question, and act. Trust the practice and the fog will lift in its own time.",
      },
      {
        id: "ac-40",
        title: "A Daily Practice",
        content:
          "The art of clarity isn't a one-time fix but a daily habit of clearing noise, choosing what matters, and acting with intention. Practice it and life feels lighter.",
      },
      {
        id: "ac-41",
        title: "Sleep on It",
        content:
          "Big decisions rarely need to be made this instant. A night's sleep lets the mind sort the noise from the signal, and the morning often brings the answer.",
      },
      {
        id: "ac-42",
        title: "Beware Decision Fatigue",
        content:
          "Every choice drains a little mental energy. Make your most important decisions when your mind is fresh, and don't trust clarity at the end of a draining day.",
      },
      {
        id: "ac-43",
        title: "Batch the Small Decisions",
        content:
          "Deciding the same small things over and over wastes clarity. Set defaults and routines for the trivial so your attention is free for what matters.",
      },
      {
        id: "ac-44",
        title: "Put Goals in Writing",
        content:
          "A goal kept in your head stays vague. Written down, it becomes concrete, testable, and far easier to act on with clarity.",
      },
      {
        id: "ac-45",
        title: "Question Your Assumptions",
        content:
          "Much confusion comes from beliefs we never examined. Ask 'is this actually true?' and watch how many walls turn out to be doors.",
      },
      {
        id: "ac-46",
        title: "Signal vs. Noise",
        content:
          "Most information is noise dressed as importance. Clarity is the discipline of finding the few signals that actually change your decision.",
      },
      {
        id: "ac-47",
        title: "The Myth of Multitasking",
        content:
          "Splitting attention fractures thought. Doing one thing at a time isn't slower — it's how the mind produces its clearest work.",
      },
      {
        id: "ac-48",
        title: "A Clear Space, a Clear Mind",
        content:
          "Outer clutter mirrors inner clutter. Tidying your physical surroundings is a surprisingly direct way to tidy your thinking.",
      },
      {
        id: "ac-49",
        title: "Let Go of Sunk Costs",
        content:
          "What you've already spent — time, money, effort — is gone whatever you choose next. Decide from where you are now, not from what you can't get back.",
      },
      {
        id: "ac-50",
        title: "Seek the Opposite View",
        content:
          "Clarity grows when you deliberately look for the case against your idea. If it survives honest opposition, you can trust it far more.",
      },
      {
        id: "ac-51",
        title: "Pause Before You React",
        content:
          "A single breath between trigger and response is where clarity lives. The pause turns a reaction into a choice.",
      },
      {
        id: "ac-52",
        title: "Clarity Is Quiet Confidence",
        content:
          "When your thinking is clear, you no longer need to argue with yourself. You act calmly, adjust freely, and carry a quiet confidence that overthinking never gave you.",
      },
    ],
  },

  // The Art of Spending Money — Morgan Housel
  "bk-001": {
    bookId: "bk-001",
    tagline: "Simple choices for a richer life — spend money to buy a better life",
    updated: "2026-07",
    frames: [
      {
        id: "as-1",
        title: "Spending Is a Skill",
        content:
          "We obsess over earning and investing but rarely learn how to spend well. Using money wisely is its own skill, and mastering it matters as much as growing your wealth.",
      },
      {
        id: "as-2",
        title: "Money Is a Tool for Freedom",
        content:
          "The real purpose of money isn't luxury or status — it's control over your life. At its best, money buys time, options, and the ability to live on your own terms.",
      },
      {
        id: "as-3",
        title: "Aim for a Richer Life, Not a Bigger Pile",
        content:
          "Accumulating more isn't the goal; living better is. The point of money is what it lets you feel and do, not the size of the number in your account.",
      },
      {
        id: "as-4",
        title: "Independence Is the Best Purchase",
        content:
          "The highest return money offers is independence — the freedom to say no, to walk away, and to spend your days as you choose. Buy that before you buy things.",
      },
      {
        id: "as-5",
        title: "The Comparison Trap",
        content:
          "Comparison is one of the fastest ways to waste money and peace of mind. Spending to keep up with others quietly drains both your wallet and your happiness.",
      },
      {
        id: "as-6",
        title: "Status Is a Race With No Finish",
        content:
          "Chasing status through spending never ends, because there's always someone with more. The ladder has no top rung, so climbing it is a losing game.",
      },
      {
        id: "as-7",
        title: "Expectations Shape How Rich You Feel",
        content:
          "Wealth is relative to expectations. If your wants outrun what you have, you'll feel poor at any income; manage expectations and modest means can feel abundant.",
      },
      {
        id: "as-8",
        title: "Manage Wants, Not Just Earnings",
        content:
          "You can grow richer by wanting less just as surely as by earning more. Keeping expectations in check is an underrated path to feeling wealthy.",
      },
      {
        id: "as-9",
        title: "Hedonic Adaptation",
        content:
          "The thrill of a new purchase fades fast — you adapt to the new car or couch within weeks. Much spending buys a happiness bump that quietly evaporates.",
      },
      {
        id: "as-10",
        title: "Experiences Over Possessions",
        content:
          "Experiences tend to pay better than things because we adapt to objects but keep savoring memories. A trip or a shared meal can bring joy for years.",
      },
      {
        id: "as-11",
        title: "Memories Keep Paying",
        content:
          "A good experience is enjoyed twice — once when it happens and again every time you remember it. Memories compound in a way possessions never do.",
      },
      {
        id: "as-12",
        title: "Buy Back Your Time",
        content:
          "Spending to save time or remove hassle is often money well spent. Outsourcing the chores you hate can buy hours for the life you actually want.",
      },
      {
        id: "as-13",
        title: "Spend to Remove Stress",
        content:
          "Money used to reduce friction — a shorter commute, fewer worries, more breathing room — often buys more happiness than money used to acquire more stuff.",
      },
      {
        id: "as-14",
        title: "Minimize Future Regret",
        content:
          "A useful test: what will you wish you'd done when you look back in decades? Usually it's the memories you didn't make, not the money you didn't save.",
      },
      {
        id: "as-15",
        title: "The Long View",
        content:
          "Picture your older self reflecting on how you lived. Spending in a way that your future self will thank you for is a quiet form of wisdom.",
      },
      {
        id: "as-16",
        title: "Know What You Don't Need",
        content:
          "Real financial sophistication isn't maximizing what you buy — it's minimizing what you need to buy to be happy. Contentment is cheaper than consumption.",
      },
      {
        id: "as-17",
        title: "Needing Less Is Freedom",
        content:
          "The fewer things you require to feel good, the freer you become. Low needs are a superpower that no salary can replace.",
      },
      {
        id: "as-18",
        title: "Align Spending With Values",
        content:
          "Spend lavishly on what you truly care about and cut hard on what you don't. Money spent in line with your values feels good; money spent against them feels hollow.",
      },
      {
        id: "as-19",
        title: "Spend on What You Love",
        content:
          "If you value peace, buy simplicity; if you value people, buy shared time. There's no universal right way to spend — only what genuinely fits your life.",
      },
      {
        id: "as-20",
        title: "Personal Finance Is Personal",
        content:
          "There are no one-size-fits-all rules for spending. The best choices depend on your temperament, history, and what actually makes your life richer.",
      },
      {
        id: "as-21",
        title: "The Role of Luck",
        content:
          "Where you were born, who you met, and the era you grew up in shaped your finances more than we admit. Recognizing luck keeps you humble and grateful.",
      },
      {
        id: "as-22",
        title: "Gratitude and Generosity",
        content:
          "Acknowledging luck naturally leads to generosity. When you see how much you were given, sharing it becomes a source of meaning rather than a sacrifice.",
      },
      {
        id: "as-23",
        title: "The Joy of Giving",
        content:
          "Spending on others often brings more lasting happiness than spending on yourself. Generosity is one of the highest-return uses of money.",
      },
      {
        id: "as-24",
        title: "Invest in Relationships",
        content:
          "The richest lives are full of strong relationships, not expensive things. Money spent creating time and experiences with people you love rarely disappoints.",
      },
      {
        id: "as-25",
        title: "Beware Lifestyle Creep",
        content:
          "As income rises, spending quietly rises to match, leaving you no freer than before. Guarding against creep is how raises actually improve your life.",
      },
      {
        id: "as-26",
        title: "The Hidden Cost of Nice Things",
        content:
          "Expensive possessions carry ongoing costs — upkeep, insurance, worry, and the fear of losing them. The price tag is only the beginning.",
      },
      {
        id: "as-27",
        title: "More Stuff, More to Manage",
        content:
          "Everything you own also owns a piece of your attention. Beyond a point, more possessions add maintenance and clutter rather than joy.",
      },
      {
        id: "as-28",
        title: "Wealth Is Quiet, Status Is Loud",
        content:
          "Flashy spending signals income, not wealth. Real wealth is often invisible — the freedom and security built by the money you chose not to show off.",
      },
      {
        id: "as-29",
        title: "Guilt-Free Spending",
        content:
          "Once your priorities are clear, you can spend on what you love without guilt. Clarity about your values turns spending from anxiety into enjoyment.",
      },
      {
        id: "as-30",
        title: "Frugality Without Joylessness",
        content:
          "Saving is powerful, but extreme thrift can rob life of meaning. The art is spending generously on what matters while trimming what doesn't.",
      },
      {
        id: "as-31",
        title: "The Danger of Over-Saving",
        content:
          "Hoarding every rupee for a someday that never comes has its own cost. Money unspent on a life well lived is its own kind of loss.",
      },
      {
        id: "as-32",
        title: "Define Your Enough",
        content:
          "Knowing what 'enough' looks like for you frees you from the endless chase. Without it, no income ever feels sufficient.",
      },
      {
        id: "as-33",
        title: "Spend on Health and Peace",
        content:
          "Money that protects your health, sleep, and mental calm is rarely wasted. These are the foundations that let you enjoy everything else.",
      },
      {
        id: "as-34",
        title: "Misused Money Can Buy Misery",
        content:
          "Money can't buy happiness, but poor money choices — debt, overreach, keeping up with others — can absolutely buy stress and regret.",
      },
      {
        id: "as-35",
        title: "Your Money Story Is Yours",
        content:
          "Your habits and feelings about money were shaped by your unique past. Understanding that story is the first step to spending in a way that fits you.",
      },
      {
        id: "as-36",
        title: "Reshape Your Relationship With Money",
        content:
          "The goal isn't a budget hack but a healthier relationship with money — one where it serves your life instead of running it.",
      },
      {
        id: "as-37",
        title: "Small Choices Compound",
        content:
          "A richer life is built from many small, values-aligned spending choices, not one big decision. The everyday choices quietly shape the whole.",
      },
      {
        id: "as-38",
        title: "Freedom Feels Better Than Flash",
        content:
          "Ask anyone who has both: the calm of financial freedom outlasts the buzz of a luxury purchase. Buy freedom first and flash rarely tempts you.",
      },
      {
        id: "as-39",
        title: "Spend on Becoming, Not Just Having",
        content:
          "Money spent on learning, skills, and growth changes who you are, not just what you own. That kind of spending keeps paying off for life.",
      },
      {
        id: "as-40",
        title: "A Richer Life by Design",
        content:
          "Spending well isn't about earning more or denying yourself — it's about choosing deliberately. Simple, values-driven choices are what make a life truly rich.",
      },
      {
        id: "as-41",
        title: "Does It Add to Your Life?",
        content:
          "Before any purchase, ask whether it genuinely adds to the life you want. If the honest answer is no, the price is always too high.",
      },
      {
        id: "as-42",
        title: "Think in Cost Per Use",
        content:
          "A cheap thing used once can be costlier than an expensive thing used daily. Judge purchases by cost per use, not just the sticker price.",
      },
      {
        id: "as-43",
        title: "The 24-Hour Rule",
        content:
          "For non-essential buys, wait a day. Much of what feels urgent in the moment loses its pull overnight, saving you money and clutter.",
      },
      {
        id: "as-44",
        title: "Automate Essentials, Weigh the Extras",
        content:
          "Put the boring necessities on autopilot so your attention is reserved for the discretionary spending that actually shapes your happiness.",
      },
      {
        id: "as-45",
        title: "Spend on the Peaks",
        content:
          "We remember the highlights and the endings of experiences. Spend a little more to make the peak moments special rather than spreading money thin.",
      },
      {
        id: "as-46",
        title: "Watch the Subscriptions",
        content:
          "Small recurring charges quietly add up to a large, forgotten drain. Review your subscriptions regularly and cancel what you no longer truly use.",
      },
      {
        id: "as-47",
        title: "Buy Quality Where It Lasts",
        content:
          "For the things you use daily and rely on, quality pays off in durability and joy. Spend well on the few, and lightly on the many.",
      },
      {
        id: "as-48",
        title: "The Freedom of Being Debt-Free",
        content:
          "Debt is a claim on your future income and your peace of mind. Paying it off buys a kind of freedom that few purchases can match.",
      },
      {
        id: "as-49",
        title: "Time Affluence",
        content:
          "Feeling rich in time often matters more than feeling rich in money. Spend to protect unhurried, unscheduled hours — they're the real luxury.",
      },
      {
        id: "as-50",
        title: "Give the Gift of Time",
        content:
          "The most meaningful thing money can buy for others is often your presence and shared experiences, not more objects.",
      },
      {
        id: "as-51",
        title: "The Cost of Clutter",
        content:
          "Everything you buy also demands space, upkeep, and attention. Fewer, better things leave you lighter and clearer.",
      },
      {
        id: "as-52",
        title: "Match Big Buys to Who You Are",
        content:
          "Large purchases should reflect your real identity and values, not the person you think others expect you to be. Otherwise the thrill fades into regret.",
      },
      {
        id: "as-53",
        title: "Money Is Stored Choices",
        content:
          "Every rupee saved is a future choice preserved. Spending is simply converting stored options into experiences — do it on purpose.",
      },
      {
        id: "as-54",
        title: "Spend Slow, Enjoy Long",
        content:
          "Rushed spending brings buyer's remorse; deliberate spending brings lasting satisfaction. Slowing down is how you get more happiness per rupee.",
      },
      {
        id: "as-55",
        title: "Intentional to the End",
        content:
          "A richer life isn't the accident of a big income — it's the result of intentional choices repeated over years. Spend on purpose and the life follows.",
      },
    ],
  },

  // The Subtle Art of Not Giving a F*ck — Mark Manson
  "bk-010": {
    bookId: "bk-010",
    tagline: "A counterintuitive approach to living a good life",
    updated: "2026-07",
    frames: [
      {
        id: "sa-1",
        title: "Care About Less, Not Nothing",
        content:
          "The book isn't about being indifferent — it's about caring only about what truly matters. Your energy is finite, so reserve it for a few important things.",
      },
      {
        id: "sa-2",
        title: "Choose What Matters",
        content:
          "You will care about something; the only question is what. Maturity is learning to give your attention to what's meaningful and shrug off the rest.",
      },
      {
        id: "sa-3",
        title: "The Feedback Loop From Hell",
        content:
          "Feeling anxious about being anxious, or guilty about feeling guilty, spirals endlessly. Accepting your experience instead of fighting it breaks the loop.",
      },
      {
        id: "sa-4",
        title: "The Backwards Law",
        content:
          "The more you chase feeling good, the more you notice you lack it. Accepting negative experiences paradoxically produces more positive ones.",
      },
      {
        id: "sa-5",
        title: "Wanting the Struggle",
        content:
          "Everyone wants the reward, but happiness comes from wanting the struggle behind it. Ask not what you want to enjoy, but what pain you're willing to endure.",
      },
      {
        id: "sa-6",
        title: "You Are Not Special",
        content:
          "The belief that you're extraordinary and entitled to great things breeds disappointment. Accepting your ordinariness is freeing, not depressing.",
      },
      {
        id: "sa-7",
        title: "The Entitlement Trap",
        content:
          "Entitlement comes in two forms — 'I'm amazing' and 'I'm worthless' — but both center life on yourself. Real growth means getting over how special you feel.",
      },
      {
        id: "sa-8",
        title: "Problems Never End",
        content:
          "Life is an endless series of problems; solving one simply reveals the next. The goal isn't a problem-free life but better problems to solve.",
      },
      {
        id: "sa-9",
        title: "Happiness Is Solving Problems",
        content:
          "Happiness comes from working on problems you find meaningful, not from avoiding them. It's an activity, not a destination you arrive at.",
      },
      {
        id: "sa-10",
        title: "Choose Better Problems",
        content:
          "Since problems are unavoidable, upgrade the ones you have. Trade the problem of boredom for the problem of a demanding goal you care about.",
      },
      {
        id: "sa-11",
        title: "Choose Your Struggle",
        content:
          "What you're willing to suffer for shapes your life more than what you enjoy. Pick struggles worthy of you, because the struggle is where life is lived.",
      },
      {
        id: "sa-12",
        title: "You're Always Choosing Values",
        content:
          "Your problems and emotions flow from what you've chosen to value. Change what you care about and the whole experience of life shifts.",
      },
      {
        id: "sa-13",
        title: "Good Values vs. Bad Values",
        content:
          "Good values are reality-based, constructive, and within your control — honesty, curiosity, humility. Bad ones — status, being right, feeling good always — depend on things you can't control.",
      },
      {
        id: "sa-14",
        title: "Measure by the Right Metrics",
        content:
          "The yardstick you choose determines how you feel. Pick metrics you can influence — effort, integrity, learning — rather than applause or comparison.",
      },
      {
        id: "sa-15",
        title: "Responsibility vs. Fault",
        content:
          "You may not be at fault for everything that happens to you, but you are responsible for how you respond. Fault is past tense; responsibility is present.",
      },
      {
        id: "sa-16",
        title: "Take Radical Responsibility",
        content:
          "Blaming circumstances hands away your power. Owning your response to every situation — even unfair ones — is where real freedom begins.",
      },
      {
        id: "sa-17",
        title: "Response-Ability",
        content:
          "Between what happens and what you do lies a choice. Strengthening that gap — your ability to respond — is the core skill of a good life.",
      },
      {
        id: "sa-18",
        title: "Certainty Is the Enemy",
        content:
          "The more certain you are, the less you question and the less you grow. Comfort with doubt keeps you learning and open to being wrong.",
      },
      {
        id: "sa-19",
        title: "You're Probably Wrong",
        content:
          "We're all wrong about plenty; today's beliefs are just less wrong than yesterday's. Holding views loosely lets you keep improving them.",
      },
      {
        id: "sa-20",
        title: "Manson's Law of Avoidance",
        content:
          "The more something threatens your identity, the harder you avoid it. Defining yourself narrowly makes life's challenges feel like existential threats.",
      },
      {
        id: "sa-21",
        title: "Loosen Your Identity",
        content:
          "Define yourself in simple, flexible terms and change becomes easier. A smaller, humbler self-image can absorb failure and growth without crumbling.",
      },
      {
        id: "sa-22",
        title: "Question Your Own Story",
        content:
          "The narratives you tell about who you are can trap you. Be willing to rewrite them; you are not fixed, and neither is your story.",
      },
      {
        id: "sa-23",
        title: "The Do Something Principle",
        content:
          "Don't wait for motivation to act — act, and motivation follows. Action, inspiration, and motivation feed each other, but action can start the loop.",
      },
      {
        id: "sa-24",
        title: "Just Do Something",
        content:
          "When stuck, take any small step. Doing something turns a vague, paralyzing problem into concrete feedback you can work with.",
      },
      {
        id: "sa-25",
        title: "Fail Forward",
        content:
          "Failure is the path to growth, not the opposite of success. Avoiding failure means avoiding improvement — the two travel together.",
      },
      {
        id: "sa-26",
        title: "The Success/Failure Paradox",
        content:
          "The people who fear failure most tend to achieve least. Willingness to be bad at something is the price of eventually being good.",
      },
      {
        id: "sa-27",
        title: "Pain Is Part of the Process",
        content:
          "Growth requires discomfort by definition. If you're never uncomfortable, you're probably not stretching or improving.",
      },
      {
        id: "sa-28",
        title: "Learn to Say No",
        content:
          "You cannot value everything; caring about the right things means rejecting others. Saying no is how you give your yes any meaning.",
      },
      {
        id: "sa-29",
        title: "Commitment Brings Freedom",
        content:
          "Endless options breed shallow anxiety. Committing deeply to fewer things — a craft, a person, a purpose — creates richer freedom than keeping every door open.",
      },
      {
        id: "sa-30",
        title: "Rejection Is Necessary",
        content:
          "Healthy relationships require the ability to say and hear no. Boundaries and honest rejection are what keep love from curdling into resentment.",
      },
      {
        id: "sa-31",
        title: "Boundaries Matter",
        content:
          "In healthy relationships each person takes responsibility for their own emotions and lets the other do the same. Blurred boundaries breed dependence and blame.",
      },
      {
        id: "sa-32",
        title: "Trust Is Earned and Rebuilt",
        content:
          "Trust is the foundation of any bond, and once broken it can only be rebuilt through consistent, honest action over time — not words alone.",
      },
      {
        id: "sa-33",
        title: "Stop Forcing Positivity",
        content:
          "Relentless positivity denies real problems that need attention. Honest acceptance of the negative is healthier than a forced smile.",
      },
      {
        id: "sa-34",
        title: "Emotions Are Signposts",
        content:
          "Feelings are information, not commands. They point to what may need attention, but they aren't always right and shouldn't run the show.",
      },
      {
        id: "sa-35",
        title: "Don't Believe Every Thought",
        content:
          "Your mind produces a constant stream of judgments, many of them wrong. Observe your thoughts instead of obeying them automatically.",
      },
      {
        id: "sa-36",
        title: "The Value of Suffering",
        content:
          "Pain, handled well, teaches resilience and meaning. The question isn't how to avoid suffering but how to suffer for something worthwhile.",
      },
      {
        id: "sa-37",
        title: "Peel the Self-Awareness Onion",
        content:
          "Beneath your emotions lie the reasons you feel them, and beneath those, your values. Digging down reveals what you actually need to change.",
      },
      {
        id: "sa-38",
        title: "Ask Why You Feel It",
        content:
          "Don't stop at the emotion — ask what it says about your values and expectations. The honest answer often points straight at the real problem.",
      },
      {
        id: "sa-39",
        title: "Autonomy Over Approval",
        content:
          "Chasing everyone's approval is a bottomless pit. Living by your own considered values beats performing for an audience that will never be fully satisfied.",
      },
      {
        id: "sa-40",
        title: "Comparison in the Digital Age",
        content:
          "Constant exposure to others' highlight reels inflates expectations and drains contentment. Caring less about the scoreboard restores your peace.",
      },
      {
        id: "sa-41",
        title: "Enough Is a Decision",
        content:
          "There will always be more to want. Deciding what counts as enough is an act of will that frees you from the endless chase.",
      },
      {
        id: "sa-42",
        title: "Own Your Story",
        content:
          "You can't always choose your circumstances, but you choose the meaning you give them. Taking authorship of your story is a quiet form of power.",
      },
      {
        id: "sa-43",
        title: "Growth Through Discomfort",
        content:
          "Every meaningful change asks you to sit with discomfort. Learning to stay present through it is how you expand what you're capable of.",
      },
      {
        id: "sa-44",
        title: "Pick Struggles Worth Having",
        content:
          "Choose problems aligned with your values, and even the hard days feel meaningful. Struggle in service of what you care about doesn't feel like mere suffering.",
      },
      {
        id: "sa-45",
        title: "Commitment Deepens Life",
        content:
          "Depth beats breadth. A committed relationship, mastered skill, or focused purpose delivers more than an endless buffet of shallow experiences.",
      },
      {
        id: "sa-46",
        title: "Let Go of the Need to Be Right",
        content:
          "Clinging to being right blocks learning and connection. Being willing to be wrong is how you grow and how relationships survive.",
      },
      {
        id: "sa-47",
        title: "Death Gives Life Meaning",
        content:
          "Confronting your mortality clarifies what truly matters. The awareness that time is limited is the ultimate cure for caring about trivial things.",
      },
      {
        id: "sa-48",
        title: "…And Then You Die",
        content:
          "Everything ends, which is exactly why your choices matter now. Let the shortness of life push you toward what's meaningful, not what's merely comfortable.",
      },
      {
        id: "sa-49",
        title: "Leave Something Bigger Than You",
        content:
          "Meaning grows when you invest in something beyond yourself — people, work, a cause. A life pointed outward outlasts one spent chasing personal comfort.",
      },
      {
        id: "sa-50",
        title: "Care About What's Real",
        content:
          "Give your limited attention to what's real, immediate, and within your control. Everything else deserves the shrug the title recommends.",
      },
      {
        id: "sa-51",
        title: "Freedom in Caring Less",
        content:
          "When you stop trying to care about everything, you finally have room to care deeply about the few things that make life good. That's the subtle art.",
      },
    ],
  },

  // Think and Grow Rich — Napoleon Hill
  "bk-525": {
    bookId: "bk-525",
    tagline: "The classic laws of wealth, desire, faith and persistence",
    updated: "2026-07",
    frames: [
      {
        id: "tg-1",
        title: "Thoughts Are Things",
        content:
          "Hill's central claim: our thoughts, charged with purpose and desire, are the starting point of all riches. What you think about persistently, you move toward.",
      },
      {
        id: "tg-2",
        title: "The Secret: Burning Desire",
        content:
          "Wishing won't bring wealth. A white-hot, obsessive desire — a definite aim you're determined to reach — is the seed of every fortune.",
      },
      {
        id: "tg-3",
        title: "Definiteness of Purpose",
        content:
          "Drifting leads nowhere. Choose one clear, definite major purpose and organize your energy around it relentlessly.",
      },
      {
        id: "tg-4",
        title: "The Six Steps to Riches",
        content:
          "Hill gives a concrete method: fix the exact amount you want, decide what you'll give for it, set a date, make a plan, write it down, and read it aloud daily.",
      },
      {
        id: "tg-5",
        title: "Name Your Number and Date",
        content:
          "Vague goals bring vague results. State precisely how much you intend to acquire and exactly when you intend to have it.",
      },
      {
        id: "tg-6",
        title: "Decide What You'll Give",
        content:
          "There's no such thing as something for nothing. Determine what service or value you'll give in return for the wealth you desire.",
      },
      {
        id: "tg-7",
        title: "Write Your Aim Down",
        content:
          "Putting your goal in writing makes it concrete and commits you to it. A written statement turns a wish into a plan.",
      },
      {
        id: "tg-8",
        title: "Read It Aloud Daily",
        content:
          "Read your goal morning and night, seeing and feeling yourself already in possession of it. Repetition burns it into your mind.",
      },
      {
        id: "tg-9",
        title: "Desire Backed by Faith",
        content:
          "Desire lights the fire; faith keeps it burning. Believing you will succeed, before any evidence appears, is what carries you through.",
      },
      {
        id: "tg-10",
        title: "Conceive, Believe, Achieve",
        content:
          "Whatever the mind can conceive and truly believe, Hill says, it can achieve. Belief is the catalyst that turns thought into reality.",
      },
      {
        id: "tg-11",
        title: "Faith Is a State of Mind",
        content:
          "Faith isn't luck; it's a mental state you can deliberately develop through affirmation and repeated positive thought.",
      },
      {
        id: "tg-12",
        title: "Cultivate Faith Deliberately",
        content:
          "Feed your mind confidence until doubt has no room. Faith grows by repeatedly instructing the subconscious that success is certain.",
      },
      {
        id: "tg-13",
        title: "Believe It to See It",
        content:
          "Most people demand proof before they believe. The achiever believes first, and the proof follows the conviction.",
      },
      {
        id: "tg-14",
        title: "Autosuggestion",
        content:
          "Autosuggestion is the practice of feeding chosen thoughts to your subconscious. What you repeat to yourself, you eventually become.",
      },
      {
        id: "tg-15",
        title: "Repetition Reaches the Subconscious",
        content:
          "The subconscious acts on the instructions it hears most. Repeat your goal and affirmations until they sink beneath conscious thought.",
      },
      {
        id: "tg-16",
        title: "Emotionalize Your Words",
        content:
          "Affirmations without feeling do little. Charge your statements with emotion — desire, faith, excitement — to make them take hold.",
      },
      {
        id: "tg-17",
        title: "Specialized Knowledge",
        content:
          "General knowledge doesn't create wealth; applied, specialized knowledge does. Know deeply the field in which you intend to succeed.",
      },
      {
        id: "tg-18",
        title: "Knowledge Must Be Applied",
        content:
          "Information is only potential power. It becomes power when organized into definite plans and directed toward a clear end.",
      },
      {
        id: "tg-19",
        title: "Know Where to Find It",
        content:
          "You needn't know everything — you must know where and how to get what you need. Resourcefulness beats raw memorization.",
      },
      {
        id: "tg-20",
        title: "Never Stop Learning",
        content:
          "The successful keep acquiring specialized knowledge long after school. Continuous learning is the fuel of continuous achievement.",
      },
      {
        id: "tg-21",
        title: "Imagination Is the Workshop",
        content:
          "In imagination, plans and desires take shape. Every fortune begins as an idea shaped in the mind's workshop.",
      },
      {
        id: "tg-22",
        title: "Two Kinds of Imagination",
        content:
          "Synthetic imagination rearranges old ideas into new combinations; creative imagination receives fresh insight. Both build wealth when used.",
      },
      {
        id: "tg-23",
        title: "Ideas Begin Riches",
        content:
          "Ideas are the intangible seeds of all riches. A single well-executed idea can be worth a fortune.",
      },
      {
        id: "tg-24",
        title: "Organized Planning",
        content:
          "Desire and faith need a vehicle: a practical plan. Turn your goal into organized, actionable steps you can start now.",
      },
      {
        id: "tg-25",
        title: "Plan the Work, Work the Plan",
        content:
          "A plan bridges the gap between wanting and having. Build one, act on it, and adjust as reality teaches you.",
      },
      {
        id: "tg-26",
        title: "Defeat Is Temporary",
        content:
          "A plan that fails isn't final defeat — it's feedback. Successful people simply build new plans until one works.",
      },
      {
        id: "tg-27",
        title: "Revise Plans, Not Goals",
        content:
          "When a strategy fails, change the strategy, not the destination. Persistence toward the goal with flexible methods wins.",
      },
      {
        id: "tg-28",
        title: "Decision: Beat Procrastination",
        content:
          "Hill found the wealthy decide quickly and change their minds slowly; the poor do the reverse. Decisiveness is a wealth habit.",
      },
      {
        id: "tg-29",
        title: "Decide Promptly",
        content:
          "Indecision is a thief of opportunity. Gather what you need, then commit — hesitation costs more than the occasional wrong call.",
      },
      {
        id: "tg-30",
        title: "Keep Your Own Counsel",
        content:
          "Don't broadcast your plans to everyone; opinions and doubts can drain your resolve. Share goals only with those who help you reach them.",
      },
      {
        id: "tg-31",
        title: "Persistence",
        content:
          "Persistence is to desire what carbon is to steel. The habit of refusing to quit outlasts talent, luck, and circumstance.",
      },
      {
        id: "tg-32",
        title: "Persistence Beats Talent",
        content:
          "The world is full of talented people who gave up. Ordinary persistence, sustained, achieves what brilliant bursts of effort cannot.",
      },
      {
        id: "tg-33",
        title: "The Habit of Not Quitting",
        content:
          "Most people quit at the first sign of defeat, often just short of success. Build persistence into a habit and setbacks lose their sting.",
      },
      {
        id: "tg-34",
        title: "Cure Weakness With Persistence",
        content:
          "A lack of persistence can be overcome deliberately — with a clear goal, a plan, and a refusal to be influenced by discouragement.",
      },
      {
        id: "tg-35",
        title: "Three Feet From Gold",
        content:
          "Hill tells of a miner who quit three feet from a fortune. Never abandon your dig when the treasure may be just ahead.",
      },
      {
        id: "tg-36",
        title: "The Master Mind",
        content:
          "Surround yourself with a group of capable, harmonious minds working toward your goal. Their combined knowledge and energy multiply your own.",
      },
      {
        id: "tg-37",
        title: "Two Minds Create a Third",
        content:
          "When minds coordinate in harmony, a third, invisible force emerges. Collaboration produces insight no single mind could reach alone.",
      },
      {
        id: "tg-38",
        title: "Choose Allies Wisely",
        content:
          "Your mastermind group should share your vision and lift your standards. Guard it against discord, which destroys its power.",
      },
      {
        id: "tg-39",
        title: "Harmony Is Essential",
        content:
          "A mastermind only works in perfect harmony. Friction among members dissolves the very power the group was formed to create.",
      },
      {
        id: "tg-40",
        title: "Transmute Your Drive",
        content:
          "Hill argues our strongest energies can be channeled. Redirect powerful drives and emotions into creative, productive achievement.",
      },
      {
        id: "tg-41",
        title: "Channel Energy Into Achievement",
        content:
          "The same intensity that fuels desire can fuel great work. Discipline turns raw drive into sustained, focused output.",
      },
      {
        id: "tg-42",
        title: "The Subconscious Mind",
        content:
          "Your subconscious works day and night on whatever thoughts dominate it. Direct it deliberately with your goals and faith.",
      },
      {
        id: "tg-43",
        title: "Feed It Positive Emotion",
        content:
          "The subconscious acts most powerfully on emotionalized thought. Flood it with desire, faith, and enthusiasm rather than fear.",
      },
      {
        id: "tg-44",
        title: "Crowd Out the Negative",
        content:
          "You can't hold positive and negative thoughts at once. Keep your mind so full of your goal that doubt finds no room.",
      },
      {
        id: "tg-45",
        title: "The Brain Broadcasts and Receives",
        content:
          "Hill likens the mind to a broadcasting station, sending and receiving thought. A confident, focused mind attracts aligned people and ideas.",
      },
      {
        id: "tg-46",
        title: "Raise Your Mental Signal",
        content:
          "Fear and doubt weaken your broadcast; faith and enthusiasm amplify it. Tune your mind to the frequency of what you want.",
      },
      {
        id: "tg-47",
        title: "The Sixth Sense",
        content:
          "With practice, hunches and flashes of insight guide the prepared mind. Hill calls this the sixth sense — the peak of the principles.",
      },
      {
        id: "tg-48",
        title: "Trust Your Hunches",
        content:
          "Intuition often delivers ideas the conscious mind can't reason its way to. Learn to notice and act on genuine inner guidance.",
      },
      {
        id: "tg-49",
        title: "The Six Ghosts of Fear",
        content:
          "Six basic fears block most people from riches. Naming them is the first step to driving them out of your mind.",
      },
      {
        id: "tg-50",
        title: "The Fear of Poverty",
        content:
          "The most destructive fear paralyzes ambition and invites the very lack it dreads. Decide on prosperity and act as if it's assured.",
      },
      {
        id: "tg-51",
        title: "The Fear of Criticism",
        content:
          "Worrying what others think keeps people small and safe. Free yourself from the crowd's opinion to pursue your own aim.",
      },
      {
        id: "tg-52",
        title: "The Fear of Ill Health",
        content:
          "Dwelling on sickness can invite it. A mind focused on vitality and purpose supports the body as well as the goal.",
      },
      {
        id: "tg-53",
        title: "The Fear of Lost Love",
        content:
          "Jealousy and insecurity poison relationships and scatter focus. Security comes from within, not from clinging.",
      },
      {
        id: "tg-54",
        title: "The Fear of Old Age",
        content:
          "Fearing decline drains today's energy. See experience as an asset and keep growing rather than winding down.",
      },
      {
        id: "tg-55",
        title: "The Fear of Death",
        content:
          "Dread of the end steals life from the present. Accept what you cannot change and pour yourself into meaningful work now.",
      },
      {
        id: "tg-56",
        title: "Indecision, Doubt, and Worry",
        content:
          "These three offspring of fear quietly sabotage success. Decisiveness and faith are their direct antidotes.",
      },
      {
        id: "tg-57",
        title: "Guard Your Mind",
        content:
          "Your mind is the one thing you can fully control. Protect it from negativity, and fill it with your definite purpose.",
      },
      {
        id: "tg-58",
        title: "Go the Extra Mile",
        content:
          "Render more and better service than you're paid for. Those who consistently over-deliver make themselves indispensable and prosperous.",
      },
      {
        id: "tg-59",
        title: "A Positive Mental Attitude",
        content:
          "Your dominant attitude shapes your results. A relentlessly positive, expectant mindset is the soil in which riches grow.",
      },
      {
        id: "tg-60",
        title: "Adversity Carries a Seed",
        content:
          "Every defeat and heartache brings with it the seed of an equal or greater benefit — if you look for it instead of quitting.",
      },
      {
        id: "tg-61",
        title: "Money Consciousness",
        content:
          "Keep your mind so fixed on your goal of wealth that you become 'money conscious.' What you focus on expands.",
      },
      {
        id: "tg-62",
        title: "Wealth Begins in the Mind",
        content:
          "Before it reaches your hands, riches take shape in your thoughts, plans, and beliefs. Master the inner game first.",
      },
      {
        id: "tg-63",
        title: "The Winning Formula",
        content:
          "Definite purpose plus faith plus organized planning plus persistence — repeated relentlessly — is Hill's formula for turning desire into gold.",
      },
      {
        id: "tg-64",
        title: "Think, and Grow Rich",
        content:
          "The title is the lesson: disciplined, purposeful thinking, backed by action and persistence, is the true origin of wealth.",
      },
    ],
  },

  // How to Talk to Anyone — Leil Lowndes
  "bk-513": {
    bookId: "bk-513",
    tagline: "Little tricks for big success in relationships and conversation",
    updated: "2026-07",
    frames: [
      {
        id: "ht-1",
        title: "Talk to Anyone With Ease",
        content:
          "Great communicators aren't born — they use small, learnable techniques. Master a handful and you can connect with anyone, anywhere.",
      },
      {
        id: "ht-2",
        title: "First Impressions Form Fast",
        content:
          "People size you up in seconds, mostly before you speak a word. Your posture, expression, and energy do the talking first.",
      },
      {
        id: "ht-3",
        title: "Your Body Speaks First",
        content:
          "Up to most of your message is nonverbal. Align your body language with warmth and confidence before you open your mouth.",
      },
      {
        id: "ht-4",
        title: "Stand Tall and Open",
        content:
          "An upright, open posture signals confidence and approachability. Uncross your arms, lift your chin, and take up your space.",
      },
      {
        id: "ht-5",
        title: "The Warm, Unhurried Smile",
        content:
          "Don't flash an instant, automatic grin at everyone. A smile that blooms a moment slower feels genuine and personal.",
      },
      {
        id: "ht-6",
        title: "Let Your Smile Land",
        content:
          "Pause, look at the person, then let your smile spread. That brief delay tells them the smile is meant just for them.",
      },
      {
        id: "ht-7",
        title: "Make Eye Contact Count",
        content:
          "Warm, steady eye contact builds trust and intimacy. It tells people you're fully present and genuinely engaged.",
      },
      {
        id: "ht-8",
        title: "Hold the Gaze a Beat Longer",
        content:
          "Keep eye contact a moment past comfortable, even as you turn away. It conveys deep interest without tipping into a stare.",
      },
      {
        id: "ht-9",
        title: "Soft Eyes, Not a Stare",
        content:
          "The goal is warmth, not intensity. Relaxed, friendly eyes invite connection where a hard stare pushes people away.",
      },
      {
        id: "ht-10",
        title: "Turn Fully Toward People",
        content:
          "Pivot your whole body to face the person you're with. That full-attention turn makes them feel like the only one in the room.",
      },
      {
        id: "ht-11",
        title: "Give Undivided Attention",
        content:
          "Put the phone away and focus completely. In a distracted world, full presence is a rare and powerful compliment.",
      },
      {
        id: "ht-12",
        title: "Match Their Mood First",
        content:
          "Before diving in, sense the other person's energy and meet it. Matching their mood makes you feel instantly familiar.",
      },
      {
        id: "ht-13",
        title: "Read the Room",
        content:
          "Tune into the tone of a gathering before you speak. Fitting the energy of the moment keeps you from striking the wrong note.",
      },
      {
        id: "ht-14",
        title: "Skip 'What Do You Do?'",
        content:
          "That tired opener boxes people in and can embarrass them. Ask something fresher about their day, their world, or the event.",
      },
      {
        id: "ht-15",
        title: "Ask About Their World",
        content:
          "Open-ended questions about someone's life and interests invite real conversation. People light up when asked about what they love.",
      },
      {
        id: "ht-16",
        title: "Answer With a Hook",
        content:
          "When asked what you do, add a colorful detail that invites follow-up. Give them a thread to pull instead of a dead end.",
      },
      {
        id: "ht-17",
        title: "Never a One-Word Answer",
        content:
          "Bare replies kill conversation. Offer a little extra information that gives the other person something to respond to.",
      },
      {
        id: "ht-18",
        title: "Offer Conversation Threads",
        content:
          "Sprinkle small hooks into what you say. Each one is a thread the other person can grab to keep things flowing.",
      },
      {
        id: "ht-19",
        title: "Listen for Free Information",
        content:
          "People constantly reveal clues about their lives. Catch these details and use them to steer the conversation somewhere they enjoy.",
      },
      {
        id: "ht-20",
        title: "Follow Up on Details",
        content:
          "Notice the little things people mention and ask more about them. It shows you're truly listening, not just waiting to talk.",
      },
      {
        id: "ht-21",
        title: "Ask Them to Tell You More",
        content:
          "A simple 'tell me more' or 'and then what happened?' keeps someone talking. People love an audience that wants the whole story.",
      },
      {
        id: "ht-22",
        title: "Gently Echo Their Words",
        content:
          "Repeat the last few words someone said as a soft question. It shows you're following and nudges them to continue.",
      },
      {
        id: "ht-23",
        title: "Be a Word Detective",
        content:
          "Listen for pet phrases and topics people return to. Weaving their own favorite words back in makes them feel understood.",
      },
      {
        id: "ht-24",
        title: "Use Their Name Warmly",
        content:
          "Sprinkle a person's name into conversation sparingly and sincerely. Overuse feels salesy, but a well-placed name feels personal.",
      },
      {
        id: "ht-25",
        title: "Make Them the Star",
        content:
          "Shine the spotlight on the other person. The most charming people talk less about themselves and more about you.",
      },
      {
        id: "ht-26",
        title: "Draw Others Out",
        content:
          "Ask the questions that let someone share their proudest moments. People remember how you made them feel about themselves.",
      },
      {
        id: "ht-27",
        title: "Give Sincere Compliments",
        content:
          "Specific, genuine praise delights people. Compliment something real you noticed rather than an empty generic line.",
      },
      {
        id: "ht-28",
        title: "Praise Behind Their Back",
        content:
          "Say kind things about people when they're not around. Praise has a way of traveling back and landing with extra weight.",
      },
      {
        id: "ht-29",
        title: "Pass On Overheard Praise",
        content:
          "When you hear someone complimented, relay it to them. Being the messenger of good news makes you welcome everywhere.",
      },
      {
        id: "ht-30",
        title: "The Well-Timed Compliment",
        content:
          "A small, sincere compliment slipped in at the right moment can make someone's day. Timing turns kindness into impact.",
      },
      {
        id: "ht-31",
        title: "Praise the Deed, Not Flattery",
        content:
          "Admire specific actions and choices rather than gushing vaguely. Grounded praise feels honest; flattery feels hollow.",
      },
      {
        id: "ht-32",
        title: "Say 'You' More Than 'I'",
        content:
          "Frame your words around the other person. Sentences centered on 'you' feel warmer than ones centered on 'I'.",
      },
      {
        id: "ht-33",
        title: "Make It About Them",
        content:
          "Connect your points to the listener's interests and benefits. People pay most attention when they hear how it touches their world.",
      },
      {
        id: "ht-34",
        title: "Mirror Subtly",
        content:
          "Gently matching someone's posture, pace, and tone builds unconscious rapport. Keep it natural — obvious mimicry backfires.",
      },
      {
        id: "ht-35",
        title: "Echo Their Style",
        content:
          "Adapt your energy and vocabulary to the person in front of you. Speaking a little more like them helps them feel at home with you.",
      },
      {
        id: "ht-36",
        title: "Speak Their Language",
        content:
          "Use the words and references familiar to their world. Talking in their terms signals that you belong on their wavelength.",
      },
      {
        id: "ht-37",
        title: "Learn the Insider Lingo",
        content:
          "Pick up the key phrases of a group or industry and you're welcomed as one of them. A little jargon opens a lot of doors.",
      },
      {
        id: "ht-38",
        title: "Do Your Homework",
        content:
          "Before an event or meeting, learn who'll be there and what matters to them. Preparation turns nervous small talk into real connection.",
      },
      {
        id: "ht-39",
        title: "Always Have Something to Say",
        content:
          "Stay lightly informed on news, culture, and trends. A ready supply of topics saves you from awkward silences.",
      },
      {
        id: "ht-40",
        title: "Answer With Energy",
        content:
          "When asked how you are, skip the flat 'fine.' A warm, upbeat reply invites people to lean in rather than move on.",
      },
      {
        id: "ht-41",
        title: "Avoid Tired Clichés",
        content:
          "Overused phrases make you forgettable. A fresh, specific response makes you stand out in a sea of autopilot small talk.",
      },
      {
        id: "ht-42",
        title: "Work a Room With Ease",
        content:
          "Circulate with a warm, relaxed manner rather than clinging to one corner. Confidence in movement makes you approachable.",
      },
      {
        id: "ht-43",
        title: "Join Groups Gracefully",
        content:
          "Approach a cluster of people with a smile, listen briefly, then add value. Ease your way in rather than barging or interrupting.",
      },
      {
        id: "ht-44",
        title: "Be the Host, Not the Guest",
        content:
          "Even as a guest, act like a host: introduce people, refill the conversation, make others comfortable. Hosts are always liked.",
      },
      {
        id: "ht-45",
        title: "Introduce People Well",
        content:
          "When introducing two people, add a hook about each so they have something to talk about. A good intro sparks an instant bond.",
      },
      {
        id: "ht-46",
        title: "Bridge Others Together",
        content:
          "Connecting people who should know each other makes you memorable and valued. Be the hub that brings good people together.",
      },
      {
        id: "ht-47",
        title: "Exit Conversations Gracefully",
        content:
          "Leave with a warm, sincere close rather than an awkward drift. A gracious goodbye leaves a lasting good impression.",
      },
      {
        id: "ht-48",
        title: "The Sincere Goodbye",
        content:
          "End with genuine warmth and, if you can, a reason you enjoyed the chat. People remember beginnings and endings most.",
      },
      {
        id: "ht-49",
        title: "Master the Phone Voice",
        content:
          "On calls your voice carries everything. Warmth, energy, and clarity matter even more when your face can't be seen.",
      },
      {
        id: "ht-50",
        title: "Smile Before You Dial",
        content:
          "A smile changes the tone of your voice. Grin before you speak on the phone and the listener hears the friendliness.",
      },
      {
        id: "ht-51",
        title: "Personalize the Call",
        content:
          "Use the person's name and reference something specific to them. It turns a routine call into a personal connection.",
      },
      {
        id: "ht-52",
        title: "Never a Bare Thank You",
        content:
          "Add why you're grateful — 'thank you for your patience' — so the thanks feels personal and real, not automatic.",
      },
      {
        id: "ht-53",
        title: "Make Gratitude Specific",
        content:
          "Specific thanks lands harder than a generic one. Name what the person did and how it helped you.",
      },
      {
        id: "ht-54",
        title: "Do Small Favors Freely",
        content:
          "Little acts of help build a reservoir of goodwill. Give without keeping score and support tends to flow back to you.",
      },
      {
        id: "ht-55",
        title: "Build a Web of Goodwill",
        content:
          "Every kindness plants a seed in your network. Over time, generosity quietly becomes your most valuable social asset.",
      },
      {
        id: "ht-56",
        title: "Turn Small Talk Into Big Talk",
        content:
          "Small talk is the bridge to deeper connection. Move gently from surface topics toward what people truly care about.",
      },
      {
        id: "ht-57",
        title: "Find the Common Thread",
        content:
          "Hunt for shared interests, experiences, or values. A single point in common can turn a stranger into a friend.",
      },
      {
        id: "ht-58",
        title: "Let Them Feel Understood",
        content:
          "People's deepest wish in conversation is to feel heard. Reflect their feelings back and they'll treasure talking with you.",
      },
      {
        id: "ht-59",
        title: "Beat Nerves With Preparation",
        content:
          "Anxiety fades when you have a few openers and topics ready. Preparation replaces fear with quiet confidence.",
      },
      {
        id: "ht-60",
        title: "Charisma Is Learnable",
        content:
          "Charm isn't a mysterious gift; it's a set of habits anyone can practice. Small techniques, repeated, become natural warmth.",
      },
      {
        id: "ht-61",
        title: "Warmth Beats Wit",
        content:
          "You don't need to be clever or funny to be liked. Making people feel comfortable and valued matters far more than dazzling them.",
      },
      {
        id: "ht-62",
        title: "Make Everyone Feel Special",
        content:
          "The thread through every trick: leave people feeling a little better about themselves. Do that consistently and you can talk to anyone.",
      },
    ],
  },

  // How to Win Friends and Influence People — Dale Carnegie
  "bk-524": {
    bookId: "bk-524",
    tagline: "Timeless principles for winning people to your way of thinking",
    updated: "2026-07",
    frames: [
      {
        id: "wf-1",
        title: "The Timeless Skill of People",
        content:
          "Success depends far more on how you deal with people than on technical skill. Carnegie's principles are about making others feel valued, and they still work a century on.",
      },
      {
        id: "wf-2",
        title: "Don't Criticize or Condemn",
        content:
          "Criticism rarely changes people; it only makes them defensive and resentful. Even when you're right, condemning wounds pride and closes minds.",
      },
      {
        id: "wf-3",
        title: "Criticism Wounds Pride",
        content:
          "People long to feel important, and criticism attacks that directly. Instead of pointing out flaws, seek to understand why they act as they do.",
      },
      {
        id: "wf-4",
        title: "Give Honest Appreciation",
        content:
          "The deepest human craving is to feel appreciated. Sincere, specific praise motivates people far more than fault-finding ever could.",
      },
      {
        id: "wf-5",
        title: "Appreciation, Not Flattery",
        content:
          "Flattery is cheap and insincere; appreciation comes from genuinely noticing the good in someone. People can tell the difference instantly.",
      },
      {
        id: "wf-6",
        title: "Arouse an Eager Want",
        content:
          "To influence anyone, talk about what they want, not what you want. The only way to move people is to make them want to do it themselves.",
      },
      {
        id: "wf-7",
        title: "See Through Their Desire",
        content:
          "Before you ask for anything, ask how it benefits the other person. Frame your request around their goals and it becomes easy to say yes.",
      },
      {
        id: "wf-8",
        title: "Be Genuinely Interested in Others",
        content:
          "You make more friends in two months by being interested in others than in two years trying to get them interested in you.",
      },
      {
        id: "wf-9",
        title: "Interest Opens Doors",
        content:
          "Show real curiosity about people's lives, work, and passions. Genuine interest signals respect and makes others glad to be around you.",
      },
      {
        id: "wf-10",
        title: "Smile",
        content:
          "A warm smile says without words, I'm glad to see you. It costs nothing yet instantly warms the space between two people.",
      },
      {
        id: "wf-11",
        title: "A Smile Is a Message",
        content:
          "Actions speak louder than words, and a smile is one of the friendliest actions there is. Even over the phone, a smile carries in your voice.",
      },
      {
        id: "wf-12",
        title: "Remember and Use Names",
        content:
          "A person's name is, to them, the sweetest sound in any language. Remembering and using it makes people feel uniquely seen.",
      },
      {
        id: "wf-13",
        title: "Names Signal Respect",
        content:
          "Forgetting a name quietly tells someone they didn't matter enough to recall. Make the effort, and you pay a compliment few forget.",
      },
      {
        id: "wf-14",
        title: "Be a Good Listener",
        content:
          "Being a great conversationalist mostly means being a great listener. Give people your full attention and they'll find you fascinating.",
      },
      {
        id: "wf-15",
        title: "Let Them Talk About Themselves",
        content:
          "Encourage others to talk about their own experiences and achievements. People love talking about themselves far more than hearing about you.",
      },
      {
        id: "wf-16",
        title: "Talk About Their Interests",
        content:
          "The royal road to someone's heart is to speak about the things they treasure most. Do your homework and lead with their world.",
      },
      {
        id: "wf-17",
        title: "Make Others Feel Important",
        content:
          "Everyone you meet wants to feel important. Give them that feeling sincerely, and you become someone they genuinely enjoy.",
      },
      {
        id: "wf-18",
        title: "The Craving to Matter",
        content:
          "The desire to feel important is one of the strongest human urges. Satisfy it honestly and you win loyalty and affection.",
      },
      {
        id: "wf-19",
        title: "Sincerity Is Everything",
        content:
          "These aren't manipulation tactics; they only work when they come from real care. People sense the difference between a technique and true regard.",
      },
      {
        id: "wf-20",
        title: "Avoid Arguments",
        content:
          "The only way to get the best of an argument is to avoid it. Even if you win, you lose — because the other person feels defeated and resentful.",
      },
      {
        id: "wf-21",
        title: "You Can't Win an Argument",
        content:
          "Win an argument and you may lose the relationship. Nine times out of ten, both sides end more convinced they were right.",
      },
      {
        id: "wf-22",
        title: "Never Say 'You're Wrong'",
        content:
          "Telling people they're wrong attacks their intelligence and pride. Show respect for their opinions instead of flatly contradicting them.",
      },
      {
        id: "wf-23",
        title: "Respect Their Opinions",
        content:
          "You can disagree without declaring war. Acknowledge their view first, and they'll be far more open to hearing yours.",
      },
      {
        id: "wf-24",
        title: "If Wrong, Admit It Quickly",
        content:
          "When you're wrong, admit it fast and wholeheartedly. Self-criticism disarms others far better than defensiveness ever could.",
      },
      {
        id: "wf-25",
        title: "Disarm With Humility",
        content:
          "Beat others to their own criticism of you and there's nothing left for them to attack. Owning your mistakes builds trust.",
      },
      {
        id: "wf-26",
        title: "Begin in a Friendly Way",
        content:
          "A drop of honey catches more flies than a gallon of gall. Start gently and warmly, and people lower their guard.",
      },
      {
        id: "wf-27",
        title: "Friendliness Opens Minds",
        content:
          "Hostility breeds hostility. Approach even difficult conversations with kindness and you make agreement possible.",
      },
      {
        id: "wf-28",
        title: "Get Them Saying Yes",
        content:
          "Start with questions the other person will answer yes to. A string of small agreements builds momentum toward the big one.",
      },
      {
        id: "wf-29",
        title: "Begin With Common Ground",
        content:
          "Emphasize the things you agree on before the things you don't. Shared ground makes the differences feel smaller.",
      },
      {
        id: "wf-30",
        title: "Let Them Do the Talking",
        content:
          "Resist the urge to dominate. Let the other person talk themselves toward your idea; people trust conclusions they reach on their own.",
      },
      {
        id: "wf-31",
        title: "Let People Persuade Themselves",
        content:
          "We believe our own ideas most. Ask questions that lead people to discover the answer, rather than forcing it on them.",
      },
      {
        id: "wf-32",
        title: "Let the Idea Be Theirs",
        content:
          "People support what they help create. Plant the seed and let them feel the idea is their own, and buy-in follows naturally.",
      },
      {
        id: "wf-33",
        title: "Ownership Wins Buy-In",
        content:
          "Nobody likes being sold to, but everyone loves their own conclusions. Give credit generously and keep your ego out of the way.",
      },
      {
        id: "wf-34",
        title: "See Their Point of View",
        content:
          "Try honestly to see things from the other person's angle. Understanding their reasoning is the first step to changing their mind.",
      },
      {
        id: "wf-35",
        title: "Empathy Changes Everything",
        content:
          "Ask yourself why a reasonable person would feel as they do. Empathy dissolves conflict that argument only hardens.",
      },
      {
        id: "wf-36",
        title: "Be Sympathetic to Their Ideas",
        content:
          "Acknowledge people's feelings and desires as valid. A simple 'I don't blame you for feeling that way' can transform a tense exchange.",
      },
      {
        id: "wf-37",
        title: "Appeal to Nobler Motives",
        content:
          "People like to think of themselves as fair and honorable. Appeal to their better nature and they often rise to meet it.",
      },
      {
        id: "wf-38",
        title: "Assume the Best",
        content:
          "Treat people as if they were already the honest, capable person you hope they'll be. Most will try to live up to it.",
      },
      {
        id: "wf-39",
        title: "Dramatize Your Ideas",
        content:
          "Facts alone rarely move people. Make your point vivid and memorable, and it lands with feeling as well as logic.",
      },
      {
        id: "wf-40",
        title: "Make It Come Alive",
        content:
          "A dull statement is easy to ignore. Show, illustrate, and bring your idea to life so it captures attention.",
      },
      {
        id: "wf-41",
        title: "Throw Down a Challenge",
        content:
          "The desire to excel and prove oneself is a powerful motivator. A fair challenge can spark people to give their very best.",
      },
      {
        id: "wf-42",
        title: "Spark Healthy Competition",
        content:
          "People rise to a stimulating challenge that lets them shine. Used sincerely, it energizes rather than pressures.",
      },
      {
        id: "wf-43",
        title: "Begin With Praise",
        content:
          "When you must correct someone, start with honest praise. Softening the ground first makes criticism far easier to hear.",
      },
      {
        id: "wf-44",
        title: "Praise Before You Correct",
        content:
          "Beginning with appreciation is like the dentist numbing before drilling. It eases the sting of what comes next.",
      },
      {
        id: "wf-45",
        title: "Point Out Mistakes Indirectly",
        content:
          "Call attention to errors gently and indirectly rather than bluntly. People accept correction far better when their dignity stays intact.",
      },
      {
        id: "wf-46",
        title: "Say 'And', Not 'But'",
        content:
          "Praise followed by 'but' feels like the praise was fake. Swap it for 'and' and the encouragement stays believable.",
      },
      {
        id: "wf-47",
        title: "Admit Your Own Mistakes First",
        content:
          "Before criticizing another, mention your own similar faults. It's far easier to accept correction from someone humble.",
      },
      {
        id: "wf-48",
        title: "Humility Invites Change",
        content:
          "Admitting you're not perfect either puts you on the same side. People change more willingly for an ally than a judge.",
      },
      {
        id: "wf-49",
        title: "Ask, Don't Order",
        content:
          "Give suggestions in the form of questions rather than commands. Questions preserve pride and invite cooperation instead of resentment.",
      },
      {
        id: "wf-50",
        title: "Questions Preserve Dignity",
        content:
          "Asking 'what if we tried this?' lets people keep their self-respect. Orders provoke resistance; questions invite ownership.",
      },
      {
        id: "wf-51",
        title: "Let Them Save Face",
        content:
          "Never humiliate someone, even when they're clearly wrong. Letting a person save face costs you nothing and earns their gratitude.",
      },
      {
        id: "wf-52",
        title: "Protect Their Dignity",
        content:
          "A few thoughtful words to spare someone embarrassment can preserve a relationship for life. Kindness in correction is remembered.",
      },
      {
        id: "wf-53",
        title: "Praise Every Improvement",
        content:
          "Be hearty in your approbation and lavish in your praise. Recognizing small progress inspires people to keep going.",
      },
      {
        id: "wf-54",
        title: "Catch Them Doing Right",
        content:
          "Look for what people do well, not just what they do wrong. Specific praise for real effort motivates like nothing else.",
      },
      {
        id: "wf-55",
        title: "Give a Reputation to Live Up To",
        content:
          "Give someone a fine reputation and they'll strain to deserve it. Tell people they're reliable and they tend to become so.",
      },
      {
        id: "wf-56",
        title: "Expectations Lift People",
        content:
          "People rise or fall to the level of belief you place in them. Expect the best and you often draw it out.",
      },
      {
        id: "wf-57",
        title: "Make Faults Seem Easy to Fix",
        content:
          "Encourage by making the flaw look correctable. If a task feels achievable, people gladly take it on.",
      },
      {
        id: "wf-58",
        title: "Encouragement Fuels Effort",
        content:
          "Tell someone they have a knack for something and they'll practice to prove you right. Encouragement is a self-fulfilling gift.",
      },
      {
        id: "wf-59",
        title: "Make Them Happy to Comply",
        content:
          "Frame your request so the other person genuinely wants to do it. Show how cooperation serves their own interests.",
      },
      {
        id: "wf-60",
        title: "Align With Their Benefit",
        content:
          "Influence lasts when both sides win. Connect what you need to what they value, and compliance becomes willing, not forced.",
      },
      {
        id: "wf-61",
        title: "Sincerity Can't Be Faked",
        content:
          "Every principle here collapses without genuine goodwill. Manipulation is eventually seen through; real care is felt and returned.",
      },
      {
        id: "wf-62",
        title: "Principles, Not Tricks",
        content:
          "Treat these as a philosophy of respect, not a bag of tactics. Practiced daily, they reshape how people respond to you.",
      },
      {
        id: "wf-63",
        title: "Give First to Win Friends",
        content:
          "The thread through it all: put others first, appreciate sincerely, and make people feel important. Give that freely, and friendship and influence follow.",
      },
    ],
  },

  // Good Vibes, Good Life — Vex King
  "bk-382": {
    bookId: "bk-382",
    tagline: "How self-love is the key to unlocking your greatness",
    updated: "2026-07",
    frames: [
      {
        id: "gv-1",
        title: "Good Vibes, Good Life",
        content:
          "The energy you carry shapes the life you attract. Cultivate positive vibes within, and a better, brighter life tends to grow around you.",
      },
      {
        id: "gv-2",
        title: "Self-Love Is the Foundation",
        content:
          "You can't pour from an empty cup. Loving and accepting yourself isn't selfish — it's the base from which everything good in your life is built.",
      },
      {
        id: "gv-3",
        title: "You Attract What You Are",
        content:
          "Like attracts like. When you radiate positivity, kindness, and confidence, you naturally draw more of the same back into your life.",
      },
      {
        id: "gv-4",
        title: "Thoughts Shape Reality",
        content:
          "Your inner world creates your outer experience. Change the way you think and you begin to change the life you live.",
      },
      {
        id: "gv-5",
        title: "The Law of Vibration",
        content:
          "Everything, including your mood, carries an energy or vibration. Raising yours through positive habits shifts how you experience the world.",
      },
      {
        id: "gv-6",
        title: "Positive Energy Is Magnetic",
        content:
          "People are drawn to those who lift them up. Good vibes are contagious, opening doors that a heavy, negative energy keeps shut.",
      },
      {
        id: "gv-7",
        title: "Guard Your Energy",
        content:
          "Your energy is precious. Be mindful of what — and who — you let drain it, and protect the peace you work to build.",
      },
      {
        id: "gv-8",
        title: "Gratitude Changes Everything",
        content:
          "Gratitude turns what you have into enough. Focusing on your blessings rewires the mind to notice good and attract more of it.",
      },
      {
        id: "gv-9",
        title: "Count the Small Blessings",
        content:
          "Joy hides in ordinary moments. Appreciating small things daily builds a deep, steady contentment that big events alone can't give.",
      },
      {
        id: "gv-10",
        title: "Let Go of Negativity",
        content:
          "Holding onto grudges, worry, and resentment only poisons you. Releasing negativity clears space for peace and possibility.",
      },
      {
        id: "gv-11",
        title: "Release What You Can't Control",
        content:
          "Much of our stress comes from gripping things beyond our power. Focus your energy on your response, and let the rest go.",
      },
      {
        id: "gv-12",
        title: "Reframe Adversity",
        content:
          "Pain can be a teacher if you let it. Choosing to find the lesson in hard times turns setbacks into stepping stones.",
      },
      {
        id: "gv-13",
        title: "Every Setback Has a Lesson",
        content:
          "What feels like a wall is often a redirection. Ask what a difficult moment is here to teach, and it loses its power to break you.",
      },
      {
        id: "gv-14",
        title: "Stop Comparing",
        content:
          "Someone else's chapter twenty isn't your chapter one. Comparison distorts reality and steals the joy of your own journey.",
      },
      {
        id: "gv-15",
        title: "Comparison Steals Joy",
        content:
          "There will always be someone ahead and someone behind. Measuring your life against others is a race with no finish line and no winner.",
      },
      {
        id: "gv-16",
        title: "Curate Your Feed",
        content:
          "Social media shows highlight reels, not real life. Follow what inspires you and mute what makes you feel small.",
      },
      {
        id: "gv-17",
        title: "Your Worth Isn't Your Likes",
        content:
          "External validation is a shaky foundation for self-worth. Your value doesn't rise or fall with approval from a screen.",
      },
      {
        id: "gv-18",
        title: "Watch Your Self-Talk",
        content:
          "You're always listening to the voice in your head. Speak to yourself as you would to someone you love, and your world softens.",
      },
      {
        id: "gv-19",
        title: "Affirm the Good",
        content:
          "Repeated words become beliefs. Gentle, positive affirmations gradually replace the harsh inner critic with an encouraging inner ally.",
      },
      {
        id: "gv-20",
        title: "Visualize Your Best Life",
        content:
          "Seeing the life you want in your mind primes you to notice and pursue it. Imagination is the first draft of your reality.",
      },
      {
        id: "gv-21",
        title: "Act As If",
        content:
          "Embody the person you're becoming now, in small ways. Aligning your actions with your vision closes the gap between dream and life.",
      },
      {
        id: "gv-22",
        title: "Forgive to Free Yourself",
        content:
          "Forgiveness isn't excusing what happened; it's releasing the grip it has on you. You forgive for your own peace, not theirs.",
      },
      {
        id: "gv-23",
        title: "Set Boundaries",
        content:
          "Saying no to what drains you is saying yes to yourself. Healthy boundaries protect your energy and your self-respect.",
      },
      {
        id: "gv-24",
        title: "Distance Toxic People",
        content:
          "Some relationships cost more than they give. It's okay to step back from people who consistently dim your light.",
      },
      {
        id: "gv-25",
        title: "Choose Your Circle Wisely",
        content:
          "You become like those you spend the most time with. Surround yourself with people who inspire growth, not those who feed negativity.",
      },
      {
        id: "gv-26",
        title: "Kindness Is Strength",
        content:
          "Being kind, especially when it's hard, is a quiet superpower. It uplifts others and raises your own vibration too.",
      },
      {
        id: "gv-27",
        title: "Give Without Expecting",
        content:
          "Generosity given freely returns in unexpected ways. Give from abundance, not to get something back, and watch your life expand.",
      },
      {
        id: "gv-28",
        title: "Be Authentic",
        content:
          "Pretending to be someone you're not is exhausting. Living true to yourself is where real confidence and peace begin.",
      },
      {
        id: "gv-29",
        title: "Stop Seeking Approval",
        content:
          "Trying to please everyone pleases no one, least of all you. Free yourself by valuing your own opinion of your life most.",
      },
      {
        id: "gv-30",
        title: "Find Your Purpose",
        content:
          "A sense of purpose gives your days direction and your struggles meaning. Notice what lights you up and move toward it.",
      },
      {
        id: "gv-31",
        title: "Follow What Lights You Up",
        content:
          "Your passions are clues to your purpose. Give time to what energizes you, and life starts to feel less like a grind.",
      },
      {
        id: "gv-32",
        title: "Face Your Fears",
        content:
          "Fear shrinks when you walk toward it. On the other side of what scares you is often the growth you've been seeking.",
      },
      {
        id: "gv-33",
        title: "Fear Is a Signal, Not a Stop",
        content:
          "Fear often points to something that matters. Treat it as information, not a command to retreat.",
      },
      {
        id: "gv-34",
        title: "Failure Is Feedback",
        content:
          "Every failure teaches you something a success never could. Reframe it as a lesson and it becomes part of your progress.",
      },
      {
        id: "gv-35",
        title: "Leave the Comfort Zone",
        content:
          "Nothing grows where it's always comfortable. Stretching beyond the familiar is how you discover what you're capable of.",
      },
      {
        id: "gv-36",
        title: "Discipline Over Motivation",
        content:
          "Motivation comes and goes; discipline shows up daily. Small, consistent actions build the life that fleeting inspiration only imagines.",
      },
      {
        id: "gv-37",
        title: "Small Habits, Big Change",
        content:
          "Your daily routines quietly design your future. Tiny positive habits, repeated, compound into a transformed life.",
      },
      {
        id: "gv-38",
        title: "Design Your Morning",
        content:
          "How you start the day sets its tone. A calm, intentional morning routine plants good vibes before the world can rush in.",
      },
      {
        id: "gv-39",
        title: "Shape Your Environment",
        content:
          "Your surroundings influence your state of mind. A tidy, uplifting space and positive inputs make good vibes far easier to hold.",
      },
      {
        id: "gv-40",
        title: "Be Present",
        content:
          "Most suffering lives in regret about the past or worry about the future. Peace is found by returning your attention to now.",
      },
      {
        id: "gv-41",
        title: "Mindfulness Quiets the Noise",
        content:
          "A few minutes of stillness each day steadies the mind. Mindfulness helps you respond to life instead of merely reacting.",
      },
      {
        id: "gv-42",
        title: "Accept What Is",
        content:
          "Resisting reality only multiplies pain. Acceptance isn't giving up — it's meeting life as it is so you can move forward.",
      },
      {
        id: "gv-43",
        title: "Detach From Outcomes",
        content:
          "Do your best, then release your grip on exactly how things unfold. Detachment frees you from anxiety and welcomes flow.",
      },
      {
        id: "gv-44",
        title: "Protect Your Peace",
        content:
          "Your inner peace is worth more than winning arguments or proving points. Choose calm over chaos wherever you can.",
      },
      {
        id: "gv-45",
        title: "Embrace Solitude",
        content:
          "Time alone isn't loneliness — it's where you reconnect with yourself. Solitude recharges your energy and clarifies your mind.",
      },
      {
        id: "gv-46",
        title: "Heal Before You Chase",
        content:
          "Unhealed wounds shape the choices we make. Tending to your inner healing frees you to build from wholeness, not lack.",
      },
      {
        id: "gv-47",
        title: "Growth Is a Journey",
        content:
          "You won't feel positive every single day, and that's okay. Growth isn't perfection — it's gently returning to good vibes again and again.",
      },
      {
        id: "gv-48",
        title: "Mindset Shapes Money",
        content:
          "A scarcity mindset keeps you stuck; an abundance mindset opens doors. How you think about money quietly shapes your relationship with it.",
      },
      {
        id: "gv-49",
        title: "Love Yourself First",
        content:
          "You teach others how to treat you by how you treat yourself. Self-respect is the foundation of every healthy relationship.",
      },
      {
        id: "gv-50",
        title: "Be Your Own Hero",
        content:
          "Stop waiting to be rescued. You have the power to change your story — become the person who saves you.",
      },
      {
        id: "gv-51",
        title: "Radiate, Don't Compete",
        content:
          "You don't have to dim others to shine. There's room for everyone's light, and lifting others lifts you too.",
      },
      {
        id: "gv-52",
        title: "Good Vibes Are a Choice",
        content:
          "Positivity is a practice, not a personality you're born with. Choose it daily, and good vibes gradually become a good life.",
      },
    ],
  },

  // The Alchemist — Paulo Coelho
  "bk-091": {
    bookId: "bk-091",
    tagline: "A fable about following your dream — your Personal Legend",
    updated: "2026-07",
    frames: [
      {
        id: "al-1",
        title: "Your Personal Legend",
        content:
          "At the heart of the fable is the Personal Legend — the deep dream or purpose you were born to pursue. Living it is the truest reason to be alive.",
      },
      {
        id: "al-2",
        title: "Everyone Has a Dream",
        content:
          "As children we know exactly what we long for. Life often teaches us to bury it — but the dream never truly disappears.",
      },
      {
        id: "al-3",
        title: "The Universe Conspires to Help You",
        content:
          "When you truly want something and commit to it, the whole universe seems to align to help you achieve it. Intent draws support.",
      },
      {
        id: "al-4",
        title: "Listen to Your Heart",
        content:
          "The heart knows the way even when the mind doubts. Learning to hear and trust it is central to finding your treasure.",
      },
      {
        id: "al-5",
        title: "The Language of the World",
        content:
          "There is a wordless language of signs, intuition, and connection that everything shares. Attuning to it guides your path.",
      },
      {
        id: "al-6",
        title: "Read the Omens",
        content:
          "Life leaves clues along the way. Paying attention to the small signs helps you make the choices that move you toward your dream.",
      },
      {
        id: "al-7",
        title: "Fear Is the Real Obstacle",
        content:
          "It isn't circumstance that stops most people — it's fear. The greatest barrier between you and your Personal Legend lives in your own mind.",
      },
      {
        id: "al-8",
        title: "The Fear of Failing",
        content:
          "Many never begin because they dread failing. Yet the only true failure is never daring to pursue what your heart desires.",
      },
      {
        id: "al-9",
        title: "The Fear of Suffering",
        content:
          "The fear of suffering, the fable says, is worse than the suffering itself. Anxiety about what might go wrong steals more than reality ever does.",
      },
      {
        id: "al-10",
        title: "Beginner's Luck",
        content:
          "Life often rewards the first bold step to encourage you onward. When you commit to your dream, early signs of favor appear.",
      },
      {
        id: "al-11",
        title: "The Comfort Trap",
        content:
          "The crystal merchant dreams of a pilgrimage but never goes, afraid that without the dream ahead he'd have nothing to live for. Comfort can quietly cage you.",
      },
      {
        id: "al-12",
        title: "Fear of Change",
        content:
          "It's easy to cling to a safe, familiar life even when it isn't fulfilling. Growth asks you to risk the known for the possible.",
      },
      {
        id: "al-13",
        title: "Dreams Deferred Dim the Soul",
        content:
          "A dream kept only as a comfortable someday slowly loses its color. Postponing your Legend forever is its own kind of loss.",
      },
      {
        id: "al-14",
        title: "Knowledge vs. Experience",
        content:
          "The Englishman studies alchemy endlessly from books yet struggles to live it. True wisdom comes from doing, not only from reading.",
      },
      {
        id: "al-15",
        title: "Learn by Living",
        content:
          "The boy learns more from the desert, the market, and the journey than from any text. Life is the greatest teacher for those who pay attention.",
      },
      {
        id: "al-16",
        title: "The Soul of the World",
        content:
          "All things are connected by a single Soul of the World. To pursue your Legend is to take part in that greater whole.",
      },
      {
        id: "al-17",
        title: "We Are All Connected",
        content:
          "When you improve yourself and follow your dream, you enrich the world around you. One person's growth ripples outward.",
      },
      {
        id: "al-18",
        title: "Love Doesn't Hold You Back",
        content:
          "Fatima loves the boy enough to let him pursue his Legend. Real love supports your dreams rather than chaining you in place.",
      },
      {
        id: "al-19",
        title: "True Love Waits and Trusts",
        content:
          "Love that asks you to abandon your purpose isn't love at its highest. The deepest love believes in your journey and stays part of it.",
      },
      {
        id: "al-20",
        title: "Maktub — It Is Written",
        content:
          "The idea of maktub, 'it is written,' invites trust in a larger unfolding. You act with courage while surrendering to how the story flows.",
      },
      {
        id: "al-21",
        title: "The Present Moment",
        content:
          "The desert teaches that life exists only now. Dwelling in past or future robs you of the single moment where living actually happens.",
      },
      {
        id: "al-22",
        title: "Live Each Moment Fully",
        content:
          "Each day holds a small miracle for those who look. Presence turns an ordinary journey into a series of meaningful moments.",
      },
      {
        id: "al-23",
        title: "The Desert's Patience",
        content:
          "The vast desert teaches patience and humility. Big dreams require the willingness to endure long, quiet stretches without giving up.",
      },
      {
        id: "al-24",
        title: "Listen to the Silence",
        content:
          "In stillness, the heart and the world speak most clearly. Learning to be quiet is how the boy hears his guidance.",
      },
      {
        id: "al-25",
        title: "The Mentor Appears",
        content:
          "When the boy is ready, the alchemist arrives to guide him. Teachers show up for those committed enough to keep walking their path.",
      },
      {
        id: "al-26",
        title: "Turning Lead into Gold",
        content:
          "Alchemy is a metaphor for transformation — of metal and of the self. Pursuing your Legend refines you into who you're meant to become.",
      },
      {
        id: "al-27",
        title: "Purified by Trials",
        content:
          "Every hardship on the journey burns away fear and doubt. The trials aren't punishments; they're part of becoming your truest self.",
      },
      {
        id: "al-28",
        title: "When You Truly Want Something",
        content:
          "Genuine desire, backed by action, becomes a force. Half-hearted wishes fade, but wholehearted commitment moves the world to respond.",
      },
      {
        id: "al-29",
        title: "Commit to the Journey",
        content:
          "Dreaming is easy; committing is rare. The moment you fully commit, the path — with all its help and its tests — opens before you.",
      },
      {
        id: "al-30",
        title: "The Cost of the Dream",
        content:
          "Every Personal Legend has a price in risk, effort, and uncertainty. Deciding the dream is worth that price is where the adventure begins.",
      },
      {
        id: "al-31",
        title: "Ignored Blessings Fade",
        content:
          "The fable warns that a blessing not acted upon can turn into a burden. Opportunities honored grow; those ignored quietly slip away.",
      },
      {
        id: "al-32",
        title: "Follow Signs, Not Fear",
        content:
          "At every fork, the boy chooses the omens over his fear. Letting guidance rather than dread steer you keeps you on your path.",
      },
      {
        id: "al-33",
        title: "The Heart's Wisdom",
        content:
          "The alchemist tells the boy to listen to his heart, for it comes from the Soul of the World and knows his true treasure.",
      },
      {
        id: "al-34",
        title: "Hearts Fear Suffering",
        content:
          "The heart admits it fears the pain of pursuing dreams. Yet it confesses it suffers far more when those dreams are abandoned.",
      },
      {
        id: "al-35",
        title: "Speak With Your Heart",
        content:
          "Rather than silencing the heart, the boy learns to listen and reassure it. Befriending your fears quiets them better than ignoring them.",
      },
      {
        id: "al-36",
        title: "The Test of the Elements",
        content:
          "To prove himself, the boy must speak to the wind and the sun and turn himself to the wind. Faith, not force, works the miracle.",
      },
      {
        id: "al-37",
        title: "Faith Moves the World",
        content:
          "The greatest feats in the story come from belief and connection, not raw power. Faith aligns you with forces larger than yourself.",
      },
      {
        id: "al-38",
        title: "Love Is the Great Transformer",
        content:
          "Love, the alchemist says, is the force that transforms and improves the Soul of the World. It fuels the journey rather than blocking it.",
      },
      {
        id: "al-39",
        title: "Courage to Continue",
        content:
          "Again and again the boy chooses to press on despite danger and doubt. Courage isn't the absence of fear but moving forward with it.",
      },
      {
        id: "al-40",
        title: "Risk Is the Price of the Dream",
        content:
          "There is no treasure without risk. The willingness to gamble comfort for meaning is what separates dreamers from seekers.",
      },
      {
        id: "al-41",
        title: "Don't Quit Near the End",
        content:
          "Many give up just before the treasure. The final stretch is often the hardest — and the closest to reward.",
      },
      {
        id: "al-42",
        title: "The Treasure Was Home",
        content:
          "The boy travels far only to learn his treasure lay where he began. Sometimes the journey's purpose is to make you ready to see what was always there.",
      },
      {
        id: "al-43",
        title: "The Journey Was the Point",
        content:
          "The gold matters less than who the boy became chasing it. The pursuit itself transforms and enriches you.",
      },
      {
        id: "al-44",
        title: "Alchemy of the Soul",
        content:
          "The real alchemy is inner: turning fear into courage, doubt into faith, and an ordinary life into a lived dream.",
      },
      {
        id: "al-45",
        title: "Everything Is One",
        content:
          "The deeper the boy travels, the more he sees all things share one essence. Understanding this unity dissolves much of his fear.",
      },
      {
        id: "al-46",
        title: "Trust the Process",
        content:
          "The path rarely runs straight, and detours often carry hidden gifts. Trusting the unfolding keeps you moving when logic wavers.",
      },
      {
        id: "al-47",
        title: "Act Despite Fear",
        content:
          "The boy never waits to feel fearless. He acts while afraid, and the acting is what dissolves the fear.",
      },
      {
        id: "al-48",
        title: "Your Legend Serves the World",
        content:
          "Pursuing your dream isn't selfish; a person living their purpose blesses everyone around them. Your Legend is a gift you owe the world.",
      },
      {
        id: "al-49",
        title: "Simplicity of the Wise",
        content:
          "The wisest characters live simply and speak plainly. Truth, the fable suggests, is usually simpler than we make it.",
      },
      {
        id: "al-50",
        title: "Pay Attention",
        content:
          "The boy's gift is noticing — omens, people, patterns. Awareness turns an ordinary traveler into someone the world can guide.",
      },
      {
        id: "al-51",
        title: "Gratitude on the Way",
        content:
          "Even amid hardship the boy finds wonder. Gratitude for the journey keeps the dream joyful rather than merely a goal.",
      },
      {
        id: "al-52",
        title: "Let Go to Receive",
        content:
          "At times the boy must give up what he's gathered to move forward. Holding too tightly to security can block the greater treasure.",
      },
      {
        id: "al-53",
        title: "The World Rewards the Bold",
        content:
          "Those who dare to follow their Legend meet help they could never have planned. Boldness, not caution, unlocks the story's magic.",
      },
      {
        id: "al-54",
        title: "Become Who You're Meant to Be",
        content:
          "By the end, the boy is transformed — braver, wiser, more alive. The dream's true purpose was to reveal his fullest self.",
      },
      {
        id: "al-55",
        title: "Live Your Personal Legend",
        content:
          "The fable's call is simple and radical: find your dream and pursue it. A life spent chasing your Legend is a life fully lived.",
      },
      {
        id: "al-56",
        title: "The Alchemist's Lesson",
        content:
          "Follow your heart, read the signs, embrace the journey, and trust that the universe supports the courageous. That is how lead becomes gold.",
      },
    ],
  },

  // Rich Dad Poor Dad — Robert Kiyosaki
  "bk-438": {
    bookId: "bk-438",
    tagline: "What the rich teach their kids about money that the poor do not",
    updated: "2026-07",
    frames: [
      {
        id: "rd-1",
        title: "Two Dads, Two Mindsets",
        content:
          "Kiyosaki learned money from two father figures: his highly educated but struggling real dad, and his friend's less-schooled but wealthy 'rich dad.' Their opposite beliefs shaped opposite lives.",
      },
      {
        id: "rd-2",
        title: "The Poor Dad Script",
        content:
          "Poor dad said 'I can't afford it,' 'study hard and get a safe job,' and treated a paycheck as security. That mindset kept him working for money his whole life.",
      },
      {
        id: "rd-3",
        title: "The Rich Dad Script",
        content:
          "Rich dad asked 'how can I afford it?', prized financial education, and built businesses and assets. The shift from statements to questions kept his mind working on wealth.",
      },
      {
        id: "rd-4",
        title: "The Rich Don't Work for Money",
        content:
          "Most people trade time for a paycheck their whole lives. The wealthy instead learn to make money work for them, so their income no longer depends on their labor.",
      },
      {
        id: "rd-5",
        title: "Make Money Work for You",
        content:
          "The goal is to acquire assets that generate income while you sleep. Once your money earns money, you're no longer trapped trading hours for rupees.",
      },
      {
        id: "rd-6",
        title: "Fear and Greed",
        content:
          "Fear of not having money and the desire for more drive most financial decisions. Unexamined, these emotions keep people chained to jobs they dislike.",
      },
      {
        id: "rd-7",
        title: "Escape the Rat Race",
        content:
          "The rat race is earning more only to spend more, so expenses always rise to meet income. Breaking free means buying assets faster than you inflate your lifestyle.",
      },
      {
        id: "rd-8",
        title: "Financial Literacy Is the Foundation",
        content:
          "Schools teach almost nothing about money. Without financial literacy, even high earners stay broke — knowledge, not income, is what builds lasting wealth.",
      },
      {
        id: "rd-9",
        title: "It's Not How Much You Make",
        content:
          "It's how much you keep and how many generations you keep it for. Plenty of high-income people are one paycheck from broke because they never learned to hold money.",
      },
      {
        id: "rd-10",
        title: "Assets vs. Liabilities",
        content:
          "The single most important rule: assets put money in your pocket, liabilities take money out. The rich buy assets; the poor and middle class buy liabilities they think are assets.",
      },
      {
        id: "rd-11",
        title: "The Rich Buy Assets",
        content:
          "Businesses, stocks, bonds, income real estate, and intellectual property feed the asset column. Every rupee funneled there becomes a little worker earning for you.",
      },
      {
        id: "rd-12",
        title: "Your House Is Not an Asset",
        content:
          "Kiyosaki's provocative claim: your home usually takes money out of your pocket in mortgage, taxes, and upkeep. By his rule that makes it a liability, not an asset.",
      },
      {
        id: "rd-13",
        title: "The Middle-Class Trap",
        content:
          "As income rises, the middle class buys bigger houses and cars, piling on liabilities. They mistake looking rich for being rich, and the debt keeps them running.",
      },
      {
        id: "rd-14",
        title: "Cash Flow Tells the Story",
        content:
          "Follow the direction money flows and you'll see the truth. Wealth is built by steadily increasing the income flowing in from assets.",
      },
      {
        id: "rd-15",
        title: "Mind Your Own Business",
        content:
          "Your job is not your business; your asset column is. Keep the day job, but spend your energy and spare money building assets that you actually own.",
      },
      {
        id: "rd-16",
        title: "Build the Asset Column",
        content:
          "Start small and reinvest what your assets earn to buy more assets. Over time this snowball becomes the engine of financial freedom.",
      },
      {
        id: "rd-17",
        title: "The Power of Corporations",
        content:
          "The wealthy use business structures to earn, spend on legitimate expenses, and then pay tax on what's left. Employees earn, get taxed, then spend what remains.",
      },
      {
        id: "rd-18",
        title: "Financial IQ: Accounting",
        content:
          "Learn to read the numbers — to understand a balance sheet and cash-flow statement. Financial literacy starts with knowing what the figures are really telling you.",
      },
      {
        id: "rd-19",
        title: "Financial IQ: Investing",
        content:
          "Understand how money makes money. Investing is a science of strategies and options that anyone can learn, not a mystery reserved for experts.",
      },
      {
        id: "rd-20",
        title: "Financial IQ: Markets",
        content:
          "Know supply, demand, and the emotions that move markets. Opportunities appear to those who understand what drives prices up and down.",
      },
      {
        id: "rd-21",
        title: "Financial IQ: The Law",
        content:
          "Knowing tax advantages and legal protections can dramatically change your results. The rules reward those who take the time to learn them.",
      },
      {
        id: "rd-22",
        title: "Work to Learn, Not to Earn",
        content:
          "Early in your career, choose jobs for the skills they teach, not just the salary. Learning sales, systems, and leadership pays off far longer than a slightly bigger paycheck.",
      },
      {
        id: "rd-23",
        title: "Sales and Communication",
        content:
          "The ability to sell and communicate is central to wealth. Rich dad urged learning marketing and persuasion, skills most technical experts neglect.",
      },
      {
        id: "rd-24",
        title: "Overcome Fear",
        content:
          "The fear of losing money stops most people from ever investing. Winners feel the fear but act anyway, treating losses as tuition rather than catastrophe.",
      },
      {
        id: "rd-25",
        title: "Overcome Cynicism",
        content:
          "Doubts and 'what ifs' talk people out of good opportunities. Don't let the loudest critic — often your own mind — make your decisions for you.",
      },
      {
        id: "rd-26",
        title: "Overcome Laziness",
        content:
          "Busyness is often laziness in disguise — staying busy to avoid something important. A little healthy greed, asking 'how can I afford it?', cures it.",
      },
      {
        id: "rd-27",
        title: "Overcome Bad Habits",
        content:
          "Your habits shape your finances more than your intelligence. The keystone habit: pay yourself first, before the bills, to force yourself to build assets.",
      },
      {
        id: "rd-28",
        title: "Overcome Arrogance",
        content:
          "What you don't know can cost you dearly, and arrogance hides your blind spots. Stay humble, keep learning, and seek out experts where you're weak.",
      },
      {
        id: "rd-29",
        title: "Pay Yourself First",
        content:
          "Set aside money for investing before paying anyone else. The pressure of still owing bills becomes fuel to find more income rather than an excuse to skip saving.",
      },
      {
        id: "rd-30",
        title: "Good Debt vs. Bad Debt",
        content:
          "Bad debt buys liabilities and drains you. Good debt buys assets that others help you pay for and that put money in your pocket — debt itself isn't the enemy.",
      },
      {
        id: "rd-31",
        title: "Financial Education Over Titles",
        content:
          "Degrees don't guarantee financial success. Ongoing self-education about money often matters more than the letters after your name.",
      },
      {
        id: "rd-32",
        title: "The Rich Invent Money",
        content:
          "Confidence and financial intelligence let people spot or create opportunities others miss. Money is, in part, an idea — the prepared mind sees deals everywhere.",
      },
      {
        id: "rd-33",
        title: "Opportunities Favor the Prepared",
        content:
          "Chances to build wealth pass everyone, but only the financially educated recognize and seize them. Preparation is what turns luck into a fortune.",
      },
      {
        id: "rd-34",
        title: "Manage Risk, Don't Fear It",
        content:
          "Playing it safe by avoiding all risk is its own risk. The skill is learning to manage risk intelligently rather than running from it.",
      },
      {
        id: "rd-35",
        title: "Failure Inspires Winners",
        content:
          "Winners treat losing as part of winning; losers are defeated by the fear of it. Every setback carries a lesson that moves you closer to success.",
      },
      {
        id: "rd-36",
        title: "Find Mentors",
        content:
          "Seek out your own 'rich dad' — mentors who have done what you want to do. Their guidance shortcuts years of costly trial and error.",
      },
      {
        id: "rd-37",
        title: "Choose Your Influences",
        content:
          "You absorb the money habits of those around you. Surround yourself with people who think in assets and opportunities, not excuses.",
      },
      {
        id: "rd-38",
        title: "Master a Formula, Then Learn Another",
        content:
          "Learn one way of making money well, then keep adding new formulas. The world changes, and yesterday's winning recipe eventually needs updating.",
      },
      {
        id: "rd-39",
        title: "Model the Greats",
        content:
          "Pick financial heroes and study how they think and act. Modeling those who've succeeded makes the path feel possible and clear.",
      },
      {
        id: "rd-40",
        title: "Teach and You Receive",
        content:
          "Generosity — of money, knowledge, and time — tends to come back multiplied. Giving keeps you focused on abundance rather than scarcity.",
      },
      {
        id: "rd-41",
        title: "Emotions vs. Logic",
        content:
          "Money decisions ruled by fear and desire usually go wrong. Financial intelligence is partly the ability to keep emotion from hijacking your choices.",
      },
      {
        id: "rd-42",
        title: "Learn the Language of Money",
        content:
          "Words like asset, liability, cash flow, and leverage are the vocabulary of wealth. Speaking the language is the first step to playing the game well.",
      },
      {
        id: "rd-43",
        title: "Beware the Doodads",
        content:
          "Small liabilities — gadgets, upgrades, impulse buys — quietly bleed the asset column. Watching the little leaks matters as much as landing the big wins.",
      },
      {
        id: "rd-44",
        title: "Use Assets to Buy Luxuries",
        content:
          "Rich dad let his assets pay for luxuries; the treat became a reward for building income first. Buying the toy before the asset is doing it backwards.",
      },
      {
        id: "rd-45",
        title: "Start Small, Think Big",
        content:
          "You don't need a fortune to begin. Start with small investments and let knowledge and confidence — and returns — grow together.",
      },
      {
        id: "rd-46",
        title: "Define Financial Independence",
        content:
          "You're financially free when income from your assets exceeds your expenses. From that point, working becomes a choice, not a necessity.",
      },
      {
        id: "rd-47",
        title: "The Habit of Learning",
        content:
          "Commit to constantly educating yourself about money through books, courses, and mentors. In finance, what you know compounds like interest.",
      },
      {
        id: "rd-48",
        title: "Action Beats Analysis",
        content:
          "Knowledge without action changes nothing. Rich dad valued doers who learned by starting over thinkers who waited for perfect certainty.",
      },
      {
        id: "rd-49",
        title: "Get Started: Find a Reason",
        content:
          "A strong 'why' — freedom, family, choice — powers you through the hard parts. Purpose is the emotional fuel behind financial discipline.",
      },
      {
        id: "rd-50",
        title: "Get Started: Feed Your Mind",
        content:
          "Invest first in your financial education. The greatest asset you own is your own trained mind, and it pays the highest returns.",
      },
      {
        id: "rd-51",
        title: "Get Started: Take Small Steps",
        content:
          "Break the journey into tiny actions — open the account, buy the first asset, read the next book. Momentum builds from motion, not from planning alone.",
      },
      {
        id: "rd-52",
        title: "Pay for Advice",
        content:
          "Good professionals and information are worth paying for; they often make you far more than they cost. Cheap advice can be the most expensive kind.",
      },
      {
        id: "rd-53",
        title: "Give First",
        content:
          "Rich dad believed you have to give to receive — teaching, tithing, and helping others created a mindset of abundance that attracted more.",
      },
      {
        id: "rd-54",
        title: "Focus, Follow One Course",
        content:
          "Scattering effort across too many things dilutes results. Concentrating on a clear plan — Focus: Follow One Course Until Successful — builds real wealth.",
      },
      {
        id: "rd-55",
        title: "Teach Your Kids About Money",
        content:
          "Financial habits form early. Passing on the language of assets and cash flow gives the next generation a head start school never provides.",
      },
      {
        id: "rd-56",
        title: "Wealth Is a Mindset First",
        content:
          "Before it's a bank balance, wealth is a way of thinking about money, risk, and opportunity. Change the mindset and the numbers eventually follow.",
      },
      {
        id: "rd-57",
        title: "Think Like the Rich",
        content:
          "Buy assets, mind your own business, boost your financial IQ, and let money work for you. Do this consistently and you can step out of the rat race for good.",
      },
    ],
  },

  // Mindset — Carol S. Dweck
  "bk-151": {
    bookId: "bk-151",
    tagline: "The new psychology of success — fixed vs. growth mindset",
    updated: "2026-07",
    frames: MINDSET_FRAMES,
  },
};

export const getQuickRead = (bookId) => quickReads[bookId] || null;
export const hasQuickRead = (bookId) => Boolean(quickReads[bookId]);
export const quickReadBookIds = () => Object.keys(quickReads);
export const quickReadFrameCount = (bookId) =>
  quickReads[bookId]?.frames?.length || 0;

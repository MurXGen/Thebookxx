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

  // The Secret — Rhonda Byrne
  "bk-140": {
    bookId: "bk-140",
    tagline: "The law of attraction and the power of positive thought",
    updated: "2026-07",
    frames: [
      {
        id: "se-1",
        title: "The Law of Attraction",
        content:
          "The Secret's central idea is the law of attraction: the belief that your dominant thoughts and feelings draw matching experiences into your life. Like, the book says, attracts like.",
      },
      {
        id: "se-2",
        title: "Thoughts Become Things",
        content:
          "According to the book, thoughts carry an energy that shapes your reality. What you think about most consistently, you begin to move toward and attract.",
      },
      {
        id: "se-3",
        title: "You Attract What You Focus On",
        content:
          "Whether you focus on what you want or what you fear, the book argues you draw more of it. Direct your attention deliberately toward your desires.",
      },
      {
        id: "se-4",
        title: "Your Feelings Are the Signal",
        content:
          "Byrne teaches that feelings reveal what you're attracting. Good feelings signal alignment with what you want; bad feelings signal the opposite.",
      },
      {
        id: "se-5",
        title: "Feel Good on Purpose",
        content:
          "Because feelings are said to broadcast your request, deliberately cultivating positive emotions is central to the book's method.",
      },
      {
        id: "se-6",
        title: "The Creative Process: Ask",
        content:
          "Step one is to ask clearly for what you want. The book suggests deciding on your desire with clarity, as if placing an order with the universe.",
      },
      {
        id: "se-7",
        title: "Be Clear About Your Desire",
        content:
          "Vague wishes bring vague results, the book claims. The more specific and vivid your request, the more powerfully you're said to attract it.",
      },
      {
        id: "se-8",
        title: "The Creative Process: Believe",
        content:
          "Step two is to believe it's already yours. Faith and expectation, the book argues, are what turn a wish into a magnet.",
      },
      {
        id: "se-9",
        title: "Believe As If It's Done",
        content:
          "Act and feel as though your desire has already arrived. This unwavering belief, Byrne says, is the bridge between wanting and receiving.",
      },
      {
        id: "se-10",
        title: "The Creative Process: Receive",
        content:
          "Step three is to receive — to feel the joy of having it now. Getting into the feeling of the wish fulfilled is said to complete the process.",
      },
      {
        id: "se-11",
        title: "Align Your Feelings to Receive",
        content:
          "The book teaches that you can only receive what you're a vibrational match to. Feeling good now is how you tune yourself to good outcomes.",
      },
      {
        id: "se-12",
        title: "Gratitude Multiplies",
        content:
          "Gratitude is one of the book's most emphasized practices. Being thankful for what you have, it claims, attracts more to be thankful for.",
      },
      {
        id: "se-13",
        title: "Give Thanks in Advance",
        content:
          "Byrne suggests thanking the universe as if your desire has already been granted. Gratitude in advance signals expectant belief.",
      },
      {
        id: "se-14",
        title: "Visualization",
        content:
          "The book urges you to picture your desire vividly and often. Seeing and feeling the end result is presented as a powerful attracting tool.",
      },
      {
        id: "se-15",
        title: "See and Feel the End Result",
        content:
          "Effective visualization, the book says, isn't just seeing — it's feeling the emotions of already having it. Emotion is the amplifier.",
      },
      {
        id: "se-16",
        title: "The Universe as a Catalog",
        content:
          "Byrne compares desiring to ordering from a catalog: choose what you want, place your order through thought and feeling, then let it come.",
      },
      {
        id: "se-17",
        title: "Place Your Order and Let Go",
        content:
          "After asking and believing, the book advises releasing anxious attachment. Trusting rather than gripping is said to keep the channel open.",
      },
      {
        id: "se-18",
        title: "Expectation Is Powerful",
        content:
          "Expecting good things, the book claims, is a strong form of attraction. Anticipation, not hope with doubt, is what draws results.",
      },
      {
        id: "se-19",
        title: "Doubt Cancels the Order",
        content:
          "Persistent doubt, according to the book, works against your desire. Mixed signals of wanting and disbelieving muddle what you attract.",
      },
      {
        id: "se-20",
        title: "Guard Against Negative Thoughts",
        content:
          "Byrne stresses managing your mental diet. Since thoughts are said to attract, she urges catching and redirecting negative ones quickly.",
      },
      {
        id: "se-21",
        title: "Focus on Wanted, Not Unwanted",
        content:
          "The book warns that dwelling on what you don't want attracts more of it. Keep your attention on the outcome you desire instead.",
      },
      {
        id: "se-22",
        title: "The Power of Now",
        content:
          "Feeling good in the present moment is the book's practical anchor. You attract from where you are, so choose peace and joy now.",
      },
      {
        id: "se-23",
        title: "Shift Your Vibe Quickly",
        content:
          "The book offers tools — happy memories, music, gratitude — to change how you feel fast. Deliberately raising your mood is a core skill.",
      },
      {
        id: "se-24",
        title: "The Secret to Money",
        content:
          "To attract wealth, the book says, feel abundant now rather than focusing on lack. A scarcity mindset is thought to repel the very thing you want.",
      },
      {
        id: "se-25",
        title: "Feel Abundant Now",
        content:
          "Byrne advises acting and feeling wealthy in small ways today. Cultivating a sense of plenty is presented as the doorway to more.",
      },
      {
        id: "se-26",
        title: "Give to Open the Flow",
        content:
          "Generosity, the book claims, signals abundance and keeps money circulating toward you. Giving from a good feeling attracts more.",
      },
      {
        id: "se-27",
        title: "The Secret to Relationships",
        content:
          "To improve relationships, the book says to focus on what you appreciate in others rather than their faults. Attention to the good grows it.",
      },
      {
        id: "se-28",
        title: "Love Yourself First",
        content:
          "Byrne teaches that self-love sets the tone for how others treat you. Filling your own cup is the starting point for loving connection.",
      },
      {
        id: "se-29",
        title: "Radiate What You Seek",
        content:
          "The book suggests you attract in others the qualities you embody. Be the love, warmth, and positivity you wish to receive.",
      },
      {
        id: "se-30",
        title: "The Secret to Health",
        content:
          "The book argues the mind influences the body, and that belief, joy, and laughter support wellness. It frames health as partly a mental state.",
      },
      {
        id: "se-31",
        title: "Laughter and Joy Heal",
        content:
          "Positive emotion, according to the book, supports the body's wellbeing. Cultivating joy is offered as part of staying healthy.",
      },
      {
        id: "se-32",
        title: "You Are the Creator",
        content:
          "The book's empowering message is that you are the creator of your own life through your thoughts and feelings — not a passive victim of events.",
      },
      {
        id: "se-33",
        title: "Take Charge of Your Thoughts",
        content:
          "Since thought is presented as creative, mastering your mind becomes the key skill. You steer your life by steering your attention.",
      },
      {
        id: "se-34",
        title: "Segment Your Day With Intention",
        content:
          "The book suggests setting a positive intention before each part of your day. Deliberate expectation, it claims, shapes how each segment unfolds.",
      },
      {
        id: "se-35",
        title: "Take Inspired Action",
        content:
          "Attraction, the book notes, still requires action — but inspired, joyful action rather than forced striving. Follow the nudges that feel right.",
      },
      {
        id: "se-36",
        title: "Attract, Don't Chase",
        content:
          "Desperate chasing, the book argues, broadcasts lack. Acting from calm expectancy is presented as more magnetic than anxious effort.",
      },
      {
        id: "se-37",
        title: "The Feeling Is the Secret",
        content:
          "More than thoughts, the book emphasizes feelings as the real power. Generating the emotion of the wish fulfilled is the heart of the method.",
      },
      {
        id: "se-38",
        title: "Speak in the Present Tense",
        content:
          "Byrne advises affirming desires as already true — 'I am,' not 'I will.' Present-tense language reinforces the feeling of having.",
      },
      {
        id: "se-39",
        title: "Surround Yourself With Reminders",
        content:
          "Vision boards, notes, and symbols keep your desire vivid and top of mind. The book uses these to sustain focus and belief.",
      },
      {
        id: "se-40",
        title: "See Obstacles as Temporary",
        content:
          "Setbacks, the book suggests, are just delays, not denials. Holding steady in belief through them keeps the process alive.",
      },
      {
        id: "se-41",
        title: "Trust the How to the Universe",
        content:
          "You need not know exactly how your desire will arrive, the book says — only what and why. Release the 'how' and stay open to surprise.",
      },
      {
        id: "se-42",
        title: "You Deserve Good Things",
        content:
          "The book encourages a deep sense of worthiness. Believing you deserve your desires is said to be part of allowing them in.",
      },
      {
        id: "se-43",
        title: "Gratitude Rituals",
        content:
          "Daily gratitude practices — listing blessings, a gratitude object — are recommended to keep you in a receiving state.",
      },
      {
        id: "se-44",
        title: "Praise and Bless",
        content:
          "The book advises praising and appreciating rather than criticizing. Focusing on the good, it claims, calls more good toward you.",
      },
      {
        id: "se-45",
        title: "Your Body Follows Your Mind",
        content:
          "The book frames the body as responsive to belief and emotion. Picturing health and feeling vital is presented as supportive of the body.",
      },
      {
        id: "se-46",
        title: "Emotion Is the Amplifier",
        content:
          "A thought held with strong feeling is said to be far more powerful than a neutral one. Intensity of emotion magnifies the signal.",
      },
      {
        id: "se-47",
        title: "Start Small to Build Belief",
        content:
          "The book suggests attracting small, easy things first — a parking spot, a call. Early wins build the belief needed for bigger ones.",
      },
      {
        id: "se-48",
        title: "Keep Your Vibe High",
        content:
          "Protect your emotional state as your most valuable asset. The book treats a consistently good mood as the engine of attraction.",
      },
      {
        id: "se-49",
        title: "Let Go of Resentment",
        content:
          "Holding onto anger keeps you in a low state, the book warns. Releasing grievances frees you to feel — and attract — better things.",
      },
      {
        id: "se-50",
        title: "The Earth Turns for You",
        content:
          "Byrne offers a message of self-worth: see yourself as deserving of the universe's abundance rather than unworthy or small.",
      },
      {
        id: "se-51",
        title: "Give the Best of Yourself",
        content:
          "The book links receiving with giving your best energy to the world. What you put out, it claims, returns to you multiplied.",
      },
      {
        id: "se-52",
        title: "Consistency of Feeling",
        content:
          "Occasional positive thoughts, the book says, aren't enough. A steady, habitual emotional tone is what shapes lasting results.",
      },
      {
        id: "se-53",
        title: "A Note of Balance",
        content:
          "The law of attraction is inspiring but not a substitute for effort, planning, or professional help. Treat these ideas as motivation to think positively and act, not as a guarantee.",
      },
      {
        id: "se-54",
        title: "Live the Secret",
        content:
          "The book's takeaway: tend your thoughts and feelings, practice gratitude, expect good, and act with joy. Whatever your beliefs, a positive, grateful mind tends to build a better life.",
      },
    ],
  },

  // Attitude Is Everything — Jeff Keller
  "bk-328": {
    bookId: "bk-328",
    tagline: "Change your attitude, and you change your life",
    updated: "2026-07",
    frames: [
      {
        id: "ae-1",
        title: "Attitude Is Everything",
        content:
          "Your attitude — not your circumstances — is the biggest factor in your success and happiness. Change your attitude and you genuinely change your life.",
      },
      {
        id: "ae-2",
        title: "Success Begins in the Mind",
        content:
          "Every achievement starts as a thought. What you consistently think about shapes the reality you eventually experience.",
      },
      {
        id: "ae-3",
        title: "Your Mind Is Like a Computer",
        content:
          "Garbage in, garbage out. The thoughts and messages you feed your mind determine the results it produces, so choose your inputs with care.",
      },
      {
        id: "ae-4",
        title: "Program Positive Inputs",
        content:
          "Fill your mind with encouraging books, people, and ideas. A steady diet of positive input reprograms a negative mindset over time.",
      },
      {
        id: "ae-5",
        title: "You Become What You Think About",
        content:
          "Dwell on problems and you attract more of them; dwell on possibilities and you find them. Your dominant thoughts set your direction.",
      },
      {
        id: "ae-6",
        title: "Self-Image Sets the Ceiling",
        content:
          "You perform in line with how you see yourself. Raise your self-image and your behaviour and results rise to match it.",
      },
      {
        id: "ae-7",
        title: "Act As If",
        content:
          "Behave like the confident, capable person you want to become. Acting the part gradually turns the image into reality.",
      },
      {
        id: "ae-8",
        title: "See the Glass Half Full",
        content:
          "Optimists and pessimists face the same facts but tell different stories. Choosing to focus on what's good changes how you feel and act.",
      },
      {
        id: "ae-9",
        title: "Focus on What's Good",
        content:
          "Whatever you focus on expands in your mind. Deliberately look for the positive and it starts to dominate your experience.",
      },
      {
        id: "ae-10",
        title: "Positive Expectancy",
        content:
          "Expect good outcomes and you act in ways that make them likelier. Expectation quietly shapes effort, energy, and results.",
      },
      {
        id: "ae-11",
        title: "You Can't Win Expecting to Lose",
        content:
          "If you're already convinced you'll fail, you sabotage yourself before you start. Belief in the possibility of success is the price of admission.",
      },
      {
        id: "ae-12",
        title: "Believe You Can",
        content:
          "Whether you think you can or you can't, you're usually right. Self-belief unlocks effort and persistence that doubt shuts down.",
      },
      {
        id: "ae-13",
        title: "Reframe Problems as Opportunities",
        content:
          "The same situation is a disaster or a challenge depending on your frame. Ask what this problem makes possible, not just what it costs.",
      },
      {
        id: "ae-14",
        title: "Every Setback Carries a Seed",
        content:
          "Difficulties often carry a hidden lesson or opportunity. Train yourself to hunt for it instead of only mourning the loss.",
      },
      {
        id: "ae-15",
        title: "Watch Your Words",
        content:
          "Your words reflect and reinforce your attitude. Speak defeat and you feel defeated; speak possibility and you lift yourself.",
      },
      {
        id: "ae-16",
        title: "Words Shape Your Mindset",
        content:
          "The language you use programs your mind and signals to others who you are. Choose words that build you up, not tear you down.",
      },
      {
        id: "ae-17",
        title: "Speak of What You Want",
        content:
          "Talk about your goals and hopes, not your fears and complaints. Where your words go, your energy and attention follow.",
      },
      {
        id: "ae-18",
        title: "Stop Complaining",
        content:
          "Complaining keeps you focused on the problem and drains your power to solve it. Replace complaints with requests or action.",
      },
      {
        id: "ae-19",
        title: "Complaining Repels People",
        content:
          "Chronic negativity pushes others away, while positivity draws them in. People gravitate toward those who lift the mood, not drain it.",
      },
      {
        id: "ae-20",
        title: "Answer With Optimism",
        content:
          "When asked how you are, respond with energy and positivity. A cheerful, genuine answer sets the tone for the whole interaction.",
      },
      {
        id: "ae-21",
        title: "Words Become Self-Fulfilling",
        content:
          "Say 'I'm terrible at this' often enough and you make it true. Speak to yourself as a coach would, not a critic.",
      },
      {
        id: "ae-22",
        title: "Associate With Positive People",
        content:
          "You absorb the attitudes of those around you. Spend time with encouraging, ambitious people and their energy becomes yours.",
      },
      {
        id: "ae-23",
        title: "Choose Your Circle",
        content:
          "Your environment shapes your outlook. Curate the people you spend the most time with as carefully as you'd curate your diet.",
      },
      {
        id: "ae-24",
        title: "Limit Toxic Influences",
        content:
          "Some people drain your optimism no matter what. It's okay to reduce your exposure to relentless negativity to protect your attitude.",
      },
      {
        id: "ae-25",
        title: "Heaven Helps Those Who Act",
        content:
          "A positive attitude means little without action. Good things flow to those who pair belief with consistent, courageous doing.",
      },
      {
        id: "ae-26",
        title: "Action Cures Fear",
        content:
          "Fear shrinks the moment you move toward it. Taking the first step often dissolves the anxiety that thinking only magnifies.",
      },
      {
        id: "ae-27",
        title: "Leave the Comfort Zone",
        content:
          "Growth lives just outside what feels safe. Regularly stretching beyond your comfort zone expands what you believe you can do.",
      },
      {
        id: "ae-28",
        title: "Do the Thing You Fear",
        content:
          "Confronting a fear directly is how you shrink it. Courage isn't the absence of fear but action taken in spite of it.",
      },
      {
        id: "ae-29",
        title: "Persistence Pays",
        content:
          "Most people give up right before the breakthrough. A positive, persistent attitude keeps you going until the results arrive.",
      },
      {
        id: "ae-30",
        title: "Don't Quit Before the Miracle",
        content:
          "Setbacks are part of every success story. Treat them as temporary detours, not dead ends, and keep moving.",
      },
      {
        id: "ae-31",
        title: "Make a Commitment",
        content:
          "Half-hearted effort brings half-hearted results. Full commitment unlocks resources, ideas, and help that hesitation never sees.",
      },
      {
        id: "ae-32",
        title: "Be Willing to Fail",
        content:
          "Fear of failure paralyzes more dreams than failure itself. Accept failure as tuition on the road to success.",
      },
      {
        id: "ae-33",
        title: "Take Responsibility",
        content:
          "Blaming others hands away your power to change things. Owning your response — even to unfair events — puts you back in control.",
      },
      {
        id: "ae-34",
        title: "You Are Not a Victim",
        content:
          "A victim mindset keeps you stuck; an ownership mindset moves you forward. Focus on what you can influence, not what you can't.",
      },
      {
        id: "ae-35",
        title: "Gratitude Fuels Positivity",
        content:
          "Gratitude is attitude in action. Regularly noticing what's good rewires your mind toward optimism and contentment.",
      },
      {
        id: "ae-36",
        title: "Count Your Blessings",
        content:
          "Even on hard days there is something to appreciate. A daily habit of gratitude steadily lifts your baseline mood.",
      },
      {
        id: "ae-37",
        title: "Smile and Mean It",
        content:
          "A genuine smile lifts your own mood and warms everyone around you. It's a small act with an outsized effect on attitude.",
      },
      {
        id: "ae-38",
        title: "Enthusiasm Is Contagious",
        content:
          "Approach your work and relationships with energy, and others catch it. Enthusiasm opens doors that indifference leaves shut.",
      },
      {
        id: "ae-39",
        title: "Give to Receive",
        content:
          "Helping others, without keeping score, creates goodwill and meaning. Generosity is both a positive attitude and a magnet for good.",
      },
      {
        id: "ae-40",
        title: "Lift Others Up",
        content:
          "Encouraging the people around you multiplies positivity — theirs and yours. You rarely lift someone without rising yourself.",
      },
      {
        id: "ae-41",
        title: "Visualize Success",
        content:
          "See yourself succeeding in vivid detail before it happens. Mental rehearsal primes your mind and body to make it real.",
      },
      {
        id: "ae-42",
        title: "See It Before You Achieve It",
        content:
          "Clear mental pictures of your goals sharpen focus and motivation. If you can picture it clearly, you're far likelier to reach it.",
      },
      {
        id: "ae-43",
        title: "Guard Against Negativity",
        content:
          "Negative news, gossip, and self-doubt seep in unless you defend against them. Actively protect the positive state you build.",
      },
      {
        id: "ae-44",
        title: "Feed Your Mind Good Material",
        content:
          "Read uplifting books, listen to encouraging voices, and revisit your goals. What you feed your mind daily becomes your default outlook.",
      },
      {
        id: "ae-45",
        title: "Handle Criticism Gracefully",
        content:
          "Not all criticism deserves your energy. Take the useful part, leave the rest, and don't let it dent your core confidence.",
      },
      {
        id: "ae-46",
        title: "Expect the Best of People",
        content:
          "Approaching others with positive assumptions usually brings out their better side. Attitude shapes relationships as much as outcomes.",
      },
      {
        id: "ae-47",
        title: "Turn Envy Into Inspiration",
        content:
          "When others succeed, let it inspire rather than diminish you. Their win is proof of what's possible for you too.",
      },
      {
        id: "ae-48",
        title: "Attitude Is a Choice",
        content:
          "You can't always control what happens, but you always choose your response. That choice is your greatest and most reliable freedom.",
      },
      {
        id: "ae-49",
        title: "Choose It Daily",
        content:
          "A positive attitude isn't a one-time decision; it's a daily practice. Renew it each morning and return to it whenever you drift.",
      },
      {
        id: "ae-50",
        title: "Persist Through Bad Days",
        content:
          "Everyone has off days; the difference is how fast you reset. Gently steer your thoughts back toward the positive again and again.",
      },
      {
        id: "ae-51",
        title: "Model the Attitude You Want",
        content:
          "Be the calm, upbeat presence you'd like to be around. Living your attitude influences your world more than preaching it.",
      },
      {
        id: "ae-52",
        title: "A Great Attitude Changes Everything",
        content:
          "Same job, same challenges, different attitude — and life transforms. Master your outlook and you master the one thing that colours it all.",
      },
    ],
  },

  // Why We Sleep — Matthew Walker
  "bk-168": {
    bookId: "bk-168",
    tagline: "The new science of sleep and dreams — and why they matter",
    updated: "2026-07",
    frames: [
      {
        id: "ws-1",
        title: "Sleep Is Non-Negotiable",
        content:
          "Walker argues sleep is the single most effective thing you can do to reset your brain and body's health. It underpins nearly every system we have.",
      },
      {
        id: "ws-2",
        title: "The Neglected Third of Life",
        content:
          "We spend about a third of life asleep, yet modern culture treats it as wasted time. That neglect, Walker says, is quietly harming us.",
      },
      {
        id: "ws-3",
        title: "Two Forces Control Sleep",
        content:
          "Sleep is governed by two systems: your circadian rhythm (an internal 24-hour clock) and sleep pressure (a chemical urge that builds while awake).",
      },
      {
        id: "ws-4",
        title: "Your Circadian Rhythm",
        content:
          "An internal clock keyed to light tells your body when to feel alert and when to feel sleepy, roughly on a 24-hour cycle.",
      },
      {
        id: "ws-5",
        title: "Sleep Pressure and Adenosine",
        content:
          "While you're awake, a chemical called adenosine builds up, increasing the pressure to sleep. A full night's sleep clears it away.",
      },
      {
        id: "ws-6",
        title: "Caffeine Blocks the Signal",
        content:
          "Caffeine works by blocking adenosine receptors, masking sleepiness. It doesn't remove the fatigue — it just hides it temporarily.",
      },
      {
        id: "ws-7",
        title: "Caffeine's Long Half-Life",
        content:
          "Caffeine can linger for many hours; half of it may still be in your system five to six hours after your afternoon coffee, disrupting night sleep.",
      },
      {
        id: "ws-8",
        title: "The Caffeine Crash",
        content:
          "When caffeine wears off, the built-up adenosine floods back, causing a slump. You pay back the alertness you borrowed, with interest.",
      },
      {
        id: "ws-9",
        title: "Melatonin, the Hormone of Night",
        content:
          "As darkness falls, the brain releases melatonin, signalling that it's time to sleep. Melatonin times sleep but doesn't generate it.",
      },
      {
        id: "ws-10",
        title: "Light Sets Your Clock",
        content:
          "Light, especially morning sunlight, is the master signal that sets your circadian clock. Artificial light at night confuses it.",
      },
      {
        id: "ws-11",
        title: "Two Types of Sleep",
        content:
          "Sleep alternates between NREM (non-dreaming, restorative) and REM (dreaming) stages. Both are essential and do different jobs.",
      },
      {
        id: "ws-12",
        title: "The Sleep Cycle",
        content:
          "Across the night you move through repeating cycles of about 90 minutes, with the balance shifting from deep NREM early to more REM near morning.",
      },
      {
        id: "ws-13",
        title: "Deep NREM Sleep",
        content:
          "Deep non-REM sleep, strongest in the first half of the night, restores the body and helps move memories into long-term storage.",
      },
      {
        id: "ws-14",
        title: "REM Sleep and Dreaming",
        content:
          "REM sleep, richest toward morning, is when most vivid dreaming happens. It supports emotional processing and creative connection-making.",
      },
      {
        id: "ws-15",
        title: "Cutting Sleep Short Cuts REM",
        content:
          "Because REM concentrates in the later hours, sleeping only six hours can rob you of a large share of your dreaming sleep.",
      },
      {
        id: "ws-16",
        title: "Sleep Before Learning",
        content:
          "Sleep before studying prepares the brain to absorb new information. A tired brain is like a sponge that can't soak anything up.",
      },
      {
        id: "ws-17",
        title: "Sleep After Learning",
        content:
          "Sleep after learning cements new memories. Walker calls it hitting the 'save' button on what you studied that day.",
      },
      {
        id: "ws-18",
        title: "Memory Consolidation",
        content:
          "During sleep the brain replays and files the day's experiences, strengthening what matters and integrating it with older knowledge.",
      },
      {
        id: "ws-19",
        title: "Creativity in REM",
        content:
          "REM sleep fuses distant ideas in novel ways, which is why solutions and creative insights often arrive after a good night's rest.",
      },
      {
        id: "ws-20",
        title: "Overnight Emotional Therapy",
        content:
          "REM sleep helps strip the sharp emotional charge from difficult memories, so you wake able to remember events without being overwhelmed by them.",
      },
      {
        id: "ws-21",
        title: "Sleep and Mood",
        content:
          "Too little sleep amplifies the brain's emotional centers and weakens the rational control over them, leaving us reactive and irritable.",
      },
      {
        id: "ws-22",
        title: "Sleep and Mental Health",
        content:
          "Sleep loss is tightly linked with anxiety, depression, and other conditions. Walker stresses sleep's role in psychological wellbeing.",
      },
      {
        id: "ws-23",
        title: "The Myth of Catching Up",
        content:
          "You can't fully repay lost sleep on the weekend. Sleep isn't like a bank where a big deposit clears weeks of debt.",
      },
      {
        id: "ws-24",
        title: "Sleep Debt Accumulates",
        content:
          "Chronic short sleep builds a debt that quietly degrades performance and health, even when you feel you've 'adapted' to it.",
      },
      {
        id: "ws-25",
        title: "You Can't Judge Your Own Deficit",
        content:
          "The sleep-deprived routinely underestimate their impairment. Feeling fine on little sleep is itself a symptom of the deficit.",
      },
      {
        id: "ws-26",
        title: "Sleep and the Immune System",
        content:
          "Even one night of short sleep can reduce key immune cells. Consistent good sleep strengthens the body's natural defenses.",
      },
      {
        id: "ws-27",
        title: "Sleep and Cancer Risk",
        content:
          "Walker cites research linking chronic sleep loss and disrupted rhythms with higher cancer risk — one reason shift work is treated so seriously.",
      },
      {
        id: "ws-28",
        title: "Sleep and the Heart",
        content:
          "Short sleep is associated with higher blood pressure and cardiovascular problems. Walker even points to spikes in heart events around clock changes.",
      },
      {
        id: "ws-29",
        title: "Sleep and Blood Sugar",
        content:
          "Too little sleep impairs how the body handles glucose, pushing it toward a pre-diabetic state and raising metabolic risk.",
      },
      {
        id: "ws-30",
        title: "Sleep and Weight",
        content:
          "Sleep loss disrupts appetite hormones, increasing hunger (ghrelin) and dulling fullness (leptin), which drives overeating.",
      },
      {
        id: "ws-31",
        title: "Cravings Rise When Tired",
        content:
          "A sleepy brain craves more calories, especially sugary and high-carb foods. Good sleep supports healthier eating with less willpower.",
      },
      {
        id: "ws-32",
        title: "Sleep and Alzheimer's",
        content:
          "Walker links poor sleep with the buildup of amyloid protein tied to Alzheimer's — and worsening sleep can be both a warning sign and a driver.",
      },
      {
        id: "ws-33",
        title: "The Brain's Overnight Cleanse",
        content:
          "During deep sleep, the brain's glymphatic system flushes out metabolic waste built up during the day, including harmful proteins.",
      },
      {
        id: "ws-34",
        title: "Drowsy Driving Kills",
        content:
          "Fatigue behind the wheel can be as dangerous as drunk driving. Drowsy driving causes vast numbers of accidents every year.",
      },
      {
        id: "ws-35",
        title: "Microsleeps",
        content:
          "A severely sleep-deprived brain can slip into 'microsleeps' — split-second lapses of attention that are deadly at high speed.",
      },
      {
        id: "ws-36",
        title: "Alcohol Wrecks Sleep",
        content:
          "A nightcap may knock you out, but alcohol is a sedative, not true sleep. It fragments the night and blocks restorative stages.",
      },
      {
        id: "ws-37",
        title: "Alcohol Suppresses REM",
        content:
          "Alcohol especially suppresses REM sleep, robbing you of dreaming and the emotional and memory benefits it provides.",
      },
      {
        id: "ws-38",
        title: "Screens and Blue Light",
        content:
          "Evening screen light suppresses melatonin and pushes back your body clock, making it harder to fall — and stay — asleep.",
      },
      {
        id: "ws-39",
        title: "The Modern Sleep Crisis",
        content:
          "Artificial light, long work hours, caffeine, and alcohol have created a society-wide sleep shortage with serious health costs.",
      },
      {
        id: "ws-40",
        title: "Sleeping Pills Aren't Real Sleep",
        content:
          "Walker warns that many sleeping pills sedate rather than produce natural sleep, and can carry risks without delivering true restoration.",
      },
      {
        id: "ws-41",
        title: "Aim for Seven to Nine Hours",
        content:
          "Most adults need seven to nine hours a night. Routinely getting under seven, Walker argues, measurably harms body and mind.",
      },
      {
        id: "ws-42",
        title: "Consistency Is King",
        content:
          "Going to bed and waking at the same times daily — even on weekends — strengthens your body clock and improves sleep quality.",
      },
      {
        id: "ws-43",
        title: "Keep the Room Cool",
        content:
          "A slightly cool bedroom helps your core temperature drop, which the body needs to fall and stay asleep. Aim for cooler than feels obvious.",
      },
      {
        id: "ws-44",
        title: "Dark and Quiet",
        content:
          "Darkness triggers melatonin; even dim light can disrupt it. A dark, quiet room signals the brain that it's truly time to rest.",
      },
      {
        id: "ws-45",
        title: "Get Morning Sunlight",
        content:
          "Bright light early in the day anchors your circadian rhythm, helping you feel alert in the morning and sleepy at night.",
      },
      {
        id: "ws-46",
        title: "Wind Down Before Bed",
        content:
          "A relaxing pre-sleep routine — dim lights, no screens, calm activity — signals your brain to shift gears toward sleep.",
      },
      {
        id: "ws-47",
        title: "Avoid Late Caffeine",
        content:
          "Because caffeine lingers for hours, Walker advises cutting it off by early afternoon to protect your night's sleep.",
      },
      {
        id: "ws-48",
        title: "Don't Lie Awake in Bed",
        content:
          "If you can't sleep, get up and do something calming until sleepy. Lying awake trains the brain to associate bed with wakefulness.",
      },
      {
        id: "ws-49",
        title: "Naps: Use With Care",
        content:
          "Short early naps can help, but long or late naps reduce sleep pressure and can sabotage that night's sleep.",
      },
      {
        id: "ws-50",
        title: "Teenagers' Shifted Clocks",
        content:
          "Adolescent body clocks naturally run late, so early school starts fight biology. Teens aren't lazy — they're biologically wired to sleep later.",
      },
      {
        id: "ws-51",
        title: "Schools and Work Start Too Early",
        content:
          "Walker argues later school and work start times would improve learning, mood, safety, and health, especially for the young.",
      },
      {
        id: "ws-52",
        title: "Dreams Have Purpose",
        content:
          "Far from random, dreams help process emotion and spark creativity. Walker treats dreaming as active, useful overnight brainwork.",
      },
      {
        id: "ws-53",
        title: "Sleep and Performance",
        content:
          "Athletes and professionals perform measurably better with more sleep — faster reactions, sharper focus, fewer injuries and errors.",
      },
      {
        id: "ws-54",
        title: "Sleep and Longevity",
        content:
          "Chronic short sleep is linked with a shorter lifespan. Walker's blunt summary: the shorter your sleep, the shorter your life tends to be.",
      },
      {
        id: "ws-55",
        title: "No Substitute for Sleep",
        content:
          "No pill, food, or trick fully replaces natural sleep. It remains the most powerful, freely available health tool we have.",
      },
      {
        id: "ws-56",
        title: "Prioritize It Like Diet and Exercise",
        content:
          "We celebrate diet and exercise but overlook sleep — the third pillar that makes the other two work. Give it equal respect.",
      },
      {
        id: "ws-57",
        title: "Protect Your Sleep",
        content:
          "Guard your sleep as you would any vital appointment. Small, consistent habits protect the hours your health depends on.",
      },
      {
        id: "ws-58",
        title: "The Best Health Investment",
        content:
          "Walker's message is simple: sleep more, and better. It's the closest thing to a free, natural cure for body and mind we possess.",
      },
    ],
  },

  // The Castle — Franz Kafka
  "bk-266": {
    bookId: "bk-266",
    tagline: "An endless quest for acceptance from an unreachable authority",
    updated: "2026-07",
    frames: [
      {
        id: "ca-1",
        title: "The Land Surveyor Arrives",
        content:
          "A man known only as K. arrives in a village claiming to be a land surveyor summoned by the Castle. From the first page, nothing about his purpose is clear.",
      },
      {
        id: "ca-2",
        title: "The Unreachable Castle",
        content:
          "The Castle looms over the village yet K. can never quite reach it. It becomes a symbol of every goal that stays maddeningly out of grasp.",
      },
      {
        id: "ca-3",
        title: "Access Forever Denied",
        content:
          "K. seeks official recognition and entry, but every path is blocked by rules, delays, and misdirection. The door is always one more obstacle away.",
      },
      {
        id: "ca-4",
        title: "Bureaucracy Without End",
        content:
          "The Castle's administration is a labyrinth of officials, files, and procedures. Kafka renders bureaucracy as an almost mythical, inescapable force.",
      },
      {
        id: "ca-5",
        title: "The Authority You Never Meet",
        content:
          "The powers that govern the village never appear in person. K. chases an authority that stays hidden behind layers of intermediaries.",
      },
      {
        id: "ca-6",
        title: "Klamm, the Elusive Official",
        content:
          "The official Klamm is spoken of with awe but glimpsed only fleetingly. Power here is rumour, reverence, and absence rather than presence.",
      },
      {
        id: "ca-7",
        title: "The Village and the Castle",
        content:
          "The villagers live in submission to a Castle they barely understand. Kafka contrasts ordinary life with the remote authority that rules it.",
      },
      {
        id: "ca-8",
        title: "The Outsider's Struggle",
        content:
          "K. is a stranger who never gains footing. His story captures the ache of trying to belong somewhere that keeps you at arm's length.",
      },
      {
        id: "ca-9",
        title: "Longing to Belong",
        content:
          "Beneath K.'s quest is a basic human hunger: to be recognized, accepted, and given a place. The Castle withholds exactly that.",
      },
      {
        id: "ca-10",
        title: "Recognition Withheld",
        content:
          "Even confirming whether K. was truly hired proves impossible. Kafka dramatizes how systems can deny you the simple acknowledgment you seek.",
      },
      {
        id: "ca-11",
        title: "Endless Obstacles",
        content:
          "Each step toward the Castle spawns new conditions and confusions. Progress is always promised and never delivered.",
      },
      {
        id: "ca-12",
        title: "Messengers and Middlemen",
        content:
          "K. deals only with go-betweens like the messenger Barnabas, never principals. Communication passes through so many hands that meaning dissolves.",
      },
      {
        id: "ca-13",
        title: "Communication That Fails",
        content:
          "Messages are vague, contradictory, or lost. Kafka shows how information decays as it travels through a vast, indifferent hierarchy.",
      },
      {
        id: "ca-14",
        title: "The Illusion of Progress",
        content:
          "K. is repeatedly made to feel he's advancing, only to find he's stood still. Hope is dangled to keep him compliant and moving.",
      },
      {
        id: "ca-15",
        title: "Waiting as a Way of Life",
        content:
          "The village runs on waiting — for officials, for answers, for permission. Time itself seems to dissolve into endless anticipation.",
      },
      {
        id: "ca-16",
        title: "Power That Hides Its Face",
        content:
          "The Castle's strength lies partly in its invisibility. What can't be confronted can't be argued with, appealed to, or overcome.",
      },
      {
        id: "ca-17",
        title: "The Absurd Quest",
        content:
          "K. pursues a goal whose rules keep changing and whose end never arrives. Kafka makes the pursuit itself the true subject.",
      },
      {
        id: "ca-18",
        title: "Identity Tied to a Role",
        content:
          "K. clings to being 'the surveyor,' but the title may be a mistake. Without official recognition, even his identity feels uncertain.",
      },
      {
        id: "ca-19",
        title: "Officials as Demigods",
        content:
          "The villagers treat Castle officials with near-religious reverence. Kafka examines how humans exalt the powerful they cannot reach.",
      },
      {
        id: "ca-20",
        title: "Arbitrary Rules",
        content:
          "The Castle's regulations seem to shift and contradict. Authority here needs no consistency, only the power to be obeyed.",
      },
      {
        id: "ca-21",
        title: "Frieda and Human Connection",
        content:
          "K.'s relationship with Frieda offers warmth amid the cold machinery. Yet even love gets tangled in his obsession with the Castle.",
      },
      {
        id: "ca-22",
        title: "The Cost of the Obsession",
        content:
          "K. sacrifices peace, rest, and relationships to his quest. Kafka asks what a single-minded pursuit of acceptance can cost a person.",
      },
      {
        id: "ca-23",
        title: "Losing Yourself in the Goal",
        content:
          "The more K. chases the Castle, the more he loses himself. The goal consumes the seeker rather than fulfilling him.",
      },
      {
        id: "ca-24",
        title: "The Unattainable Grace",
        content:
          "Many read the Castle as divine grace or salvation — longed for, sought endlessly, but never quite reached in this life.",
      },
      {
        id: "ca-25",
        title: "God or Government?",
        content:
          "Is the Castle heaven or the state? Kafka lets it be both — any higher power we serve, obey, and can never fully understand.",
      },
      {
        id: "ca-26",
        title: "The Silence of the Powerful",
        content:
          "The Castle rarely answers and never explains. Its silence is a wall K. beats against for the entire book.",
      },
      {
        id: "ca-27",
        title: "Hope That Never Resolves",
        content:
          "K. is sustained by the belief that acceptance is just ahead. Kafka examines how hope can both drive us and imprison us.",
      },
      {
        id: "ca-28",
        title: "The Unfinished Journey",
        content:
          "Kafka never finished the novel; K. never reaches the Castle. The incompleteness becomes part of its meaning — some quests have no arrival.",
      },
      {
        id: "ca-29",
        title: "No Arrival, Only Pursuit",
        content:
          "The book suggests the pursuit may be all there is. Meaning, if any, must be found in the striving, not the destination.",
      },
      {
        id: "ca-30",
        title: "Alienation of the Modern Soul",
        content:
          "K.'s estrangement mirrors modern life: surrounded by people and institutions, yet fundamentally unrecognized and alone.",
      },
      {
        id: "ca-31",
        title: "The Individual vs the Institution",
        content:
          "One person stands against an immense, faceless structure. Kafka returns again to the powerlessness of the individual before the system.",
      },
      {
        id: "ca-32",
        title: "Belonging as a Basic Need",
        content:
          "The novel lays bare how deeply we need a place and a purpose — and how devastating it is to be denied them.",
      },
      {
        id: "ca-33",
        title: "The Trap of Legitimacy",
        content:
          "K. wants the system to validate him, handing it power over his worth. Seeking legitimacy from an indifferent authority becomes a snare.",
      },
      {
        id: "ca-34",
        title: "Papers and Permissions",
        content:
          "Documents, stamps, and approvals rule the village. Kafka satirizes a world where a human's reality depends on official paperwork.",
      },
      {
        id: "ca-35",
        title: "The Kafkaesque Maze",
        content:
          "The Castle is a labyrinth with no center you can reach. It embodies the Kafkaesque: circular, absurd, and quietly suffocating.",
      },
      {
        id: "ca-36",
        title: "Persistence Against the Absurd",
        content:
          "Despite futility, K. never stops trying. There is a stubborn, almost heroic dignity in his refusal to give up.",
      },
      {
        id: "ca-37",
        title: "The Dignity of Trying",
        content:
          "Even if the Castle can't be reached, K.'s persistence affirms the human will to seek meaning against impossible odds.",
      },
      {
        id: "ca-38",
        title: "Meaning We Make Ourselves",
        content:
          "Since the Castle grants no meaning, any sense of purpose must come from within K. The novel points, quietly, toward self-made meaning.",
      },
      {
        id: "ca-39",
        title: "Faith Without Certainty",
        content:
          "K. keeps believing in a resolution he has no proof exists. Kafka turns the quest into a study of faith held in the dark.",
      },
      {
        id: "ca-40",
        title: "The Village's Fatalism",
        content:
          "The villagers have surrendered to the Castle's power as simply how things are. Kafka shows how oppression becomes normalized over time.",
      },
      {
        id: "ca-41",
        title: "The Officials' Indifference",
        content:
          "Those with power show no malice toward K. — only indifference, which proves just as crushing as cruelty.",
      },
      {
        id: "ca-42",
        title: "Time Dissolves in Waiting",
        content:
          "Days blur as K. waits and negotiates. The novel captures how bureaucratic limbo warps our very sense of time.",
      },
      {
        id: "ca-43",
        title: "The Reader Shares K.'s Frustration",
        content:
          "Kafka makes us feel the runaround alongside K. Our own frustration becomes part of understanding his ordeal.",
      },
      {
        id: "ca-44",
        title: "An Allegory of Life",
        content:
          "Many see the whole novel as life itself: a striving toward goals and acceptance we pursue without ever fully arriving.",
      },
      {
        id: "ca-45",
        title: "The Absurd Hero",
        content:
          "Like Sisyphus, K. persists at a task that will never be complete. There is meaning, Kafka hints, in the persistence itself.",
      },
      {
        id: "ca-46",
        title: "Systems Beyond Reason",
        content:
          "The Castle can't be reasoned with because it doesn't run on reason. Kafka warns of institutions that have outgrown logic and mercy.",
      },
      {
        id: "ca-47",
        title: "The Human Need for Answers",
        content:
          "K.'s craving for clarity in an unclear world is deeply relatable. We, too, keep demanding answers reality won't give.",
      },
      {
        id: "ca-48",
        title: "Connection vs Ambition",
        content:
          "K.'s obsession with the Castle strains his human ties. The novel quietly asks whether we sacrifice real connection chasing recognition.",
      },
      {
        id: "ca-49",
        title: "The Cold Comfort of Routine",
        content:
          "The village clings to its routines under the Castle's shadow. Kafka observes how people find fragile comfort even under arbitrary power.",
      },
      {
        id: "ca-50",
        title: "Interpretations Abound",
        content:
          "Religious, political, existential — The Castle invites endless readings. Its unfinished ambiguity is a feature, not a flaw.",
      },
      {
        id: "ca-51",
        title: "A Mirror for Our Institutions",
        content:
          "Anyone who has fought an unresponsive system will feel the novel's truth. It remains a sharp mirror of modern bureaucratic life.",
      },
      {
        id: "ca-52",
        title: "The Endless Approach",
        content:
          "K. is always approaching, never arriving. The Castle captures the peculiar modern condition of forever striving toward the just-out-of-reach.",
      },
      {
        id: "ca-53",
        title: "Why It Endures",
        content:
          "The Castle lasts because its frustration is universal: the longing to belong, to be recognized, and to understand a world that refuses to explain itself.",
      },
    ],
  },

  // Letters to Milena — Franz Kafka
  "bk-004": {
    bookId: "bk-004",
    tagline: "Kafka's raw, tender love letters — the soul behind the fiction",
    updated: "2026-07",
    frames: [
      {
        id: "lm-1",
        title: "Love Through Letters",
        content:
          "These are Kafka's real letters to Milena Jesenská, the journalist who translated his work. In them we meet not the myth but the man, in love and in fear.",
      },
      {
        id: "lm-2",
        title: "The Kafka Behind the Fiction",
        content:
          "Where his novels are cold and strange, the letters are warm, aching, and intimate. They reveal the tender heart beneath the famous dread.",
      },
      {
        id: "lm-3",
        title: "Words as Intimacy",
        content:
          "Separated by distance and circumstance, Kafka builds closeness through language alone. The letters show how deeply two people can meet on the page.",
      },
      {
        id: "lm-4",
        title: "Longing Across Distance",
        content:
          "Much of the relationship lived in absence and anticipation. Kafka captures the sweet torment of loving someone you rarely get to hold.",
      },
      {
        id: "lm-5",
        title: "The Terror of Intimacy",
        content:
          "Kafka craves closeness yet is terrified by it. The letters lay bare the war between the longing to be loved and the fear of being truly known.",
      },
      {
        id: "lm-6",
        title: "Fear and Desire Entwined",
        content:
          "For Kafka, love and anxiety are inseparable. He writes of wanting Milena desperately while dreading what wanting could do to him.",
      },
      {
        id: "lm-7",
        title: "Writing as a Lifeline",
        content:
          "For Kafka, writing was survival. In these letters, the act of writing to Milena becomes a way to stay tethered to life and to another soul.",
      },
      {
        id: "lm-8",
        title: "Vulnerability on the Page",
        content:
          "Kafka hides nothing — his doubts, dreams, and dark moods pour out. The letters are a masterclass in emotional honesty.",
      },
      {
        id: "lm-9",
        title: "Self-Doubt and Unworthiness",
        content:
          "He often feels undeserving of Milena's love. The letters reveal a man haunted by the sense that he isn't enough.",
      },
      {
        id: "lm-10",
        title: "The Impossible Relationship",
        content:
          "Milena was married, and circumstances kept them apart. The love unfolds under the shadow of its own impossibility.",
      },
      {
        id: "lm-11",
        title: "Honesty to the Bone",
        content:
          "Kafka refuses comforting lies, even to himself. His radical honesty about fear and desire makes the letters piercingly real.",
      },
      {
        id: "lm-12",
        title: "The Ghosts of Letters",
        content:
          "Kafka famously feared that letters let ghosts drink the kisses meant for lovers. He longed for presence that words could never replace.",
      },
      {
        id: "lm-13",
        title: "Presence vs Absence",
        content:
          "The letters ache with the gap between written intimacy and physical presence. Kafka feels the limits of love conducted on paper.",
      },
      {
        id: "lm-14",
        title: "The Fear of Happiness",
        content:
          "Kafka distrusts joy, half-expecting it to be snatched away. He shows how some people struggle to let themselves be happy.",
      },
      {
        id: "lm-15",
        title: "Illness and Mortality",
        content:
          "Writing while ill with tuberculosis, Kafka's awareness of death colors the letters, lending his tenderness an urgent fragility.",
      },
      {
        id: "lm-16",
        title: "The Body and the Soul",
        content:
          "Kafka wrestles with the gulf between physical longing and spiritual connection. The letters explore love in both its forms.",
      },
      {
        id: "lm-17",
        title: "Sleepless Nights",
        content:
          "Insomnia and anxiety thread through the letters. Kafka writes from the small hours, when fears and longings loom largest.",
      },
      {
        id: "lm-18",
        title: "The Torture of Waiting",
        content:
          "Each unanswered letter is agony. Kafka captures how love makes us hostages to the next word from the beloved.",
      },
      {
        id: "lm-19",
        title: "Language and Translation",
        content:
          "Milena translated Kafka's work; their bond was built partly through language itself. Words were both their medium and their meeting place.",
      },
      {
        id: "lm-20",
        title: "Being Truly Seen",
        content:
          "Milena understood Kafka as few did. The letters reveal the rare relief and terror of being genuinely seen by another.",
      },
      {
        id: "lm-21",
        title: "The Courage to Be Known",
        content:
          "To love, Kafka must let himself be known — the very thing that frightens him most. The letters trace that trembling courage.",
      },
      {
        id: "lm-22",
        title: "Tenderness and Restraint",
        content:
          "Kafka's affection is deep yet often held back by fear. The push and pull of tenderness and restraint gives the letters their tension.",
      },
      {
        id: "lm-23",
        title: "Love as Salvation and Threat",
        content:
          "Milena is both K.'s hope of rescue and a source of overwhelming fear. Love, for Kafka, is salvation and danger at once.",
      },
      {
        id: "lm-24",
        title: "The Writer's Solitude",
        content:
          "Kafka needed solitude to write yet ached for connection. The letters expose the lonely bargain many artists make.",
      },
      {
        id: "lm-25",
        title: "Dependence on Another",
        content:
          "Kafka's moods rise and fall with Milena's letters. He reveals, unguarded, how love can make us reliant on another's smallest sign.",
      },
      {
        id: "lm-26",
        title: "The Small Details of Devotion",
        content:
          "Kafka lingers over tiny things — a phrase, a photograph, a memory. Love lives in the details he can't stop turning over.",
      },
      {
        id: "lm-27",
        title: "Jealousy and Insecurity",
        content:
          "Kafka's insecurities surface as worry and jealousy. The letters show love's shadow side with unflinching candor.",
      },
      {
        id: "lm-28",
        title: "The Purity of Longing",
        content:
          "Even unfulfilled, Kafka's longing has a purity and intensity. Sometimes the yearning itself becomes the love story.",
      },
      {
        id: "lm-29",
        title: "Words Chosen With Care",
        content:
          "Every sentence is crafted with a writer's precision and a lover's feeling. The letters are literature and confession in one.",
      },
      {
        id: "lm-30",
        title: "The Fragility of Connection",
        content:
          "Built on paper and distance, the bond feels perpetually at risk. Kafka is acutely aware of how easily it could break.",
      },
      {
        id: "lm-31",
        title: "Confession and Catharsis",
        content:
          "Writing to Milena lets Kafka release what he can't say aloud. The letters double as confession, therapy, and art.",
      },
      {
        id: "lm-32",
        title: "The Wish to Dissolve Into Another",
        content:
          "Kafka expresses a longing to merge with the beloved, to lose himself in her. It is love at its most consuming and vulnerable.",
      },
      {
        id: "lm-33",
        title: "The Limits of Letters",
        content:
          "For all their beauty, the letters can't bridge every gap. Kafka feels keenly what words leave undone.",
      },
      {
        id: "lm-34",
        title: "Sensitivity as Gift and Curse",
        content:
          "Kafka's extraordinary sensitivity makes him a great writer and a suffering lover. The same nerve feels both beauty and pain intensely.",
      },
      {
        id: "lm-35",
        title: "The Ache of the Unlived Life",
        content:
          "Beneath the romance runs grief for the fuller life Kafka fears he'll never live. The letters mourn possibilities as much as they celebrate love.",
      },
      {
        id: "lm-36",
        title: "Honesty About Fear",
        content:
          "Kafka names his fears rather than hiding them. There is strange strength in his willingness to be openly afraid.",
      },
      {
        id: "lm-37",
        title: "Love Amid Anxiety",
        content:
          "The letters show love not as serene but as tangled with dread — a truer portrait than any fairy tale.",
      },
      {
        id: "lm-38",
        title: "The Space Between Two People",
        content:
          "Kafka meditates on the unbridgeable distance that remains even between lovers. Two souls can draw close yet never fully merge.",
      },
      {
        id: "lm-39",
        title: "Letting Go",
        content:
          "As the relationship fades, Kafka's letters turn toward release. He shows the quiet grief of loving something you must let go.",
      },
      {
        id: "lm-40",
        title: "What Remains",
        content:
          "Though the romance ended, the letters endure as one of literature's most moving records of the human heart.",
      },
      {
        id: "lm-41",
        title: "A Portrait of the Inner Kafka",
        content:
          "Read alongside his fiction, the letters explain the man: the same fear, alienation, and longing, here turned toward love.",
      },
      {
        id: "lm-42",
        title: "The Beauty of Imperfect Love",
        content:
          "This is love that is anxious, incomplete, and doomed — and yet luminous. Kafka finds beauty precisely in its imperfection.",
      },
      {
        id: "lm-43",
        title: "Vulnerability as Strength",
        content:
          "In baring his fears, Kafka models a rare emotional bravery. The letters suggest that real intimacy requires exactly this openness.",
      },
      {
        id: "lm-44",
        title: "The Comfort of Being Understood",
        content:
          "Kafka's deepest relief is Milena's understanding. The letters remind us how healing it is simply to be understood.",
      },
      {
        id: "lm-45",
        title: "Distance Makes the Heart Ache",
        content:
          "The physical separation intensifies every feeling. Kafka shows how longing can magnify love into something almost unbearable.",
      },
      {
        id: "lm-46",
        title: "Words That Outlive Us",
        content:
          "Kafka's private letters, never meant for us, now speak to millions. Sincere words, it turns out, echo far beyond their moment.",
      },
      {
        id: "lm-47",
        title: "The Human Behind the Legend",
        content:
          "The letters humanize a literary icon. Kafka emerges not as a distant genius but as a fragile, feeling man like any of us.",
      },
      {
        id: "lm-48",
        title: "Love Documented",
        content:
          "Few relationships are recorded so intimately from within. The letters are a rare, unguarded diary of a heart in love.",
      },
      {
        id: "lm-49",
        title: "A Lesson in Feeling Deeply",
        content:
          "Kafka teaches, by example, the cost and beauty of feeling everything fully. To love like this is to risk — and to live.",
      },
      {
        id: "lm-50",
        title: "The Timeless Human Heart",
        content:
          "A century later, Kafka's longing, fear, and tenderness feel utterly current. The letters prove the human heart hasn't changed at all.",
      },
    ],
  },

  // How to Treat Her Right? — Gautam Grover
  "bk-388": {
    bookId: "bk-388",
    tagline: "A practical guide for men on respect, communication and lasting love",
    updated: "2026-07",
    frames: [
      {
        id: "hr-1",
        title: "Treating Her Right Is a Skill",
        content:
          "Loving well isn't instinct — it's a set of habits you can learn. This guide reframes being a good partner as a skill any man can build with intention.",
      },
      {
        id: "hr-2",
        title: "Respect Is the Foundation",
        content:
          "Everything good in a relationship grows from respect. Treat her as an equal whose thoughts, feelings, and choices genuinely matter.",
      },
      {
        id: "hr-3",
        title: "Love Is Shown, Not Just Said",
        content:
          "Words are easy; consistent actions prove love. She feels cared for through what you do daily, not just what you declare.",
      },
      {
        id: "hr-4",
        title: "Listen to Understand",
        content:
          "Give her your full attention and listen to truly understand, not just to respond. Feeling heard is one of the deepest forms of love.",
      },
      {
        id: "hr-5",
        title: "Don't Fix — Empathize",
        content:
          "Often she wants understanding, not solutions. Resist the urge to fix; sometimes the most loving response is simply, 'that sounds hard.'",
      },
      {
        id: "hr-6",
        title: "Validate Her Feelings",
        content:
          "Never dismiss what she feels as an overreaction. Acknowledging emotions, even ones you don't share, builds safety and closeness.",
      },
      {
        id: "hr-7",
        title: "Emotional Intelligence Matters",
        content:
          "Learn to read and manage emotions — hers and yours. Emotional awareness is what turns a good man into a great partner.",
      },
      {
        id: "hr-8",
        title: "Communicate Openly",
        content:
          "Share your thoughts and feelings instead of bottling them up. Open, honest communication prevents small issues from festering into big ones.",
      },
      {
        id: "hr-9",
        title: "Honesty Builds Trust",
        content:
          "Trust is the currency of love, and honesty is how you earn it. Even hard truths, shared kindly, strengthen the bond.",
      },
      {
        id: "hr-10",
        title: "Consistency Over Grand Gestures",
        content:
          "A steady stream of small kindnesses matters more than occasional big romantic displays. Reliability is deeply romantic.",
      },
      {
        id: "hr-11",
        title: "Small Gestures, Big Impact",
        content:
          "A thoughtful text, a cup of tea, a remembered preference — tiny gestures tell her she's on your mind, and they add up.",
      },
      {
        id: "hr-12",
        title: "Give Quality Time",
        content:
          "Presence is a gift. Set aside undistracted time together where she has your full, undivided attention.",
      },
      {
        id: "hr-13",
        title: "Put Away the Phone",
        content:
          "Nothing says 'you matter less than this screen' like scrolling while she talks. Being fully present is a daily act of love.",
      },
      {
        id: "hr-14",
        title: "Appreciate Her Daily",
        content:
          "Notice and thank her for what she does, big and small. Feeling appreciated keeps love alive far more than being taken for granted kills it.",
      },
      {
        id: "hr-15",
        title: "Notice the Little Things",
        content:
          "Remember her favourite things, her worries, her wins. Attention to detail proves you truly see her.",
      },
      {
        id: "hr-16",
        title: "Support Her Dreams",
        content:
          "Champion her ambitions instead of competing with them. A partner who believes in her goals becomes her safe place to grow.",
      },
      {
        id: "hr-17",
        title: "Be Her Biggest Cheerleader",
        content:
          "Celebrate her successes without envy or ego. Being genuinely happy for her is one of love's purest expressions.",
      },
      {
        id: "hr-18",
        title: "Partnership, Not Ownership",
        content:
          "She is your partner, not your possession. Treating the relationship as a team of equals is the heart of treating her right.",
      },
      {
        id: "hr-19",
        title: "Share the Load",
        content:
          "Split responsibilities and chores fairly. Carrying your share of the everyday burden is a concrete, powerful form of respect.",
      },
      {
        id: "hr-20",
        title: "Control Is Not Love",
        content:
          "Monitoring, restricting, or dictating her life isn't love — it's control. Real love gives freedom, not surveillance.",
      },
      {
        id: "hr-21",
        title: "Jealousy Is Not Affection",
        content:
          "Possessive jealousy signals insecurity, not devotion. Secure love trusts rather than polices.",
      },
      {
        id: "hr-22",
        title: "Give Her Space",
        content:
          "Healthy love includes room to breathe — her own friends, hobbies, and time. Space strengthens a relationship rather than threatening it.",
      },
      {
        id: "hr-23",
        title: "Trust Her",
        content:
          "Extend trust freely unless truly given reason not to. Suspicion corrodes love, while trust lets it flourish.",
      },
      {
        id: "hr-24",
        title: "Loyalty Above All",
        content:
          "Faithfulness in action, word, and attention is non-negotiable. Loyalty is the bedrock she builds her security on.",
      },
      {
        id: "hr-25",
        title: "Handle Conflict Calmly",
        content:
          "Disagreements are normal; how you handle them defines the relationship. Stay calm, stay kind, and attack the problem, not her.",
      },
      {
        id: "hr-26",
        title: "Never Win by Wounding",
        content:
          "Scoring points by hurting her means the relationship loses. In love, the goal is resolution, not victory.",
      },
      {
        id: "hr-27",
        title: "Apologize Sincerely",
        content:
          "A real apology owns the mistake without excuses. Saying sorry — and meaning it — heals wounds that pride would only deepen.",
      },
      {
        id: "hr-28",
        title: "Own Your Mistakes",
        content:
          "Defensiveness blocks growth. Admitting when you're wrong shows maturity and makes her feel safe to be honest too.",
      },
      {
        id: "hr-29",
        title: "Affection Beyond the Physical",
        content:
          "Tenderness lives in more than intimacy — a hug, a hand held, a kind word. Everyday affection keeps emotional closeness alive.",
      },
      {
        id: "hr-30",
        title: "Romance Doesn't End",
        content:
          "Courtship shouldn't stop after commitment. Keep dating her, surprising her, and pursuing her long after the relationship is settled.",
      },
      {
        id: "hr-31",
        title: "Keep Dating Her",
        content:
          "Plan time together, dress up, make an effort. Continuing to court her tells her she's still worth winning.",
      },
      {
        id: "hr-32",
        title: "Protect Her Dignity",
        content:
          "Never mock or criticize her, especially in front of others. Guarding her dignity publicly and privately is a mark of true respect.",
      },
      {
        id: "hr-33",
        title: "Never Belittle Her",
        content:
          "Sarcasm and put-downs quietly erode love. Speak to her — and about her — with the respect you'd want for yourself.",
      },
      {
        id: "hr-34",
        title: "Be Reliable",
        content:
          "Do what you say you'll do. Dependability turns you into someone she can lean on without fear of being let down.",
      },
      {
        id: "hr-35",
        title: "Keep Your Promises",
        content:
          "Broken promises are withdrawals from trust. Keeping even small commitments proves your word means something.",
      },
      {
        id: "hr-36",
        title: "Patience in Hard Times",
        content:
          "Love is tested in difficulty, not ease. Standing by her patiently through stress and struggle is when it matters most.",
      },
      {
        id: "hr-37",
        title: "Stand By Her",
        content:
          "Be her ally against the world, not another critic. Knowing you're on her side gives her strength and security.",
      },
      {
        id: "hr-38",
        title: "Encourage, Don't Criticize",
        content:
          "Lift her up with encouragement rather than constant correction. People bloom under support and wilt under nagging.",
      },
      {
        id: "hr-39",
        title: "Understand Her Love Language",
        content:
          "People feel loved differently — words, time, touch, gifts, or acts. Learn how she best receives love and give it in her language.",
      },
      {
        id: "hr-40",
        title: "Learn What She Needs",
        content:
          "Ask, observe, and adapt to what actually makes her feel cared for. Assuming her needs match yours is a common mistake.",
      },
      {
        id: "hr-41",
        title: "Grow Together",
        content:
          "Keep learning and evolving as a couple. Relationships thrive when both partners keep growing side by side.",
      },
      {
        id: "hr-42",
        title: "Nurture Friendship",
        content:
          "The strongest couples are best friends. Cultivate the easy companionship beneath the romance.",
      },
      {
        id: "hr-43",
        title: "Laugh Together",
        content:
          "Shared humour is glue. Keeping playfulness and laughter alive lightens the hard days and deepens the good ones.",
      },
      {
        id: "hr-44",
        title: "Respect Her Family and Friends",
        content:
          "The people she loves matter to her. Treating them with warmth and grace is a way of honouring her.",
      },
      {
        id: "hr-45",
        title: "Financial Respect and Transparency",
        content:
          "Handle money as a team with honesty and fairness. Financial secrecy or control breeds resentment; openness builds partnership.",
      },
      {
        id: "hr-46",
        title: "Security, Not Suffocation",
        content:
          "Offer steady reassurance without clinging. Healthy love makes her feel safe and free at the same time.",
      },
      {
        id: "hr-47",
        title: "Make Her Feel Safe",
        content:
          "Emotional safety means she can be fully herself without fear of judgment. Creating that safety is one of your most important jobs.",
      },
      {
        id: "hr-48",
        title: "Be Emotionally Available",
        content:
          "Don't shut down or stonewall when things get hard. Staying emotionally open, even when uncomfortable, keeps connection alive.",
      },
      {
        id: "hr-49",
        title: "Grow Your Own Self First",
        content:
          "You can't pour from an empty cup. Working on your own confidence, health, and character makes you a better partner too.",
      },
      {
        id: "hr-50",
        title: "Love Is a Daily Choice",
        content:
          "Feelings ebb and flow, but love is chosen and renewed each day through your actions. Choose her, actively, again and again.",
      },
      {
        id: "hr-51",
        title: "Never Take Her for Granted",
        content:
          "Complacency kills relationships slowly. Keep valuing her presence as the gift it is, not a guarantee you're owed.",
      },
      {
        id: "hr-52",
        title: "A Woman Treated Right",
        content:
          "Given respect, honesty, presence, and consistent love, she thrives — and so does the relationship. Treat her right, and you both win.",
      },
    ],
  },

  // The 7 Habits of Highly Effective People — Stephen R. Covey
  "bk-308": {
    bookId: "bk-308",
    tagline: "Powerful lessons in personal change, built on timeless principles",
    updated: "2026-07",
    frames: [
      {
        id: "sh-1",
        title: "Effectiveness Rests on Principles",
        content:
          "Covey argues lasting success comes from aligning your life with timeless principles like integrity, fairness, and service — not clever shortcuts.",
      },
      {
        id: "sh-2",
        title: "Character Over Personality",
        content:
          "The modern world sells the 'personality ethic' of image and technique. Covey champions the deeper 'character ethic' of who you truly are.",
      },
      {
        id: "sh-3",
        title: "Paradigms Shape Everything",
        content:
          "We each carry mental maps of how the world works. These paradigms filter everything we see, so changing them changes our whole experience.",
      },
      {
        id: "sh-4",
        title: "The Power of a Paradigm Shift",
        content:
          "When you see a situation in a genuinely new way, behaviour changes effortlessly. Real transformation is a shift in perception, not just effort.",
      },
      {
        id: "sh-5",
        title: "We See the World As We Are",
        content:
          "You don't see the world as it is, but as you are. Self-awareness of your own lens is the beginning of growth.",
      },
      {
        id: "sh-6",
        title: "What a Habit Is",
        content:
          "Covey defines a habit as the intersection of knowledge (what to do), skill (how to do it), and desire (wanting to do it). All three are needed.",
      },
      {
        id: "sh-7",
        title: "The Maturity Continuum",
        content:
          "Growth moves from dependence ('you take care of me') to independence ('I take care of myself') to interdependence ('we can do more together').",
      },
      {
        id: "sh-8",
        title: "Interdependence Is Highest",
        content:
          "Independence is a milestone, not the summit. The most effective people combine self-reliance with the power of working well with others.",
      },
      {
        id: "sh-9",
        title: "The P/PC Balance",
        content:
          "Effectiveness balances Production (results) with Production Capability (the resource that makes results possible). Push only for eggs and you kill the goose.",
      },
      {
        id: "sh-10",
        title: "Care for the Goose",
        content:
          "Whether it's your health, relationships, or tools, protect the capacity that produces your results. Sustainable success tends both.",
      },
      {
        id: "sh-11",
        title: "Habit 1 — Be Proactive",
        content:
          "Between stimulus and response lies your freedom to choose. Proactive people take responsibility rather than blaming conditions or others.",
      },
      {
        id: "sh-12",
        title: "Response-Ability",
        content:
          "You have the ability to choose your response to anything. Reactive people are driven by feelings; proactive people are driven by values.",
      },
      {
        id: "sh-13",
        title: "Circle of Concern vs Influence",
        content:
          "The Circle of Concern holds everything you worry about; the Circle of Influence holds what you can actually affect. Focus determines which one grows.",
      },
      {
        id: "sh-14",
        title: "Focus on What You Control",
        content:
          "Pour energy into your Circle of Influence and it expands. Obsess over things you can't control and you shrink your own power.",
      },
      {
        id: "sh-15",
        title: "The Language of the Proactive",
        content:
          "Swap 'I have to' and 'there's nothing I can do' for 'I choose to' and 'let me look at my options.' Words reveal and shape mindset.",
      },
      {
        id: "sh-16",
        title: "Habit 2 — Begin With the End in Mind",
        content:
          "Start with a clear vision of your desired destination. Knowing where you're going ensures every step actually moves you toward it.",
      },
      {
        id: "sh-17",
        title: "The Two Creations",
        content:
          "Everything is created twice — first mentally, then physically. Design your life on purpose in your mind before living it out.",
      },
      {
        id: "sh-18",
        title: "Write a Personal Mission Statement",
        content:
          "Define your core values and life aims in a personal mission statement. It becomes a constitution for making tough decisions.",
      },
      {
        id: "sh-19",
        title: "Imagine Your Own Funeral",
        content:
          "Covey's famous exercise: picture what you'd want said at your funeral. Working backward from that clarifies what truly matters now.",
      },
      {
        id: "sh-20",
        title: "Be the Author of Your Life",
        content:
          "Without a vision of your own, you live out someone else's script. Begin with the end in mind to author your own story.",
      },
      {
        id: "sh-21",
        title: "Habit 3 — Put First Things First",
        content:
          "Discipline yourself to act on your priorities, not just your urges. Habit 3 is the physical creation of the vision from Habit 2.",
      },
      {
        id: "sh-22",
        title: "The Time Management Matrix",
        content:
          "Tasks fall into four quadrants by urgency and importance. Effectiveness means spending less time firefighting and more on what's important.",
      },
      {
        id: "sh-23",
        title: "Urgent vs Important",
        content:
          "Urgent things shout for attention; important things quietly shape your future. Don't let the urgent crowd out the important.",
      },
      {
        id: "sh-24",
        title: "Live in Quadrant II",
        content:
          "Quadrant II — important but not urgent — holds planning, growth, and relationships. Investing here prevents crises before they start.",
      },
      {
        id: "sh-25",
        title: "Schedule Your Priorities",
        content:
          "Don't just prioritize your schedule; schedule your priorities. Put the big rocks in first, and let the small stuff fit around them.",
      },
      {
        id: "sh-26",
        title: "Learn to Say No",
        content:
          "Every yes to the trivial is a no to the vital. Saying no gracefully protects the time your real priorities deserve.",
      },
      {
        id: "sh-27",
        title: "The Private Victory",
        content:
          "Habits 1 through 3 build self-mastery — the 'private victory' of becoming independent before you try to work well with others.",
      },
      {
        id: "sh-28",
        title: "Habit 4 — Think Win-Win",
        content:
          "Seek agreements and solutions where everyone benefits. Win-win isn't soft; it's the belief that success isn't a zero-sum game.",
      },
      {
        id: "sh-29",
        title: "Abundance Mentality",
        content:
          "A scarcity mindset sees a fixed pie and fears others' success. An abundance mindset believes there's plenty for all — and shares credit freely.",
      },
      {
        id: "sh-30",
        title: "Win-Win or No Deal",
        content:
          "If a true win-win can't be found, sometimes the best option is no deal. Better no agreement than one that breeds resentment.",
      },
      {
        id: "sh-31",
        title: "The Emotional Bank Account",
        content:
          "Every kindness, promise kept, and honest word is a deposit of trust. Every slight or broken promise is a withdrawal.",
      },
      {
        id: "sh-32",
        title: "Make Deposits of Trust",
        content:
          "Strong relationships run on high trust balances. Consistent small deposits — courtesy, integrity, apologies — build the reserves that carry you through conflict.",
      },
      {
        id: "sh-33",
        title: "Habit 5 — Seek First to Understand",
        content:
          "Most people listen only to reply. Covey urges you to truly understand the other person before trying to be understood yourself.",
      },
      {
        id: "sh-34",
        title: "Empathic Listening",
        content:
          "Listen with the intent to understand, not to answer. Empathic listening gets inside another's frame of reference and makes them feel heard.",
      },
      {
        id: "sh-35",
        title: "Diagnose Before You Prescribe",
        content:
          "A good doctor understands before prescribing; so should you. Rushing to advise before understanding breaks trust and misses the real issue.",
      },
      {
        id: "sh-36",
        title: "Then to Be Understood",
        content:
          "Once you've truly understood, you've earned the right — and the audience — to share your own view clearly and be heard.",
      },
      {
        id: "sh-37",
        title: "Habit 6 — Synergize",
        content:
          "Synergy means the whole is greater than the sum of its parts. Creative cooperation produces solutions no one could reach alone.",
      },
      {
        id: "sh-38",
        title: "Value the Differences",
        content:
          "Differences aren't obstacles; they're the raw material of synergy. Genuinely valuing other viewpoints unlocks better answers.",
      },
      {
        id: "sh-39",
        title: "The Third Alternative",
        content:
          "Beyond 'my way' and 'your way' lies a better third way, created together. Synergy searches for that superior alternative.",
      },
      {
        id: "sh-40",
        title: "The Public Victory",
        content:
          "Habits 4 through 6 build effective relationships — the 'public victory' of interdependence that multiplies what you can achieve.",
      },
      {
        id: "sh-41",
        title: "Habit 7 — Sharpen the Saw",
        content:
          "A woodcutter too busy sawing to sharpen the blade works ever harder for less. Habit 7 is renewing yourself so the other six stay effective.",
      },
      {
        id: "sh-42",
        title: "Renew Four Dimensions",
        content:
          "Sharpen the saw across four areas: physical, mental, social/emotional, and spiritual. Neglect any one and the whole self weakens.",
      },
      {
        id: "sh-43",
        title: "Physical Renewal",
        content:
          "Exercise, nutrition, and rest maintain the body that carries everything else. Caring for it is caring for your capacity to perform.",
      },
      {
        id: "sh-44",
        title: "Mental Renewal",
        content:
          "Reading, learning, writing, and planning keep the mind sharp. A mind that stops growing slowly dulls.",
      },
      {
        id: "sh-45",
        title: "Social/Emotional Renewal",
        content:
          "Meaningful relationships and service refill your emotional reserves. Connection and contribution renew the heart.",
      },
      {
        id: "sh-46",
        title: "Spiritual Renewal",
        content:
          "Time in reflection, nature, prayer, or values-clarifying keeps you centered on principle. It is the core that steadies all the rest.",
      },
      {
        id: "sh-47",
        title: "The Upward Spiral",
        content:
          "Renewal fuels growth, which enables more renewal. Living the habits creates an upward spiral of learning, committing, and doing.",
      },
      {
        id: "sh-48",
        title: "Principle-Centered Living",
        content:
          "Center your life on principles rather than on work, money, or approval. Principles don't shift, so they give steady footing in any storm.",
      },
      {
        id: "sh-49",
        title: "Integrity in the Moment of Choice",
        content:
          "Character is built in small daily choices to honor your commitments. Integrity is keeping promises to yourself and others.",
      },
      {
        id: "sh-50",
        title: "Inside-Out Change",
        content:
          "Covey's approach starts within: change yourself before trying to change circumstances or people. Private victories precede public ones.",
      },
      {
        id: "sh-51",
        title: "Proactivity Is the Foundation",
        content:
          "Every other habit rests on the choice to be proactive. Owning your responses is the root of all personal effectiveness.",
      },
      {
        id: "sh-52",
        title: "Vision Guides Action",
        content:
          "A clear personal mission turns scattered effort into focused progress. Know your end, and daily choices align themselves.",
      },
      {
        id: "sh-53",
        title: "Trust Is the Glue",
        content:
          "The public habits all depend on trust. Without healthy emotional bank accounts, win-win, listening, and synergy fall apart.",
      },
      {
        id: "sh-54",
        title: "Effectiveness Is Sustainable",
        content:
          "The habits aim not at a quick win but at lasting effectiveness — results today without sacrificing your capacity for tomorrow.",
      },
      {
        id: "sh-55",
        title: "Balance and Renewal",
        content:
          "Sharpening the saw keeps you from burning out. Regular renewal is what lets the other six habits work over a lifetime.",
      },
      {
        id: "sh-56",
        title: "Small Habits, Big Character",
        content:
          "We are what we repeatedly do. Practiced consistently, these seven habits reshape not just what you achieve but who you become.",
      },
      {
        id: "sh-57",
        title: "From Independence to Legacy",
        content:
          "Master yourself, build trust, cooperate creatively, and keep renewing — and your influence grows into a lasting, principled legacy.",
      },
      {
        id: "sh-58",
        title: "Live the 7 Habits",
        content:
          "Be proactive, begin with the end in mind, put first things first, think win-win, seek to understand, synergize, and sharpen the saw. Together, they build a truly effective life.",
      },
    ],
  },

  // Breaking the Habit of Being Yourself — Dr. Joe Dispenza
  "bk-132": {
    bookId: "bk-132",
    tagline: "How to lose your mind and create a new one",
    updated: "2026-07",
    frames: [
      {
        id: "bh-1",
        title: "Breaking the Habit of Being Yourself",
        content:
          "Dispenza's premise: you have become a habit. To change your life, you must break the automatic patterns of thinking, feeling, and acting that keep recreating the same you.",
      },
      {
        id: "bh-2",
        title: "You Are a Set of Habits",
        content:
          "Most of who you are runs on autopilot — memorized routines of thought and emotion. Change means becoming conscious of these habits and rewriting them.",
      },
      {
        id: "bh-3",
        title: "Personality Creates Personal Reality",
        content:
          "Your personality — your thoughts, actions, and feelings — creates your personal reality. Keep the same personality and you keep the same life.",
      },
      {
        id: "bh-4",
        title: "The Same Self, the Same Life",
        content:
          "If you want a new reality, you can't keep being the same person. A new life requires becoming, in a real sense, someone new.",
      },
      {
        id: "bh-5",
        title: "Most of You Is on Autopilot",
        content:
          "A large share of daily behaviour is driven by subconscious programs. You can't change what you don't first make conscious.",
      },
      {
        id: "bh-6",
        title: "The Subconscious Programs",
        content:
          "By adulthood we run on a stored set of automatic reactions. Real transformation means reaching and rewriting that programming.",
      },
      {
        id: "bh-7",
        title: "The Thought-Feeling Loop",
        content:
          "Your thoughts create feelings and your feelings drive more thoughts, spinning the same cycle. This loop keeps your state — and life — fixed.",
      },
      {
        id: "bh-8",
        title: "The Body as Unconscious Mind",
        content:
          "Repeat an emotional state long enough and the body memorizes it, running it without your permission. The body becomes the mind.",
      },
      {
        id: "bh-9",
        title: "Living in the Past",
        content:
          "Reliving old emotions keeps your biology anchored to yesterday. You can't create a new future while emotionally living in the past.",
      },
      {
        id: "bh-10",
        title: "Memorized Emotions",
        content:
          "Emotions from past events get memorized and replayed for years. These stored feelings quietly define your personality.",
      },
      {
        id: "bh-11",
        title: "Emotional Addiction",
        content:
          "The body can grow addicted to the chemistry of familiar emotions — even negative ones — and unconsciously seeks situations that trigger them.",
      },
      {
        id: "bh-12",
        title: "Survival vs Creation",
        content:
          "Living in stress emotions keeps you in survival mode, focused on the body, environment, and time. Creation requires a calmer, expanded state.",
      },
      {
        id: "bh-13",
        title: "Stress Keeps You Stuck",
        content:
          "Chronic stress narrows your focus and your biology. It is the very state that reinforces the old self you're trying to change.",
      },
      {
        id: "bh-14",
        title: "Three Things Hold You Back",
        content:
          "Your environment, your body, and time conspire to keep you the same. Transformation means rising above all three.",
      },
      {
        id: "bh-15",
        title: "Bigger Than Your Environment",
        content:
          "If your thoughts merely mirror your surroundings, nothing changes. Thinking beyond your current environment is the first step to a new reality.",
      },
      {
        id: "bh-16",
        title: "Bigger Than Your Body",
        content:
          "When the body demands its usual emotional fix, don't give in. Overriding the body's habits is how you free yourself from the old self.",
      },
      {
        id: "bh-17",
        title: "Bigger Than Time",
        content:
          "Escape the loop of remembered past and predicted future. Change is only possible in the present moment.",
      },
      {
        id: "bh-18",
        title: "The Three Brains",
        content:
          "We change through three stages: thinking (learning), doing (applying), and being (embodying). Only when it becomes 'being' is the change complete.",
      },
      {
        id: "bh-19",
        title: "Knowledge Is for the Mind",
        content:
          "New information primes the brain with fresh circuits. But knowledge alone, without action, changes nothing lasting.",
      },
      {
        id: "bh-20",
        title: "Instruction Is for the Body",
        content:
          "Applying what you learn teaches the body a new experience. Doing turns intellectual knowledge into lived skill.",
      },
      {
        id: "bh-21",
        title: "Experience Embodies It",
        content:
          "A new experience produces a new emotion, and repeated enough, that emotion becomes a trait of your character.",
      },
      {
        id: "bh-22",
        title: "Repetition Builds Identity",
        content:
          "Do and feel something enough times and it hardwires into who you are. Identity is built by repetition, for better or worse.",
      },
      {
        id: "bh-23",
        title: "Unlearn the Old Self",
        content:
          "Change requires unlearning as much as learning — dismantling the mental and emotional habits that define the current you.",
      },
      {
        id: "bh-24",
        title: "Prune Old Circuits",
        content:
          "Neural connections you stop using weaken and fade. Ceasing to fire old thought patterns lets them wither.",
      },
      {
        id: "bh-25",
        title: "Sprout New Connections",
        content:
          "New thoughts and rehearsals grow fresh neural pathways. The brain physically reshapes around what you repeatedly practice.",
      },
      {
        id: "bh-26",
        title: "Neuroplasticity in Action",
        content:
          "Your brain is not fixed. Deliberate mental effort rewires it, making the new self more natural over time.",
      },
      {
        id: "bh-27",
        title: "Mental Rehearsal",
        content:
          "Repeatedly rehearsing your new self in your mind installs the circuitry before the behaviour appears in the world.",
      },
      {
        id: "bh-28",
        title: "The Brain Doesn't Know the Difference",
        content:
          "Vivid inner rehearsal registers in the brain much like a real experience — which is why imagination can reshape identity.",
      },
      {
        id: "bh-29",
        title: "Change Before It Happens",
        content:
          "Don't wait for circumstances to improve before you feel different. Adopt the thoughts and emotions of the new self now.",
      },
      {
        id: "bh-30",
        title: "Feel the Future in the Present",
        content:
          "Generate the elevated emotions of your desired future today. Emotionally living in that future, Dispenza says, helps draw it toward you.",
      },
      {
        id: "bh-31",
        title: "Gratitude as Already Received",
        content:
          "Gratitude is the emotion of having already received. Feeling thankful in advance signals body and mind that the new reality is here.",
      },
      {
        id: "bh-32",
        title: "Energy and Frequency",
        content:
          "Dispenza frames emotions as energy you broadcast. Shifting to elevated emotions changes the frequency you carry into the world.",
      },
      {
        id: "bh-33",
        title: "The Quantum Field of Possibility",
        content:
          "He draws on quantum ideas: a field of infinite possibility that consciousness can tap. Your focused, coherent state, he argues, selects from it.",
      },
      {
        id: "bh-34",
        title: "Become No One, No Thing, No Time",
        content:
          "In deep meditation, you dissolve identification with your name, body, and schedule. From this open state, new realities can form.",
      },
      {
        id: "bh-35",
        title: "Enter the Present Moment",
        content:
          "The generous present moment is where creation happens. Letting go of the known past and future frees you to become new.",
      },
      {
        id: "bh-36",
        title: "Overcome the Analytical Mind",
        content:
          "The busy analytical mind defends the old self. Meditation slows it so you can reach the subconscious where habits live.",
      },
      {
        id: "bh-37",
        title: "From Beta to Alpha and Theta",
        content:
          "Shifting from busy beta brainwaves into calmer alpha and theta states opens the door to reprogramming the subconscious.",
      },
      {
        id: "bh-38",
        title: "Meditation as Rewiring",
        content:
          "Dispenza's core practice is meditation — a structured tool to observe the old self, release it, and rehearse the new one.",
      },
      {
        id: "bh-39",
        title: "Observe Your Old Self",
        content:
          "Becoming aware of your automatic thoughts and reactions robs them of their control. Observation is the first step to freedom.",
      },
      {
        id: "bh-40",
        title: "Break the Emotional Bonds",
        content:
          "Consciously release the memorized emotions tying you to the past. Letting them go loosens the grip of the old identity.",
      },
      {
        id: "bh-41",
        title: "Reinvent a New Self",
        content:
          "Deliberately design who you want to become — the thoughts, feelings, and actions of the new personality — then rehearse it.",
      },
      {
        id: "bh-42",
        title: "Rehearse the New You",
        content:
          "Mentally live a day as the new self until it feels familiar. Practice makes the new identity the path of least resistance.",
      },
      {
        id: "bh-43",
        title: "Choose New Thoughts and Feelings",
        content:
          "Moment to moment, catch the old pattern and choose the new one instead. Change is thousands of small conscious choices.",
      },
      {
        id: "bh-44",
        title: "Consistency Rewrites Identity",
        content:
          "One inspired meditation won't hold; daily repetition does. Consistency is what turns a chosen new self into your natural state.",
      },
      {
        id: "bh-45",
        title: "Mind the Gap",
        content:
          "Notice the gap between who you are and who you want to be. Closing it, day by day, is the whole work of transformation.",
      },
      {
        id: "bh-46",
        title: "Live as the New Self",
        content:
          "Beyond meditation, carry the new state into daily life. The goal is to be the new person off the cushion, in the real world.",
      },
      {
        id: "bh-47",
        title: "Discomfort Means Growth",
        content:
          "Stepping out of the familiar old self feels uncomfortable and unfamiliar. Dispenza says that discomfort is the feeling of change working.",
      },
      {
        id: "bh-48",
        title: "Don't Wait to Feel Ready",
        content:
          "The old self will resist and make excuses. Act as the new self before it feels natural, and the feeling follows.",
      },
      {
        id: "bh-49",
        title: "Emotions Instruct the Genes",
        content:
          "Elevated emotions are presented as signals that can influence gene expression, aligning your biology with your new mind.",
      },
      {
        id: "bh-50",
        title: "Coherence of Heart and Mind",
        content:
          "Bringing heart and brain into a calm, ordered coherence strengthens focus and the ability to hold your new state.",
      },
      {
        id: "bh-51",
        title: "Reality Follows the Inner Shift",
        content:
          "Change the inner state consistently, and outer circumstances, Dispenza argues, begin to reflect the new you.",
      },
      {
        id: "bh-52",
        title: "Freedom From the Past",
        content:
          "Breaking the habit of being yourself is ultimately freedom — no longer a prisoner of old emotions, reactions, and limits.",
      },
      {
        id: "bh-53",
        title: "A Practice, Not a Quick Fix",
        content:
          "This is ongoing inner work, not an overnight switch. The reward is a self you consciously build rather than one you inherited.",
      },
      {
        id: "bh-54",
        title: "A Note of Balance",
        content:
          "The book mixes real neuroscience with bolder metaphysical claims. Take the practical parts — mindfulness, mental rehearsal, managing emotion — and hold the rest thoughtfully.",
      },
      {
        id: "bh-55",
        title: "Become Someone New",
        content:
          "The invitation is bold: stop being your old, automatic self and consciously create a new one. Change your inner state daily, and you change your life.",
      },
    ],
  },

  // Dopamine Detox — Thibaut Meurisse
  "bk-244": {
    bookId: "bk-244",
    tagline: "A short guide to remove distractions and reclaim your focus",
    updated: "2026-07",
    frames: [
      {
        id: "dd-1",
        title: "The Overstimulated Brain",
        content:
          "Modern life bombards us with pings, feeds, and instant pleasures. Meurisse argues this constant stimulation is quietly destroying our focus and motivation.",
      },
      {
        id: "dd-2",
        title: "What Dopamine Really Does",
        content:
          "Dopamine isn't the 'pleasure chemical' so much as the 'wanting' chemical. It drives craving and the pursuit of rewards, not just enjoyment.",
      },
      {
        id: "dd-3",
        title: "Wired for the Next Hit",
        content:
          "Every notification and scroll delivers a small dopamine spike, training you to seek the next one. The chase itself becomes compulsive.",
      },
      {
        id: "dd-4",
        title: "The Instant Gratification Trap",
        content:
          "Easy, immediate pleasures crowd out slower, more meaningful rewards. We trade deep satisfaction for quick, shallow hits.",
      },
      {
        id: "dd-5",
        title: "The Cost of Constant Stimulation",
        content:
          "When you're always stimulated, ordinary tasks feel unbearably boring. Focus, patience, and motivation all quietly erode.",
      },
      {
        id: "dd-6",
        title: "Tolerance Raises the Bar",
        content:
          "The brain adapts to overstimulation, so you need ever more to feel the same buzz. Your baseline for satisfaction keeps climbing.",
      },
      {
        id: "dd-7",
        title: "The Baseline Problem",
        content:
          "With a sky-high stimulation baseline, calm activities feel flat and dull. The goal of a detox is to reset that baseline lower.",
      },
      {
        id: "dd-8",
        title: "What a Dopamine Detox Is",
        content:
          "A dopamine detox means temporarily removing high-stimulation activities so your brain resensitizes to normal, healthy rewards.",
      },
      {
        id: "dd-9",
        title: "Not About Dopamine Itself",
        content:
          "You can't and shouldn't eliminate dopamine — it's essential. The detox targets the compulsive, overstimulating behaviours around it.",
      },
      {
        id: "dd-10",
        title: "Resetting Your Sensitivity",
        content:
          "After a detox, simple things — a walk, a book, real work — feel rewarding again. You've restored your ability to enjoy the ordinary.",
      },
      {
        id: "dd-11",
        title: "Identify Your Distractions",
        content:
          "First, list what overstimulates you: the phone, social media, junk food, games. Awareness is the starting point of change.",
      },
      {
        id: "dd-12",
        title: "Rank Your Stimulations",
        content:
          "Sort your habits by how strongly they hook you. The most compulsive ones are the first to target in a detox.",
      },
      {
        id: "dd-13",
        title: "The Usual Culprits",
        content:
          "Endless scrolling, notifications, binge content, sugary food, and constant novelty are the main drivers of overstimulation.",
      },
      {
        id: "dd-14",
        title: "The Phone Is Engineered to Hook You",
        content:
          "Apps are designed by experts to capture and hold your attention. You're not weak-willed; you're up against deliberate manipulation.",
      },
      {
        id: "dd-15",
        title: "Choose Your Detox",
        content:
          "A detox can last a few hours, a day, or a weekend. Pick a length that challenges you without being impossible to sustain.",
      },
      {
        id: "dd-16",
        title: "Remove High-Stimulation Inputs",
        content:
          "During the detox, cut out the compulsive activities entirely. Put the phone away, log off, and avoid the usual quick fixes.",
      },
      {
        id: "dd-17",
        title: "Sit With Boredom",
        content:
          "Boredom is the whole point. Letting yourself be understimulated is what allows your brain to recalibrate.",
      },
      {
        id: "dd-18",
        title: "The Do-Nothing Exercise",
        content:
          "Try simply sitting and doing nothing for a while. It feels uncomfortable at first, then surprisingly clarifying.",
      },
      {
        id: "dd-19",
        title: "Discomfort Is Temporary",
        content:
          "The restlessness of a detox passes. Reminding yourself that the craving will fade makes it far easier to ride out.",
      },
      {
        id: "dd-20",
        title: "Cravings Come in Waves",
        content:
          "Urges rise, peak, and subside if you don't act on them. Watch a craving like a wave and let it wash past.",
      },
      {
        id: "dd-21",
        title: "Urge Surfing",
        content:
          "Instead of fighting or feeding a craving, observe it with curiosity. Noticing it without reacting robs it of power.",
      },
      {
        id: "dd-22",
        title: "After the Detox",
        content:
          "The reset isn't the end; how you reintroduce stimulation matters most. Return to habits deliberately, not automatically.",
      },
      {
        id: "dd-23",
        title: "Reintroduce Mindfully",
        content:
          "Bring back activities one at a time and notice their real effect on you. Some you'll want back; others you'll happily leave behind.",
      },
      {
        id: "dd-24",
        title: "Rediscover Simple Pleasures",
        content:
          "With a reset baseline, a coffee, a conversation, or a sunset feels genuinely good again. You relearn to enjoy quiet rewards.",
      },
      {
        id: "dd-25",
        title: "The Joy of Understimulation",
        content:
          "A less stimulated life is calmer and more present. You trade frantic buzz for steady, sustainable contentment.",
      },
      {
        id: "dd-26",
        title: "Single-Tasking",
        content:
          "Overstimulation trains constant task-switching. Doing one thing at a time rebuilds the focus that multitasking destroyed.",
      },
      {
        id: "dd-27",
        title: "Deep Focus Returns",
        content:
          "As your baseline drops, you can once again sit with a single task for long stretches. Concentration comes back with practice.",
      },
      {
        id: "dd-28",
        title: "Delayed Gratification",
        content:
          "The ability to postpone reward is a superpower. Detoxing strengthens your tolerance for effort before payoff.",
      },
      {
        id: "dd-29",
        title: "Hard Now, Easy Later",
        content:
          "Choosing the harder, less stimulating path today builds the focus and discipline that make tomorrow far easier.",
      },
      {
        id: "dd-30",
        title: "Align Actions With Goals",
        content:
          "Ask whether an activity moves you toward your goals or just soothes a craving. Let your goals, not your impulses, choose.",
      },
      {
        id: "dd-31",
        title: "The Pleasure Trap",
        content:
          "Cheap, effortless pleasures give a quick spike then leave you emptier. Meaningful rewards take effort but satisfy far longer.",
      },
      {
        id: "dd-32",
        title: "Effortful Rewards Satisfy More",
        content:
          "Pleasures you work for — skills, fitness, creation — bring durable fulfillment. Handed-to-you dopamine fades fast.",
      },
      {
        id: "dd-33",
        title: "Design Your Environment",
        content:
          "Willpower is unreliable; environment is dependable. Shape your surroundings so distractions are hard and good habits are easy.",
      },
      {
        id: "dd-34",
        title: "Make Distractions Harder",
        content:
          "Delete the apps, log out, leave the phone in another room. Every extra step between you and a distraction weakens its pull.",
      },
      {
        id: "dd-35",
        title: "Make Good Habits Easier",
        content:
          "Lay out the book, the gym clothes, the work tools. Reducing friction for good behaviour makes it the path of least resistance.",
      },
      {
        id: "dd-36",
        title: "Out of Sight, Out of Mind",
        content:
          "Cues trigger cravings. Removing tempting objects and notifications from view quietly removes the urge to use them.",
      },
      {
        id: "dd-37",
        title: "Set Boundaries With Tech",
        content:
          "Turn off non-essential notifications, use app limits, and schedule screen-free times. Boundaries protect your attention.",
      },
      {
        id: "dd-38",
        title: "Schedule Your Stimulation",
        content:
          "Rather than grazing on distraction all day, set specific windows for it. Contained stimulation loses its grip on your focus.",
      },
      {
        id: "dd-39",
        title: "Batch Your Inputs",
        content:
          "Check messages and feeds in a few dedicated blocks instead of constantly. Batching reduces the endless dopamine drip.",
      },
      {
        id: "dd-40",
        title: "Guard Your Mornings",
        content:
          "Starting the day with scrolling primes your brain for distraction. A calm, screen-free morning sets a focused tone.",
      },
      {
        id: "dd-41",
        title: "Build a Focus Ritual",
        content:
          "A consistent routine before deep work signals your brain it's time to concentrate, easing you past the pull of distraction.",
      },
      {
        id: "dd-42",
        title: "Embrace Slowness",
        content:
          "Not everything needs to be fast and stimulating. Slower, deliberate living restores presence and mental calm.",
      },
      {
        id: "dd-43",
        title: "Boredom Sparks Creativity",
        content:
          "When you stop numbing every dull moment, your mind wanders productively. Boredom is often the birthplace of new ideas.",
      },
      {
        id: "dd-44",
        title: "Rest Without a Screen",
        content:
          "Scrolling isn't real rest; it just restimulates. Genuine downtime — a walk, quiet, closed eyes — actually recharges you.",
      },
      {
        id: "dd-45",
        title: "Consume With Intention",
        content:
          "Choose deliberately what content and food you take in, rather than mindlessly grazing. Intention turns consumption into a choice.",
      },
      {
        id: "dd-46",
        title: "Quality Over Quantity",
        content:
          "A few enriching inputs beat an endless stream of shallow ones. Curate what you feed your mind as carefully as your body.",
      },
      {
        id: "dd-47",
        title: "The Comfort of Numbing",
        content:
          "We often reach for distraction to avoid uncomfortable feelings. The scroll is frequently an escape from something we don't want to feel.",
      },
      {
        id: "dd-48",
        title: "Face What You Avoid",
        content:
          "Beneath many cravings lies boredom, anxiety, or loneliness. Addressing the underlying feeling reduces the need to numb it.",
      },
      {
        id: "dd-49",
        title: "Replace, Don't Just Remove",
        content:
          "A vacuum invites relapse. Fill the time freed by the detox with meaningful, rewarding activities you actually value.",
      },
      {
        id: "dd-50",
        title: "Fill the Void With Meaning",
        content:
          "Hobbies, relationships, exercise, and creative work give lasting reward. Meaning is the healthiest replacement for cheap stimulation.",
      },
      {
        id: "dd-51",
        title: "Small Wins Rebuild Focus",
        content:
          "Each time you resist a distraction, your self-control strengthens. Stack small victories and focus grows steadily.",
      },
      {
        id: "dd-52",
        title: "Consistency Over Intensity",
        content:
          "One heroic detox day won't fix everything. Small, sustainable changes practiced consistently reshape your habits for good.",
      },
      {
        id: "dd-53",
        title: "Track Your Progress",
        content:
          "Noticing how your focus and mood improve reinforces the habit. Awareness of the payoff keeps you motivated to continue.",
      },
      {
        id: "dd-54",
        title: "Relapses Are Normal",
        content:
          "Slipping back into old habits doesn't mean failure. Notice it without shame, reset, and continue — progress isn't linear.",
      },
      {
        id: "dd-55",
        title: "Regular Mini-Detoxes",
        content:
          "Make periodic detoxes a routine — a screen-free evening or weekend. Regular resets keep your baseline healthy over time.",
      },
      {
        id: "dd-56",
        title: "Mind the Micro-Habits",
        content:
          "The reflexive phone-check while waiting is where overstimulation hides. Catching these tiny habits matters as much as the big ones.",
      },
      {
        id: "dd-57",
        title: "Protect Your Attention",
        content:
          "Your focus is your most valuable and most attacked resource. Guarding it is the real purpose behind any dopamine detox.",
      },
      {
        id: "dd-58",
        title: "Motivation Returns",
        content:
          "As overstimulation fades, tasks that felt impossibly boring become doable again. A reset brain rediscovers its drive.",
      },
      {
        id: "dd-59",
        title: "A Calmer, Sharper Mind",
        content:
          "Less noise means clearer thinking and steadier emotions. The detox trades scattered buzz for calm, focused clarity.",
      },
      {
        id: "dd-60",
        title: "Reclaim Your Time",
        content:
          "The hours lost to scrolling add up to years. Reducing distraction quietly gives you back enormous amounts of life.",
      },
      {
        id: "dd-61",
        title: "Presence Over Distraction",
        content:
          "Freed from constant stimulation, you're more present with people and experiences. Attention is the currency of a rich life.",
      },
      {
        id: "dd-62",
        title: "Redefine Fun",
        content:
          "As your baseline resets, your idea of enjoyment shifts from frantic stimulation to deeper, quieter pleasures.",
      },
      {
        id: "dd-63",
        title: "Discipline Is Freedom",
        content:
          "Controlling your impulses isn't restriction; it's liberation from being jerked around by every craving and notification.",
      },
      {
        id: "dd-64",
        title: "Start Today",
        content:
          "You don't need the perfect plan. Put the phone in another room for an hour and simply notice how it feels to begin.",
      },
      {
        id: "dd-65",
        title: "Awareness First",
        content:
          "Before changing anything, simply observe your habits for a day. Seeing how often you reach for a hit is itself transformative.",
      },
      {
        id: "dd-66",
        title: "One Habit at a Time",
        content:
          "Don't try to fix everything at once. Tackle your most disruptive habit first, then build from that early success.",
      },
      {
        id: "dd-67",
        title: "Reward Yourself Wisely",
        content:
          "Use effortful, healthy rewards to reinforce focus. Celebrating progress with meaningful treats keeps the change enjoyable.",
      },
      {
        id: "dd-68",
        title: "Balance, Not Deprivation",
        content:
          "The aim isn't a joyless life but a balanced one, where pleasures are chosen consciously rather than consumed compulsively.",
      },
      {
        id: "dd-69",
        title: "Long-Term Focus",
        content:
          "Keep your bigger goals in view. Remembering what you're focusing for makes resisting momentary distractions worthwhile.",
      },
      {
        id: "dd-70",
        title: "Freedom From the Feed",
        content:
          "Breaking the compulsive pull of the feed is genuinely freeing. You decide what deserves your attention, not the algorithm.",
      },
      {
        id: "dd-71",
        title: "A Sustainable Practice",
        content:
          "Dopamine management isn't a one-time cleanse but an ongoing way of living deliberately with technology and pleasure.",
      },
      {
        id: "dd-72",
        title: "Reclaim Your Life",
        content:
          "Reset your baseline, design your environment, and choose meaning over quick hits. In doing so, you take your focus — and your life — back.",
      },
    ],
  },

  // Mastery — Robert Greene
  "bk-657": {
    bookId: "bk-657",
    tagline: "The path to mastery, decoded from history's greatest achievers",
    updated: "2026-07",
    frames: [
      {
        id: "ms-1",
        title: "Mastery Is the Ultimate Power",
        content:
          "Greene argues that reaching mastery in a field is the highest human power and fulfillment. It's a level of skill and intuition that feels almost magical from the outside.",
      },
      {
        id: "ms-2",
        title: "Not Genius, but Process",
        content:
          "Masters aren't born with superhuman gifts; they follow a process. Understanding that process makes mastery available to almost anyone.",
      },
      {
        id: "ms-3",
        title: "The Brain Is Built for It",
        content:
          "The human brain is designed to master skills through sustained practice. Our capacity to learn deeply is our greatest evolutionary advantage.",
      },
      {
        id: "ms-4",
        title: "A Path Anyone Can Walk",
        content:
          "By studying masters across history and fields, Greene distils a repeatable path — one you can follow with patience and desire.",
      },
      {
        id: "ms-5",
        title: "Discover Your Life's Task",
        content:
          "The journey begins with finding your calling — the unique work you were meant to do. This inner sense of purpose fuels the whole path.",
      },
      {
        id: "ms-6",
        title: "Your Primal Inclination",
        content:
          "We each have a deep, individual inclination — a subject or activity that fascinated us early. It's a clue to your life's task.",
      },
      {
        id: "ms-7",
        title: "Return to Childhood Fascinations",
        content:
          "The things that absorbed you as a child, before others' opinions intruded, often point toward your true calling.",
      },
      {
        id: "ms-8",
        title: "The Voice of Your Uniqueness",
        content:
          "You are one of a kind, with a distinct configuration of talents and interests. Mastery flows from honouring, not suppressing, that uniqueness.",
      },
      {
        id: "ms-9",
        title: "Rebel Against the Wrong Path",
        content:
          "Money, parents, or convenience can pull you into work that isn't yours. Have the courage to resist a path that betrays your inclination.",
      },
      {
        id: "ms-10",
        title: "Find Your Niche",
        content:
          "Seek or create a niche where your particular blend of skills stands out. Occupying ground no one else does is a route to mastery.",
      },
      {
        id: "ms-11",
        title: "Avoid the False Self",
        content:
          "The false self is who others expect you to be. Shedding it to reconnect with your genuine interests is essential to the journey.",
      },
      {
        id: "ms-12",
        title: "Trust Your Inclinations",
        content:
          "Follow the pull of what deeply interests you, even when the payoff isn't obvious. That inner compass rarely misleads.",
      },
      {
        id: "ms-13",
        title: "A Sense of Destiny",
        content:
          "Masters feel their work is a calling, not just a job. This sense of destiny sustains them through years of hard effort.",
      },
      {
        id: "ms-14",
        title: "Submit to Reality",
        content:
          "The next phase is the apprenticeship — a humbling immersion in learning the real, unglamorous fundamentals of your field.",
      },
      {
        id: "ms-15",
        title: "The Apprenticeship Phase",
        content:
          "After formal education comes the crucial period of transforming your mind through practice in the real world. It typically lasts years.",
      },
      {
        id: "ms-16",
        title: "Learning Over Earning",
        content:
          "Early on, prioritize what you learn over what you earn. Choosing growth-rich work over a slightly bigger paycheck pays off for decades.",
      },
      {
        id: "ms-17",
        title: "Value Education Above All",
        content:
          "See your first jobs as an education you're being paid for. The skills and knowledge you gain are worth far more than the salary.",
      },
      {
        id: "ms-18",
        title: "Deep Observation",
        content:
          "First, watch and absorb the rules, etiquette, and reality of your field before acting. Patient observation prevents costly early mistakes.",
      },
      {
        id: "ms-19",
        title: "Learn the Rules First",
        content:
          "Master the conventions and fundamentals thoroughly before trying to break them. You can only innovate on a foundation you truly understand.",
      },
      {
        id: "ms-20",
        title: "Skills Acquisition",
        content:
          "Second, dedicate yourself to acquiring skills through intense, repeated practice. This is where the brain physically rewires toward expertise.",
      },
      {
        id: "ms-21",
        title: "The Power of Practice",
        content:
          "Deep, focused practice — not raw talent — builds mastery. Roughly ten thousand hours of it separates the master from the amateur.",
      },
      {
        id: "ms-22",
        title: "Practice Rewires the Brain",
        content:
          "Repetition literally builds and strengthens neural pathways. What feels laborious at first becomes automatic and intuitive over time.",
      },
      {
        id: "ms-23",
        title: "Embrace Boredom and Repetition",
        content:
          "The tedious drilling of fundamentals is unavoidable. Those who push through the boredom reach fluency that the impatient never do.",
      },
      {
        id: "ms-24",
        title: "Move Toward Resistance",
        content:
          "Practice your weaknesses, not just your strengths. Deliberately tackling what's hard is where the real growth happens.",
      },
      {
        id: "ms-25",
        title: "Experimentation",
        content:
          "Third, once skilled, begin experimenting and taking on more responsibility. Testing your abilities against real challenges deepens them.",
      },
      {
        id: "ms-26",
        title: "A Feeling of Inferiority",
        content:
          "Enter each new field willing to feel like a beginner again. Humility and openness accelerate learning far more than pride.",
      },
      {
        id: "ms-27",
        title: "Expand Your Horizons",
        content:
          "Apprentice broadly, absorbing knowledge from adjacent fields. A wide base of skills fuels later originality and connection-making.",
      },
      {
        id: "ms-28",
        title: "Overcome Impatience",
        content:
          "The great enemy of mastery is the desire for quick results. Accepting that mastery takes years is itself a competitive advantage.",
      },
      {
        id: "ms-29",
        title: "Trust the Slow Process",
        content:
          "Progress in the apprenticeship is often invisible day to day, then suddenly leaps forward. Keep going through the plateaus.",
      },
      {
        id: "ms-30",
        title: "Find the Right Mentor",
        content:
          "A mentor can compress years of learning into months by guiding your practice and sharing hard-won wisdom directly.",
      },
      {
        id: "ms-31",
        title: "Absorb the Master's Power",
        content:
          "Learn intensely from someone further along than you, absorbing their knowledge, tricks, and way of thinking.",
      },
      {
        id: "ms-32",
        title: "Choose a Mentor Who Fits You",
        content:
          "Pick a mentor whose strengths match your needs and inclinations, not just the most famous name. Fit matters more than fame.",
      },
      {
        id: "ms-33",
        title: "Transform Their Knowledge",
        content:
          "Don't merely copy your mentor; adapt what you learn to your own personality and vision. Absorb, then make it yours.",
      },
      {
        id: "ms-34",
        title: "Give Back and Surpass",
        content:
          "The goal is eventually to internalize and then exceed your mentor. A good student honours a mentor by outgrowing them.",
      },
      {
        id: "ms-35",
        title: "Beware Over-Dependence",
        content:
          "Cling to a mentor too long and you stunt your own voice. Know when to leave the nest and forge your own path.",
      },
      {
        id: "ms-36",
        title: "Books and the Dead as Mentors",
        content:
          "When no living mentor is available, study the great figures of the past through their work. History offers endless masters to learn from.",
      },
      {
        id: "ms-37",
        title: "See People as They Are",
        content:
          "To thrive, you need social intelligence — the ability to read people accurately and navigate the human world without naivety.",
      },
      {
        id: "ms-38",
        title: "Shed Your Naivety",
        content:
          "Idealizing people or assuming everyone shares your goals leads to painful setbacks. Seeing others clearly protects your progress.",
      },
      {
        id: "ms-39",
        title: "Read the Room",
        content:
          "Learn to sense the moods, politics, and unspoken rules around you. Social awareness keeps your talent from being derailed by others.",
      },
      {
        id: "ms-40",
        title: "Craft the Right Image",
        content:
          "How you present yourself shapes the opportunities you're given. Manage your image thoughtfully as part of your rise.",
      },
      {
        id: "ms-41",
        title: "Avoid Envy and Enemies",
        content:
          "Talent breeds envy. Downplay your brilliance where needed and avoid making unnecessary enemies who can block your path.",
      },
      {
        id: "ms-42",
        title: "Suffer Fools Patiently",
        content:
          "You'll encounter difficult, foolish people. Learning to handle them calmly, rather than react, keeps your energy on the work.",
      },
      {
        id: "ms-43",
        title: "Don't Let Ego Blind You",
        content:
          "Grandiosity and defensiveness distort your perception of people and feedback. Keep your ego in check to keep learning.",
      },
      {
        id: "ms-44",
        title: "Empathy as a Tool",
        content:
          "Deep empathy lets you understand collaborators, rivals, and audiences. Reading people well is itself a mastered skill.",
      },
      {
        id: "ms-45",
        title: "Awaken the Dimensional Mind",
        content:
          "After the apprenticeship comes the creative-active phase, where you use your mastered skills to create original, powerful work.",
      },
      {
        id: "ms-46",
        title: "From Apprentice to Creator",
        content:
          "Once the fundamentals are automatic, your mind is freed to innovate, connect, and invent. Skill becomes the platform for creativity.",
      },
      {
        id: "ms-47",
        title: "Keep the Mind Open",
        content:
          "Guard against the rigidity that success can bring. Staying curious and flexible keeps your creative powers alive.",
      },
      {
        id: "ms-48",
        title: "Hold Uncertainty",
        content:
          "Resist the urge to rush to conclusions. Sitting with open questions and ambiguity is where original ideas incubate.",
      },
      {
        id: "ms-49",
        title: "Let Ideas Incubate",
        content:
          "Alternate intense focus with relaxed downtime. The unconscious mind synthesizes solutions when you step away from the problem.",
      },
      {
        id: "ms-50",
        title: "Mechanical vs Living Intelligence",
        content:
          "Rote, mechanical thinking produces dull work. Living intelligence stays adaptive, questioning, and alive to new possibilities.",
      },
      {
        id: "ms-51",
        title: "Combine Distant Fields",
        content:
          "Breakthroughs often come from linking ideas across unrelated domains. A broad apprenticeship makes these fertile connections possible.",
      },
      {
        id: "ms-52",
        title: "Question Assumptions",
        content:
          "Look at your field with fresh eyes and challenge what everyone takes for granted. Assumptions are where hidden opportunities hide.",
      },
      {
        id: "ms-53",
        title: "Embrace Serendipity",
        content:
          "Stay alert to accidents and anomalies. Many great discoveries came from noticing what others dismissed as chance.",
      },
      {
        id: "ms-54",
        title: "Fail Forward",
        content:
          "Creative work means frequent failure. Treat each failure as data, adjust, and try again — persistence outlasts frustration.",
      },
      {
        id: "ms-55",
        title: "The Emotional Pitfalls of Creativity",
        content:
          "Impatience, complacency, and fear of criticism sabotage creative growth. Managing these emotions is part of the work.",
      },
      {
        id: "ms-56",
        title: "Fuse Intuition and Reason",
        content:
          "True mastery unites deep intuition with rational analysis. The master feels the right move and can also explain it.",
      },
      {
        id: "ms-57",
        title: "The Master's Intuition",
        content:
          "After years of practice, masters develop a high-level intuition — an instant grasp of situations that looks like a sixth sense.",
      },
      {
        id: "ms-58",
        title: "The Fingertip Feel",
        content:
          "Masters seem to feel the answer before they reason it out. This tacit, embodied knowledge is the fruit of thousands of hours.",
      },
      {
        id: "ms-59",
        title: "See the Whole",
        content:
          "Where beginners see fragments, masters perceive the entire system at once — how every part relates to the living whole.",
      },
      {
        id: "ms-60",
        title: "Thinking Becomes Seeing",
        content:
          "At the highest level, deliberate analysis gives way to direct perception. The master simply sees what needs to be done.",
      },
      {
        id: "ms-61",
        title: "Connect With Your Field",
        content:
          "Masters feel deeply connected to their subject, almost merging with it. That intimate bond is what produces effortless brilliance.",
      },
      {
        id: "ms-62",
        title: "Intuition Takes Years",
        content:
          "There's no shortcut to the master's intuition; it's built only through prolonged, immersive practice. Time is the essential ingredient.",
      },
      {
        id: "ms-63",
        title: "Passion Fuels the Journey",
        content:
          "Love for the work is what carries you through the long, hard years. Genuine passion, not willpower alone, sustains mastery.",
      },
      {
        id: "ms-64",
        title: "Patience Is Essential",
        content:
          "Mastery unfolds over a decade or more. Cultivating patience against a culture of instant results is itself a discipline.",
      },
      {
        id: "ms-65",
        title: "There Are No Shortcuts",
        content:
          "Hacks and quick fixes can't replace deep practice. The path is long by nature, and trying to skip it only leads back to the start.",
      },
      {
        id: "ms-66",
        title: "Resistance Is the Path",
        content:
          "The obstacles and difficulties in your field aren't detours — they're the very terrain of mastery. Lean into the hard parts.",
      },
      {
        id: "ms-67",
        title: "Turn Weakness Into Strength",
        content:
          "Masters often transform an early limitation into a distinctive strength. Your struggles can become the source of your originality.",
      },
      {
        id: "ms-68",
        title: "Adversity Sharpens Mastery",
        content:
          "Setbacks, if met with resolve, forge resilience and depth. The hardest periods often precede the greatest leaps.",
      },
      {
        id: "ms-69",
        title: "Time and Effort Over Talent",
        content:
          "Given enough focused time and effort, dedication beats raw talent. The tortoise of persistence outpaces the hare of gifts.",
      },
      {
        id: "ms-70",
        title: "Stay a Lifelong Learner",
        content:
          "Mastery isn't a final destination but a continuing practice. The greatest masters keep learning and growing until the end.",
      },
      {
        id: "ms-71",
        title: "Avoid Complacency at the Top",
        content:
          "Success can breed the rigidity and arrogance that end growth. Guard against resting on past achievements.",
      },
      {
        id: "ms-72",
        title: "Reconnect With Your Calling",
        content:
          "When you feel lost or stuck, return to the original inclination that started you. Your life's task keeps pointing the way home.",
      },
      {
        id: "ms-73",
        title: "The Reward Is Freedom",
        content:
          "Mastery brings a rare freedom — to work on your own terms, create what you envision, and shape your world. It's power in the deepest sense.",
      },
      {
        id: "ms-74",
        title: "Fulfillment Through Craft",
        content:
          "Beyond money or fame, mastery offers profound fulfillment — the deep satisfaction of doing meaningful work exceptionally well.",
      },
      {
        id: "ms-75",
        title: "Focus Beats Multitasking",
        content:
          "Deep skill requires sustained concentration on one pursuit. Scattering your energy across many things prevents mastery of any.",
      },
      {
        id: "ms-76",
        title: "Apprentice, Then Innovate",
        content:
          "You must earn the right to be creative by first mastering the craft. Innovation without foundation is just noise.",
      },
      {
        id: "ms-77",
        title: "Learn From Everything",
        content:
          "Masters extract lessons from every experience, success, and failure alike. A learning mindset turns all of life into training.",
      },
      {
        id: "ms-78",
        title: "The Alchemy of Learning",
        content:
          "Through practice, information becomes skill, skill becomes intuition, and intuition becomes mastery. Each stage transmutes the last.",
      },
      {
        id: "ms-79",
        title: "Guard Your Time",
        content:
          "Mastery demands enormous focused hours. Protecting your time from distraction and trivial demands is protecting your future.",
      },
      {
        id: "ms-80",
        title: "Practice With Intensity",
        content:
          "Hours alone aren't enough; the quality of attention matters. Fully engaged, deliberate practice accelerates growth dramatically.",
      },
      {
        id: "ms-81",
        title: "Feedback Fuels Growth",
        content:
          "Seek honest feedback and measure your progress. Without it, you may practice your errors and plateau unknowingly.",
      },
      {
        id: "ms-82",
        title: "Cultivate Curiosity",
        content:
          "An endless, childlike curiosity keeps you exploring and improving. It's the renewable fuel of the master's mind.",
      },
      {
        id: "ms-83",
        title: "Immerse Yourself Fully",
        content:
          "Total immersion in your field speeds learning immensely. Surround yourself with the work, the people, and the challenges of your craft.",
      },
      {
        id: "ms-84",
        title: "Discipline and Desire",
        content:
          "Mastery weds fiery desire with steady discipline. Passion supplies the drive; discipline turns it into daily, consistent effort.",
      },
      {
        id: "ms-85",
        title: "Own Your Development",
        content:
          "No one hands you mastery. Take charge of your own growth — choose your practice, mentors, and challenges deliberately.",
      },
      {
        id: "ms-86",
        title: "The Long Game Wins",
        content:
          "Those who think in years and decades outlast those chasing quick wins. Mastery rewards a long-term, patient orientation.",
      },
      {
        id: "ms-87",
        title: "Reinvent When Needed",
        content:
          "Fields and circumstances change. Masters keep adapting, sometimes reinventing themselves, rather than clinging to old methods.",
      },
      {
        id: "ms-88",
        title: "Connect Skill to Purpose",
        content:
          "Mastery gains its full power when aimed at something meaningful. Skill in service of a deeper purpose creates lasting value.",
      },
      {
        id: "ms-89",
        title: "Mastery Is a Way of Life",
        content:
          "More than a goal, mastery is an orientation — a lifelong commitment to learning, patience, and excellence in your craft.",
      },
      {
        id: "ms-90",
        title: "Everyone Has the Potential",
        content:
          "Greene's core belief: mastery isn't for a chosen few. With the right process and dedication, the potential lives in you.",
      },
      {
        id: "ms-91",
        title: "Start Where You Are",
        content:
          "You don't need perfect conditions to begin. Take the next step on your path today, and let the process unfold.",
      },
      {
        id: "ms-92",
        title: "Honour Your Uniqueness",
        content:
          "Your particular mix of interests and experiences is your greatest asset. Build your mastery around what makes you unlike anyone else.",
      },
      {
        id: "ms-93",
        title: "The Master's Peace",
        content:
          "Deep mastery brings a quiet confidence and calm. Having earned real competence, the master no longer needs to prove anything.",
      },
      {
        id: "ms-94",
        title: "Achieve Your Mastery",
        content:
          "Discover your calling, apprentice with humility, find mentors, sharpen your social and creative minds, and practice relentlessly. That is the road to mastery.",
      },
    ],
  },

  // Good to Great — Jim Collins
  "bk-663": {
    bookId: "bk-663",
    tagline: "Why some companies make the leap from good to great — and others don't",
    updated: "2026-07",
    frames: [
      {
        id: "gg-1",
        title: "Good Is the Enemy of Great",
        content:
          "Collins opens with a paradox: the reason so few things become great is that most are merely good. Settling for good quietly blocks greatness.",
      },
      {
        id: "gg-2",
        title: "A Five-Year Study",
        content:
          "His team studied companies that jumped from good to great results and sustained them, comparing each to a similar company that didn't. The patterns are striking.",
      },
      {
        id: "gg-3",
        title: "Greatness Is a Choice",
        content:
          "Greatness isn't a matter of circumstance or luck; it's largely a matter of conscious choice and discipline. Any organization can pursue it.",
      },
      {
        id: "gg-4",
        title: "Level 5 Leadership",
        content:
          "The great companies were led by 'Level 5' leaders — a rare blend of deep personal humility and intense professional will.",
      },
      {
        id: "gg-5",
        title: "Humility Plus Will",
        content:
          "Level 5 leaders are ambitious first for the company, not themselves. They're modest and self-effacing, yet fiercely determined to succeed.",
      },
      {
        id: "gg-6",
        title: "The Window and the Mirror",
        content:
          "In success, Level 5 leaders look out the window to credit others and luck. In failure, they look in the mirror to take responsibility.",
      },
      {
        id: "gg-7",
        title: "Not About Charisma",
        content:
          "The best leaders weren't larger-than-life celebrities. Quiet, determined, and results-focused, they built greatness that outlasted them.",
      },
      {
        id: "gg-8",
        title: "First Who, Then What",
        content:
          "Great companies got the right people on the bus before deciding where to drive it. Who is on the team matters more than the initial strategy.",
      },
      {
        id: "gg-9",
        title: "Get the Right People On",
        content:
          "Start by attracting self-motivated, high-character people. With the right people, you can adapt strategy far more easily.",
      },
      {
        id: "gg-10",
        title: "Get the Wrong People Off",
        content:
          "Just as important is getting the wrong people off the bus. Keeping poor fits, out of comfort, drags the whole organization down.",
      },
      {
        id: "gg-11",
        title: "The Right Seats",
        content:
          "Then put the right people in the right seats, matched to their strengths. Talent aligned to role multiplies performance.",
      },
      {
        id: "gg-12",
        title: "People Are Not the Asset",
        content:
          "Collins refines the cliché: people aren't your most important asset — the right people are. Fit and character matter more than headcount.",
      },
      {
        id: "gg-13",
        title: "Rigorous, Not Ruthless",
        content:
          "Great companies are demanding but fair. They apply high standards consistently rather than through cruelty or arbitrary layoffs.",
      },
      {
        id: "gg-14",
        title: "When in Doubt, Don't Hire",
        content:
          "Rather than settle, great companies keep looking until they find the right person. Compromising on people is a costly mistake.",
      },
      {
        id: "gg-15",
        title: "Best People, Biggest Opportunities",
        content:
          "Put your strongest people on your biggest opportunities, not your biggest problems. Ride your winners.",
      },
      {
        id: "gg-16",
        title: "Confront the Brutal Facts",
        content:
          "Great companies face reality honestly, however harsh, while never losing faith they'll prevail. Truth and hope must coexist.",
      },
      {
        id: "gg-17",
        title: "The Stockdale Paradox",
        content:
          "Named for a POW who survived by holding two truths: confront the brutal facts of your situation, yet retain unwavering faith in the end.",
      },
      {
        id: "gg-18",
        title: "Faith and Facts Together",
        content:
          "Blind optimists who denied reality fared worst. Survivors both faced the facts and believed they would ultimately triumph.",
      },
      {
        id: "gg-19",
        title: "Create a Climate of Truth",
        content:
          "Build a culture where facts are heard and hard truths surface. Leaders should create conditions where the truth can be told.",
      },
      {
        id: "gg-20",
        title: "Lead With Questions",
        content:
          "Great leaders ask questions to understand reality, not to blame. Curiosity and humility invite the honest information you need.",
      },
      {
        id: "gg-21",
        title: "Autopsies Without Blame",
        content:
          "Examine failures openly to learn, without punishing the messenger. Blame-free analysis is how organizations improve.",
      },
      {
        id: "gg-22",
        title: "The Hedgehog Concept",
        content:
          "Great companies found one simple, clarifying idea — their Hedgehog Concept — and organized everything around it.",
      },
      {
        id: "gg-23",
        title: "The Three Circles",
        content:
          "The Hedgehog Concept lives at the intersection of three questions: what you're deeply passionate about, what you can be best at, and what drives your economics.",
      },
      {
        id: "gg-24",
        title: "What You're Passionate About",
        content:
          "Find the work that genuinely fires up your organization. Passion can't be manufactured; it must be discovered.",
      },
      {
        id: "gg-25",
        title: "What You Can Be Best At",
        content:
          "Identify what you can truly be the best in the world at — and, just as important, what you cannot. Honesty here is crucial.",
      },
      {
        id: "gg-26",
        title: "What Drives Your Economics",
        content:
          "Understand the single measure that best drives your economic engine. Clarity about what makes money focuses every decision.",
      },
      {
        id: "gg-27",
        title: "The Intersection Is Your Focus",
        content:
          "Where all three circles overlap is where you should concentrate. Everything outside that intersection is a distraction.",
      },
      {
        id: "gg-28",
        title: "Simplicity Within Complexity",
        content:
          "The Hedgehog Concept distils a complex world into one guiding idea. Great strategy is often piercingly simple.",
      },
      {
        id: "gg-29",
        title: "The Fox and the Hedgehog",
        content:
          "The fox knows many things; the hedgehog knows one big thing. Great companies are hedgehogs, focused relentlessly on their one concept.",
      },
      {
        id: "gg-30",
        title: "It Takes Time to Find",
        content:
          "The Hedgehog Concept isn't obvious overnight; it emerges through honest reflection and debate. Patience in finding it pays off.",
      },
      {
        id: "gg-31",
        title: "A Culture of Discipline",
        content:
          "Great companies pair disciplined people with disciplined thought and disciplined action. Discipline runs through everything they do.",
      },
      {
        id: "gg-32",
        title: "Disciplined People",
        content:
          "With the right, self-disciplined people on board, you need less bureaucracy and control. Good people manage themselves.",
      },
      {
        id: "gg-33",
        title: "Disciplined Thought",
        content:
          "Confronting facts and holding to the Hedgehog Concept are acts of disciplined thinking. Rigor of mind precedes rigor of action.",
      },
      {
        id: "gg-34",
        title: "Disciplined Action",
        content:
          "Consistently doing what fits the Hedgehog Concept — and refusing what doesn't — is disciplined action. Say no to the tempting distractions.",
      },
      {
        id: "gg-35",
        title: "Freedom Within a Framework",
        content:
          "Discipline isn't rigid control. Within a clear framework, disciplined people are given great freedom and responsibility.",
      },
      {
        id: "gg-36",
        title: "The Stop-Doing List",
        content:
          "Great companies are as clear about what to stop doing as what to start. Discipline means pruning anything outside the three circles.",
      },
      {
        id: "gg-37",
        title: "Technology Accelerators",
        content:
          "Great companies use technology to accelerate momentum, not to create it. They adopt tech that fits their Hedgehog Concept.",
      },
      {
        id: "gg-38",
        title: "Technology Doesn't Cause Greatness",
        content:
          "Technology is an accelerator of existing momentum, never the primary cause of a leap. Fundamentals come first.",
      },
      {
        id: "gg-39",
        title: "Crawl, Walk, Run",
        content:
          "Great companies think carefully before adopting new technology, then apply it deliberately. Hype-chasing is a comparison company's habit.",
      },
      {
        id: "gg-40",
        title: "The Flywheel",
        content:
          "Transformation is like turning a giant flywheel: each push builds on the last until momentum makes it nearly unstoppable.",
      },
      {
        id: "gg-41",
        title: "Momentum Builds Slowly",
        content:
          "There's no single dramatic moment of breakthrough. Greatness comes from consistent effort compounding over years.",
      },
      {
        id: "gg-42",
        title: "No Miracle Moment",
        content:
          "From outside it looks like a sudden leap, but insiders know it was gradual, cumulative work. Overnight success is a myth.",
      },
      {
        id: "gg-43",
        title: "The Doom Loop",
        content:
          "Comparison companies lurched from program to program, chasing quick fixes and never building momentum. Inconsistency kills the flywheel.",
      },
      {
        id: "gg-44",
        title: "Avoid Reactive Lurching",
        content:
          "Constantly changing direction resets your progress to zero. Sustained, consistent pushes in one direction win.",
      },
      {
        id: "gg-45",
        title: "Buildup and Breakthrough",
        content:
          "Greatness follows a pattern of long buildup then breakthrough. The unglamorous buildup is where the real work happens.",
      },
      {
        id: "gg-46",
        title: "Consistency Over Time",
        content:
          "Doing the right things, aligned to your concept, again and again, is what turns the flywheel. Patience and persistence compound.",
      },
      {
        id: "gg-47",
        title: "The Genius of the AND",
        content:
          "Great companies embrace both ends of paradoxes — humility and will, freedom and discipline — rather than choosing one.",
      },
      {
        id: "gg-48",
        title: "Reject the Tyranny of OR",
        content:
          "Don't accept that you must choose between, say, purpose and profit. The great figure out how to have both.",
      },
      {
        id: "gg-49",
        title: "Preserve the Core, Stimulate Progress",
        content:
          "Enduring greatness holds firmly to core values while relentlessly changing strategies and practices. Stability and change coexist.",
      },
      {
        id: "gg-50",
        title: "Greatness Takes Patience",
        content:
          "The leap from good to great demands discipline and years of consistent effort. There are no shortcuts to lasting excellence.",
      },
      {
        id: "gg-51",
        title: "Culture Over Charisma",
        content:
          "Sustained greatness comes from disciplined culture, not a heroic leader. Build systems and values that outlive any individual.",
      },
      {
        id: "gg-52",
        title: "Focus Beats Diversification",
        content:
          "The great companies concentrated on what they could be best at. Sprawling into everything diluted the comparison companies.",
      },
      {
        id: "gg-53",
        title: "Face Reality, Keep Faith",
        content:
          "The Stockdale Paradox applies to any hard endeavour: see the brutal facts clearly, yet never abandon belief in eventual victory.",
      },
      {
        id: "gg-54",
        title: "Right People First, Always",
        content:
          "When in doubt, invest in getting and keeping the right people. Nearly every other principle depends on this foundation.",
      },
      {
        id: "gg-55",
        title: "Apply It Beyond Business",
        content:
          "Level 5 humility, the Hedgehog Concept, disciplined action, and the flywheel apply to careers, teams, and personal goals too.",
      },
      {
        id: "gg-56",
        title: "Build Something That Lasts",
        content:
          "Good to Great is about enduring excellence, not a temporary spike. The aim is greatness that sustains long after the leap.",
      },
      {
        id: "gg-57",
        title: "Greatness Is Not Luck",
        content:
          "Collins found that great companies didn't have better luck than their peers — they made better, more disciplined choices.",
      },
      {
        id: "gg-58",
        title: "From Good to Great",
        content:
          "Get the right people, confront the facts, find your Hedgehog Concept, build a culture of discipline, and keep turning the flywheel. That is the path to greatness.",
      },
    ],
  },

  // The One Minute Manager — Kenneth Blanchard & Spencer Johnson
  "bk-662": {
    bookId: "bk-662",
    tagline: "A simple system for managing people and getting great results",
    updated: "2026-07",
    frames: [
      {
        id: "om-1",
        title: "Managing in a Minute",
        content:
          "Told as a fable, the book follows a young man seeking a great manager. He discovers a leader who gets superb results with a remarkably simple approach.",
      },
      {
        id: "om-2",
        title: "Tough vs Nice — Be Both",
        content:
          "Most managers are either tough (results-focused) or nice (people-focused). The One Minute Manager combines both, caring about people and results.",
      },
      {
        id: "om-3",
        title: "Results Through People",
        content:
          "The central belief: people who feel good about themselves produce good results. Managing well means helping people feel good and perform well.",
      },
      {
        id: "om-4",
        title: "The Three Secrets",
        content:
          "The whole method rests on three quick practices: One Minute Goals, One Minute Praisings, and One Minute Re-Directs (originally Reprimands).",
      },
      {
        id: "om-5",
        title: "Secret 1 — One Minute Goals",
        content:
          "Clear goals are the foundation. Manager and employee agree on what needs doing and what good performance looks like — briefly and specifically.",
      },
      {
        id: "om-6",
        title: "Set Goals Together",
        content:
          "Goals aren't dictated from above; they're agreed upon. Shared ownership makes people far more committed to reaching them.",
      },
      {
        id: "om-7",
        title: "Keep Goals Short",
        content:
          "Each goal fits on a single page, readable in a minute. If it takes longer, it's too complicated to guide daily behaviour.",
      },
      {
        id: "om-8",
        title: "Review Goals Often",
        content:
          "People should reread their goals regularly and check whether their behaviour matches them. Frequent review keeps effort on target.",
      },
      {
        id: "om-9",
        title: "Goals Begin Behaviors",
        content:
          "Clear goals start good performance; without them, people can't know what's expected. Clarity up front prevents most problems.",
      },
      {
        id: "om-10",
        title: "Know What Good Looks Like",
        content:
          "Define success concretely so everyone recognizes it. Vague expectations lead to confusion, frustration, and finger-pointing.",
      },
      {
        id: "om-11",
        title: "Focus on the Vital Few",
        content:
          "Rather than dozens of goals, focus on the few that drive most results. A handful of clear priorities beats a long, fuzzy list.",
      },
      {
        id: "om-12",
        title: "Catch People Doing Right",
        content:
          "The key to developing people is to catch them doing something right, not to catch them making mistakes. Look for the good.",
      },
      {
        id: "om-13",
        title: "Secret 2 — One Minute Praisings",
        content:
          "When someone does well, praise them promptly and specifically. Immediate, genuine recognition is one of the most powerful management tools.",
      },
      {
        id: "om-14",
        title: "Praise Immediately",
        content:
          "Don't save praise for an annual review. Recognizing good work as it happens reinforces the behaviour while it's fresh.",
      },
      {
        id: "om-15",
        title: "Be Specific",
        content:
          "Tell people exactly what they did right. Specific praise teaches them what to repeat, where vague compliments teach nothing.",
      },
      {
        id: "om-16",
        title: "Share How You Feel",
        content:
          "Let people know how their good work makes you feel and how it helps the team. Genuine emotion makes praise land deeply.",
      },
      {
        id: "om-17",
        title: "Encourage More of the Same",
        content:
          "End a praising by encouraging them to keep it up. Positive reinforcement makes good behaviour more likely to recur.",
      },
      {
        id: "om-18",
        title: "Praise Progress, Not Just Perfection",
        content:
          "Especially when people are learning, praise approximate successes. Rewarding steps in the right direction builds momentum toward mastery.",
      },
      {
        id: "om-19",
        title: "Help People Win",
        content:
          "A good manager sets people up to succeed and then celebrates it. Your job is to help your team feel like winners.",
      },
      {
        id: "om-20",
        title: "Secret 3 — One Minute Re-Directs",
        content:
          "When someone with the skills makes a mistake, address it quickly and clearly, then reaffirm your confidence in them.",
      },
      {
        id: "om-21",
        title: "Address Mistakes Promptly",
        content:
          "Don't let errors pile up for a big blowup later. Quick, calm correction is fairer and far more effective.",
      },
      {
        id: "om-22",
        title: "Confirm the Facts First",
        content:
          "Before redirecting, make sure you understand what actually happened. Correcting based on assumptions destroys trust.",
      },
      {
        id: "om-23",
        title: "Be Clear About What Went Wrong",
        content:
          "State specifically what the mistake was and how it affects things. Precision helps the person understand and fix it.",
      },
      {
        id: "om-24",
        title: "Then Reaffirm the Person",
        content:
          "After the correction, remind them that you value them and believe in their ability. The behaviour was wrong; the person is still good.",
      },
      {
        id: "om-25",
        title: "Tough on Behavior, Kind to the Person",
        content:
          "Separate the deed from the doer. You can be firm about a mistake while remaining warm and supportive toward the individual.",
      },
      {
        id: "om-26",
        title: "End on a Positive Note",
        content:
          "A re-direct closes with encouragement, not lingering criticism. People leave motivated to improve rather than deflated.",
      },
      {
        id: "om-27",
        title: "Don't Attack Self-Worth",
        content:
          "Criticizing character rather than behaviour crushes confidence. Protect people's sense of worth even while correcting their work.",
      },
      {
        id: "om-28",
        title: "Feedback Is the Breakfast of Champions",
        content:
          "People need timely feedback to grow. Regular, honest input — praise and correction alike — fuels high performance.",
      },
      {
        id: "om-29",
        title: "Consequences Maintain Behavior",
        content:
          "Goals begin behavior, but what happens afterward — praise or correction — determines whether it continues. Follow-through matters.",
      },
      {
        id: "om-30",
        title: "Everyone Is a Potential Winner",
        content:
          "Some people are winners who just look like losers because a manager hasn't helped them yet. Believe in people's potential.",
      },
      {
        id: "om-31",
        title: "Believe in Your People",
        content:
          "When you genuinely believe in someone, they tend to rise to it. Confidence from a manager becomes confidence in the employee.",
      },
      {
        id: "om-32",
        title: "Autonomy With Clarity",
        content:
          "Once goals are clear, let people do their work. Clarity up front allows freedom in execution.",
      },
      {
        id: "om-33",
        title: "Manage Less, Empower More",
        content:
          "The one-minute approach is efficient precisely because it develops self-sufficient people who don't need constant oversight.",
      },
      {
        id: "om-34",
        title: "The Best Minute Invested in People",
        content:
          "The best minute you spend is the one you invest in your people. Small, focused moments of attention yield big returns.",
      },
      {
        id: "om-35",
        title: "People Are Your Greatest Asset",
        content:
          "Results flow through people, so developing them is the highest-leverage work a manager can do.",
      },
      {
        id: "om-36",
        title: "Honesty and Care Together",
        content:
          "Great management blends candor with genuine care. People trust a manager who is both truthful and on their side.",
      },
      {
        id: "om-37",
        title: "Praise Publicly, Redirect Privately",
        content:
          "Recognition shared openly lifts people; correction is best given one-on-one to protect dignity.",
      },
      {
        id: "om-38",
        title: "Consistency Builds Trust",
        content:
          "Applying these practices reliably makes you predictable and fair. People relax and perform when they know what to expect.",
      },
      {
        id: "om-39",
        title: "Clarity Prevents Problems",
        content:
          "Most performance issues trace back to unclear expectations. Investing in clear goals up front saves conflict later.",
      },
      {
        id: "om-40",
        title: "Short, Frequent Check-Ins",
        content:
          "Brief, regular touchpoints beat rare marathon reviews. Small, consistent attention keeps everyone aligned.",
      },
      {
        id: "om-41",
        title: "Teach People to Manage Themselves",
        content:
          "The ultimate aim is people who set their own goals and self-correct. A great manager works to become less necessary.",
      },
      {
        id: "om-42",
        title: "Simple, Not Easy",
        content:
          "The three secrets are simple to grasp but require discipline to practice consistently. Their power is in the doing.",
      },
      {
        id: "om-43",
        title: "Care Enough to Be Honest",
        content:
          "Avoiding hard conversations isn't kindness; it lets people fail. Caring managers deliver honest feedback promptly.",
      },
      {
        id: "om-44",
        title: "Reinforce What Works",
        content:
          "Notice and celebrate the behaviours you want more of. What gets recognized gets repeated.",
      },
      {
        id: "om-45",
        title: "Adjust to Each Person",
        content:
          "New employees need more guidance; experienced ones need more freedom. Match your support to each person's competence.",
      },
      {
        id: "om-46",
        title: "Leadership Is a Skill",
        content:
          "Great managing isn't an innate gift but a learnable set of practices. Anyone willing to apply them can lead well.",
      },
      {
        id: "om-47",
        title: "Model the Behavior",
        content:
          "Managers set the tone. Living the standards you expect earns the credibility to ask them of others.",
      },
      {
        id: "om-48",
        title: "Develop, Don't Just Direct",
        content:
          "The goal isn't to command tasks but to grow capable people. Development is the manager's true product.",
      },
      {
        id: "om-49",
        title: "Pass It On",
        content:
          "The young man in the fable eventually teaches others. Great managers multiply themselves by developing more great managers.",
      },
      {
        id: "om-50",
        title: "Become a One Minute Manager",
        content:
          "Set clear goals, catch people doing right, and redirect mistakes kindly. Do these three simple things well, and your people — and results — flourish.",
      },
    ],
  },

  // Who Moved My Cheese? — Spencer Johnson
  "bk-661": {
    bookId: "bk-661",
    tagline: "A simple parable about dealing with change in work and life",
    updated: "2026-07",
    frames: [
      {
        id: "wc-1",
        title: "A Parable About Change",
        content:
          "Johnson tells a short fable of two mice and two little people in a maze, searching for cheese. It's a memorable lesson on how to handle change.",
      },
      {
        id: "wc-2",
        title: "The Cheese Is What You Want",
        content:
          "In the story, cheese stands for whatever you desire — a job, a relationship, money, health. It's your idea of success and happiness.",
      },
      {
        id: "wc-3",
        title: "The Maze Is Where You Look",
        content:
          "The maze represents where you spend your time seeking what you want — your workplace, community, or life. We all wander our own maze.",
      },
      {
        id: "wc-4",
        title: "Four Ways to Face Change",
        content:
          "The four characters embody four responses to change: Sniff, Scurry, Hem, and Haw. We each carry a bit of all of them.",
      },
      {
        id: "wc-5",
        title: "Sniff — Sees Change Early",
        content:
          "Sniff the mouse sniffs out change in advance. He notices the signs that the cheese is running low before it disappears.",
      },
      {
        id: "wc-6",
        title: "Scurry — Acts Quickly",
        content:
          "Scurry springs into action without overthinking. When the cheese is gone, he immediately sets off to find more.",
      },
      {
        id: "wc-7",
        title: "Hem — Denies and Resists",
        content:
          "Hem the little person refuses to accept the change. He clings to the empty cheese station, insisting things go back to how they were.",
      },
      {
        id: "wc-8",
        title: "Haw — Learns to Adapt",
        content:
          "Haw eventually overcomes his fear and adapts. His journey — from denial to acceptance to action — is the heart of the story.",
      },
      {
        id: "wc-9",
        title: "The Cheese Disappears",
        content:
          "One day the cheese at their familiar station is simply gone. The comfortable supply they relied on has vanished.",
      },
      {
        id: "wc-10",
        title: "Change Always Comes",
        content:
          "The cheese was slowly dwindling all along; its disappearance shouldn't have been a shock. Change is constant and inevitable.",
      },
      {
        id: "wc-11",
        title: "Hem's Denial",
        content:
          "Hem reacts with disbelief and outrage: 'Who moved my cheese?' He wastes energy protesting instead of adapting.",
      },
      {
        id: "wc-12",
        title: "It's Not Fair!",
        content:
          "Hem feels entitled to his cheese and treats its loss as an injustice. That victim mindset keeps him stuck and hungry.",
      },
      {
        id: "wc-13",
        title: "The Cost of Clinging",
        content:
          "By refusing to move, Hem grows weaker and more bitter. Clinging to what's gone only deepens the loss.",
      },
      {
        id: "wc-14",
        title: "Haw's Fear",
        content:
          "Haw is afraid to venture into the maze again. Fear of the unknown paralyzes him alongside Hem for a long while.",
      },
      {
        id: "wc-15",
        title: "Paralyzed by Comfort",
        content:
          "The little people had grown so comfortable they stopped paying attention. Comfort had quietly dulled their readiness for change.",
      },
      {
        id: "wc-16",
        title: "The Mice Move On",
        content:
          "Meanwhile, Sniff and Scurry, without agonizing, have already found new cheese elsewhere. Simplicity and action served them well.",
      },
      {
        id: "wc-17",
        title: "Overthinking Traps Us",
        content:
          "The mice succeeded partly because they didn't overanalyze. Sometimes the human tendency to overthink becomes its own obstacle.",
      },
      {
        id: "wc-18",
        title: "Haw Ventures Out",
        content:
          "Hungry and finally willing, Haw laughs at himself and steps into the maze. The first move past fear is the hardest and most important.",
      },
      {
        id: "wc-19",
        title: "The Handwriting on the Wall",
        content:
          "As he searches, Haw writes lessons on the maze walls to encourage himself and anyone who follows. These become the book's core wisdom.",
      },
      {
        id: "wc-20",
        title: "Change Happens",
        content:
          "The first lesson: change happens — they keep moving the cheese. Expecting change rather than resenting it is where wisdom begins.",
      },
      {
        id: "wc-21",
        title: "Anticipate Change",
        content:
          "Get ready for the cheese to move. Those who expect change aren't blindsided and can prepare instead of panic.",
      },
      {
        id: "wc-22",
        title: "Monitor Change",
        content:
          "Smell the cheese often so you know when it's getting old. Staying alert to small shifts warns you before a crisis hits.",
      },
      {
        id: "wc-23",
        title: "Adapt Quickly",
        content:
          "The quicker you let go of the old cheese, the sooner you can enjoy new cheese. Speed of adaptation reduces suffering.",
      },
      {
        id: "wc-24",
        title: "Let Go Sooner",
        content:
          "Every day Haw held onto the empty station was a day wasted. Releasing what's gone frees you to find what's next.",
      },
      {
        id: "wc-25",
        title: "Change",
        content:
          "Move with the cheese. Instead of resisting the current, flow with it and go where the opportunity now lies.",
      },
      {
        id: "wc-26",
        title: "Enjoy Change",
        content:
          "Savor the adventure and the taste of new cheese. Change, once embraced, can be exciting rather than threatening.",
      },
      {
        id: "wc-27",
        title: "Be Ready to Change Again",
        content:
          "They keep moving the cheese, so stay ready. Change isn't a single event to survive but a permanent condition to embrace.",
      },
      {
        id: "wc-28",
        title: "Fear Is Often Worse Than Reality",
        content:
          "Haw discovers that the maze he dreaded held new cheese all along. The fear of change is usually worse than the change itself.",
      },
      {
        id: "wc-29",
        title: "What Would You Do Without Fear?",
        content:
          "Haw asks himself what he'd do if he weren't afraid. The question unlocks courage and pulls him forward into action.",
      },
      {
        id: "wc-30",
        title: "Imagine Enjoying New Cheese",
        content:
          "Picturing himself finding and savoring new cheese motivates Haw to keep going. Visualizing a better outcome makes change feel worth pursuing.",
      },
      {
        id: "wc-31",
        title: "Visualization Pulls You Forward",
        content:
          "A vivid, positive image of the future draws you toward it. Focusing on possibility rather than loss changes your whole energy.",
      },
      {
        id: "wc-32",
        title: "Old Beliefs Trap You",
        content:
          "Haw realizes his old belief — that the cheese would always be there — kept him stuck. Outdated assumptions block adaptation.",
      },
      {
        id: "wc-33",
        title: "Let Go of Outdated Ideas",
        content:
          "When beliefs no longer serve reality, release them. Flexibility of mind is what allows flexibility of action.",
      },
      {
        id: "wc-34",
        title: "Comfort Zones Expire",
        content:
          "The station that once fed them became a trap. What was comfortable yesterday can become a cage today.",
      },
      {
        id: "wc-35",
        title: "Notice Small Changes Early",
        content:
          "The cheese shrank gradually before it vanished. Paying attention to small early signals lets you respond before it's a crisis.",
      },
      {
        id: "wc-36",
        title: "Small Changes Precede Big Ones",
        content:
          "Big disruptions are usually preceded by little warning signs. Staying observant turns surprises into anticipated events.",
      },
      {
        id: "wc-37",
        title: "Action Beats Analysis",
        content:
          "Haw makes progress only once he moves, not while he worries. Taking a step, even an uncertain one, breaks the paralysis.",
      },
      {
        id: "wc-38",
        title: "The Freedom of Letting Go",
        content:
          "Once Haw releases his attachment, he feels lighter and freer. Letting go isn't loss; it's liberation.",
      },
      {
        id: "wc-39",
        title: "Laugh at Your Own Folly",
        content:
          "Haw learns to laugh at how long he clung to the old ways. Humour and self-forgiveness make change easier to accept.",
      },
      {
        id: "wc-40",
        title: "Take It Lightly",
        content:
          "Treating change with lightness rather than dread lowers its power to frighten you. A playful attitude helps you adapt.",
      },
      {
        id: "wc-41",
        title: "Change Can Lead to Better",
        content:
          "The new cheese Haw finds is more plentiful than before. Change often opens doors to something better than what was lost.",
      },
      {
        id: "wc-42",
        title: "Growth Requires Movement",
        content:
          "Staying put guarantees decline as the world moves on. Growth demands that you keep venturing into new territory.",
      },
      {
        id: "wc-43",
        title: "Leave a Trail for Others",
        content:
          "Haw's wall-writings help those who come after him. Sharing your lessons about change can guide and encourage others.",
      },
      {
        id: "wc-44",
        title: "Hem's Fate Is a Warning",
        content:
          "We never learn if Hem changes — a deliberate open ending. It asks each reader: will you adapt, or cling like Hem?",
      },
      {
        id: "wc-45",
        title: "Stay Alert and Flexible",
        content:
          "The lasting posture the book recommends is watchfulness and readiness. Keep sniffing the cheese and stay light on your feet.",
      },
      {
        id: "wc-46",
        title: "Change in the Workplace",
        content:
          "The parable is often applied to jobs and organizations. Roles, industries, and companies shift; those who adapt thrive.",
      },
      {
        id: "wc-47",
        title: "Change in Personal Life",
        content:
          "Relationships, health, and circumstances change too. The same principles — anticipate, adapt, and enjoy — apply everywhere.",
      },
      {
        id: "wc-48",
        title: "Simplicity Is the Point",
        content:
          "The story is deliberately simple so its lesson sticks. In a changing world, a clear, memorable mindset is worth more than complexity.",
      },
      {
        id: "wc-49",
        title: "Apply It to Your Life",
        content:
          "Ask what your cheese is, whether it's moving, and how you're responding. Honest reflection turns the fable into real change.",
      },
      {
        id: "wc-50",
        title: "Move With the Cheese",
        content:
          "The takeaway is simple and powerful: notice change, let go of the old quickly, and keep moving toward the new. Adapt, and you thrive.",
      },
    ],
  },

  // The 4-Hour Work Week — Timothy Ferriss
  "bk-660": {
    bookId: "bk-660",
    tagline: "Escape the 9-to-5, automate income, and design your ideal life",
    updated: "2026-07",
    frames: [
      {
        id: "hw-1",
        title: "Escape the 9-to-5",
        content:
          "Ferriss challenges the assumption that you must work forty years to enjoy life later. He shows how to design freedom into your life now.",
      },
      {
        id: "hw-2",
        title: "The New Rich",
        content:
          "The New Rich aren't those with the most money, but those with the most control over their time and mobility. Freedom is the real wealth.",
      },
      {
        id: "hw-3",
        title: "Lifestyle Design",
        content:
          "Instead of accumulating money to spend someday, design the life you want and reverse-engineer what it actually costs to live it.",
      },
      {
        id: "hw-4",
        title: "Time and Mobility",
        content:
          "Wealth measured only in dollars misses the point. Being able to choose what you do, when, and where is the true currency.",
      },
      {
        id: "hw-5",
        title: "The Deferred-Life Plan Is Broken",
        content:
          "Slaving for decades to retire at sixty-five gambles your best years on an uncertain future. Ferriss urges distributing freedom across your life.",
      },
      {
        id: "hw-6",
        title: "Take Mini-Retirements",
        content:
          "Rather than one long retirement at the end, sprinkle extended breaks and adventures throughout your life while you're young enough to enjoy them.",
      },
      {
        id: "hw-7",
        title: "Relative Income",
        content:
          "What matters isn't just how much you earn, but how much you earn per hour and how freely. Money that costs your whole life is expensive.",
      },
      {
        id: "hw-8",
        title: "The DEAL Framework",
        content:
          "Ferriss's system spells DEAL: Definition, Elimination, Automation, and Liberation. Each step moves you toward a freer life.",
      },
      {
        id: "hw-9",
        title: "D — Definition",
        content:
          "First, redefine your goals and rules. Get clear on the lifestyle you truly want rather than chasing vague notions of success.",
      },
      {
        id: "hw-10",
        title: "Dreamlining",
        content:
          "Turn dreams into concrete timelines. List what you want to have, be, and do, then price them out — often they're cheaper than you think.",
      },
      {
        id: "hw-11",
        title: "Fear-Setting",
        content:
          "Instead of goal-setting alone, define your fears in detail. Naming the worst case usually reveals it's survivable and reversible.",
      },
      {
        id: "hw-12",
        title: "Define the Worst Case",
        content:
          "Write out exactly what could go wrong and how you'd recover. Most fears shrink dramatically once examined on paper.",
      },
      {
        id: "hw-13",
        title: "The Cost of Inaction",
        content:
          "We weigh the risk of acting but ignore the cost of staying put. Ask what it will cost, in years and regret, to do nothing.",
      },
      {
        id: "hw-14",
        title: "E — Elimination",
        content:
          "Next, eliminate the unimportant to free your time. Productivity isn't doing more; it's doing less of what doesn't matter.",
      },
      {
        id: "hw-15",
        title: "The 80/20 Rule",
        content:
          "Roughly eighty percent of results come from twenty percent of efforts. Identify that vital twenty percent and cut the rest.",
      },
      {
        id: "hw-16",
        title: "Cut the Trivial Many",
        content:
          "Most tasks contribute little. Ruthlessly removing low-value activities creates space for what truly moves the needle.",
      },
      {
        id: "hw-17",
        title: "Parkinson's Law",
        content:
          "Work expands to fill the time available. Set tight deadlines and tasks shrink to fit, forcing focus on essentials.",
      },
      {
        id: "hw-18",
        title: "Short Deadlines Sharpen Focus",
        content:
          "Give yourself hours instead of days, and you'll cut the fluff automatically. Constraints breed efficiency.",
      },
      {
        id: "hw-19",
        title: "Effectiveness Over Efficiency",
        content:
          "Doing the right things matters more than doing things right. Being efficient at unimportant tasks is still a waste.",
      },
      {
        id: "hw-20",
        title: "The Low-Information Diet",
        content:
          "Most news and updates are irrelevant to your goals. Cutting the flood of information frees attention and reduces anxiety.",
      },
      {
        id: "hw-21",
        title: "Selective Ignorance",
        content:
          "Deliberately ignore what you can't act on or don't need. Protecting your attention is protecting your productivity.",
      },
      {
        id: "hw-22",
        title: "Batch Your Tasks",
        content:
          "Group similar tasks and do them together. Batching reduces the switching costs that fragment your day.",
      },
      {
        id: "hw-23",
        title: "Check Email Sparingly",
        content:
          "Constant inbox-checking shatters focus. Ferriss recommends checking email only once or twice a day at set times.",
      },
      {
        id: "hw-24",
        title: "The Not-To-Do List",
        content:
          "Deciding what you'll refuse to do is as powerful as any to-do list. Guard your time by saying no to distractions and low-value requests.",
      },
      {
        id: "hw-25",
        title: "Learn to Say No",
        content:
          "Every yes to the unimportant steals from the important. Politely declining protects the freedom you're building.",
      },
      {
        id: "hw-26",
        title: "A — Automation",
        content:
          "Third, automate income and tasks so money and work flow without your constant involvement. Build systems, not just effort.",
      },
      {
        id: "hw-27",
        title: "Build a Muse",
        content:
          "A 'muse' is an automated business that generates income with minimal ongoing work. It funds your freedom without a boss.",
      },
      {
        id: "hw-28",
        title: "Test Before You Invest",
        content:
          "Before committing money, cheaply test whether people will actually buy. Validate demand first to avoid costly failures.",
      },
      {
        id: "hw-29",
        title: "Outsource and Delegate",
        content:
          "Hand off repetitive tasks to assistants and services. Freeing yourself from busywork lets you focus on high-value decisions.",
      },
      {
        id: "hw-30",
        title: "Virtual Assistants",
        content:
          "Ferriss popularized using remote assistants to handle scheduling, research, and admin. Delegation multiplies your effective time.",
      },
      {
        id: "hw-31",
        title: "Systems Over Hustle",
        content:
          "Grinding harder has limits; well-built systems scale. Design processes that run without you rather than doing everything yourself.",
      },
      {
        id: "hw-32",
        title: "Remove Yourself From the Loop",
        content:
          "The goal is a business and life that don't depend on your constant attention. Automate decisions and free your presence.",
      },
      {
        id: "hw-33",
        title: "L — Liberation",
        content:
          "Finally, liberate yourself from a fixed location. Remote work and mobility let you live and work anywhere you choose.",
      },
      {
        id: "hw-34",
        title: "Escape the Office",
        content:
          "Ferriss offers tactics to negotiate remote work by proving your output. Freedom of place often follows freedom of proof.",
      },
      {
        id: "hw-35",
        title: "Geoarbitrage",
        content:
          "Earn in a strong currency and live where costs are low, and your money stretches far further. Location can transform your lifestyle.",
      },
      {
        id: "hw-36",
        title: "Fill the Void With Purpose",
        content:
          "Freedom without direction breeds boredom. Ferriss warns that once you escape work, you must fill life with meaning and passion.",
      },
      {
        id: "hw-37",
        title: "The Point Isn't Idleness",
        content:
          "The aim isn't to do nothing but to do what excites and fulfills you. Freedom is a tool for a richer life, not mere laziness.",
      },
      {
        id: "hw-38",
        title: "Do What Excites You",
        content:
          "Chase excitement, not just relaxation. Pursuing challenges and adventures is what makes a free life genuinely rewarding.",
      },
      {
        id: "hw-39",
        title: "Question the Rules",
        content:
          "Most limits are assumed, not real. Ferriss thrives by asking whether the conventional rules actually apply to him.",
      },
      {
        id: "hw-40",
        title: "Do the Opposite",
        content:
          "When everyone zigs, consider zagging. Contrarian thinking uncovers opportunities the crowd overlooks.",
      },
      {
        id: "hw-41",
        title: "Be Unreasonable",
        content:
          "Reasonable people accept the world as it is; the unreasonable reshape it. Ambitious, bold requests often get surprising yeses.",
      },
      {
        id: "hw-42",
        title: "Ask Better Questions",
        content:
          "The quality of your life follows the quality of your questions. Ask 'what would this look like if it were easy?' and options appear.",
      },
      {
        id: "hw-43",
        title: "Focus on Strengths",
        content:
          "Rather than fixing every weakness, multiply your strengths. Doubling down on what you do best yields outsized returns.",
      },
      {
        id: "hw-44",
        title: "Eliminate, Then Automate",
        content:
          "Never automate what you can eliminate. Cut a task entirely before spending effort to make it efficient.",
      },
      {
        id: "hw-45",
        title: "Money Buys Freedom, Not Stuff",
        content:
          "Use income to purchase time and options rather than status symbols. Freedom compounds; possessions depreciate.",
      },
      {
        id: "hw-46",
        title: "Work Smarter, Not Longer",
        content:
          "Hours worked is a poor measure of value. Concentrated, high-leverage effort beats long days of busywork.",
      },
      {
        id: "hw-47",
        title: "Beware Busyness as Identity",
        content:
          "Many wear busyness as a badge of honour. Ferriss reframes it as a warning sign of poor prioritization.",
      },
      {
        id: "hw-48",
        title: "Design, Don't Drift",
        content:
          "Without a design, life defaults to others' expectations. Consciously architecting your days is how you take back control.",
      },
      {
        id: "hw-49",
        title: "Start Small, Start Now",
        content:
          "You don't need to quit everything today. Small experiments — a mini-project, a test business — begin the shift toward freedom.",
      },
      {
        id: "hw-50",
        title: "Continuous Learning",
        content:
          "The freed life is a chance to learn languages, skills, and crafts. Growth keeps the adventure fresh and meaningful.",
      },
      {
        id: "hw-51",
        title: "Comparison Steals Freedom",
        content:
          "Chasing others' benchmarks traps you on a treadmill. Define enough on your own terms and step off the comparison game.",
      },
      {
        id: "hw-52",
        title: "Time Is Non-Renewable",
        content:
          "You can always make more money, never more time. Spending your scarcest resource wisely is the essence of the book.",
      },
      {
        id: "hw-53",
        title: "Test Assumptions Constantly",
        content:
          "Before accepting any 'have to,' test whether it's actually required. Many constraints crumble under a simple experiment.",
      },
      {
        id: "hw-54",
        title: "Automate Your Finances",
        content:
          "Set up systems for saving, paying, and investing automatically. Removing manual steps protects both money and attention.",
      },
      {
        id: "hw-55",
        title: "The Fear of Freedom",
        content:
          "Some people fear open time more than a busy schedule. Ferriss notes that designing a meaningful life requires facing that discomfort.",
      },
      {
        id: "hw-56",
        title: "Reclaim Your Attention",
        content:
          "Cutting inputs, batching, and saying no all serve one aim: reclaiming your focus for what genuinely matters.",
      },
      {
        id: "hw-57",
        title: "Adventure Over Accumulation",
        content:
          "Experiences and adventures, not possessions, define a rich life. Spend your freedom on living, not on acquiring.",
      },
      {
        id: "hw-58",
        title: "Take the Mini-Retirement",
        content:
          "Don't wait for permission or the perfect moment. Plan an extended break, travel, or project — and actually take it.",
      },
      {
        id: "hw-59",
        title: "Freedom Is a Skill",
        content:
          "Designing a free, mobile, automated life is a set of learnable skills, not luck. Anyone willing to question the norms can build it.",
      },
      {
        id: "hw-60",
        title: "Design Your Ideal Life",
        content:
          "Define what you want, eliminate the trivial, automate the essential, and liberate yourself from place. That's how you build a life of freedom.",
      },
    ],
  },

  // Meditations — Marcus Aurelius
  "bk-659": {
    bookId: "bk-659",
    tagline: "The private Stoic reflections of a Roman emperor",
    updated: "2026-07",
    frames: [
      {
        id: "me-1",
        title: "A Roman Emperor's Diary",
        content:
          "Meditations was never meant for publication — it's Marcus Aurelius's private notebook of Stoic reflections, written to steady himself as he ruled an empire.",
      },
      {
        id: "me-2",
        title: "Philosophy for Living",
        content:
          "These aren't abstract theories but practical reminders for daily life. Marcus wrote to train his own character, and his notes still guide millions.",
      },
      {
        id: "me-3",
        title: "What Is in Our Control",
        content:
          "The heart of Stoicism: some things are up to us — our judgments and actions — and some are not. Peace comes from focusing only on the former.",
      },
      {
        id: "me-4",
        title: "The Dichotomy of Control",
        content:
          "You can't control events, other people, or outcomes — only your responses. Investing energy in what you can't control breeds frustration.",
      },
      {
        id: "me-5",
        title: "Externals Are Indifferent",
        content:
          "Wealth, health, and reputation are neither good nor bad in themselves. What matters is the virtue with which you handle them.",
      },
      {
        id: "me-6",
        title: "Your Judgments Disturb You",
        content:
          "It's not events that upset us but our opinions about them. Change the judgment, and the disturbance dissolves.",
      },
      {
        id: "me-7",
        title: "Remove the Opinion",
        content:
          "Marcus reminds himself: take away the story you've added, and the harm often vanishes. Much suffering is self-inflicted through interpretation.",
      },
      {
        id: "me-8",
        title: "The Obstacle Is the Way",
        content:
          "What blocks the path can become the path. The impediment to action can be turned into an opportunity to practice virtue.",
      },
      {
        id: "me-9",
        title: "Turn Adversity Into Virtue",
        content:
          "Every difficulty is a chance to exercise patience, courage, or wisdom. Obstacles are the raw material of good character.",
      },
      {
        id: "me-10",
        title: "Love Your Fate",
        content:
          "Accept, even embrace, whatever happens as part of nature's order. Wishing reality were otherwise only adds needless suffering.",
      },
      {
        id: "me-11",
        title: "Accept What Happens",
        content:
          "Marcus counsels welcoming events as a doctor accepts a difficult case — not resigned, but composed and ready to respond well.",
      },
      {
        id: "me-12",
        title: "Live According to Nature",
        content:
          "For the Stoics, living well means living in harmony with nature — and human nature is rational and social. Reason and cooperation are our purpose.",
      },
      {
        id: "me-13",
        title: "Reason Is Our Gift",
        content:
          "What sets humans apart is the capacity to reason. Using that faculty to govern our impulses is how we fulfill our nature.",
      },
      {
        id: "me-14",
        title: "Virtue Is the Only Good",
        content:
          "The Stoics hold that a good character is the sole true good. With virtue you can be content in any circumstance.",
      },
      {
        id: "me-15",
        title: "The Four Virtues",
        content:
          "Stoicism rests on four cardinal virtues: wisdom, justice, courage, and self-discipline. Marcus returns to them as his compass.",
      },
      {
        id: "me-16",
        title: "Wisdom",
        content:
          "Wisdom is knowing what is good, bad, and indifferent — and acting accordingly. It's the practical skill of living rightly.",
      },
      {
        id: "me-17",
        title: "Justice",
        content:
          "Treat others fairly and work for the common good. Marcus, though emperor, insists on serving people rather than lording over them.",
      },
      {
        id: "me-18",
        title: "Courage",
        content:
          "Face hardship, fear, and even death with steadiness. Courage is doing what's right despite discomfort or danger.",
      },
      {
        id: "me-19",
        title: "Self-Discipline",
        content:
          "Master your desires and impulses rather than being ruled by them. Temperance keeps you free and clear-headed.",
      },
      {
        id: "me-20",
        title: "The Present Moment",
        content:
          "You possess only the present. The past is gone and the future unknown, so live fully in the now — it's all you truly have.",
      },
      {
        id: "me-21",
        title: "You Only Ever Lose the Now",
        content:
          "Since only the present is real, even death takes only this fleeting moment. Focusing on now frees you from regret and dread.",
      },
      {
        id: "me-22",
        title: "Remember You Will Die",
        content:
          "Marcus constantly reminds himself of mortality. Awareness of death sharpens priorities and dispels petty concerns.",
      },
      {
        id: "me-23",
        title: "Death Is Natural",
        content:
          "Death is a natural process, like being born, not something to fear. Accepting it lets you live with urgency and calm.",
      },
      {
        id: "me-24",
        title: "All Things Pass",
        content:
          "Everything is in flux and soon forgotten. Remembering the impermanence of all things loosens our grip on trivial worries.",
      },
      {
        id: "me-25",
        title: "Fame Is Fleeting",
        content:
          "Marcus notes that even great names fade and those who praise you soon die too. Chasing reputation is chasing smoke.",
      },
      {
        id: "me-26",
        title: "The View From Above",
        content:
          "Imagine looking down on your life and the world from a great height. From that cosmic perspective, most troubles shrink to nothing.",
      },
      {
        id: "me-27",
        title: "We Are Small, Time Is Vast",
        content:
          "Against the immensity of time and the universe, our lives are brief and tiny. This humbling view brings both perspective and peace.",
      },
      {
        id: "me-28",
        title: "The Inner Citadel",
        content:
          "Your mind is a fortress no external force can breach without your consent. Retreat into it, and you're always secure.",
      },
      {
        id: "me-29",
        title: "Retreat Within",
        content:
          "You don't need a country house to find peace; you can withdraw into your own mind anytime. Inner calm is always available.",
      },
      {
        id: "me-30",
        title: "Be Like the Rock",
        content:
          "Marcus pictures a headland battered by waves that stands unmoved. Be that rock — steady while the storms of life crash around you.",
      },
      {
        id: "me-31",
        title: "Undisturbed by Externals",
        content:
          "Nothing outside your mind can truly harm your character. Only your own consent can trouble your inner peace.",
      },
      {
        id: "me-32",
        title: "Do Your Duty",
        content:
          "Rise each day and do the work you're here to do. Marcus urges himself past reluctance to fulfill his responsibilities.",
      },
      {
        id: "me-33",
        title: "Act for the Common Good",
        content:
          "We exist to serve one another, like parts of one body. What benefits the whole community ultimately benefits you.",
      },
      {
        id: "me-34",
        title: "We Are Made for Cooperation",
        content:
          "Humans are social by nature, made to work together. To act against others is to act against your own nature.",
      },
      {
        id: "me-35",
        title: "On Difficult People",
        content:
          "Each morning, Marcus prepares to meet the ungrateful, arrogant, and dishonest. Expecting difficulty keeps him from being thrown by it.",
      },
      {
        id: "me-36",
        title: "Others Act From Ignorance",
        content:
          "People do wrong because they don't know better. Understanding this replaces anger with patience and even compassion.",
      },
      {
        id: "me-37",
        title: "Anger Harms You Most",
        content:
          "Losing your temper punishes you more than the offender. Marcus reminds himself that composure is strength, not weakness.",
      },
      {
        id: "me-38",
        title: "The Best Revenge",
        content:
          "The finest response to bad behaviour is not to imitate it. Stay good and just, and you've already won.",
      },
      {
        id: "me-39",
        title: "Forgive and Move On",
        content:
          "Holding grudges burdens only you. Correct others gently if you can, forgive their nature, and return to your own work.",
      },
      {
        id: "me-40",
        title: "Simplicity",
        content:
          "Marcus prizes a plain, focused life. Do fewer things, but do what's essential, and you'll find greater peace.",
      },
      {
        id: "me-41",
        title: "Ask: Is This Necessary?",
        content:
          "Before acting or speaking, ask whether it's needful. Cutting the unnecessary frees time and calms the mind.",
      },
      {
        id: "me-42",
        title: "Humility",
        content:
          "Despite being emperor, Marcus reminds himself he's one small part of the cosmos. Humility guards against the corruption of power.",
      },
      {
        id: "me-43",
        title: "Guard Against Ego",
        content:
          "Power and praise can inflate the self. Marcus deliberately keeps his ego in check, remembering he too will soon be dust.",
      },
      {
        id: "me-44",
        title: "Examine Yourself",
        content:
          "Regular self-scrutiny keeps character on track. Marcus reviews his thoughts and actions to correct and improve himself.",
      },
      {
        id: "me-45",
        title: "Morning Preparation",
        content:
          "He rehearses the day's challenges in advance, so nothing catches him unprepared. Anticipation breeds steadiness.",
      },
      {
        id: "me-46",
        title: "Evening Review",
        content:
          "Looking back over the day — what you did well and poorly — turns experience into growth. Reflection is how character is forged.",
      },
      {
        id: "me-47",
        title: "Gratitude",
        content:
          "Marcus opens his book thanking those who shaped him. Appreciating what and who you've been given fosters contentment.",
      },
      {
        id: "me-48",
        title: "Appreciate What You Have",
        content:
          "Rather than craving more, dwell on the good already present in your life. Gratitude is a quiet antidote to endless wanting.",
      },
      {
        id: "me-49",
        title: "Waste No Time",
        content:
          "Life is short and uncertain. Don't squander it on trivialities, gossip, or delay — do what matters, now.",
      },
      {
        id: "me-50",
        title: "Character Over Reputation",
        content:
          "Care about being good, not about seeming good. What others think is beyond your control; your character is entirely yours.",
      },
      {
        id: "me-51",
        title: "Be Good, Don't Talk About It",
        content:
          "Don't waste breath debating what a good person is — be one. Marcus values quiet virtue over philosophical posturing.",
      },
      {
        id: "me-52",
        title: "The Rational Universe",
        content:
          "The Stoics saw the cosmos as ordered by reason, the logos. Trusting this larger order helps you accept your place within it.",
      },
      {
        id: "me-53",
        title: "Everything Is Connected",
        content:
          "All things are woven together in one web. Seeing yourself as part of a greater whole dissolves isolation and self-importance.",
      },
      {
        id: "me-54",
        title: "Endure and Renounce",
        content:
          "A Stoic motto: bear what must be borne, and give up craving what you cannot have. Endurance and restraint bring freedom.",
      },
      {
        id: "me-55",
        title: "Control Your Perceptions",
        content:
          "You have power over your mind, not outside events. Realizing this, Marcus writes, is where your strength truly lies.",
      },
      {
        id: "me-56",
        title: "Waste No Anger on the World",
        content:
          "Getting angry at how things are is futile; the world owes you nothing. Adjust yourself to reality rather than raging at it.",
      },
      {
        id: "me-57",
        title: "Do the Right Thing Regardless",
        content:
          "Act justly whether or not you're recognized. Virtue is its own reward and needs no audience.",
      },
      {
        id: "me-58",
        title: "Discomfort Is Bearable",
        content:
          "Pain and hardship, Marcus reminds himself, are endurable and pass. The mind can rise above the body's complaints.",
      },
      {
        id: "me-59",
        title: "Keep Returning to Principle",
        content:
          "When you drift, gently return to your Stoic principles, again and again. The practice is in the returning.",
      },
      {
        id: "me-60",
        title: "A Practice, Not a Theory",
        content:
          "Stoicism is meant to be lived, not merely read. Marcus's repetitions show that even an emperor had to practice daily.",
      },
      {
        id: "me-61",
        title: "Waste Not the Present on the Future",
        content:
          "Anxiety about the future robs the present of life. Meet each moment as it comes, doing what it asks of you.",
      },
      {
        id: "me-62",
        title: "Serve Without Complaint",
        content:
          "Marcus carried immense burdens yet counseled himself against self-pity. Do your work quietly and well, without grumbling.",
      },
      {
        id: "me-63",
        title: "Nothing Truly Belongs to Us",
        content:
          "Everything, even our bodies and loved ones, is on loan from nature. Holding this loosely spares us much grief when things pass.",
      },
      {
        id: "me-64",
        title: "The Strength of Calm",
        content:
          "A tranquil, well-ordered mind is the greatest strength. Marcus shows that real power is self-command, not command over others.",
      },
      {
        id: "me-65",
        title: "Timeless Consolation",
        content:
          "Written for one troubled man two thousand years ago, these words still comfort and steady readers facing life's storms today.",
      },
      {
        id: "me-66",
        title: "Live as a Stoic",
        content:
          "Focus on what you control, act with virtue, accept what comes, serve others, and remember your mortality. That is the path to a serene life.",
      },
    ],
  },

  // The Richest Man in Babylon — George S. Clason
  "bk-658": {
    bookId: "bk-658",
    tagline: "Timeless money lessons told through Babylonian parables",
    updated: "2026-07",
    frames: [
      {
        id: "rb-1",
        title: "Wisdom From Ancient Babylon",
        content:
          "Set in the world's first great city of wealth, Clason's parables teach financial principles that are as true today as they were thousands of years ago.",
      },
      {
        id: "rb-2",
        title: "Money Follows Laws",
        content:
          "Wealth isn't luck or magic; it obeys simple, learnable laws. Those who understand and follow them prosper, while others stay poor.",
      },
      {
        id: "rb-3",
        title: "Bansir's Question",
        content:
          "Bansir the chariot builder works hard yet has no gold. He and his friend Kobbi wonder why diligent labour hasn't made them rich.",
      },
      {
        id: "rb-4",
        title: "Hard Work Isn't Enough",
        content:
          "The friends realize that earning money and keeping money are different skills. Working hard without financial knowledge leaves you empty-handed.",
      },
      {
        id: "rb-5",
        title: "Arkad, the Richest Man",
        content:
          "They seek out Arkad, once a humble scribe, now Babylon's wealthiest man. He agrees to share the secrets that made him rich.",
      },
      {
        id: "rb-6",
        title: "A Part of All You Earn Is Yours to Keep",
        content:
          "Arkad's foundational lesson: pay yourself first. Set aside at least a tenth of everything you earn before paying anyone else.",
      },
      {
        id: "rb-7",
        title: "Pay Yourself First",
        content:
          "Most people pay everyone else and keep nothing. Reverse this — take your savings off the top, and live on what remains.",
      },
      {
        id: "rb-8",
        title: "Save at Least a Tenth",
        content:
          "Saving ten percent of your income, consistently, is enough to build wealth over time. You'll barely miss it, yet it compounds.",
      },
      {
        id: "rb-9",
        title: "Learn From the Competent",
        content:
          "Arkad first lost his savings by taking advice from a brickmaker about jewels. Seek guidance only from those expert in the matter at hand.",
      },
      {
        id: "rb-10",
        title: "Beware Bad Advice",
        content:
          "Well-meaning but ignorant advice can cost you everything. Consult people who have actually succeeded in what you're attempting.",
      },
      {
        id: "rb-11",
        title: "Make Your Gold Work",
        content:
          "Saved gold should not sit idle. Put it to work earning more, so your money begins to make money on its own.",
      },
      {
        id: "rb-12",
        title: "Money Multiplies",
        content:
          "Each coin you save can become a worker that earns for you, and its earnings earn too. This is the quiet power of compounding.",
      },
      {
        id: "rb-13",
        title: "The Seven Cures for a Lean Purse",
        content:
          "The king asks Arkad to teach Babylon's citizens. Arkad gives seven remedies to fatten an empty purse — a complete plan for wealth.",
      },
      {
        id: "rb-14",
        title: "Cure 1 — Start Your Purse to Fattening",
        content:
          "Keep one tenth of all you earn. This first cure begins the habit of accumulation that everything else builds on.",
      },
      {
        id: "rb-15",
        title: "Cure 2 — Control Your Expenditures",
        content:
          "Spending rises to match income unless you check it. Budget deliberately so your necessary expenses never consume all you make.",
      },
      {
        id: "rb-16",
        title: "Needs vs Desires",
        content:
          "What we call necessary expenses will always grow to equal our income. Distinguish true needs from endless desires.",
      },
      {
        id: "rb-17",
        title: "Cure 3 — Make Your Gold Multiply",
        content:
          "Invest your savings so they earn a steady return. A stream of gold flowing in, working while you sleep, is the road to wealth.",
      },
      {
        id: "rb-18",
        title: "Cure 4 — Guard Your Treasures From Loss",
        content:
          "Protect your principal above all. Invest only where your capital is safe, and never risk it chasing impossible returns.",
      },
      {
        id: "rb-19",
        title: "Protect the Principal",
        content:
          "The first rule of investing is not to lose what you have. Consult the wise and avoid schemes that promise too much.",
      },
      {
        id: "rb-20",
        title: "Cure 5 — Own Your Home",
        content:
          "Make your dwelling a profitable investment. Owning your home reduces your costs and gives you security and a growing asset.",
      },
      {
        id: "rb-21",
        title: "Cure 6 — Insure a Future Income",
        content:
          "Provide in advance for old age and for your family. Set aside money now so that your later years and loved ones are protected.",
      },
      {
        id: "rb-22",
        title: "Cure 7 — Increase Your Ability to Earn",
        content:
          "Cultivate your skills and knowledge. As you become more capable and valuable, your income naturally rises.",
      },
      {
        id: "rb-23",
        title: "Invest in Yourself",
        content:
          "The desire to earn more, backed by learning and effort, is a form of wealth-building. Your growing ability is your best asset.",
      },
      {
        id: "rb-24",
        title: "The Five Laws of Gold",
        content:
          "In another tale, Arkad's son learns the five laws of gold — enduring truths about how wealth is gained, kept, and lost.",
      },
      {
        id: "rb-25",
        title: "Law 1 — Gold Comes to the Saver",
        content:
          "Gold comes gladly to anyone who saves at least a tenth of their earnings to build an estate for their future.",
      },
      {
        id: "rb-26",
        title: "Law 2 — Gold Works for the Wise",
        content:
          "Gold labours diligently for the owner who finds it profitable employment, multiplying like flocks in the field.",
      },
      {
        id: "rb-27",
        title: "Law 3 — Gold Stays With the Careful",
        content:
          "Gold clings to the cautious owner who invests it under the advice of the wise and experienced.",
      },
      {
        id: "rb-28",
        title: "Law 4 — Gold Flees the Ignorant Investor",
        content:
          "Gold slips away from those who invest it in ventures they don't understand or that the wise would not approve.",
      },
      {
        id: "rb-29",
        title: "Law 5 — Gold Flees Get-Rich-Quick",
        content:
          "Gold flees the person who chases impossible returns, follows tempting schemes, or trusts their money to their own inexperience.",
      },
      {
        id: "rb-30",
        title: "The Gold Lender of Babylon",
        content:
          "Rodan, given fifty pieces of gold, wonders whom to trust. The spearmaker Mathon teaches him the wisdom of careful lending.",
      },
      {
        id: "rb-31",
        title: "Lend Only to the Trustworthy",
        content:
          "Better a little caution than a great regret. Lend or invest only where repayment or return is reasonably secure.",
      },
      {
        id: "rb-32",
        title: "Humans Repay From Character",
        content:
          "A borrower's ability and honesty matter more than their promises. Judge people by their track record before trusting them with gold.",
      },
      {
        id: "rb-33",
        title: "The Walls of Babylon",
        content:
          "Babylon's great walls protected it from invaders. The lesson: we all need protection — insurance and savings — against life's attacks.",
      },
      {
        id: "rb-34",
        title: "Build Your Own Walls",
        content:
          "Adequate protection against the unexpected — an emergency fund, insurance — is essential. Don't leave yourself defenseless.",
      },
      {
        id: "rb-35",
        title: "The Camel Trader",
        content:
          "Dabasir, once buried in debt and enslaved, tells how he clawed his way back to freedom and wealth through resolve.",
      },
      {
        id: "rb-36",
        title: "Where Determination Is, a Way Is Found",
        content:
          "Dabasir's turning point was deciding to repay every debt and reclaim his self-respect. Firm resolve creates a path where none seemed to exist.",
      },
      {
        id: "rb-37",
        title: "The Soul of a Free Man",
        content:
          "Dabasir chose to see his debts as an honourable duty rather than a prison. That shift in spirit changed everything.",
      },
      {
        id: "rb-38",
        title: "Face Your Debts Honestly",
        content:
          "Running from debt only deepens the trap. Confronting it head-on, with a plan, is the beginning of financial freedom.",
      },
      {
        id: "rb-39",
        title: "The Clay Tablets of Dabasir",
        content:
          "Dabasir's ancient plan, found on clay tablets, still works: a simple system for saving, repaying debt, and living within your means.",
      },
      {
        id: "rb-40",
        title: "Ten, Twenty, Seventy",
        content:
          "His plan: save one tenth of income, use two tenths to repay creditors, and live on the remaining seventy percent.",
      },
      {
        id: "rb-41",
        title: "Live on Seventy Percent",
        content:
          "Committing to live on most, but not all, of your income leaves room to both save and pay down what you owe.",
      },
      {
        id: "rb-42",
        title: "Repay Creditors Steadily",
        content:
          "Paying every creditor a fair, consistent portion earns their patience and respect, and steadily clears your debts.",
      },
      {
        id: "rb-43",
        title: "The Luckiest Man in Babylon",
        content:
          "Sharru Nada, a wealthy merchant, reveals that his fortune began with a secret about work discovered during his days as a slave.",
      },
      {
        id: "rb-44",
        title: "Work Is Your Best Friend",
        content:
          "Sharru Nada learned to love good, hard work. It was work, embraced wholeheartedly, that lifted him from slavery to riches.",
      },
      {
        id: "rb-45",
        title: "Good Luck Follows Effort",
        content:
          "Opportunity favours those in motion. What looks like luck usually visits the person already working hard and paying attention.",
      },
      {
        id: "rb-46",
        title: "Attract Good Fortune Through Action",
        content:
          "You can't wait passively for luck. Taking action and seizing opportunities is how the fortunate become fortunate.",
      },
      {
        id: "rb-47",
        title: "The Power of Small Beginnings",
        content:
          "Every fortune in these tales starts with a single saved coin and a firm decision. Modest, consistent steps build great wealth.",
      },
      {
        id: "rb-48",
        title: "Wealth Is Built, Not Wished",
        content:
          "Longing for riches changes nothing; disciplined action changes everything. Wealth is the result of habits, not hopes.",
      },
      {
        id: "rb-49",
        title: "Discipline Beats Luck",
        content:
          "Consistency in saving, investing, and living within your means beats any stroke of fortune. Discipline is the true secret.",
      },
      {
        id: "rb-50",
        title: "Control Your Financial Life",
        content:
          "You needn't be a slave to circumstance. Applying these principles puts you, not chance, in charge of your money.",
      },
      {
        id: "rb-51",
        title: "Seek Wise Counsel",
        content:
          "The parables repeat it: consult those with real experience before risking your gold. Good advice is worth seeking out.",
      },
      {
        id: "rb-52",
        title: "Patience and Compounding",
        content:
          "Gold grows slowly at first, then rapidly as its earnings earn. Patience lets the miracle of compounding do its work.",
      },
      {
        id: "rb-53",
        title: "Enjoy Life Along the Way",
        content:
          "The goal isn't miserly hoarding but a full, secure life. Provide for the future while still enjoying the present in moderation.",
      },
      {
        id: "rb-54",
        title: "Money Is a Tool for Living",
        content:
          "Wealth exists to give you security, freedom, and the ability to help others — not merely to be counted.",
      },
      {
        id: "rb-55",
        title: "Guard Against Temptation",
        content:
          "Get-rich-quick schemes and impatience destroy fortunes. The steady, cautious path is far surer than the flashy shortcut.",
      },
      {
        id: "rb-56",
        title: "Teach the Next Generation",
        content:
          "Arkad passes his wisdom to his son and his city. Financial principles, taught early, become a lasting family inheritance.",
      },
      {
        id: "rb-57",
        title: "Character and Wealth Together",
        content:
          "The Babylonians tie money to honour, diligence, and integrity. Lasting wealth and good character reinforce one another.",
      },
      {
        id: "rb-58",
        title: "Simple, Not Easy",
        content:
          "The principles are simple to understand but require discipline to follow. Their power lies in consistent practice over years.",
      },
      {
        id: "rb-59",
        title: "It's Never Too Late",
        content:
          "Dabasir began deep in debt and slavery, yet still built wealth. Wherever you start, these laws can transform your finances.",
      },
      {
        id: "rb-60",
        title: "Start Where You Are",
        content:
          "You don't need a large income to begin — only the decision to save a tenth and follow the laws. Start today, however small.",
      },
      {
        id: "rb-61",
        title: "Consistency Compounds",
        content:
          "Small, repeated acts of saving and wise investing snowball over time into security and abundance.",
      },
      {
        id: "rb-62",
        title: "Freedom Through Wealth",
        content:
          "Financial independence buys the freedom to live on your own terms. That freedom is the true prize the parables point toward.",
      },
      {
        id: "rb-63",
        title: "Timeless and Universal",
        content:
          "Though set in ancient Babylon, these lessons apply to anyone, anywhere. Human nature and money's laws haven't changed.",
      },
      {
        id: "rb-64",
        title: "Become Your Own Richest Man",
        content:
          "Save a tenth, control spending, invest wisely, protect what you have, and keep learning. Follow the laws, and wealth will find you.",
      },
    ],
  },

  // The Art of Seduction — Robert Greene
  "bk-656": {
    bookId: "bk-656",
    tagline: "The timeless art of charm, influence and irresistible attraction",
    updated: "2026-07",
    frames: [
      {
        id: "sd-1",
        title: "Seduction Is a Form of Power",
        content:
          "Greene frames seduction as the subtlest form of power — winning others through charm and psychology rather than force. It works in romance, business, and life.",
      },
      {
        id: "sd-2",
        title: "Charm Over Force",
        content:
          "You can never truly force people to want you; you can only draw them in. Indirect influence lasts where pressure only breeds resistance.",
      },
      {
        id: "sd-3",
        title: "Anyone Can Learn It",
        content:
          "Seduction isn't reserved for the beautiful. It's a set of learnable qualities and strategies anyone can cultivate.",
      },
      {
        id: "sd-4",
        title: "The Seductive Character",
        content:
          "The first half of the book profiles types of seducers. Recognizing which archetype suits you lets you develop your natural charm.",
      },
      {
        id: "sd-5",
        title: "The Siren",
        content:
          "The Siren radiates overt allure and confidence, offering an escape into pleasure and fantasy. Her power is heightened femininity and an air of danger.",
      },
      {
        id: "sd-6",
        title: "The Rake",
        content:
          "The Rake pursues with irresistible, all-consuming desire. His attention feels total and intoxicating, flattering the target with pure, unrestrained want.",
      },
      {
        id: "sd-7",
        title: "The Ideal Lover",
        content:
          "The Ideal Lover senses what people long for and becomes it. By fulfilling others' romantic and emotional ideals, they become impossible to resist.",
      },
      {
        id: "sd-8",
        title: "The Dandy",
        content:
          "The Dandy blurs conventional roles and radiates freedom and ambiguity. Their refusal to be categorized makes them intriguing and magnetic.",
      },
      {
        id: "sd-9",
        title: "The Natural",
        content:
          "The Natural charms through childlike spontaneity and innocence. Their unselfconscious playfulness disarms and delights.",
      },
      {
        id: "sd-10",
        title: "The Coquette",
        content:
          "The Coquette masters the art of delay — hot then cold, giving then withdrawing. This self-sufficient teasing keeps others endlessly pursuing.",
      },
      {
        id: "sd-11",
        title: "The Charmer",
        content:
          "The Charmer focuses entirely on you, soothing your ego and making you feel important. They rarely argue and always leave you feeling better.",
      },
      {
        id: "sd-12",
        title: "The Charismatic",
        content:
          "The Charismatic draws people with an inner fire — conviction, purpose, and self-belief. Their radiant certainty makes others want to follow.",
      },
      {
        id: "sd-13",
        title: "The Star",
        content:
          "The Star is a dreamlike, slightly distant figure onto whom people project fantasies. Their alluring, ungraspable image keeps admirers fascinated.",
      },
      {
        id: "sd-14",
        title: "The Anti-Seducer",
        content:
          "Anti-seducers repel through insecurity, self-absorption, neediness, or cheapness. Knowing these traits helps you avoid killing attraction.",
      },
      {
        id: "sd-15",
        title: "Know Your Target",
        content:
          "Seduction begins with deep observation. Every person has a particular character and unmet need; read it before you make a move.",
      },
      {
        id: "sd-16",
        title: "Everyone Has a Void",
        content:
          "People carry an inner lack — boredom, loneliness, an unlived dream. The seducer senses that void and offers to fill it.",
      },
      {
        id: "sd-17",
        title: "Read the Victim's Type",
        content:
          "Different people are susceptible in different ways. Tailoring your approach to their psychology is what makes it work.",
      },
      {
        id: "sd-18",
        title: "The Resistant Are Best",
        content:
          "The most guarded targets, once won over, become the most devoted. Resistance often masks the strongest hidden longing.",
      },
      {
        id: "sd-19",
        title: "The Seductive Process",
        content:
          "The second half maps seduction as a deliberate sequence of phases — from stirring interest to the final move. Patience and strategy guide each step.",
      },
      {
        id: "sd-20",
        title: "Choose the Right Victim",
        content:
          "Everything depends on selecting the right target — someone whose character responds to your particular charms. The wrong choice dooms the effort.",
      },
      {
        id: "sd-21",
        title: "Create a False Sense of Security",
        content:
          "Never approach too directly at first. Disarm suspicion by seeming harmless — a friend, not a pursuer — so their guard lowers.",
      },
      {
        id: "sd-22",
        title: "Approach Indirectly",
        content:
          "The indirect route is the seducer's path. Circle in slowly rather than announcing your intentions, and desire grows in the space you leave.",
      },
      {
        id: "sd-23",
        title: "Send Mixed Signals",
        content:
          "A blend of interest and reserve, warmth and mystery, keeps people intrigued. Predictability is the enemy of desire.",
      },
      {
        id: "sd-24",
        title: "Appear an Object of Desire",
        content:
          "We want what others want. Showing that you're valued and desired by others makes you instantly more attractive.",
      },
      {
        id: "sd-25",
        title: "Create a Need — Stir Anxiety",
        content:
          "Make people aware of a lack in their lives. A little discontent and longing is the soil in which seduction takes root.",
      },
      {
        id: "sd-26",
        title: "Master the Art of Insinuation",
        content:
          "Plant ideas indirectly through hints, suggestions, and ambiguity. What people conclude for themselves feels far more powerful than what you state.",
      },
      {
        id: "sd-27",
        title: "Enter Their Spirit",
        content:
          "Adapt to your target's moods and worldview. Meeting people where they are builds the rapport that opens them to you.",
      },
      {
        id: "sd-28",
        title: "Create Temptation",
        content:
          "Dangle the promise of adventure, pleasure, or escape. A vivid temptation pulls people out of their routine and toward you.",
      },
      {
        id: "sd-29",
        title: "Keep Them in Suspense",
        content:
          "Never become predictable. Constant small surprises keep the other person guessing and their interest alive.",
      },
      {
        id: "sd-30",
        title: "The Power of Words",
        content:
          "Language can enchant. Well-chosen, suggestive, flattering words weave a spell that plain speech never could.",
      },
      {
        id: "sd-31",
        title: "Pay Attention to Detail",
        content:
          "Small gestures — a remembered preference, a thoughtful touch — signal deep attention. Details create the feeling of being truly seen.",
      },
      {
        id: "sd-32",
        title: "Poeticize Your Presence",
        content:
          "Absence and idealization heighten desire. When you're away, let them fill the space with romantic imagination.",
      },
      {
        id: "sd-33",
        title: "Disarm With Vulnerability",
        content:
          "Revealing a strategic weakness or tenderness lowers defenses. A touch of vulnerability makes you human and trustworthy.",
      },
      {
        id: "sd-34",
        title: "Strategic Weakness",
        content:
          "Showing you can be affected — moved, softened — invites others closer. Perfect armor keeps people at a distance.",
      },
      {
        id: "sd-35",
        title: "Confuse Desire and Reality",
        content:
          "Blur the line between fantasy and life so the target loses their footing. Enchantment lives where reality softens into dream.",
      },
      {
        id: "sd-36",
        title: "Create the Perfect Illusion",
        content:
          "Craft experiences and moments that feel almost too good to be real. A beautiful illusion is more seductive than plain honesty.",
      },
      {
        id: "sd-37",
        title: "Isolate the Target",
        content:
          "Draw them away from their usual world and influences. In a private bubble, your presence looms larger and their attachment deepens.",
      },
      {
        id: "sd-38",
        title: "Prove Yourself",
        content:
          "At a certain point, demonstrate sincerity or sacrifice to dissolve lingering doubt. A meaningful gesture cements devotion.",
      },
      {
        id: "sd-39",
        title: "Stir Deep Emotions",
        content:
          "Reach past the surface to childhood feelings, nostalgia, and longing. Emotional depth binds far more strongly than pleasant chit-chat.",
      },
      {
        id: "sd-40",
        title: "Use the Forbidden",
        content:
          "A hint of the taboo or transgressive adds intensity. What feels a little dangerous or off-limits is powerfully alluring.",
      },
      {
        id: "sd-41",
        title: "Use Spiritual Lures",
        content:
          "Appeal to people's yearning for meaning, transcendence, or a higher connection. Seduction can operate on the soul, not just the senses.",
      },
      {
        id: "sd-42",
        title: "Mix Pleasure With Pain",
        content:
          "A little pain — jealousy, uncertainty, longing — makes pleasure sweeter. Constant ease breeds boredom; contrast keeps desire sharp.",
      },
      {
        id: "sd-43",
        title: "The Pursuer Becomes Pursued",
        content:
          "The ultimate move is to make the other person chase you. Once desire is strong, step back and let them come.",
      },
      {
        id: "sd-44",
        title: "Give Them Space to Fall",
        content:
          "Withdraw slightly and let the target close the distance. People treasure most what they feel they've won themselves.",
      },
      {
        id: "sd-45",
        title: "Master the Bold Move",
        content:
          "After building tension, a decisive, well-timed move resolves it. Hesitation at the climax squanders everything you've built.",
      },
      {
        id: "sd-46",
        title: "Timing Is Everything",
        content:
          "Move too soon and you seem desperate; too late and the moment cools. Sense the ripe instant and act with confidence.",
      },
      {
        id: "sd-47",
        title: "Beware the Aftereffects",
        content:
          "After the conquest, desire can cool into indifference or resentment. Manage the aftermath thoughtfully or maintain a graceful exit.",
      },
      {
        id: "sd-48",
        title: "Attention Is the Currency",
        content:
          "Genuine, focused attention is the seducer's greatest gift. In a distracted world, making someone feel truly seen is intoxicating.",
      },
      {
        id: "sd-49",
        title: "Make Them Feel Special",
        content:
          "Everyone longs to feel uniquely important. Convey that they are unlike anyone else, and their attachment deepens.",
      },
      {
        id: "sd-50",
        title: "The Power of Absence",
        content:
          "Too much presence breeds familiarity; measured absence breeds longing. Scarcity makes the heart grow fonder.",
      },
      {
        id: "sd-51",
        title: "Mystery Attracts",
        content:
          "Reveal yourself slowly. An unsolved puzzle keeps people fascinated, while full disclosure ends the intrigue.",
      },
      {
        id: "sd-52",
        title: "Never Be Too Available",
        content:
          "Constant availability lowers your value. A degree of unpredictability and independence keeps you desirable.",
      },
      {
        id: "sd-53",
        title: "Create Anticipation",
        content:
          "Desire lives in the waiting. Building suspense and slow escalation makes the eventual moment far more powerful.",
      },
      {
        id: "sd-54",
        title: "Slowness Intensifies Desire",
        content:
          "The great seducers take their time. Rushing kills the tension that makes seduction sweet; patience deepens it.",
      },
      {
        id: "sd-55",
        title: "Appeal to the Imagination",
        content:
          "What is suggested is more powerful than what is shown. Leave room for the other person's imagination to do the seducing.",
      },
      {
        id: "sd-56",
        title: "Be a Screen for Fantasies",
        content:
          "Let people project their dreams onto you. The most alluring figures are open enough that others see their ideal in them.",
      },
      {
        id: "sd-57",
        title: "Adapt to Each Person",
        content:
          "There's no single script. Read each individual and shape your approach to their unique desires and defenses.",
      },
      {
        id: "sd-58",
        title: "Listen Deeply",
        content:
          "Draw people out and truly listen. In being heard, they feel a rare intimacy that binds them to you.",
      },
      {
        id: "sd-59",
        title: "Flatter Without Fawning",
        content:
          "Sincere, specific admiration warms people; obvious flattery repels. Praise what's real and unexpected in them.",
      },
      {
        id: "sd-60",
        title: "The Push and Pull",
        content:
          "Alternate closeness and distance, warmth and coolness. This rhythm of advance and retreat keeps desire from going stale.",
      },
      {
        id: "sd-61",
        title: "Triangles Increase Desire",
        content:
          "A hint of rivals or admirers makes you more wanted. We instinctively value what others compete for.",
      },
      {
        id: "sd-62",
        title: "We Want What Others Want",
        content:
          "Desire is contagious and comparative. Being visibly valued by others is one of the strongest attractants there is.",
      },
      {
        id: "sd-63",
        title: "Provide Pleasure and Escape",
        content:
          "Offer a break from routine and worry. People are drawn to those who make their lives feel lighter and more exciting.",
      },
      {
        id: "sd-64",
        title: "Break the Routine",
        content:
          "Novelty reignites attention. Surprising experiences and spontaneity keep a connection from settling into dull predictability.",
      },
      {
        id: "sd-65",
        title: "The Language of the Body",
        content:
          "Posture, eye contact, and touch speak louder than words. Nonverbal signals often carry the real message of attraction.",
      },
      {
        id: "sd-66",
        title: "Presence and Voice",
        content:
          "A calm, warm presence and an expressive voice are powerful tools. How you say things matters as much as what you say.",
      },
      {
        id: "sd-67",
        title: "Confidence Is Magnetic",
        content:
          "Self-assurance draws people in; visible insecurity pushes them away. Cultivating genuine confidence is foundational to charm.",
      },
      {
        id: "sd-68",
        title: "But Never Seem Needy",
        content:
          "Neediness is the great destroyer of attraction. The more secure and self-sufficient you appear, the more magnetic you become.",
      },
      {
        id: "sd-69",
        title: "Avoid Self-Absorption",
        content:
          "The anti-seducer talks only about themselves. Turning attention outward, onto the other person, is the heart of charm.",
      },
      {
        id: "sd-70",
        title: "Never Argue",
        content:
          "Winning an argument loses the seduction. Charmers soothe and agree far more than they contradict.",
      },
      {
        id: "sd-71",
        title: "Enter Their World",
        content:
          "Show curiosity about the other person's interests and life. Meeting them in their world makes them feel understood and valued.",
      },
      {
        id: "sd-72",
        title: "Give Before You Take",
        content:
          "Generosity — of attention, gifts, and delight — builds goodwill and lowers defenses. Give first, and desire follows.",
      },
      {
        id: "sd-73",
        title: "The Grand Gesture",
        content:
          "A single bold, romantic gesture can leave a lasting impression. Used sparingly, spectacle intensifies emotion.",
      },
      {
        id: "sd-74",
        title: "Small Details Matter More",
        content:
          "Beyond grand gestures, it's the constant tiny attentions that seduce. Consistency in small things proves genuine care.",
      },
      {
        id: "sd-75",
        title: "The Power of Letters and Words",
        content:
          "Written words linger and can be reread endlessly. A well-crafted message keeps you present in the other person's mind.",
      },
      {
        id: "sd-76",
        title: "Vague, Suggestive Language",
        content:
          "Ambiguity invites imagination. Suggestive rather than explicit language lets desire fill in the blanks.",
      },
      {
        id: "sd-77",
        title: "Let Them Come to You",
        content:
          "Bait and position yourself so the target initiates. When they feel they chose you, their commitment is far deeper.",
      },
      {
        id: "sd-78",
        title: "The Retreat That Draws",
        content:
          "Sometimes stepping back pulls people forward. A strategic retreat can reignite a fading pursuit.",
      },
      {
        id: "sd-79",
        title: "Hesitation Kills Seduction",
        content:
          "At the decisive moment, boldness wins. Timidity and second-guessing dissolve the spell you've carefully built.",
      },
      {
        id: "sd-80",
        title: "Seduction in Everyday Life",
        content:
          "These principles govern all persuasion — sales, leadership, friendship. Anywhere you must win people over, charm is at work.",
      },
      {
        id: "sd-81",
        title: "Seducing Groups and Crowds",
        content:
          "Leaders and stars seduce masses with vision, image, and emotion. The same laws that win one heart can move a room or a nation.",
      },
      {
        id: "sd-82",
        title: "Charisma Scales",
        content:
          "Charismatic figures project inner conviction and mystery outward. Their self-belief becomes contagious across large audiences.",
      },
      {
        id: "sd-83",
        title: "Soft Power in Persuasion",
        content:
          "In business and negotiation, making people feel good and understood opens doors that pressure slams shut.",
      },
      {
        id: "sd-84",
        title: "Believe in Your Own Allure",
        content:
          "Self-seduction comes first: if you believe you're desirable and interesting, others sense and share that belief.",
      },
      {
        id: "sd-85",
        title: "Cultivate an Air of Mystery",
        content:
          "Never fully explain yourself. A degree of the unknown keeps others curious and drawn to discover more.",
      },
      {
        id: "sd-86",
        title: "Create Emotional Peaks",
        content:
          "Memorable highs and lows imprint far deeper than steady comfort. Orchestrating emotional intensity binds people to you.",
      },
      {
        id: "sd-87",
        title: "Manage Jealousy Carefully",
        content:
          "A touch of jealousy can inflame desire, but too much breeds resentment. Wield this powerful tool with restraint.",
      },
      {
        id: "sd-88",
        title: "Understand Human Longing",
        content:
          "At its core, seduction meets deep human needs — to be desired, seen, and swept away. Understanding longing is understanding people.",
      },
      {
        id: "sd-89",
        title: "Patience and Observation",
        content:
          "The master seducer watches and waits, gathering clues and choosing moments. Rushed effort betrays the whole art.",
      },
      {
        id: "sd-90",
        title: "Adapt Your Archetype",
        content:
          "Draw on whichever seducer type fits the moment. Flexibility across roles makes you compelling to a wider range of people.",
      },
      {
        id: "sd-91",
        title: "Guard Against Anti-Seductive Habits",
        content:
          "Complaining, bragging, clinging, and stinginess all repel. Removing these traits is as important as adding charm.",
      },
      {
        id: "sd-92",
        title: "Seduction as Understanding People",
        content:
          "Stripped of romance, the book is a deep study of human psychology, desire, and influence — useful far beyond courtship.",
      },
      {
        id: "sd-93",
        title: "A Double-Edged Art",
        content:
          "These same tools can manipulate or genuinely delight. The techniques are neutral; the intention behind them is what matters.",
      },
      {
        id: "sd-94",
        title: "The Ethics of Charm",
        content:
          "Used to exploit, seduction wounds; used to connect and enchant, it enriches. Choose to charm with respect, not deceit.",
      },
      {
        id: "sd-95",
        title: "Bring Enchantment to Life",
        content:
          "At its best, seduction is the art of making ordinary moments feel magical for another person. That is a gift, not a trick.",
      },
      {
        id: "sd-96",
        title: "The Art of Enchantment",
        content:
          "Master attention, mystery, timing, and emotion, and you can charm anyone. Wielded wisely, seduction is one of life's most graceful powers.",
      },
    ],
  },

  // Eat That Frog! — Brian Tracy
  "bk-600": {
    bookId: "bk-600",
    tagline: "21 ways to stop procrastinating and get more done",
    updated: "2026-07",
    frames: [
      {
        id: "ef-1",
        title: "Eat That Frog",
        content:
          "Your 'frog' is your biggest, most important task — the one you're most likely to put off. Tracy's rule: eat it first thing, before anything else.",
      },
      {
        id: "ef-2",
        title: "What Is Your Frog?",
        content:
          "Your frog is the task that can have the greatest positive impact on your life right now. Identifying it is half the battle.",
      },
      {
        id: "ef-3",
        title: "Eat the Ugliest Frog First",
        content:
          "If you have two important tasks, do the bigger, harder, more important one first. Tackle your worst frog while your energy is highest.",
      },
      {
        id: "ef-4",
        title: "Don't Stare at the Frog",
        content:
          "If you must eat a live frog, don't sit and look at it too long. Overthinking a dreaded task only feeds procrastination — just begin.",
      },
      {
        id: "ef-5",
        title: "Do First Things First",
        content:
          "The habit of starting with your most important task, and finishing it, is the key to high productivity and success.",
      },
      {
        id: "ef-6",
        title: "Set the Table",
        content:
          "Get crystal clear about your goals before acting. You can't hit a target you haven't defined — decide exactly what you want.",
      },
      {
        id: "ef-7",
        title: "Think on Paper",
        content:
          "Write your goals and tasks down. A written goal is concrete and actionable; one left in your head stays vague and easy to ignore.",
      },
      {
        id: "ef-8",
        title: "Clarity Is Everything",
        content:
          "Most procrastination comes from fuzzy goals. The clearer you are on what to do and why, the easier it is to start.",
      },
      {
        id: "ef-9",
        title: "Plan Every Day in Advance",
        content:
          "Make your task list the night before, so your subconscious works on it overnight and you start the day with direction.",
      },
      {
        id: "ef-10",
        title: "The 10/90 Rule",
        content:
          "The first ten percent of time spent planning saves up to ninety percent in execution. A few minutes of planning multiplies your results.",
      },
      {
        id: "ef-11",
        title: "Apply the 80/20 Rule",
        content:
          "Twenty percent of your tasks produce eighty percent of your results. Identify that vital twenty percent and focus your energy there.",
      },
      {
        id: "ef-12",
        title: "The Vital Few",
        content:
          "Resist the pull to do many small, easy tasks. One high-value task is worth more than a dozen trivial ones combined.",
      },
      {
        id: "ef-13",
        title: "Consider the Consequences",
        content:
          "Important tasks are those with big long-term consequences. Judge what to do by its future impact, not its momentary urgency.",
      },
      {
        id: "ef-14",
        title: "Think Long-Term",
        content:
          "Successful people are willing to sacrifice short-term comfort for long-term gain. Long-term thinking sharpens today's priorities.",
      },
      {
        id: "ef-15",
        title: "Importance Over Urgency",
        content:
          "Urgent tasks shout, but importance is quiet. Don't let a flood of urgent trivia crowd out the few things that truly matter.",
      },
      {
        id: "ef-16",
        title: "Practice Creative Procrastination",
        content:
          "You can't do everything, so procrastinate on purpose — deliberately delay low-value tasks to make room for high-value ones.",
      },
      {
        id: "ef-17",
        title: "Choose What to Put Off",
        content:
          "The productive don't avoid procrastination entirely; they choose to postpone what matters least. Cut the small frogs loose.",
      },
      {
        id: "ef-18",
        title: "The ABCDE Method",
        content:
          "Rank tasks A (must do), B (should do), C (nice to do), D (delegate), E (eliminate). Always work on your A tasks first.",
      },
      {
        id: "ef-19",
        title: "Never Do a B Before an A",
        content:
          "Discipline yourself to finish your most important A task before touching anything of lower value. Priorities must actually be prioritized.",
      },
      {
        id: "ef-20",
        title: "Delegate and Eliminate",
        content:
          "Hand off what others can do (D) and simply drop what doesn't matter (E). Freeing your plate lets you focus on the frogs only you can eat.",
      },
      {
        id: "ef-21",
        title: "Focus on Key Result Areas",
        content:
          "Identify the handful of results your role truly depends on. Excellence in these key areas drives your whole performance.",
      },
      {
        id: "ef-22",
        title: "The Law of Three",
        content:
          "Of all your tasks, three usually account for most of your value. Find those three and give them your best time and energy.",
      },
      {
        id: "ef-23",
        title: "Your Three Vital Tasks",
        content:
          "Ask what would matter most if you could only do three things all week. Those are the frogs worth protecting time for.",
      },
      {
        id: "ef-24",
        title: "Prepare Thoroughly",
        content:
          "Before you begin, gather everything you need — information, tools, a clear space. Good preparation removes excuses to delay.",
      },
      {
        id: "ef-25",
        title: "Set Up for Success",
        content:
          "A clean, ready workspace and a clear plan make starting easy. Reduce the friction that tempts you to put things off.",
      },
      {
        id: "ef-26",
        title: "One Oil Barrel at a Time",
        content:
          "A huge task overwhelms us; focus only on the next step. As the saying goes, you can cross any desert one oil barrel at a time.",
      },
      {
        id: "ef-27",
        title: "Just Take the First Step",
        content:
          "You don't need to see the whole path — only the first move. Starting builds momentum that carries you through the rest.",
      },
      {
        id: "ef-28",
        title: "Upgrade Your Key Skills",
        content:
          "The better you get at your core tasks, the less you procrastinate on them. Continuous learning makes your frogs easier to swallow.",
      },
      {
        id: "ef-29",
        title: "Skill Beats Reluctance",
        content:
          "We avoid what we feel bad at. Improving a weak skill turns a dreaded task into one you can face with confidence.",
      },
      {
        id: "ef-30",
        title: "Identify Your Key Constraints",
        content:
          "Find the bottleneck holding back your biggest goal. Removing that single constraint often unlocks disproportionate progress.",
      },
      {
        id: "ef-31",
        title: "Look Inward for Limits",
        content:
          "Often the main constraint is within you — a skill, habit, or fear. Honestly locating it is the key to breaking through.",
      },
      {
        id: "ef-32",
        title: "Put the Pressure on Yourself",
        content:
          "Don't wait to be pushed. Set your own deadlines and standards, and act as if you had to leave town tomorrow.",
      },
      {
        id: "ef-33",
        title: "Be Your Own Boss",
        content:
          "High performers hold themselves to higher standards than anyone else would. Lead yourself and you won't need external pressure.",
      },
      {
        id: "ef-34",
        title: "Motivate Yourself Into Action",
        content:
          "Be your own cheerleader. Positive self-talk and optimism generate the energy to attack tasks rather than avoid them.",
      },
      {
        id: "ef-35",
        title: "Be an Optimist",
        content:
          "How you talk to yourself shapes your drive. Focus on solutions and possibilities, and action feels far more inviting.",
      },
      {
        id: "ef-36",
        title: "Technology Is a Terrible Master",
        content:
          "Constant devices and notifications shatter focus and feed procrastination. Left unchecked, technology runs you instead of the reverse.",
      },
      {
        id: "ef-37",
        title: "Disconnect to Focus",
        content:
          "Regularly switch everything off to work undisturbed. Periods of disconnection are where your real, deep work gets done.",
      },
      {
        id: "ef-38",
        title: "Technology Is a Wonderful Servant",
        content:
          "Used deliberately, tools can boost your productivity enormously. The key is to command your technology rather than obey it.",
      },
      {
        id: "ef-39",
        title: "Use Tools on Your Terms",
        content:
          "Decide when and how you'll use devices to serve your goals. Intentional use turns technology into a genuine ally.",
      },
      {
        id: "ef-40",
        title: "Focus Your Attention",
        content:
          "Concentration on a single task is the secret of high output. Every interruption resets your focus and costs you time.",
      },
      {
        id: "ef-41",
        title: "The Cost of Interruptions",
        content:
          "It takes minutes to fully refocus after each distraction. Protecting uninterrupted time is protecting your productivity.",
      },
      {
        id: "ef-42",
        title: "Slice the Task",
        content:
          "Break a big job into thin slices and do one at a time, like eating a salami. Small slices feel manageable where the whole felt impossible.",
      },
      {
        id: "ef-43",
        title: "The Swiss Cheese Method",
        content:
          "Punch holes in a big task by doing small five-minute chunks. A few holes create momentum that pulls you into the rest.",
      },
      {
        id: "ef-44",
        title: "Create Large Chunks of Time",
        content:
          "Important work needs unbroken blocks. Schedule big, protected chunks of time for your most valuable tasks.",
      },
      {
        id: "ef-45",
        title: "Block Time for Big Frogs",
        content:
          "Treat deep-work blocks like unmissable appointments. Guarding them ensures your frogs actually get eaten.",
      },
      {
        id: "ef-46",
        title: "Develop a Sense of Urgency",
        content:
          "Move fast on important tasks. A bias toward action and a sense of urgency are hallmarks of highly productive people.",
      },
      {
        id: "ef-47",
        title: "Get Into Flow",
        content:
          "Working quickly and continuously on a single task pulls you into flow, where focus deepens and output soars.",
      },
      {
        id: "ef-48",
        title: "Single-Handle Every Task",
        content:
          "Once you start your most important task, stay with it until it's one hundred percent complete. Don't jump between things.",
      },
      {
        id: "ef-49",
        title: "Do It to Completion",
        content:
          "Finishing gives a burst of energy and satisfaction. Half-done tasks drain you; completed ones fuel you.",
      },
      {
        id: "ef-50",
        title: "Starting and Stopping Wastes Time",
        content:
          "Every time you set a task down and pick it up again, you pay a re-entry cost. Single-handling avoids that waste entirely.",
      },
      {
        id: "ef-51",
        title: "The Momentum Principle",
        content:
          "It takes energy to start but less to keep going. Push through the initial resistance and momentum carries you forward.",
      },
      {
        id: "ef-52",
        title: "Overcome Procrastination Daily",
        content:
          "Beating procrastination isn't a one-time win but a daily practice. Each morning, choose to eat your frog again.",
      },
      {
        id: "ef-53",
        title: "Discipline Is the Key",
        content:
          "Self-discipline — making yourself do what you should, when you should — is the foundation beneath every one of these methods.",
      },
      {
        id: "ef-54",
        title: "Repetition Builds the Habit",
        content:
          "Do these practices until they're automatic. Productivity is a set of habits, and habits form through consistent repetition.",
      },
      {
        id: "ef-55",
        title: "Eat Your Frog, Every Day",
        content:
          "Plan, prioritize, and attack your most important task first, single-mindedly, each day. Do that consistently and your results transform.",
      },
    ],
  },

  // Deep Work — Cal Newport
  "bk-299": {
    bookId: "bk-299",
    tagline: "Rules for focused success in a distracted world",
    updated: "2026-07",
    frames: [
      {
        id: "dw-1",
        title: "The Age of Distraction",
        content:
          "In a world of constant notifications and open tabs, the ability to focus deeply has become both rare and enormously valuable. Newport shows how to reclaim it.",
      },
      {
        id: "dw-2",
        title: "Deep Work Defined",
        content:
          "Deep work is distraction-free concentration that pushes your cognitive abilities to their limit. It creates new value and is hard to replicate.",
      },
      {
        id: "dw-3",
        title: "Shallow Work Defined",
        content:
          "Shallow work is non-cognitively demanding, logistical tasks done while distracted — email, meetings, busywork. It's easy to replicate and adds little value.",
      },
      {
        id: "dw-4",
        title: "Deep Work Is Valuable",
        content:
          "The most rewarding work — learning hard skills, producing at an elite level — requires depth. Deep work is the engine of real achievement.",
      },
      {
        id: "dw-5",
        title: "Deep Work Is Rare",
        content:
          "As distraction rises, fewer people can concentrate. That scarcity makes the skill of deep work a genuine competitive advantage.",
      },
      {
        id: "dw-6",
        title: "Deep Work Is Meaningful",
        content:
          "Depth doesn't just produce results; it produces satisfaction. Immersion in demanding work is a reliable source of meaning and flow.",
      },
      {
        id: "dw-7",
        title: "The Deep Work Hypothesis",
        content:
          "The ability to do deep work is becoming rarer at the exact moment it's becoming more valuable. Those who cultivate it will thrive.",
      },
      {
        id: "dw-8",
        title: "The Two Core Abilities",
        content:
          "To succeed today you must quickly master hard things and produce at an elite level in quality and speed. Both depend on deep work.",
      },
      {
        id: "dw-9",
        title: "Master Hard Things Fast",
        content:
          "Learning complex skills requires intense, focused attention. You cannot master difficult material while distracted.",
      },
      {
        id: "dw-10",
        title: "The Quality Formula",
        content:
          "High-quality work equals time spent times intensity of focus. Cranking up focus lets you produce more in fewer hours.",
      },
      {
        id: "dw-11",
        title: "Deliberate Practice",
        content:
          "Skill grows through focused practice on the edge of your ability, with feedback. Distraction blocks the very concentration deliberate practice demands.",
      },
      {
        id: "dw-12",
        title: "Attention Residue",
        content:
          "When you switch tasks, part of your attention stays stuck on the last one. Constant switching leaves you perpetually half-focused.",
      },
      {
        id: "dw-13",
        title: "The Cost of Switching",
        content:
          "Even a quick glance at your inbox fragments your concentration for far longer than the glance itself. Multitasking quietly wrecks depth.",
      },
      {
        id: "dw-14",
        title: "Busyness Isn't Productivity",
        content:
          "In the absence of clear metrics, many mistake frantic activity for value. Visible busyness often masks a lack of meaningful output.",
      },
      {
        id: "dw-15",
        title: "You Are What You Focus On",
        content:
          "Your world is the sum of what you pay attention to. Concentrating on deep, worthy things quite literally builds a better life.",
      },
      {
        id: "dw-16",
        title: "Focus Shapes Wellbeing",
        content:
          "A wandering, distracted mind fixates on what's wrong. A focused mind, absorbed in good work, is calmer and more content.",
      },
      {
        id: "dw-17",
        title: "Craftsmanship and Meaning",
        content:
          "Depth turns work into craft. The care and skill of deep work give even ordinary jobs a sense of purpose.",
      },
      {
        id: "dw-18",
        title: "Choose a Deep Work Philosophy",
        content:
          "Newport offers four ways to schedule depth. Pick the one that fits your life rather than forcing a single ideal.",
      },
      {
        id: "dw-19",
        title: "The Monastic Philosophy",
        content:
          "Radically eliminate shallow obligations to maximize depth. Suited to those whose value comes from a single, clear pursuit.",
      },
      {
        id: "dw-20",
        title: "The Bimodal Philosophy",
        content:
          "Divide your time into stretches of total depth and stretches open to everything else. Reserve whole days or weeks for deep work.",
      },
      {
        id: "dw-21",
        title: "The Rhythmic Philosophy",
        content:
          "Make deep work a daily habit at the same time each day. Rhythm and routine make focus automatic rather than a decision.",
      },
      {
        id: "dw-22",
        title: "The Journalistic Philosophy",
        content:
          "Fit deep work into your schedule wherever you can, switching into focus at a moment's notice. It's demanding but flexible.",
      },
      {
        id: "dw-23",
        title: "Ritualize Your Deep Work",
        content:
          "Decide in advance where you'll work, for how long, and by what rules. Rituals remove friction and preserve willpower.",
      },
      {
        id: "dw-24",
        title: "Set Rules and Structure",
        content:
          "Define what's off-limits during deep sessions — no phone, no internet — and how you'll support the work with coffee, walks, or metrics.",
      },
      {
        id: "dw-25",
        title: "The Grand Gesture",
        content:
          "A dramatic change of environment or investment can jolt you into depth. Booking a hotel room to finish a project is a classic example.",
      },
      {
        id: "dw-26",
        title: "Change Your Environment",
        content:
          "A dedicated space signals your brain it's time to focus. Where you work shapes how deeply you can work.",
      },
      {
        id: "dw-27",
        title: "Execute Like a Business",
        content:
          "Newport borrows the Four Disciplines of Execution to make deep work happen consistently rather than by accident.",
      },
      {
        id: "dw-28",
        title: "Focus on the Wildly Important",
        content:
          "Trying to do everything dilutes your depth. Choose a small number of ambitious goals and pour your deep work into them.",
      },
      {
        id: "dw-29",
        title: "Act on Lead Measures",
        content:
          "Track the inputs you control — hours of deep work — rather than only distant outcomes. Lead measures drive daily behaviour.",
      },
      {
        id: "dw-30",
        title: "Keep a Scoreboard",
        content:
          "A visible tally of your deep-work hours creates motivation and momentum. What gets measured gets improved.",
      },
      {
        id: "dw-31",
        title: "Create Accountability",
        content:
          "Regularly review your deep-work record and confront the results. Honest accountability keeps the habit alive.",
      },
      {
        id: "dw-32",
        title: "Be Lazy — Schedule Downtime",
        content:
          "Depth requires rest. Deliberately ending work and doing nothing productive restores the attention deep work burns through.",
      },
      {
        id: "dw-33",
        title: "The Shutdown Ritual",
        content:
          "End each workday with a routine that reviews tasks and formally closes work. Once shut down, let work go until tomorrow.",
      },
      {
        id: "dw-34",
        title: "Downtime Sparks Insight",
        content:
          "The unconscious mind solves problems while you rest. Stepping away often delivers the breakthroughs effort alone couldn't.",
      },
      {
        id: "dw-35",
        title: "Rest Restores Attention",
        content:
          "Directed focus is a finite resource that recharges with rest, especially in nature. Protect your downtime to protect your depth.",
      },
      {
        id: "dw-36",
        title: "Embrace Boredom",
        content:
          "If you reach for your phone at every dull moment, you train your brain to crave distraction. Tolerating boredom rebuilds focus.",
      },
      {
        id: "dw-37",
        title: "Don't Take Breaks From Distraction",
        content:
          "Rather than occasionally unplugging, schedule your distraction. Take planned breaks from focus, not breaks from distraction.",
      },
      {
        id: "dw-38",
        title: "Schedule Internet Time",
        content:
          "Give yourself set windows for the internet and stay offline between them. This keeps your focus muscle from atrophying.",
      },
      {
        id: "dw-39",
        title: "Train Your Focus Muscle",
        content:
          "Concentration is a skill you strengthen with practice. Regularly resisting distraction makes deep focus progressively easier.",
      },
      {
        id: "dw-40",
        title: "Productive Meditation",
        content:
          "While walking or exercising, focus your mind on a single work problem. It trains concentration and generates ideas at once.",
      },
      {
        id: "dw-41",
        title: "Work With Intensity",
        content:
          "Set an ambitious deadline that forces intense focus, the way Roosevelt attacked his studies in short, ferocious bursts.",
      },
      {
        id: "dw-42",
        title: "Quit Social Media — Deliberately",
        content:
          "Newport urges evaluating each tool honestly rather than using it by default. Keep only what offers substantial benefit to your real goals.",
      },
      {
        id: "dw-43",
        title: "The Any-Benefit Trap",
        content:
          "We justify tools because they offer some possible benefit. But almost anything has some benefit; the question is whether it's worth the cost.",
      },
      {
        id: "dw-44",
        title: "The Craftsman Approach to Tools",
        content:
          "A craftsman adopts a tool only if its benefits to core goals outweigh its harms. Apply that rigorous standard to your apps and habits.",
      },
      {
        id: "dw-45",
        title: "The Law of the Vital Few",
        content:
          "A handful of activities drive most of your important results. Identify them and cut the many that contribute little.",
      },
      {
        id: "dw-46",
        title: "Reclaim Your Leisure",
        content:
          "Don't let free time dissolve into mindless scrolling. Planning meaningful leisure protects your attention even off the clock.",
      },
      {
        id: "dw-47",
        title: "Drain the Shallows",
        content:
          "Shallow work expands to fill available time. Deliberately minimizing it frees hours for the deep work that actually matters.",
      },
      {
        id: "dw-48",
        title: "Schedule Every Minute",
        content:
          "Plan your day in time blocks rather than reacting to whatever arises. A schedule ensures depth gets protected space.",
      },
      {
        id: "dw-49",
        title: "Quantify Each Task's Depth",
        content:
          "Ask how many months it would take a smart graduate to do a task. Low-skill tasks are shallow — treat them accordingly.",
      },
      {
        id: "dw-50",
        title: "Fix a Shallow-Work Budget",
        content:
          "Decide what fraction of your time shallow work may consume, then defend the rest for depth. Make the trade-off explicit.",
      },
      {
        id: "dw-51",
        title: "Finish by Five",
        content:
          "Fixed-schedule productivity — committing to end work at a set hour — forces you to ruthlessly prioritize and cut the shallow.",
      },
      {
        id: "dw-52",
        title: "Become Hard to Reach",
        content:
          "Constant availability is the enemy of depth. Set expectations that you won't respond instantly, and protect your focus.",
      },
      {
        id: "dw-53",
        title: "Make Senders Do More Work",
        content:
          "Use sender filters and clear guidelines so people send you fewer, better-considered messages — and you owe fewer replies.",
      },
      {
        id: "dw-54",
        title: "Don't Respond by Default",
        content:
          "You're not obligated to answer every email. Reply only when it clearly serves your goals, and let the rest go.",
      },
      {
        id: "dw-55",
        title: "Do More in Less Time",
        content:
          "With intense focus and less shallow clutter, you accomplish more meaningful work in fewer hours — and reclaim your evenings.",
      },
      {
        id: "dw-56",
        title: "Deep Work Builds Career Capital",
        content:
          "The rare, valuable skills that create career freedom are forged through deep work. Depth compounds into opportunity.",
      },
      {
        id: "dw-57",
        title: "Focus Is the New IQ",
        content:
          "In the knowledge economy, the ability to concentrate is as decisive as raw intelligence. Trained attention is a genuine edge.",
      },
      {
        id: "dw-58",
        title: "Protect Your Attention",
        content:
          "Your attention is your most precious, most attacked resource. Guarding it deliberately is the central act of a productive life.",
      },
      {
        id: "dw-59",
        title: "Depth Over Distraction",
        content:
          "Given the choice between a distracted, busy life and a focused, deep one, Newport makes the case that depth is the richer path.",
      },
      {
        id: "dw-60",
        title: "Start Small",
        content:
          "You needn't overhaul everything at once. Begin with a single scheduled deep-work block a day and build from there.",
      },
      {
        id: "dw-61",
        title: "Consistency Compounds",
        content:
          "Deep work practiced daily compounds into mastery and output that sporadic effort can't match. Show up regularly.",
      },
      {
        id: "dw-62",
        title: "Guard Your Mornings",
        content:
          "For many, willpower and focus are highest early. Protect your best hours for your most demanding deep work.",
      },
      {
        id: "dw-63",
        title: "Single-Task Fiercely",
        content:
          "Depth demands one thing at a time. Close the tabs, silence the phone, and give the task your whole mind.",
      },
      {
        id: "dw-64",
        title: "Boredom Is Not the Enemy",
        content:
          "Constant novelty-seeking corrodes focus. Comfort with quiet, unstimulated moments is a prerequisite for deep concentration.",
      },
      {
        id: "dw-65",
        title: "Meaning Through Mastery",
        content:
          "Getting genuinely good at something hard is deeply satisfying. Deep work is the road to that mastery and its meaning.",
      },
      {
        id: "dw-66",
        title: "Measure What Matters",
        content:
          "Track deep-work hours and skills gained, not inbox counts. Aligning your metrics with depth changes how you spend your day.",
      },
      {
        id: "dw-67",
        title: "Design a Distraction-Resistant Life",
        content:
          "Shape your tools, schedule, and environment to make depth the default and distraction the exception.",
      },
      {
        id: "dw-68",
        title: "Rest Is Strategic",
        content:
          "Deliberate rest isn't the opposite of productivity; it's what sustains deep work over the long haul. Recharge on purpose.",
      },
      {
        id: "dw-69",
        title: "The Deep Life",
        content:
          "Beyond productivity, Newport hints at a philosophy: a life built around depth, craft, and focus is a life well lived.",
      },
      {
        id: "dw-70",
        title: "Reclaim Your Focus",
        content:
          "The distracted default isn't inevitable. With intention and practice, you can rebuild the capacity for sustained concentration.",
      },
      {
        id: "dw-71",
        title: "Depth Is a Choice",
        content:
          "Every day offers a choice between shallow reaction and deep intention. Choosing depth, repeatedly, defines your work and life.",
      },
      {
        id: "dw-72",
        title: "Build the Habit",
        content:
          "Deep work is a trainable habit, not a talent. Ritualize it, protect it, and it becomes your natural way of working.",
      },
      {
        id: "dw-73",
        title: "Less, But Better",
        content:
          "Fewer priorities pursued with full focus beat many pursued distractedly. Depth is the art of doing less, but far better.",
      },
      {
        id: "dw-74",
        title: "A Life of Depth",
        content:
          "Master your attention, minimize the shallow, and pour yourself into work that matters. That is how you achieve focused success.",
      },
    ],
  },

  // The Art of War — Sun Tzu
  "bk-274": {
    bookId: "bk-274",
    tagline: "Ancient strategy for winning conflicts — on the battlefield and in life",
    updated: "2026-07",
    frames: [
      {
        id: "aw-1",
        title: "Timeless Strategy",
        content:
          "Written over two thousand years ago, Sun Tzu's manual on strategy applies far beyond war — to business, negotiation, and daily conflict. Its wisdom is about winning wisely.",
      },
      {
        id: "aw-2",
        title: "Conflict Is Serious Business",
        content:
          "War, Sun Tzu warns, is a matter of life and death for a state. Approach any serious conflict with the same gravity, study, and care.",
      },
      {
        id: "aw-3",
        title: "The Five Fundamental Factors",
        content:
          "Every contest turns on five things: moral purpose, timing, terrain, leadership, and discipline. Weigh all five before you commit.",
      },
      {
        id: "aw-4",
        title: "The Way — Moral Unity",
        content:
          "The first factor is the Way: a shared purpose that unites people with their leader. When your team believes in the cause, they'll follow you anywhere.",
      },
      {
        id: "aw-5",
        title: "Heaven — Timing",
        content:
          "Heaven represents timing and conditions — the seasons, the moment. Acting with the right timing, not just the right plan, is decisive.",
      },
      {
        id: "aw-6",
        title: "Earth — Terrain",
        content:
          "Earth is the ground you fight on — its distances, dangers, and openings. Know your terrain, literally or figuratively, before you move.",
      },
      {
        id: "aw-7",
        title: "The Commander — Leadership",
        content:
          "Victory needs a wise, courageous, disciplined leader. The qualities of the one in charge shape the fate of everyone under them.",
      },
      {
        id: "aw-8",
        title: "Method and Discipline",
        content:
          "Organization, logistics, and discipline decide whether strength can actually be applied. A brilliant plan fails without the systems to execute it.",
      },
      {
        id: "aw-9",
        title: "Assess Before You Act",
        content:
          "Sun Tzu insists on cold, thorough assessment first. Those who calculate carefully and honestly before battle usually win it.",
      },
      {
        id: "aw-10",
        title: "Know Yourself and Your Enemy",
        content:
          "His most famous line: know the enemy and know yourself, and you need not fear a hundred battles. Self-knowledge is half of strategy.",
      },
      {
        id: "aw-11",
        title: "Ignorance Is Danger",
        content:
          "Know yourself but not your enemy, and you'll win some and lose some. Know neither, and you're in peril in every encounter.",
      },
      {
        id: "aw-12",
        title: "All Warfare Is Deception",
        content:
          "Strategy relies on misdirection: appear unable when able, inactive when active. Keep opponents guessing about your true intentions.",
      },
      {
        id: "aw-13",
        title: "Appear Weak When Strong",
        content:
          "Hide your strength to be underestimated; feign weakness to lure overconfidence. Perception managed is advantage gained.",
      },
      {
        id: "aw-14",
        title: "Win Before You Fight",
        content:
          "The victorious army wins first and then goes to battle; the defeated fights first and hopes to win. Position for victory in advance.",
      },
      {
        id: "aw-15",
        title: "Battles Are Decided in Planning",
        content:
          "Most contests are won or lost before the first clash, in the quality of preparation and positioning. Do the winning in the planning.",
      },
      {
        id: "aw-16",
        title: "Win Without Fighting",
        content:
          "Supreme excellence is subduing the enemy without battle at all. The greatest victories cost the least blood.",
      },
      {
        id: "aw-17",
        title: "Break Resistance Bloodlessly",
        content:
          "To break the enemy's will through strategy, alliances, or leverage — without a fight — is the highest form of skill.",
      },
      {
        id: "aw-18",
        title: "War Is Costly",
        content:
          "Conflict drains resources, energy, and goodwill. Never enter one lightly, and always count the true cost first.",
      },
      {
        id: "aw-19",
        title: "Speed Over Prolonged War",
        content:
          "No nation benefits from prolonged warfare. If you must fight, win quickly; drawn-out conflicts exhaust and endanger everyone.",
      },
      {
        id: "aw-20",
        title: "Don't Get Bogged Down",
        content:
          "A long, grinding struggle blunts weapons and dampens morale. Avoid battles of attrition you can't decisively end.",
      },
      {
        id: "aw-21",
        title: "Fight Efficiently",
        content:
          "Use resources wisely and, where possible, turn the enemy's own strength to your advantage. Efficiency wins long campaigns.",
      },
      {
        id: "aw-22",
        title: "Attack the Enemy's Strategy",
        content:
          "The best approach is to foil the opponent's plans before they unfold. Defeat the strategy and you needn't defeat the army.",
      },
      {
        id: "aw-23",
        title: "Next Best: Break Alliances",
        content:
          "If you can't undo their plans, disrupt their alliances and support. Isolate an opponent and they weaken on their own.",
      },
      {
        id: "aw-24",
        title: "Worst: Besiege the Walls",
        content:
          "Direct, costly assaults on entrenched strength are the last resort. Avoid the head-on fight whenever a smarter path exists.",
      },
      {
        id: "aw-25",
        title: "Know When to Fight",
        content:
          "Victory comes to those who know when to fight and when not to. Picking your battles wisely is itself a decisive skill.",
      },
      {
        id: "aw-26",
        title: "Know When to Wait",
        content:
          "Sometimes the wisest move is not to engage. Patience and restraint can defeat an impatient enemy who overextends.",
      },
      {
        id: "aw-27",
        title: "Unity of Command",
        content:
          "An army with one clear commander and shared purpose beats a divided one. Confused authority loses before the fight begins.",
      },
      {
        id: "aw-28",
        title: "Don't Micromanage",
        content:
          "A ruler who interferes with the general in the field invites disaster. Empower capable people and let them lead.",
      },
      {
        id: "aw-29",
        title: "Make Yourself Invincible First",
        content:
          "Secure yourself against defeat before seeking to win. Your own solid position is what makes the enemy's mistakes exploitable.",
      },
      {
        id: "aw-30",
        title: "Wait for the Opening",
        content:
          "You can make yourself unbeatable, but you cannot force the enemy to expose himself. Prepare, then wait patiently for his error.",
      },
      {
        id: "aw-31",
        title: "Win the Easy Victories",
        content:
          "The truly skilled win with such foresight that their victories look effortless and unremarkable. They win where winning is easy.",
      },
      {
        id: "aw-32",
        title: "Position Beats Force",
        content:
          "Superior positioning lets a smaller force prevail. Arrange things so momentum and terrain do the work for you.",
      },
      {
        id: "aw-33",
        title: "Direct and Indirect",
        content:
          "Battles are won by combining the direct (expected) and indirect (surprising). The interplay of the two creates endless possibilities.",
      },
      {
        id: "aw-34",
        title: "The Power of Momentum",
        content:
          "Like a boulder rolling downhill, well-built momentum becomes unstoppable. Set conditions so your force gathers power on its own.",
      },
      {
        id: "aw-35",
        title: "Timing the Strike",
        content:
          "Energy is like a drawn crossbow; decision, like releasing the trigger. Strike at exactly the right instant, not a moment early or late.",
      },
      {
        id: "aw-36",
        title: "Attack Weakness, Avoid Strength",
        content:
          "Water flows around rocks to the low places; armies should avoid strength and strike weakness. Never attack where the enemy is strongest.",
      },
      {
        id: "aw-37",
        title: "Be Where They Aren't",
        content:
          "Advance where the enemy doesn't expect and isn't defended. Surprise and undefended openings are worth more than raw power.",
      },
      {
        id: "aw-38",
        title: "Make the Enemy Come to You",
        content:
          "Lure opponents onto ground of your choosing. When they move to your terms, you dictate the shape of the fight.",
      },
      {
        id: "aw-39",
        title: "Conceal Your Dispositions",
        content:
          "Hide your true plans and positions so the enemy must defend everywhere. Forced to spread thin, they are strong nowhere.",
      },
      {
        id: "aw-40",
        title: "Be Formless",
        content:
          "The ultimate strategy is to have no fixed form the enemy can read. If they can't predict you, they can't prepare against you.",
      },
      {
        id: "aw-41",
        title: "Adapt Like Water",
        content:
          "As water shapes itself to the ground, an army shapes itself to the enemy. There is no constant formation, only constant adaptation.",
      },
      {
        id: "aw-42",
        title: "No Fixed Method",
        content:
          "The one who can modify tactics endlessly in response to the opponent is called a master. Rigidity is the seed of defeat.",
      },
      {
        id: "aw-43",
        title: "Maneuvering",
        content:
          "The great difficulty is turning the circuitous into the direct — reaching your goal by an unexpected route while the enemy guards the obvious one.",
      },
      {
        id: "aw-44",
        title: "Turn Disadvantage Into Advantage",
        content:
          "Skilled strategists take a hard situation and bend it to their benefit. Constraints, handled cleverly, can become weapons.",
      },
      {
        id: "aw-45",
        title: "Unity and Morale",
        content:
          "A cohesive, motivated force multiplies its real strength. Attend to your people's spirit as carefully as their numbers.",
      },
      {
        id: "aw-46",
        title: "Manage the Enemy's Morale",
        content:
          "Sap the opponent's spirit and resolve. An army whose morale has broken is defeated before a blow lands.",
      },
      {
        id: "aw-47",
        title: "Attack When They're Weakest",
        content:
          "Strike when the enemy is tired, hungry, disorganized, or complacent. Choose the moment of their lowest strength for your highest.",
      },
      {
        id: "aw-48",
        title: "Discipline of Energy",
        content:
          "Don't waste your force on trivial fights or premature moves. Conserve your energy and unleash it only where it decides the outcome.",
      },
      {
        id: "aw-49",
        title: "Variation in Tactics",
        content:
          "There are roads not to travel and battles not to fight. Wisdom is knowing the exceptions to every rule and adapting on the spot.",
      },
      {
        id: "aw-50",
        title: "Consider Advantage and Disadvantage",
        content:
          "In every plan, weigh both the gains and the risks together. Blindness to the downside is how confident leaders fall.",
      },
      {
        id: "aw-51",
        title: "Five Dangerous Faults",
        content:
          "Sun Tzu warns of five flaws that ruin leaders: recklessness, cowardice, a hasty temper, a fragile sense of honour, and over-attachment to troops.",
      },
      {
        id: "aw-52",
        title: "Recklessness Leads to Destruction",
        content:
          "A leader who charges without thought gets destroyed. Boldness must be married to calculation, not replace it.",
      },
      {
        id: "aw-53",
        title: "Cowardice Leads to Capture",
        content:
          "A leader too afraid to act at the right moment loses by default. Timidity forfeits opportunities that never return.",
      },
      {
        id: "aw-54",
        title: "A Hasty Temper Can Be Provoked",
        content:
          "An easily angered leader can be baited into rash moves. Control your temper, or the enemy will use it against you.",
      },
      {
        id: "aw-55",
        title: "Fragile Honour Can Be Shamed",
        content:
          "A leader obsessed with reputation can be manipulated through insult. Don't let pride dictate strategy.",
      },
      {
        id: "aw-56",
        title: "Over-Attachment Can Be Exploited",
        content:
          "Excessive worry over one's people can paralyze decisions. Care deeply, but don't let it cloud necessary judgment.",
      },
      {
        id: "aw-57",
        title: "Read the Signs",
        content:
          "On the march, observe everything — dust, birds, movement, the enemy's behaviour. Small signs reveal large intentions.",
      },
      {
        id: "aw-58",
        title: "Interpret the Enemy",
        content:
          "Humble words with growing preparation signal an impending attack; bold words and forward movement may signal retreat. Read behaviour, not just claims.",
      },
      {
        id: "aw-59",
        title: "Know the Ground",
        content:
          "Different terrains demand different tactics. Understanding your ground — open, narrow, elevated, trapped — dictates how you should fight.",
      },
      {
        id: "aw-60",
        title: "Six Kinds of Terrain",
        content:
          "Sun Tzu classifies ground by how it shapes movement and advantage. Match your approach to the terrain rather than forcing one style.",
      },
      {
        id: "aw-61",
        title: "The Nine Situations",
        content:
          "From scattered ground to desperate ground, each situation calls for a distinct response. Recognize where you stand before you decide how to act.",
      },
      {
        id: "aw-62",
        title: "On Desperate Ground, Fight",
        content:
          "When there's no escape, soldiers fight with everything they have. Sometimes removing the option to retreat unlocks maximum resolve.",
      },
      {
        id: "aw-63",
        title: "Death Ground Breeds Courage",
        content:
          "Place people where survival demands their utmost, and they find strength they never knew. Necessity is a powerful motivator.",
      },
      {
        id: "aw-64",
        title: "Care for Your People",
        content:
          "Treat your soldiers as your own children and they'll follow you into the deepest valleys. Loyalty is earned through genuine care.",
      },
      {
        id: "aw-65",
        title: "Discipline With Compassion",
        content:
          "Kindness without discipline breeds chaos; discipline without kindness breeds resentment. Great leaders balance both.",
      },
      {
        id: "aw-66",
        title: "Reward and Standards",
        content:
          "Clear rewards and consistent standards keep a force sharp and fair. People give their best when effort is recognized and rules are just.",
      },
      {
        id: "aw-67",
        title: "Attack by Fire",
        content:
          "Fire — decisive, overwhelming force — must be used at the right time and place. Powerful weapons demand precise conditions to succeed.",
      },
      {
        id: "aw-68",
        title: "Never Fight From Anger",
        content:
          "No ruler should send troops to battle out of rage. Emotion-driven decisions in conflict are almost always disastrous.",
      },
      {
        id: "aw-69",
        title: "Anger Fades, Loss Doesn't",
        content:
          "Anger can turn back to gladness, but the destroyed cannot be restored. Weigh irreversible actions with utmost care.",
      },
      {
        id: "aw-70",
        title: "The Use of Spies",
        content:
          "Foreknowledge is the difference between victory and defeat, and it comes from intelligence — from people, not omens. Information is the ultimate edge.",
      },
      {
        id: "aw-71",
        title: "Intelligence Wins Wars",
        content:
          "Knowing the enemy's plans, strength, and movements in advance lets you strike with precision. Invest heavily in knowing.",
      },
      {
        id: "aw-72",
        title: "Five Kinds of Spies",
        content:
          "Sun Tzu details different sources of intelligence, each with its use. Diverse, cross-checked information guards against being deceived.",
      },
      {
        id: "aw-73",
        title: "Value Information Above All",
        content:
          "It's foolish to grudge the cost of good intelligence while spending fortunes on the fight. Knowing first is the cheapest path to winning.",
      },
      {
        id: "aw-74",
        title: "Deception Cuts Both Ways",
        content:
          "As you deceive, expect to be deceived. Verify what you're told and guard the secrecy of your own plans fiercely.",
      },
      {
        id: "aw-75",
        title: "Patience Is a Weapon",
        content:
          "The strategist waits calmly for the right moment while the impatient opponent blunders. Time, used well, is on the disciplined side.",
      },
      {
        id: "aw-76",
        title: "Flexibility Over Rigidity",
        content:
          "Plans meet reality and must bend. The willingness to change course as conditions shift separates victors from the stubbornly defeated.",
      },
      {
        id: "aw-77",
        title: "Economy of Force",
        content:
          "Achieve the maximum result with the minimum expenditure. Overkill wastes what a well-placed effort would have won cheaply.",
      },
      {
        id: "aw-78",
        title: "Control the Narrative",
        content:
          "Shape how the enemy perceives the situation. Feeding them a false picture leads them to defend the wrong things.",
      },
      {
        id: "aw-79",
        title: "Leadership Sets the Tone",
        content:
          "Calm, decisive leadership steadies a force in chaos. The commander's composure ripples through everyone beneath them.",
      },
      {
        id: "aw-80",
        title: "Adapt to the Opponent",
        content:
          "There is no single winning formula, only the response fitted to this enemy, this ground, this moment. Read and adjust continuously.",
      },
      {
        id: "aw-81",
        title: "Preserve, Don't Destroy",
        content:
          "It's better to capture an army, a city, or a rival intact than to wreck it. Winning while preserving value is the higher art.",
      },
      {
        id: "aw-82",
        title: "Strategy Beyond the Battlefield",
        content:
          "These principles govern any competition — business, career, negotiation. Wherever interests clash, Sun Tzu's logic applies.",
      },
      {
        id: "aw-83",
        title: "Self-Mastery First",
        content:
          "Before mastering opponents, master yourself — your emotions, discipline, and clarity. The inner battle underlies every outer one.",
      },
      {
        id: "aw-84",
        title: "Win With Wisdom, Not Force",
        content:
          "The deepest lesson isn't how to fight harder, but how to win smarter — often with the least conflict possible.",
      },
      {
        id: "aw-85",
        title: "Avoid Unnecessary Conflict",
        content:
          "The truest victory may be sidestepping a fight altogether. Choose your battles so most are won before they ever begin.",
      },
      {
        id: "aw-86",
        title: "The Art of War in Life",
        content:
          "Know yourself and your challenges, plan thoroughly, stay adaptable, and act with discipline and timing. That is how you prevail in any arena.",
      },
    ],
  },

  // The Art of Not Overthinking
  "bk-032": {
    bookId: "bk-032",
    tagline: "Quiet the mental noise and think clearly again",
    updated: "2026-07",
    frames: [
      {
        id: "ov-1",
        title: "The Overthinking Trap",
        content:
          "Overthinking turns a busy mind against itself, spinning the same thoughts without resolution. The goal isn't to stop thinking, but to stop the useless loops.",
      },
      {
        id: "ov-2",
        title: "Thinking vs Overthinking",
        content:
          "Healthy thinking moves toward a decision; overthinking circles endlessly. If your thoughts aren't leading anywhere, you've crossed the line.",
      },
      {
        id: "ov-3",
        title: "The Rumination Loop",
        content:
          "Replaying the past or rehearsing the future keeps you trapped in your head. Recognizing the loop is the first step to breaking it.",
      },
      {
        id: "ov-4",
        title: "Analysis Paralysis",
        content:
          "Too much deliberation freezes action. At some point more thinking doesn't improve the decision — it just delays it.",
      },
      {
        id: "ov-5",
        title: "Overthinking Feels Productive",
        content:
          "Churning over a problem gives the illusion of working on it. But worry is not the same as problem-solving.",
      },
      {
        id: "ov-6",
        title: "The Hidden Cost",
        content:
          "Overthinking drains energy, steals sleep, and fuels anxiety, all while rarely producing answers. It taxes you without paying out.",
      },
      {
        id: "ov-7",
        title: "Past and Future, Never Now",
        content:
          "Overthinking lives in regret about the past or worry about the future. Peace is found by returning to the present moment.",
      },
      {
        id: "ov-8",
        title: "Return to the Present",
        content:
          "The present is the only place life actually happens. Anchoring your attention here starves the loops that feed on past and future.",
      },
      {
        id: "ov-9",
        title: "Action Beats Analysis",
        content:
          "A small step forward reveals information no amount of thinking can. Action often dissolves the very worry you were stuck in.",
      },
      {
        id: "ov-10",
        title: "Just Start",
        content:
          "Momentum quiets the mind. Beginning — however imperfectly — interrupts the paralysis and gives your thoughts somewhere to go.",
      },
      {
        id: "ov-11",
        title: "Done Beats Perfect",
        content:
          "Perfectionism is overthinking's favourite fuel. Choosing 'good and finished' over 'perfect and forever pending' frees your mind.",
      },
      {
        id: "ov-12",
        title: "Embrace Good Enough",
        content:
          "Not every decision deserves maximum analysis. For most choices, a reasonable, timely answer beats an optimal, agonized one.",
      },
      {
        id: "ov-13",
        title: "You Can't Control Everything",
        content:
          "Much overthinking is an attempt to control the uncontrollable. Accepting uncertainty is the antidote to endless what-ifs.",
      },
      {
        id: "ov-14",
        title: "Make Peace With Uncertainty",
        content:
          "Life offers no guarantees, and demanding them keeps you stuck. Learning to act amid uncertainty is a form of freedom.",
      },
      {
        id: "ov-15",
        title: "Worry Is Not Preparation",
        content:
          "Worrying feels like getting ready, but it mostly rehearses disaster. Real preparation is a plan, not a spiral.",
      },
      {
        id: "ov-16",
        title: "Problem-Solve, Don't Ruminate",
        content:
          "Ask: is there an action I can take? If yes, take it. If no, dwelling on it only prolongs the pain.",
      },
      {
        id: "ov-17",
        title: "Schedule Worry Time",
        content:
          "Give anxious thoughts a set 15 minutes a day. Outside that window, gently postpone them, and they lose their grip on the rest of your time.",
      },
      {
        id: "ov-18",
        title: "Name the Thought",
        content:
          "Labeling a thought — 'this is worry,' 'this is planning' — creates distance. You observe the thought instead of being swept up in it.",
      },
      {
        id: "ov-19",
        title: "You Are Not Your Thoughts",
        content:
          "Thoughts arise on their own; you don't have to believe or obey them. Watching them pass like clouds loosens their power.",
      },
      {
        id: "ov-20",
        title: "Let Thoughts Pass",
        content:
          "Fighting a thought feeds it. Noticing it and letting it drift by is how the mind naturally settles.",
      },
      {
        id: "ov-21",
        title: "Mindfulness Quiets the Mind",
        content:
          "A few minutes of present-moment awareness each day trains you to step out of mental loops. Stillness is a skill you can build.",
      },
      {
        id: "ov-22",
        title: "Breathe and Ground",
        content:
          "Slow, deep breaths signal safety to the nervous system. Grounding in the body pulls you out of a racing head.",
      },
      {
        id: "ov-23",
        title: "The 90-Second Emotion",
        content:
          "A raw emotion moves through the body in roughly ninety seconds; overthinking is what keeps it alive for hours. Let the wave pass.",
      },
      {
        id: "ov-24",
        title: "Feelings Are Temporary",
        content:
          "No mood lasts forever. Remembering that this feeling will pass reduces the urge to over-analyze your way out of it.",
      },
      {
        id: "ov-25",
        title: "Spot Cognitive Distortions",
        content:
          "Overthinking runs on faulty thinking — catastrophizing, mind-reading, all-or-nothing. Naming the distortion strips away its false urgency.",
      },
      {
        id: "ov-26",
        title: "Stop Catastrophizing",
        content:
          "The mind loves worst-case stories that rarely happen. Ask how likely the disaster really is, and how you'd cope even if it came.",
      },
      {
        id: "ov-27",
        title: "Beyond Black and White",
        content:
          "All-or-nothing thinking makes every choice feel enormous. Most of life lives in the flexible middle, where mistakes are recoverable.",
      },
      {
        id: "ov-28",
        title: "Reframe the Story",
        content:
          "The same situation can be a threat or a challenge depending on how you frame it. Choose the interpretation that empowers action.",
      },
      {
        id: "ov-29",
        title: "Question the Thought",
        content:
          "Ask: is this true? Is it helpful? What would I tell a friend? Interrogating anxious thoughts often deflates them.",
      },
      {
        id: "ov-30",
        title: "Journaling Clears the Mind",
        content:
          "Getting thoughts out of your head and onto paper untangles them. What loops endlessly in the mind often resolves once written.",
      },
      {
        id: "ov-31",
        title: "Empty the Mental Cache",
        content:
          "A quick brain-dump of everything swirling around frees up mental space and reveals what actually needs attention.",
      },
      {
        id: "ov-32",
        title: "Limit Your Inputs",
        content:
          "A mind flooded with news, notifications, and opinions has more to overthink. Reducing inputs reduces the noise.",
      },
      {
        id: "ov-33",
        title: "Tame the Digital Noise",
        content:
          "Constant scrolling feeds comparison and worry. Deliberate breaks from screens give your mind room to quiet down.",
      },
      {
        id: "ov-34",
        title: "Stop Comparing",
        content:
          "Measuring your life against others' highlight reels multiplies anxiety. Comparison is a fast track to overthinking.",
      },
      {
        id: "ov-35",
        title: "Simplify Your Decisions",
        content:
          "Too many options overwhelm the mind. Narrowing choices and setting simple rules cuts down the deliberation.",
      },
      {
        id: "ov-36",
        title: "Use Defaults and Routines",
        content:
          "Automating small, repeated decisions saves mental energy for what matters. Routines are quiet cures for overthinking.",
      },
      {
        id: "ov-37",
        title: "Decision Fatigue Is Real",
        content:
          "Willpower and clear thinking drain through the day. Make important decisions when your mind is fresh, not depleted.",
      },
      {
        id: "ov-38",
        title: "Sleep on Big Choices",
        content:
          "The rested mind sorts what the tired one can't. A night's sleep often delivers the clarity that hours of churning couldn't.",
      },
      {
        id: "ov-39",
        title: "Trust Your Gut",
        content:
          "Your intuition has quietly processed more than you realize. For many choices, a considered gut feeling beats endless analysis.",
      },
      {
        id: "ov-40",
        title: "Most Decisions Are Reversible",
        content:
          "We treat choices as permanent when most can be adjusted. Knowing you can course-correct makes deciding lighter and faster.",
      },
      {
        id: "ov-41",
        title: "Lower the Stakes",
        content:
          "Overthinking inflates the importance of small choices. Remind yourself that most decisions won't matter much in a year.",
      },
      {
        id: "ov-42",
        title: "Set a Time Limit",
        content:
          "Give yourself a deadline to decide. A ticking clock forces the mind to conclude instead of circling indefinitely.",
      },
      {
        id: "ov-43",
        title: "Self-Compassion",
        content:
          "Beating yourself up for overthinking only adds another layer of thought. Meet your anxious mind with kindness instead.",
      },
      {
        id: "ov-44",
        title: "Talk to Yourself Kindly",
        content:
          "Speak to yourself as you would a worried friend. A gentler inner voice calms the mind far better than a harsh one.",
      },
      {
        id: "ov-45",
        title: "Move Your Body",
        content:
          "Exercise burns off anxious energy and shifts you out of your head. Movement is one of the fastest ways to break a thought spiral.",
      },
      {
        id: "ov-46",
        title: "Get Into Nature",
        content:
          "Time outdoors calms the nervous system and widens your perspective. Nature quietly dissolves the mind's small, looping worries.",
      },
      {
        id: "ov-47",
        title: "Gratitude Shifts Focus",
        content:
          "Overthinking fixates on what's wrong. Deliberately noticing what's good redirects the mind toward the positive.",
      },
      {
        id: "ov-48",
        title: "Focus on What You Control",
        content:
          "Sort worries into what you can and can't influence. Pour energy into the first and release the second.",
      },
      {
        id: "ov-49",
        title: "Let Go of the Rest",
        content:
          "Some things simply aren't yours to solve. Practicing release — of outcomes, of others' choices — lightens the mental load.",
      },
      {
        id: "ov-50",
        title: "Single-Task",
        content:
          "Juggling many things at once fragments attention and feeds overwhelm. Doing one thing fully quiets the background noise.",
      },
      {
        id: "ov-51",
        title: "One Thing at a Time",
        content:
          "Give your full focus to the task in front of you. Presence in a single action leaves no room for anxious wandering.",
      },
      {
        id: "ov-52",
        title: "Accept Imperfect Action",
        content:
          "Waiting to feel certain before acting guarantees inaction. Move forward imperfectly and adjust as you learn.",
      },
      {
        id: "ov-53",
        title: "Watch Your Self-Talk",
        content:
          "Overthinking is often a harsh inner monologue on repeat. Catch the critical narration and gently redirect it.",
      },
      {
        id: "ov-54",
        title: "Create Mental Space",
        content:
          "Silence, walks, and unstructured time let the mind settle. A cluttered schedule leaves no room for thoughts to calm.",
      },
      {
        id: "ov-55",
        title: "Progress, Not Rumination",
        content:
          "Measure yourself by forward steps, not by how thoroughly you've analyzed. Movement, however small, beats mental spinning.",
      },
      {
        id: "ov-56",
        title: "Set Boundaries With Your Mind",
        content:
          "You can decline an invitation to overthink. When a familiar loop starts, choose to step out rather than climb aboard.",
      },
      {
        id: "ov-57",
        title: "Trust the Process",
        content:
          "Not everything needs to be figured out right now. Trusting that clarity will come with time and action eases the urgency to solve it all.",
      },
      {
        id: "ov-58",
        title: "Practice Makes Quiet",
        content:
          "A calm mind isn't a personality trait but a practice. Each time you interrupt a loop, the habit of overthinking weakens.",
      },
      {
        id: "ov-59",
        title: "Be Patient With Yourself",
        content:
          "You won't silence overthinking overnight. Gently returning your attention, again and again, is the whole of the work.",
      },
      {
        id: "ov-60",
        title: "The Art of Letting Go",
        content:
          "In the end, not overthinking is the art of releasing — of control, of certainty, of the endless need to solve. Let thoughts go, and clarity returns.",
      },
    ],
  },

  // The Laws of Human Nature — Robert Greene
  "bk-012": {
    bookId: "bk-012",
    tagline: "Master the hidden forces that drive people's behaviour",
    updated: "2026-07",
    frames: [
      {
        id: "hn-1",
        title: "Understanding Human Nature",
        content:
          "Greene argues that beneath our rational surface lie ancient, powerful drives. Learning the laws of human nature helps you read people and yourself clearly.",
      },
      {
        id: "hn-2",
        title: "Become a Student of People",
        content:
          "Most conflict and failure come from misjudging others. Treating human behaviour as a subject to study gives you a lasting advantage.",
      },
      {
        id: "hn-3",
        title: "Know Yourself First",
        content:
          "The same forces you see in others live in you. Self-knowledge is the foundation for understanding — and not being ruled by — human nature.",
      },
      {
        id: "hn-4",
        title: "The Law of Irrationality",
        content:
          "We like to think we're rational, but emotions secretly drive most decisions. Mastering your emotional self begins with admitting how often feeling overrides logic.",
      },
      {
        id: "hn-5",
        title: "Master Your Emotions",
        content:
          "Strong emotions distort perception and push you to react. Creating distance — pausing before you act — is the first step to clear thinking.",
      },
      {
        id: "hn-6",
        title: "The Law of Narcissism",
        content:
          "Everyone is self-absorbed to some degree. The healthy path is turning self-love outward into empathy — genuinely feeling into others.",
      },
      {
        id: "hn-7",
        title: "Cultivate Empathy",
        content:
          "Empathy is a skill you can develop by listening deeply and imagining others' inner worlds. It's the ultimate tool for influence and connection.",
      },
      {
        id: "hn-8",
        title: "The Law of Role-Playing",
        content:
          "People wear masks, presenting a front while hiding their true feelings. Learn to read the micro-signals that leak past the performance.",
      },
      {
        id: "hn-9",
        title: "See Through the Mask",
        content:
          "Watch faces, tone, and body language, especially in unguarded moments. Actions and small tells reveal far more than words.",
      },
      {
        id: "hn-10",
        title: "The Law of Compulsive Behaviour",
        content:
          "Character is destiny; people repeat their patterns. Judge others by the consistent trend of their actions, not their promises.",
      },
      {
        id: "hn-11",
        title: "Read Character Over Time",
        content:
          "Anyone can impress once. Watch how people handle stress, power, and responsibility across time to gauge their true character.",
      },
      {
        id: "hn-12",
        title: "The Law of Covetousness",
        content:
          "People desire what seems scarce, forbidden, or just out of reach. Become an object of intrigue rather than something too easily had.",
      },
      {
        id: "hn-13",
        title: "The Law of Shortsightedness",
        content:
          "We fixate on the immediate and ignore long-term consequences. Elevating your perspective above the moment is a rare, powerful discipline.",
      },
      {
        id: "hn-14",
        title: "Elevate Your Perspective",
        content:
          "Step back from urgency and drama to see the larger pattern. The long view reveals what panic and impulse hide.",
      },
      {
        id: "hn-15",
        title: "The Law of Defensiveness",
        content:
          "People resist being changed or controlled. Confirm their good opinion of themselves and their resistance melts away.",
      },
      {
        id: "hn-16",
        title: "Soften Resistance",
        content:
          "Make people feel secure, respected, and free, and they open up. Attack their self-image and they close ranks against you.",
      },
      {
        id: "hn-17",
        title: "The Law of Self-Sabotage",
        content:
          "Your attitude colours your reality. A negative, fearful outlook narrows what you see and invites the very failures you dread.",
      },
      {
        id: "hn-18",
        title: "Change Your Attitude",
        content:
          "By shifting your inner attitude, you change how you experience and respond to circumstances — often changing the outcome itself.",
      },
      {
        id: "hn-19",
        title: "The Law of Repression",
        content:
          "We all have a shadow — the traits we deny and push down. What you repress leaks out sideways and controls you unseen.",
      },
      {
        id: "hn-20",
        title: "Confront Your Dark Side",
        content:
          "Integrating your shadow — acknowledging your aggression, envy, and flaws — makes you whole and far less easily manipulated.",
      },
      {
        id: "hn-21",
        title: "The Law of Envy",
        content:
          "Envy hides behind friendly faces and praise. Learn to spot its signs, and avoid triggering it by flaunting your good fortune.",
      },
      {
        id: "hn-22",
        title: "Beware the Fragile Ego",
        content:
          "Wounded egos lash out in subtle ways. Handle proud, insecure people carefully, and don't feed comparison that breeds resentment.",
      },
      {
        id: "hn-23",
        title: "The Law of Grandiosity",
        content:
          "Success can inflate the ego into delusion. Stay grounded in reality and know your limits, or grandiosity will lead to a fall.",
      },
      {
        id: "hn-24",
        title: "Know Your Limits",
        content:
          "Keep your self-belief tethered to evidence and feedback. Confidence built on fantasy collapses; confidence built on reality endures.",
      },
      {
        id: "hn-25",
        title: "The Law of Gender Rigidity",
        content:
          "We suppress the traits our culture labels for the opposite gender. Reclaiming your fuller range makes you more balanced and creative.",
      },
      {
        id: "hn-26",
        title: "The Law of Aimlessness",
        content:
          "Without a sense of purpose, we drift and feel lost. A clear guiding purpose organizes your energy and gives life direction.",
      },
      {
        id: "hn-27",
        title: "Advance With Purpose",
        content:
          "Define a calling larger than yourself and let it steer your decisions. Purpose turns scattered effort into a focused force.",
      },
      {
        id: "hn-28",
        title: "The Law of Conformity",
        content:
          "In groups, people lose their individuality and reason, pulled toward the average. Awareness of this pull helps you resist it.",
      },
      {
        id: "hn-29",
        title: "Resist the Group's Pull",
        content:
          "Groups can lower standards and silence dissent. Keep your independent judgment even while working within the collective.",
      },
      {
        id: "hn-30",
        title: "The Law of Fickleness",
        content:
          "People's loyalty and moods shift constantly. To lead, you must earn authority continually, not assume it's permanent.",
      },
      {
        id: "hn-31",
        title: "Make Them Want to Follow",
        content:
          "Real leadership inspires rather than commands. Give people a vision and a sense of contribution, and they follow willingly.",
      },
      {
        id: "hn-32",
        title: "The Law of Aggression",
        content:
          "Behind many polite facades lies frustrated aggression. Learn to sense hidden hostility before it catches you off guard.",
      },
      {
        id: "hn-33",
        title: "Channel Your Own Aggression",
        content:
          "Aggression denied turns passive and toxic. Channeled consciously, that same drive becomes ambition, boldness, and productive energy.",
      },
      {
        id: "hn-34",
        title: "The Law of Generational Myopia",
        content:
          "Each generation shares blind spots shaped by its era. Seeing your generational biases lets you seize the historical moment.",
      },
      {
        id: "hn-35",
        title: "The Law of Death Denial",
        content:
          "We avoid thinking about mortality, and it makes us anxious and shallow. Meditating on our shared mortality sharpens meaning and urgency.",
      },
      {
        id: "hn-36",
        title: "Embrace Mortality",
        content:
          "Accepting that life is finite frees you to live boldly and prioritize what matters. Death-awareness is a paradoxical source of vitality.",
      },
      {
        id: "hn-37",
        title: "People Are Driven by Emotion",
        content:
          "Appeals to pure logic rarely move anyone. To influence people, speak to their emotions, self-interest, and identity.",
      },
      {
        id: "hn-38",
        title: "Everyone Wears a Social Mask",
        content:
          "The self people show is curated. Assume there's more beneath the surface, and watch for the gap between words and behaviour.",
      },
      {
        id: "hn-39",
        title: "Observe Without Judging",
        content:
          "To read people accurately, suspend your snap judgments and simply observe. Bias blinds you to what's really there.",
      },
      {
        id: "hn-40",
        title: "Detach to See Clearly",
        content:
          "When you're emotionally hooked, you can't read a situation. Cultivating calm detachment lets you perceive people and motives accurately.",
      },
      {
        id: "hn-41",
        title: "Look for Patterns",
        content:
          "Isolated actions can mislead; patterns tell the truth. Track how people behave repeatedly to predict what they'll do next.",
      },
      {
        id: "hn-42",
        title: "Insecurity Runs Deep",
        content:
          "Much behaviour is driven by hidden insecurity and the need for validation. Recognizing this breeds both compassion and insight.",
      },
      {
        id: "hn-43",
        title: "Validate to Connect",
        content:
          "People crave feeling seen and important. Sincere acknowledgment of their worth opens doors that pressure never could.",
      },
      {
        id: "hn-44",
        title: "Beware First Impressions",
        content:
          "Charm and polish can hide flaws; awkwardness can hide depth. Reserve judgment until behaviour over time reveals character.",
      },
      {
        id: "hn-45",
        title: "The Power of Self-Awareness",
        content:
          "The more you understand your own drives, the less they secretly control you — and the better you understand everyone else.",
      },
      {
        id: "hn-46",
        title: "Turn Empathy Into a Superpower",
        content:
          "Deep, deliberate empathy lets you anticipate needs, defuse conflict, and connect. It's the most practical skill in the book.",
      },
      {
        id: "hn-47",
        title: "Manage Your Reactions",
        content:
          "You can't control what people do, only how you respond. Mastering your reactions is the core of dealing well with difficult people.",
      },
      {
        id: "hn-48",
        title: "Anticipate Manipulation",
        content:
          "Understanding these laws helps you spot when they're used on you. Awareness is your best protection against being played.",
      },
      {
        id: "hn-49",
        title: "The Shadow in Everyone",
        content:
          "Kind people can harbor hidden anger; confident people, hidden fear. Expecting complexity keeps you from being naively surprised.",
      },
      {
        id: "hn-50",
        title: "Envy Is Everywhere",
        content:
          "Learn to downplay your wins around the insecure, and to notice the subtle jabs and coldness that betray envy.",
      },
      {
        id: "hn-51",
        title: "Purpose Beats Drifting",
        content:
          "A person with direction outperforms ten with none. Anchor yourself to a purpose and let it filter your choices.",
      },
      {
        id: "hn-52",
        title: "Groups Change People",
        content:
          "In crowds and teams, individuals behave differently — bolder, more conforming, less rational. Factor the group effect into your reading.",
      },
      {
        id: "hn-53",
        title: "Lead by Vision",
        content:
          "People follow those who give them meaning and a sense of belonging. Cast a compelling vision and set the example yourself.",
      },
      {
        id: "hn-54",
        title: "Read the Times",
        content:
          "Understanding the spirit and biases of your era lets you position yourself ahead of trends rather than behind them.",
      },
      {
        id: "hn-55",
        title: "Confront, Don't Repress",
        content:
          "Facing your uncomfortable traits directly disarms them. What you refuse to see, you're doomed to act out unconsciously.",
      },
      {
        id: "hn-56",
        title: "Adapt to Each Person",
        content:
          "There's no one-size-fits-all approach to people. Tailor how you engage based on the drives and character you observe.",
      },
      {
        id: "hn-57",
        title: "Patience Reveals Truth",
        content:
          "People eventually show who they are if you watch long enough. Patience protects you from misjudging on early impressions.",
      },
      {
        id: "hn-58",
        title: "The Rational Human Ideal",
        content:
          "Greene's goal is the 'rational human' — self-aware, empathetic, and calm, mastering the primal drives rather than being enslaved by them.",
      },
      {
        id: "hn-59",
        title: "Compassion Over Cynicism",
        content:
          "Understanding people's flaws needn't make you cynical. Seeing why they behave as they do can deepen empathy instead.",
      },
      {
        id: "hn-60",
        title: "Use Knowledge Wisely",
        content:
          "These insights can manipulate or connect. Greene's higher path is to use them to relate more wisely and lead more nobly.",
      },
      {
        id: "hn-61",
        title: "The Long Game of Character",
        content:
          "Building genuine character and self-mastery is slow but decisive. Over time, it outperforms cleverness and manipulation.",
      },
      {
        id: "hn-62",
        title: "Emotions in Others",
        content:
          "Learn to sense the emotional currents in a room — tension, excitement, fear — and you can guide interactions others can't even read.",
      },
      {
        id: "hn-63",
        title: "Free Yourself From Reactivity",
        content:
          "The reactive person is easily controlled. Calm, thoughtful responses make you far harder to manipulate or provoke.",
      },
      {
        id: "hn-64",
        title: "Turn Inward to Rise",
        content:
          "The more honestly you examine your own nature, the more powerful and free you become in dealing with everyone else's.",
      },
      {
        id: "hn-65",
        title: "Human Nature Is the Constant",
        content:
          "Technology changes; human nature doesn't. Master these timeless drives and you hold a key that never goes out of date.",
      },
      {
        id: "hn-66",
        title: "Become the Wise Observer",
        content:
          "Study people with patience and empathy, master your own drives, and you move through the world with rare clarity and influence.",
      },
    ],
  },

  // The Mountain Is You — Brianna Wiest
  "bk-044": {
    bookId: "bk-044",
    tagline: "Transforming self-sabotage into self-mastery",
    updated: "2026-07",
    frames: [
      {
        id: "mo-1",
        title: "The Mountain Is You",
        content:
          "The biggest obstacle standing between you and your goals is usually yourself. The mountain you must climb is your own self-sabotage.",
      },
      {
        id: "mo-2",
        title: "Self-Sabotage Is Protection",
        content:
          "Self-sabotage isn't self-hatred — it's a misguided attempt to protect yourself. Some part of you believes staying stuck is safer than moving forward.",
      },
      {
        id: "mo-3",
        title: "Two Conflicting Desires",
        content:
          "Sabotage happens when a conscious goal collides with an unconscious need. You want change, but a deeper part of you fears what it might cost.",
      },
      {
        id: "mo-4",
        title: "Unmet Needs Drive It",
        content:
          "Behind every self-sabotaging pattern is an unmet need — for safety, control, love, or worth. Meet the need and the sabotage loses its job.",
      },
      {
        id: "mo-5",
        title: "Find the Hidden Payoff",
        content:
          "Every self-defeating behaviour gives you something, even if it's just comfort or an excuse. Uncover the payoff to understand the pattern.",
      },
      {
        id: "mo-6",
        title: "Procrastination as Fear",
        content:
          "Procrastination often isn't laziness but fear — of failure, judgment, or even success. Naming the fear is the first step past it.",
      },
      {
        id: "mo-7",
        title: "Perfectionism as Avoidance",
        content:
          "Perfectionism can be a sophisticated way of never finishing. If it's never perfect, you never have to risk being judged.",
      },
      {
        id: "mo-8",
        title: "The Fear of Success",
        content:
          "Sometimes we fear success more than failure — the visibility, expectations, and change it brings. So we quietly hold ourselves back.",
      },
      {
        id: "mo-9",
        title: "The Upper Limit Problem",
        content:
          "When life gets too good, we often sabotage to return to a familiar level of comfort. We're wired to protect the known, even when it's less.",
      },
      {
        id: "mo-10",
        title: "The Comfort Zone Is a Cage",
        content:
          "What feels safe can quietly keep you small. Growth always lives on the far side of discomfort.",
      },
      {
        id: "mo-11",
        title: "Your Triggers Are Teachers",
        content:
          "The things that upset you point to your unhealed places. Triggers aren't just pain — they're a map of where you need to grow.",
      },
      {
        id: "mo-12",
        title: "Emotions Carry Messages",
        content:
          "Feelings aren't obstacles to push away; they're information. Learning to read them is central to emotional mastery.",
      },
      {
        id: "mo-13",
        title: "Metabolize Your Emotions",
        content:
          "Unfelt emotions don't disappear; they lodge in the body and drive behaviour. You must feel them fully to finally release them.",
      },
      {
        id: "mo-14",
        title: "Feel to Heal",
        content:
          "Avoiding pain keeps it alive. Allowing yourself to feel an emotion completely is what lets it move through and dissolve.",
      },
      {
        id: "mo-15",
        title: "Don't Suppress — Process",
        content:
          "Distraction and numbing only postpone what must be faced. Processing emotions consciously is how you stop them from running you.",
      },
      {
        id: "mo-16",
        title: "Release the Past",
        content:
          "Clinging to old stories and grudges anchors you to who you were. Letting go creates space to become who you could be.",
      },
      {
        id: "mo-17",
        title: "Grieve the Old Self",
        content:
          "Real change means letting an old identity die, and that deserves grief. Honour who you were as you become someone new.",
      },
      {
        id: "mo-18",
        title: "Let Go to Grow",
        content:
          "You cannot hold your old life and reach for a new one at once. Growth requires releasing what no longer fits.",
      },
      {
        id: "mo-19",
        title: "Wanting vs Attachment",
        content:
          "Sometimes we cling to what hurts us because it's familiar. Distinguish what you truly want from what you're merely attached to.",
      },
      {
        id: "mo-20",
        title: "Redefine What You Want",
        content:
          "Many goals are inherited or performative. Get honest about what you actually desire beneath the shoulds and expectations.",
      },
      {
        id: "mo-21",
        title: "Build Emotional Intelligence",
        content:
          "Self-mastery is largely emotional mastery — the ability to understand and work with your feelings rather than be ruled by them.",
      },
      {
        id: "mo-22",
        title: "Respond, Don't React",
        content:
          "Between trigger and action lies a choice. Widening that gap turns reflexive reactions into deliberate responses.",
      },
      {
        id: "mo-23",
        title: "The Inner Narrative",
        content:
          "The story you tell about yourself shapes what you do. Change the narrative and you change the behaviour that follows it.",
      },
      {
        id: "mo-24",
        title: "Rewrite Your Story",
        content:
          "You are not the victim of your history unless you keep casting yourself that way. Author a new, empowering story instead.",
      },
      {
        id: "mo-25",
        title: "Question Limiting Beliefs",
        content:
          "Many limits are beliefs you never examined. Ask whether they're actually true, and watch some of your walls become doors.",
      },
      {
        id: "mo-26",
        title: "Identity Shapes Your Life",
        content:
          "You act in line with who you believe you are. Upgrading your self-image quietly upgrades your choices and results.",
      },
      {
        id: "mo-27",
        title: "Become the Next You",
        content:
          "Picture the version of you who has overcome this mountain. Then start thinking, choosing, and acting as that person now.",
      },
      {
        id: "mo-28",
        title: "The Future Self",
        content:
          "Your future self is built by today's small decisions. Ask what they would do, and let that guide the moment.",
      },
      {
        id: "mo-29",
        title: "Small Consistent Choices",
        content:
          "Transformation isn't one dramatic leap but countless small, aligned choices. Consistency is what actually moves the mountain.",
      },
      {
        id: "mo-30",
        title: "Discipline Is Self-Love",
        content:
          "Doing what's good for you, even when it's hard, is an act of care for your future self — not punishment.",
      },
      {
        id: "mo-31",
        title: "Build New Habits",
        content:
          "Willpower fades, but habits endure. Replace self-sabotaging routines with small supportive ones, repeated until they stick.",
      },
      {
        id: "mo-32",
        title: "Design Your Days",
        content:
          "Your daily routine is your life in miniature. Structure your days around your growth, and the bigger change takes care of itself.",
      },
      {
        id: "mo-33",
        title: "Boundaries Protect Growth",
        content:
          "Healthy boundaries guard your energy and direction. Saying no to what drains you protects your yes to what matters.",
      },
      {
        id: "mo-34",
        title: "Stop People-Pleasing",
        content:
          "Living for others' approval is a form of self-abandonment. Reclaiming your own preferences is part of self-mastery.",
      },
      {
        id: "mo-35",
        title: "Build Self-Trust",
        content:
          "Every promise you keep to yourself deepens self-trust. That trust is the foundation of confidence and change.",
      },
      {
        id: "mo-36",
        title: "Follow Your Intuition",
        content:
          "Beneath the noise, a quieter inner knowing often points the way. Learning to hear and honour it is a form of wisdom.",
      },
      {
        id: "mo-37",
        title: "Resistance Points the Way",
        content:
          "What you most resist is often what you most need to do. Discomfort can be a compass toward growth, not a stop sign.",
      },
      {
        id: "mo-38",
        title: "Do the Hard Thing",
        content:
          "The path up the mountain is rarely easy or comfortable. Choosing the harder, growth-producing option is how you climb.",
      },
      {
        id: "mo-39",
        title: "Progress Over Perfection",
        content:
          "You don't need flawless; you need forward. Small imperfect steps beat waiting for the perfect moment that never comes.",
      },
      {
        id: "mo-40",
        title: "Healing Isn't Linear",
        content:
          "Growth comes in waves, with setbacks and plateaus. A bad day isn't failure — it's part of the nonlinear climb.",
      },
      {
        id: "mo-41",
        title: "Be Patient With Yourself",
        content:
          "Deep change takes time. Impatience often becomes another form of self-sabotage; trust the slow work of becoming.",
      },
      {
        id: "mo-42",
        title: "Forgive Yourself",
        content:
          "Self-punishment keeps you stuck in shame. Forgiving your past mistakes frees the energy you need to move forward.",
      },
      {
        id: "mo-43",
        title: "Compassion for the Old You",
        content:
          "The self who sabotaged was doing their best to cope. Meeting that self with compassion, not contempt, is what allows healing.",
      },
      {
        id: "mo-44",
        title: "Peak Experiences",
        content:
          "Moments of flow and joy are glimpses of your potential. Notice them — they hint at the life you're capable of building.",
      },
      {
        id: "mo-45",
        title: "Align With Your Values",
        content:
          "Fulfillment comes from living in line with what you truly value. Misalignment is a quiet source of sabotage and unrest.",
      },
      {
        id: "mo-46",
        title: "Purpose Fuels the Climb",
        content:
          "A clear sense of why makes the hard work bearable. Purpose turns struggle into meaningful effort.",
      },
      {
        id: "mo-47",
        title: "Turn Pain Into Growth",
        content:
          "Your suffering can become your greatest teacher. The very struggles you resent often forge your deepest strengths.",
      },
      {
        id: "mo-48",
        title: "The Gift in the Struggle",
        content:
          "The mountain isn't just an obstacle; it's the making of you. Who you become in the climb is the real reward.",
      },
      {
        id: "mo-49",
        title: "Detach Self-Worth From Outcomes",
        content:
          "Your value isn't your achievements. Rooting worth in who you are, not what you produce, steadies you through ups and downs.",
      },
      {
        id: "mo-50",
        title: "Notice Your Patterns",
        content:
          "Self-sabotage repeats in familiar forms. Simply seeing the pattern clearly takes away much of its unconscious power.",
      },
      {
        id: "mo-51",
        title: "Interrupt the Loop",
        content:
          "Awareness lets you catch a sabotaging impulse in the moment and choose differently. Interruption breaks the automatic cycle.",
      },
      {
        id: "mo-52",
        title: "Regulate Your Nervous System",
        content:
          "Much sabotage is a stress response. Calming your body — through breath, rest, movement — makes better choices possible.",
      },
      {
        id: "mo-53",
        title: "Rest Is Part of the Work",
        content:
          "Burning out is its own sabotage. Genuine rest and recovery are essential to sustaining the climb.",
      },
      {
        id: "mo-54",
        title: "Choose Growth Over Comfort",
        content:
          "At each fork, you can pick the comfortable known or the expansive unknown. Repeatedly choosing growth is self-mastery in action.",
      },
      {
        id: "mo-55",
        title: "Your Environment Matters",
        content:
          "Surroundings and relationships shape your patterns. Curate people and spaces that support the person you're becoming.",
      },
      {
        id: "mo-56",
        title: "Let Go of the Need to Control",
        content:
          "Trying to control everything breeds anxiety and rigidity. Learning to trust and release is part of inner freedom.",
      },
      {
        id: "mo-57",
        title: "Feel Your Feelings Fully",
        content:
          "Wiest returns to this again and again: the way out is through. Fully felt emotions stop silently steering your life.",
      },
      {
        id: "mo-58",
        title: "Mastery Is a Daily Practice",
        content:
          "Self-mastery isn't a destination you arrive at once, but a practice you renew each day through conscious choices.",
      },
      {
        id: "mo-59",
        title: "You Are the Path",
        content:
          "Since the mountain is you, so is the path up it. Everything you need to change is already within your reach.",
      },
      {
        id: "mo-60",
        title: "Climb Your Mountain",
        content:
          "Stop waiting for external conditions to change. The work is internal, and the summit is a truer, freer version of yourself.",
      },
      {
        id: "mo-61",
        title: "The View From the Top",
        content:
          "On the other side of self-sabotage is self-mastery — a life aligned with your values, driven by choice rather than fear.",
      },
      {
        id: "mo-62",
        title: "Becoming Who You're Meant to Be",
        content:
          "The mountain exists to make you rise. Face it with courage and compassion, and you become the person capable of the life you want.",
      },
    ],
  },

  // The Courage to Be Happy — Ichiro Kishimi & Fumitake Koga
  "bk-150": {
    bookId: "bk-150",
    tagline: "Adlerian wisdom on love, work and the courage to find happiness",
    updated: "2026-07",
    frames: [
      {
        id: "ch-1",
        title: "The Sequel on Happiness",
        content:
          "This follow-up returns to the philosopher and youth, now testing Adler's ideas against the hard realities of work, education, and love.",
      },
      {
        id: "ch-2",
        title: "Ideals Meet Real Life",
        content:
          "The youth, now a teacher, has struggled to apply Adlerian psychology. The book asks whether these principles truly survive contact with daily life.",
      },
      {
        id: "ch-3",
        title: "The Goal of Education",
        content:
          "Adler sees education not as intervention but as support toward self-reliance. The aim is to help people stand on their own.",
      },
      {
        id: "ch-4",
        title: "Self-Reliance Is the Point",
        content:
          "Whether teaching, parenting, or leading, the goal is independence — helping others need you less, not more.",
      },
      {
        id: "ch-5",
        title: "Respect Comes First",
        content:
          "All good relationships begin with respect: seeing another person as they truly are, and valuing their uniqueness.",
      },
      {
        id: "ch-6",
        title: "See People as They Are",
        content:
          "Respect means not trying to mold others into what you want, but accepting and appreciating who they already are.",
      },
      {
        id: "ch-7",
        title: "Neither Praise Nor Scold",
        content:
          "Adlerian practice avoids both praising and scolding, since both assert authority from above and foster dependence.",
      },
      {
        id: "ch-8",
        title: "Why Scolding Fails",
        content:
          "Scolding may stop behaviour briefly, but it teaches fear and damages the relationship. It never builds genuine cooperation.",
      },
      {
        id: "ch-9",
        title: "Why Praise Fails",
        content:
          "Praise trains people to chase approval and act only when watched. It quietly makes them dependent on your judgment.",
      },
      {
        id: "ch-10",
        title: "Beyond Reward and Punishment",
        content:
          "A life run on carrots and sticks produces people who only act for reward or from fear. Adler seeks a deeper motivation.",
      },
      {
        id: "ch-11",
        title: "The Power of Encouragement",
        content:
          "Instead of judging, encourage — help others find the courage to face their own tasks as equals, with your support.",
      },
      {
        id: "ch-12",
        title: "The Stages of Problem Behaviour",
        content:
          "Adler outlines escalating stages of misbehaviour, each an attempt to secure belonging. Understanding the aim helps you respond wisely.",
      },
      {
        id: "ch-13",
        title: "Stage 1 — Seeking Praise",
        content:
          "First, people act out to be praised and noticed as 'good.' The behaviour aims at approval rather than genuine contribution.",
      },
      {
        id: "ch-14",
        title: "Stage 2 — Attracting Attention",
        content:
          "When praise fails, they seek attention any way they can, even negative. Being scolded feels better than being ignored.",
      },
      {
        id: "ch-15",
        title: "Stage 3 — Power Struggles",
        content:
          "Next comes open defiance and provocation, daring you to fight. Winning the struggle only escalates it.",
      },
      {
        id: "ch-16",
        title: "Stage 4 — Revenge",
        content:
          "Feeling unloved, they seek to hurt back, doing what they know will wound. This is a cry from someone who feels they can't belong.",
      },
      {
        id: "ch-17",
        title: "Stage 5 — Proof of Incompetence",
        content:
          "Finally, they give up entirely, acting helpless so nothing is expected of them. Despair, not laziness, drives this stage.",
      },
      {
        id: "ch-18",
        title: "Don't Take the Bait",
        content:
          "Getting drawn into power struggles or revenge cycles feeds them. Respond from respect and refuse to fight on those terms.",
      },
      {
        id: "ch-19",
        title: "Behaviour Seeks Belonging",
        content:
          "Beneath even destructive acts is a wish to belong. Address the need for connection, and the behaviour loses its purpose.",
      },
      {
        id: "ch-20",
        title: "Relationships of Equals",
        content:
          "Teacher and student, parent and child, boss and worker — all flourish best as horizontal relationships of mutual respect.",
      },
      {
        id: "ch-21",
        title: "Trust Unconditionally",
        content:
          "Deep relationships require believing in others without demanding proof first. Someone must extend trust, and it can be you.",
      },
      {
        id: "ch-22",
        title: "Believe, Even at Risk",
        content:
          "Others may betray your trust — that is their task. Yours is to keep believing, because only that makes real connection possible.",
      },
      {
        id: "ch-23",
        title: "Community Feeling, Deepened",
        content:
          "Happiness grows as your circle of concern widens from yourself to family, community, and humanity. Belonging expands outward.",
      },
      {
        id: "ch-24",
        title: "From Self-Interest to Social Interest",
        content:
          "Maturity is the shift from 'what can I get?' to 'what can I give?' Social interest is the heart of an Adlerian life.",
      },
      {
        id: "ch-25",
        title: "Give Meaning to Life",
        content:
          "Life has no preset meaning; we assign it. Choosing contribution as your meaning is what makes existence feel worthwhile.",
      },
      {
        id: "ch-26",
        title: "Love Is a Task",
        content:
          "Love, Adler says, is the hardest and most important of life's tasks. It's not a feeling that happens to you but a task you take up.",
      },
      {
        id: "ch-27",
        title: "The Courage to Love",
        content:
          "Loving means risking rejection and giving up self-centeredness. That vulnerability takes real courage — the courage to be happy.",
      },
      {
        id: "ch-28",
        title: "Love Is a Decision",
        content:
          "Beyond falling in love, real love is a deliberate choice to keep building a bond. It's decided and renewed, not merely felt.",
      },
      {
        id: "ch-29",
        title: "Loving Is a Skill",
        content:
          "Love can be learned and practiced like any art. Most people wait to be loved; few learn the harder skill of actively loving.",
      },
      {
        id: "ch-30",
        title: "From Being Loved to Loving",
        content:
          "Children seek to be loved; adults learn to love. Growing up emotionally is this shift from receiving to giving love.",
      },
      {
        id: "ch-31",
        title: "The Style of Being Loved",
        content:
          "A life spent trying to be loved keeps you self-centered, always asking how to win others' affection. Real freedom lies in loving instead.",
      },
      {
        id: "ch-32",
        title: "Love Makes You an Adult",
        content:
          "Through love, you move beyond childhood self-interest into genuine independence and responsibility. Love matures us.",
      },
      {
        id: "ch-33",
        title: "The Shift From 'I' to 'We'",
        content:
          "Love changes the subject of life from 'I' to 'we.' The center of the world moves from yourself to the two of you together.",
      },
      {
        id: "ch-34",
        title: "Self-Centeredness Dissolves",
        content:
          "In loving, the obsession with your own happiness fades. Seeking 'our' happiness quietly frees you from the prison of self.",
      },
      {
        id: "ch-35",
        title: "Building Happiness Together",
        content:
          "Love isn't finding the perfect person; it's two ordinary people choosing to build happiness side by side over time.",
      },
      {
        id: "ch-36",
        title: "Destiny Is Made, Not Found",
        content:
          "There is no single fated partner waiting. You create destiny by committing and doing the daily work of love.",
      },
      {
        id: "ch-37",
        title: "The Courage to Take the First Step",
        content:
          "Love, like happiness, begins with a courageous first move made without guarantees. Waiting for certainty means waiting forever.",
      },
      {
        id: "ch-38",
        title: "Independence Through Love",
        content:
          "Paradoxically, true independence is reached through love and belonging, not isolation. We become ourselves in relationship.",
      },
      {
        id: "ch-39",
        title: "Don't Fear Being Disliked",
        content:
          "As in the first book, freedom requires accepting that not everyone will approve. Living well means acting anyway.",
      },
      {
        id: "ch-40",
        title: "Live for This Moment",
        content:
          "Happiness isn't a future reward for present suffering. It's found by living earnestly and contributing in the here and now.",
      },
      {
        id: "ch-41",
        title: "Happiness Is Contribution",
        content:
          "Adler's definition holds: to feel useful to others is to be happy. Contribution, not achievement, is the source of contentment.",
      },
      {
        id: "ch-42",
        title: "You Decide to Be Happy",
        content:
          "Happiness is less a stroke of luck than a decision and a practice. It takes courage to choose it and live accordingly.",
      },
      {
        id: "ch-43",
        title: "Small Acts of Contribution",
        content:
          "You don't need grand gestures. Everyday acts of usefulness and kindness quietly build a felt sense of worth and belonging.",
      },
      {
        id: "ch-44",
        title: "Work as Contribution",
        content:
          "Work matters not for status but as a way of contributing to others. Seen this way, even ordinary jobs gain meaning.",
      },
      {
        id: "ch-45",
        title: "Friendship as Trust",
        content:
          "The task of friendship is built on trust and mutual respect between equals, without keeping score of who owes whom.",
      },
      {
        id: "ch-46",
        title: "Love as Union",
        content:
          "The task of love asks the most: to merge two lives into a shared 'we' while respecting each other's independence.",
      },
      {
        id: "ch-47",
        title: "The Three Life Tasks Again",
        content:
          "Work, friendship, and love remain the arenas of a full life. Courage means facing all three rather than hiding from them.",
      },
      {
        id: "ch-48",
        title: "Believe in People's Goodness",
        content:
          "Adlerian living rests on faith that people are fundamentally comrades, not enemies. That belief reshapes how you meet the world.",
      },
      {
        id: "ch-49",
        title: "Give First",
        content:
          "Don't wait for others to respect or love you first. Offer respect, trust, and contribution, and connection tends to follow.",
      },
      {
        id: "ch-50",
        title: "Ordinary Days Are Enough",
        content:
          "You don't need a remarkable life to be happy. Ordinary days, lived with contribution and love, are already full.",
      },
      {
        id: "ch-51",
        title: "No One Is Above You",
        content:
          "Even in hierarchies of role, no human is above another in worth. Holding that equality changes every relationship.",
      },
      {
        id: "ch-52",
        title: "Break Free of Approval",
        content:
          "Living for praise, whether from parents, bosses, or society, keeps you unfree. Happiness begins when that need loosens.",
      },
      {
        id: "ch-53",
        title: "Respect Cannot Be Forced",
        content:
          "You can't demand respect or love from others; you can only offer your own freely. What returns is their task, not yours.",
      },
      {
        id: "ch-54",
        title: "The Danger of Special-ness",
        content:
          "Craving to be special — good or bad — is a bid for attention. The courage to be ordinary quietly frees you from that trap.",
      },
      {
        id: "ch-55",
        title: "Encourage, Don't Rescue",
        content:
          "Doing everything for others robs them of self-reliance. Encouragement helps people find the courage to face their own tasks.",
      },
      {
        id: "ch-56",
        title: "Separation and Belonging",
        content:
          "Separate tasks so resentment fades, yet stay connected through contribution. Independence and belonging grow together.",
      },
      {
        id: "ch-57",
        title: "Love Over Fear",
        content:
          "Fear makes us controlling and defensive; love makes us open and generous. Choosing love over fear is the braver, happier path.",
      },
      {
        id: "ch-58",
        title: "Happiness Within Reach",
        content:
          "You needn't wait for perfect conditions. The materials of happiness — self-acceptance, trust, contribution, love — are available now.",
      },
      {
        id: "ch-59",
        title: "Courage, Not Circumstance",
        content:
          "What separates the happy from the unhappy isn't luck but courage — to change, to love, and to be disliked while staying true.",
      },
      {
        id: "ch-60",
        title: "The Work of a Lifetime",
        content:
          "Loving well and contributing fully aren't one-time achievements but lifelong practices, renewed day by ordinary day.",
      },
      {
        id: "ch-61",
        title: "Two Kinds of Life",
        content:
          "You can drift, seeking approval and avoiding risk, or you can choose the harder, freer path of love and contribution.",
      },
      {
        id: "ch-62",
        title: "Change Begins With You",
        content:
          "You can't wait for others or the world to change first. The one who starts — in love, trust, and giving — is you.",
      },
      {
        id: "ch-63",
        title: "The Courage to Be Happy",
        content:
          "Happiness asks courage: to love actively, contribute freely, accept yourself, and let go of the need to be approved of.",
      },
      {
        id: "ch-64",
        title: "Choose Happiness Today",
        content:
          "You don't reach happiness someday; you decide on it now. Take the first courageous step, and a happy life becomes possible.",
      },
    ],
  },

  // The Courage to Be Disliked — Ichiro Kishimi & Fumitake Koga
  "bk-009": {
    bookId: "bk-009",
    tagline: "How to free yourself and find happiness through Adlerian psychology",
    updated: "2026-07",
    frames: [
      {
        id: "cd-1",
        title: "A Dialogue on Freedom",
        content:
          "Told as a debate between a philosopher and a troubled youth, the book unpacks Alfred Adler's psychology and its bold claim: anyone can be happy, starting now.",
      },
      {
        id: "cd-2",
        title: "The World Is Surprisingly Simple",
        content:
          "Life feels complicated because we make it so. Adlerian thought argues the world is simple, and happiness is available to all who have the courage to claim it.",
      },
      {
        id: "cd-3",
        title: "Purpose, Not Cause",
        content:
          "Adler focuses on the purpose behind behaviour, not its past cause. We aren't pushed by history so much as pulled by the goals we choose now.",
      },
      {
        id: "cd-4",
        title: "The Provocative Claim About Trauma",
        content:
          "Adler argues we aren't determined by past trauma; rather, we give experiences meaning to serve present goals. It's a controversial but liberating reframe.",
      },
      {
        id: "cd-5",
        title: "You Choose Your Meaning",
        content:
          "The same event can mean defeat or lesson depending on the purpose it serves you. You author the significance of your past.",
      },
      {
        id: "cd-6",
        title: "You Can Change Anytime",
        content:
          "If the past doesn't dictate you, change is always possible. What holds most people back is not their history but their decision to stay the same.",
      },
      {
        id: "cd-7",
        title: "Lifestyle Is a Choice",
        content:
          "Your 'lifestyle' — your worldview and way of living — was chosen and can be re-chosen. It only feels fixed because changing it takes courage.",
      },
      {
        id: "cd-8",
        title: "Emotions Serve Goals",
        content:
          "We don't get swept away by anger; we use anger to achieve a purpose, like dominating a situation. Emotions are tools we deploy.",
      },
      {
        id: "cd-9",
        title: "Your Unhappiness Is a Choice",
        content:
          "Adler says you chose your current way of being because it felt safer than the unknown. Unhappiness can be a decision to avoid risk.",
      },
      {
        id: "cd-10",
        title: "The Courage to Change",
        content:
          "Change is frightening because the familiar feels secure. Transformation requires the courage to face uncertainty and let go of comfortable excuses.",
      },
      {
        id: "cd-11",
        title: "All Problems Are Interpersonal",
        content:
          "Adler's striking claim: every problem is, at root, a problem of human relationships. Even loneliness only exists because others do.",
      },
      {
        id: "cd-12",
        title: "Feelings of Inferiority",
        content:
          "Everyone feels inferior in some way, and that can spur healthy growth. It becomes harmful only when we turn it into an excuse.",
      },
      {
        id: "cd-13",
        title: "Inferiority Feeling vs Complex",
        content:
          "A feeling of inferiority motivates; an inferiority complex uses it as a reason to give up. The difference is whether you strive or stall.",
      },
      {
        id: "cd-14",
        title: "The Superiority Complex",
        content:
          "Bragging and dominating others often masks deep insecurity. Those who must feel above you usually feel small inside.",
      },
      {
        id: "cd-15",
        title: "Life Is Not a Competition",
        content:
          "When you see others as comrades rather than rivals, the world stops feeling like a battlefield. Comparison is the thief of peace.",
      },
      {
        id: "cd-16",
        title: "Horizontal Relationships",
        content:
          "Adler urges relationships of equals — horizontal, not vertical. No one is fundamentally above or below anyone else.",
      },
      {
        id: "cd-17",
        title: "Beyond the Vertical",
        content:
          "Vertical thinking ranks people and breeds envy and control. Seeing everyone as 'different but equal' dissolves much of our conflict.",
      },
      {
        id: "cd-18",
        title: "The Desire for Recognition",
        content:
          "Craving approval chains you to others' expectations. Adler goes so far as to say we should not live to be recognized.",
      },
      {
        id: "cd-19",
        title: "Don't Live for Approval",
        content:
          "If you organize your life around pleasing others, you live their life, not yours. True freedom means releasing the need for their applause.",
      },
      {
        id: "cd-20",
        title: "The Separation of Tasks",
        content:
          "A key tool: separate your tasks from others'. Ask, 'Whose task is this?' and take responsibility only for what is genuinely yours.",
      },
      {
        id: "cd-21",
        title: "Whose Task Is It?",
        content:
          "Whoever ultimately bears the consequences owns the task. Another person's choices and opinions of you are their task, not yours.",
      },
      {
        id: "cd-22",
        title: "Let Others Own Their Tasks",
        content:
          "You can offer help, but you can't live people's lives for them. Stop intruding on others' tasks and stop letting them intrude on yours.",
      },
      {
        id: "cd-23",
        title: "How Others See You Is Their Task",
        content:
          "Whether someone likes or dislikes you is their concern, not yours. Freeing yourself from that judgment is deeply liberating.",
      },
      {
        id: "cd-24",
        title: "The Courage to Be Disliked",
        content:
          "Real freedom is accepting that some people will dislike you — and living authentically anyway. That acceptance is the book's central courage.",
      },
      {
        id: "cd-25",
        title: "Being Disliked Is Proof of Freedom",
        content:
          "If no one dislikes you, you may be bending to everyone's wishes. A few disapprovals can be a sign you're living on your own terms.",
      },
      {
        id: "cd-26",
        title: "You Can't Please Everyone",
        content:
          "Trying to be liked by all leaves you unfree and untrue. Accepting this releases enormous pressure.",
      },
      {
        id: "cd-27",
        title: "Discard Others' Expectations",
        content:
          "You do not exist to meet other people's expectations, and they don't exist to meet yours. Let that mutual freedom stand.",
      },
      {
        id: "cd-28",
        title: "Reward-and-Punishment Thinking",
        content:
          "Adler rejects manipulating people through praise and scolding. Both create hierarchy and dependence rather than genuine relationship.",
      },
      {
        id: "cd-29",
        title: "Don't Seek Praise",
        content:
          "Chasing praise makes your worth depend on others' evaluation. It quietly places you below the one doing the praising.",
      },
      {
        id: "cd-30",
        title: "Praise Creates Hierarchy",
        content:
          "Praise is often a judgment from above — 'well done, good boy.' It subtly asserts superiority even when kindly meant.",
      },
      {
        id: "cd-31",
        title: "Encouragement, Not Praise",
        content:
          "Instead of praising, express gratitude and shared appreciation between equals. 'Thank you' honours; 'good job' evaluates.",
      },
      {
        id: "cd-32",
        title: "Community Feeling",
        content:
          "Adler's ideal is 'community feeling' — a sense of connection and contribution to others. It's the compass toward happiness.",
      },
      {
        id: "cd-33",
        title: "A Sense of Belonging",
        content:
          "We all need to feel we belong. But belonging is earned by contributing to the community, not by demanding it from others.",
      },
      {
        id: "cd-34",
        title: "Where Is My Place?",
        content:
          "Rather than asking what others can do for you, ask what you can offer. Your place is found by contributing, not by taking.",
      },
      {
        id: "cd-35",
        title: "Self-Acceptance",
        content:
          "Accept yourself as you are, including your limits — not resigning, but honestly working with reality. Change what you can; accept what you can't.",
      },
      {
        id: "cd-36",
        title: "Accept, Don't Resign",
        content:
          "Self-acceptance isn't giving up. It's seeing yourself clearly, at sixty percent say, and asking how to move toward a hundred.",
      },
      {
        id: "cd-37",
        title: "Confidence in Others",
        content:
          "Trust people unconditionally, without demanding guarantees. To have relationships of depth, you must risk believing in others.",
      },
      {
        id: "cd-38",
        title: "Trust vs Blind Faith",
        content:
          "Confidence means believing in others while letting how they respond be their task. You risk betrayal, but only that openness allows real connection.",
      },
      {
        id: "cd-39",
        title: "Contribution to Others",
        content:
          "The deepest sense of worth comes from feeling useful to others. Contribution, not recognition, is where lasting fulfillment lives.",
      },
      {
        id: "cd-40",
        title: "Feeling Useful Equals Worth",
        content:
          "You feel your value not when praised, but when you sense you're contributing to your community. That inner feeling is enough.",
      },
      {
        id: "cd-41",
        title: "The Three Pillars",
        content:
          "Happiness rests on self-acceptance, confidence in others, and contribution to others — each reinforcing the next.",
      },
      {
        id: "cd-42",
        title: "We Are Not the Center",
        content:
          "You are part of the community, not its center. Releasing the need to be the star frees you to belong and contribute.",
      },
      {
        id: "cd-43",
        title: "From 'I' to 'We'",
        content:
          "Shifting attention from yourself to the larger 'we' dissolves much anxiety. Self-obsession is a lonely prison.",
      },
      {
        id: "cd-44",
        title: "Life Lies",
        content:
          "We invent excuses — 'life lies' — to avoid the tasks of relationships. Blaming circumstances protects us from the risk of trying.",
      },
      {
        id: "cd-45",
        title: "The Tasks of Life",
        content:
          "Adler names three life tasks: work, friendship, and love. Growth means facing them with courage rather than fleeing.",
      },
      {
        id: "cd-46",
        title: "Facing the Tasks",
        content:
          "Avoiding relationships to avoid getting hurt guarantees a lonely life. The tasks are hard, but engaging them is where meaning lies.",
      },
      {
        id: "cd-47",
        title: "Living in the Present",
        content:
          "Neither past regret nor future anxiety is real; only now is. Adler urges a life lived fully in this present moment.",
      },
      {
        id: "cd-48",
        title: "Life as a Series of Moments",
        content:
          "Life isn't a line toward a distant goal but a chain of complete 'nows.' Each present moment is whole in itself.",
      },
      {
        id: "cd-49",
        title: "Dance Through Life",
        content:
          "Rather than trudging toward a destination, dance — be fully engaged in the here and now. The dancing itself is the point.",
      },
      {
        id: "cd-50",
        title: "No Need for a Grand Plan",
        content:
          "You don't need your whole future mapped to live well. Living earnestly in each moment is enough to build a meaningful life.",
      },
      {
        id: "cd-51",
        title: "The Guiding Star",
        content:
          "Let contribution to others be your fixed guiding star. As long as you follow it, you can't lose your way.",
      },
      {
        id: "cd-52",
        title: "The Courage to Be Ordinary",
        content:
          "You needn't be special to be worthwhile. Accepting an ordinary life, lived with contribution, is itself a quiet courage.",
      },
      {
        id: "cd-53",
        title: "Special Good or Special Bad",
        content:
          "Those who can't be exceptionally good sometimes seek to be exceptionally bad, just to stand out. Both flee the fear of being ordinary.",
      },
      {
        id: "cd-54",
        title: "Happiness Is Contribution",
        content:
          "Adler defines happiness as the feeling of contribution. When you sense you're helping your community, you are already happy.",
      },
      {
        id: "cd-55",
        title: "Change Yourself, Change Your World",
        content:
          "You can't control others, only your own outlook and choices. Change how you relate to the world, and your world changes with you.",
      },
      {
        id: "cd-56",
        title: "The World Is Only Yours to Change",
        content:
          "Waiting for others or circumstances to change first keeps you stuck. Someone must begin, and it can only be you.",
      },
      {
        id: "cd-57",
        title: "Freedom Costs Courage",
        content:
          "Freedom, authenticity, and happiness all demand courage — the willingness to be disliked, to change, and to contribute anyway.",
      },
      {
        id: "cd-58",
        title: "Reject Determinism",
        content:
          "You are not a helpless product of your childhood or environment. Reclaiming that agency is the first step to a freer life.",
      },
      {
        id: "cd-59",
        title: "Separate, Then Connect",
        content:
          "Paradoxically, separating tasks doesn't isolate you — it clears the resentment and control that poison relationships, allowing true connection.",
      },
      {
        id: "cd-60",
        title: "Let Go of Comparison",
        content:
          "Measuring yourself against others breeds inferiority or arrogance. Compare only with your own ideal self, moving forward.",
      },
      {
        id: "cd-61",
        title: "Stop Fearing Judgment",
        content:
          "The fear of others' opinions is a cage of our own making. Recognizing that their judgment is their task unlocks the door.",
      },
      {
        id: "cd-62",
        title: "Give Without Keeping Score",
        content:
          "Contribution loses its power the moment you demand something back. Genuine giving asks nothing in return.",
      },
      {
        id: "cd-63",
        title: "Belonging Is Built, Not Found",
        content:
          "You don't wait to be given a place; you create belonging by actively contributing to the people around you.",
      },
      {
        id: "cd-64",
        title: "Happiness Starts Now",
        content:
          "You don't need to fix your past or perfect your future first. Adler insists you can decide to be happy in this very moment.",
      },
      {
        id: "cd-65",
        title: "A Simple, Radical Message",
        content:
          "Accept yourself, trust others, contribute freely, and stop living for approval. Simple to say, courageous to live.",
      },
      {
        id: "cd-66",
        title: "The Courage to Be Free",
        content:
          "To be disliked by some is the price of living as your true self. Pay it willingly, and you gain the freedom to finally be happy.",
      },
    ],
  },

  // The 48 Laws of Power — Robert Greene
  "bk-013": {
    bookId: "bk-013",
    tagline: "The timeless, ruthless laws of gaining and keeping power",
    updated: "2026-07",
    frames: [
      {
        id: "lp-1",
        title: "The Game of Power",
        content:
          "Greene argues that power is a social game played everywhere — at work, in politics, in relationships. The 48 Laws distil how it has been won and lost throughout history.",
      },
      {
        id: "lp-2",
        title: "Observe, Don't Endorse",
        content:
          "The laws are deliberately amoral — a study of how power actually operates, not a moral guide. Read them to understand and protect yourself as much as to act.",
      },
      {
        id: "lp-3",
        title: "Master the Indirect",
        content:
          "A recurring theme: power rewards the subtle and indirect over the blunt and obvious. Those who scheme quietly usually beat those who act openly.",
      },
      {
        id: "lp-4",
        title: "Law 1 — Never Outshine the Master",
        content:
          "Make those above you feel superior. Display too much talent and you may inspire fear and insecurity instead of gratitude.",
      },
      {
        id: "lp-5",
        title: "Law 2 — Use Enemies, Watch Friends",
        content:
          "Friends can betray you out of envy, while a former enemy, given a chance to prove himself, is often more loyal. Never trust blindly.",
      },
      {
        id: "lp-6",
        title: "Law 3 — Conceal Your Intentions",
        content:
          "Keep people off balance by hiding your true aims. If they never know what you're after, they can't prepare a defense.",
      },
      {
        id: "lp-7",
        title: "Law 4 — Always Say Less Than Necessary",
        content:
          "The less you say, the more powerful and mysterious you seem. Say too much and you reveal weakness and give others ammunition.",
      },
      {
        id: "lp-8",
        title: "Law 5 — Guard Your Reputation",
        content:
          "Reputation is the cornerstone of power. Protect it fiercely, and learn to destroy enemies by attacking theirs.",
      },
      {
        id: "lp-9",
        title: "Law 6 — Court Attention",
        content:
          "Be seen and talked about at all costs. It is better to be attacked than ignored; obscurity is the true enemy of power.",
      },
      {
        id: "lp-10",
        title: "Law 7 — Take the Credit",
        content:
          "Get others to do the work, then claim the credit. Their effort becomes your reputation, and efficiency looks like brilliance.",
      },
      {
        id: "lp-11",
        title: "Law 8 — Make Others Come to You",
        content:
          "Lure opponents onto your ground with bait. When you make others act first, you control the terms of the encounter.",
      },
      {
        id: "lp-12",
        title: "Law 9 — Win Through Actions",
        content:
          "Never win through argument; you may win the point but breed resentment. Demonstrate your case through actions instead.",
      },
      {
        id: "lp-13",
        title: "Law 10 — Avoid the Unlucky",
        content:
          "Misery and misfortune can be contagious. Associate with the happy and successful, and steer clear of chronic drainers.",
      },
      {
        id: "lp-14",
        title: "Law 11 — Keep People Dependent",
        content:
          "Make others rely on you and your position is secure. The more they need you, the more freedom and safety you gain.",
      },
      {
        id: "lp-15",
        title: "Law 12 — Disarm With Honesty",
        content:
          "A single sincere, generous act can disarm even the wary. Selective honesty lowers people's guard for your larger aims.",
      },
      {
        id: "lp-16",
        title: "Law 13 — Appeal to Self-Interest",
        content:
          "When you need help, never appeal to mercy or gratitude. Show people how helping you serves their own interests.",
      },
      {
        id: "lp-17",
        title: "Law 14 — Pose as Friend, Work as Spy",
        content:
          "Learn to gather information quietly. Casual, friendly probing reveals more about rivals than any direct question.",
      },
      {
        id: "lp-18",
        title: "Law 15 — Crush Your Enemy Totally",
        content:
          "A wounded enemy will recover and seek revenge. When you must strike, do so decisively enough that they can't retaliate.",
      },
      {
        id: "lp-19",
        title: "Law 16 — Use Absence",
        content:
          "Too much presence breeds contempt; strategic absence increases respect and value. Scarcity makes you more desirable.",
      },
      {
        id: "lp-20",
        title: "Law 17 — Cultivate Unpredictability",
        content:
          "Keep others off balance by being hard to read. Deliberate unpredictability unnerves opponents and keeps them reacting to you.",
      },
      {
        id: "lp-21",
        title: "Law 18 — Don't Isolate Yourself",
        content:
          "Building walls to feel safe cuts you off from information and allies. Power requires staying connected, not hiding away.",
      },
      {
        id: "lp-22",
        title: "Law 19 — Know Who You Face",
        content:
          "Not everyone reacts the same to a slight. Misjudge the wrong person and you can make a permanent, dangerous enemy.",
      },
      {
        id: "lp-23",
        title: "Law 20 — Don't Commit to Anyone",
        content:
          "Stay independent and above the fray. If you commit to no single side, all sides court you and you keep your options open.",
      },
      {
        id: "lp-24",
        title: "Law 21 — Seem Dumber Than Your Mark",
        content:
          "Let others feel smarter than you. Playing the fool makes people underestimate you and lower their defenses.",
      },
      {
        id: "lp-25",
        title: "Law 22 — Use the Surrender Tactic",
        content:
          "When weaker, surrendering can be power. It buys time, denies the enemy satisfaction, and lets you recover to strike later.",
      },
      {
        id: "lp-26",
        title: "Law 23 — Concentrate Your Forces",
        content:
          "Spreading yourself thin dilutes power. Focus your energy and resources on a single, rich source of strength.",
      },
      {
        id: "lp-27",
        title: "Law 24 — Play the Perfect Courtier",
        content:
          "In any hierarchy, master the art of indirection, flattery, and grace. The skilled courtier advances without ever seeming to grasp.",
      },
      {
        id: "lp-28",
        title: "Law 25 — Re-Create Yourself",
        content:
          "Don't accept the role society hands you. Shape your own image and identity, and command attention as your own creation.",
      },
      {
        id: "lp-29",
        title: "Law 26 — Keep Your Hands Clean",
        content:
          "Maintain a spotless appearance by using others as scapegoats and cat's-paws to disguise your involvement in the dirty work.",
      },
      {
        id: "lp-30",
        title: "Law 27 — Create a Following",
        content:
          "People long to believe in something. Offer a cause and vague promises, and you can build a devoted, cultlike following.",
      },
      {
        id: "lp-31",
        title: "Law 28 — Act With Boldness",
        content:
          "Timidity is dangerous; boldness is often safer. Commit fully, because hesitation and half-measures invite trouble.",
      },
      {
        id: "lp-32",
        title: "Law 29 — Plan to the End",
        content:
          "Think several steps ahead to the very conclusion. Planning the endgame prevents nasty surprises and keeps you in control.",
      },
      {
        id: "lp-33",
        title: "Law 30 — Make It Look Effortless",
        content:
          "Hide the sweat and tricks behind your success. Effortlessness looks like natural talent and adds to your mystique.",
      },
      {
        id: "lp-34",
        title: "Law 31 — Control the Options",
        content:
          "Get others to choose among options you've set, all of which favor you. They feel in control while you decide the outcome.",
      },
      {
        id: "lp-35",
        title: "Law 32 — Play to Fantasies",
        content:
          "People flee harsh truths toward appealing fantasies. Offer the dream they crave and you win a powerful following.",
      },
      {
        id: "lp-36",
        title: "Law 33 — Find the Weakness",
        content:
          "Everyone has a psychological lever — an insecurity, need, or desire. Discover it, and you hold the means to influence them.",
      },
      {
        id: "lp-37",
        title: "Law 34 — Carry Yourself Like Royalty",
        content:
          "Demand respect by radiating dignity and confidence. Act like you deserve the crown and people tend to treat you accordingly.",
      },
      {
        id: "lp-38",
        title: "Law 35 — Master Timing",
        content:
          "Know when to wait and when to strike. Patience and perfect timing achieve what force and haste never could.",
      },
      {
        id: "lp-39",
        title: "Law 36 — Disdain What You Can't Have",
        content:
          "Chasing something in vain draws attention to your lack of it. Ignoring what you can't have is often the sharpest response.",
      },
      {
        id: "lp-40",
        title: "Law 37 — Create Spectacle",
        content:
          "Striking images and grand gestures move people more than words. Surround yourself with symbols that dramatize your power.",
      },
      {
        id: "lp-41",
        title: "Law 38 — Think Freely, Blend In",
        content:
          "Flaunting unconventional ideas invites attack. Keep your rebellious thoughts private and outwardly conform to fit in.",
      },
      {
        id: "lp-42",
        title: "Law 39 — Stir the Waters",
        content:
          "Rattle your opponents to make them act rashly, while you stay calm. Emotional enemies make mistakes you can exploit.",
      },
      {
        id: "lp-43",
        title: "Law 40 — Despise the Free Lunch",
        content:
          "What is free often carries hidden strings or guilt. Paying your own way keeps you independent and unindebted.",
      },
      {
        id: "lp-44",
        title: "Law 41 — Don't Follow a Great Man",
        content:
          "Succeeding a legend leaves you in their shadow. Clear your own space and build a new name rather than inherit theirs.",
      },
      {
        id: "lp-45",
        title: "Law 42 — Strike the Shepherd",
        content:
          "Trouble often traces to one strong instigator. Neutralize the leader and the followers scatter and lose their momentum.",
      },
      {
        id: "lp-46",
        title: "Law 43 — Win Hearts and Minds",
        content:
          "Coercion breeds resistance. Seduce people emotionally so they willingly follow you, and your influence becomes durable.",
      },
      {
        id: "lp-47",
        title: "Law 44 — Use the Mirror Effect",
        content:
          "Reflecting people's actions back at them can disarm, unsettle, or teach them a lesson through their own behaviour.",
      },
      {
        id: "lp-48",
        title: "Law 45 — Change Gradually",
        content:
          "Preach the need for change, but reform slowly. Sudden, sweeping change frightens people and provokes backlash.",
      },
      {
        id: "lp-49",
        title: "Law 46 — Never Appear Too Perfect",
        content:
          "Flawlessness breeds envy and secret enemies. Occasionally admitting a harmless flaw makes you human and safer.",
      },
      {
        id: "lp-50",
        title: "Law 47 — Know When to Stop",
        content:
          "In victory, don't let momentum push you too far. Overreaching turns triumph into disaster; set a goal and stop there.",
      },
      {
        id: "lp-51",
        title: "Law 48 — Assume Formlessness",
        content:
          "The ultimate power is adaptability. Be like water — fluid and shapeless — so opponents can never pin you down or predict you.",
      },
      {
        id: "lp-52",
        title: "Power Is Everywhere",
        content:
          "These laws aren't just for kings and generals. The same dynamics play out in offices, families, and friendships every day.",
      },
      {
        id: "lp-53",
        title: "Perception Over Reality",
        content:
          "In the game of power, how things appear often matters more than how they are. Managing perception is a core skill.",
      },
      {
        id: "lp-54",
        title: "Reputation Is Everything",
        content:
          "A strong reputation intimidates and attracts before you even act. Build it deliberately and defend it without mercy.",
      },
      {
        id: "lp-55",
        title: "Emotions Are a Liability",
        content:
          "Anger, impatience, and neediness cloud judgment and reveal weakness. The powerful master their emotions, or hide them.",
      },
      {
        id: "lp-56",
        title: "Patience Wins",
        content:
          "Most people are impatient, which is their undoing. The one who can wait for the right moment holds a decisive edge.",
      },
      {
        id: "lp-57",
        title: "Never Seem Needy",
        content:
          "Neediness repels and lowers your value. The more self-sufficient you appear, the more others are drawn to you.",
      },
      {
        id: "lp-58",
        title: "Study People Closely",
        content:
          "Power depends on reading others — their desires, fears, and weaknesses. Observation is the intelligence-gathering behind every move.",
      },
      {
        id: "lp-59",
        title: "Allies and Enemies",
        content:
          "Choose both carefully. A useful enemy can sharpen and motivate you, while the wrong ally can quietly undermine you.",
      },
      {
        id: "lp-60",
        title: "Mystery Is Magnetic",
        content:
          "Predictable people are easy to control. A degree of mystery keeps others intrigued and unable to fully grasp you.",
      },
      {
        id: "lp-61",
        title: "Control the Frame",
        content:
          "Whoever defines the terms of an interaction controls it. Set the context, and others play by the rules you designed.",
      },
      {
        id: "lp-62",
        title: "The Long Game",
        content:
          "Power is built over time through consistent positioning. Short-term wins that damage your long-term standing aren't worth it.",
      },
      {
        id: "lp-63",
        title: "Flatter the Powerful",
        content:
          "Those above you crave validation. Make them shine, and they'll reward and protect you rather than fear you.",
      },
      {
        id: "lp-64",
        title: "Manage Credit and Blame",
        content:
          "Quietly attach yourself to successes and distance yourself from failures. Association shapes how power sees you.",
      },
      {
        id: "lp-65",
        title: "Boldness Beats Timidity",
        content:
          "The world yields to the confident and decisive. Half-hearted moves invite resistance; bold ones command respect.",
      },
      {
        id: "lp-66",
        title: "Adaptability Is Survival",
        content:
          "Rigid people break when circumstances shift. The formless, flexible operator adapts and endures where others fall.",
      },
      {
        id: "lp-67",
        title: "Information Is Power",
        content:
          "Knowing more than others — their plans, secrets, and pressures — lets you anticipate and outmaneuver them.",
      },
      {
        id: "lp-68",
        title: "Never Reveal Your Hand",
        content:
          "Keep your true goals and feelings hidden. The moment people know exactly what you want, they gain leverage over you.",
      },
      {
        id: "lp-69",
        title: "Use Symbols and Spectacle",
        content:
          "People are moved by images more than arguments. Symbols, ceremony, and drama amplify your presence and authority.",
      },
      {
        id: "lp-70",
        title: "Seduction Over Force",
        content:
          "Force creates enemies; seduction creates allies. Winning people emotionally builds influence that outlasts coercion.",
      },
      {
        id: "lp-71",
        title: "Cut Losses Cleanly",
        content:
          "Don't cling to failing positions out of pride. The powerful abandon lost causes quickly and redeploy their strength.",
      },
      {
        id: "lp-72",
        title: "Beware Envy",
        content:
          "Success breeds resentment in others. Downplay parts of your good fortune to avoid making silent enemies.",
      },
      {
        id: "lp-73",
        title: "The Power of Restraint",
        content:
          "Not every provocation deserves a response. Restraint often projects more strength than reaction, and denies enemies satisfaction.",
      },
      {
        id: "lp-74",
        title: "Position Before Battle",
        content:
          "Wars are often won before they start, through superior positioning. Arrange the board so your victory is nearly inevitable.",
      },
      {
        id: "lp-75",
        title: "Let Others Reveal Themselves",
        content:
          "Stay quiet and let people talk. The more they expose their intentions and flaws, the more you learn while giving away nothing.",
      },
      {
        id: "lp-76",
        title: "Turn Weakness Into Strength",
        content:
          "Apparent surrender, ignorance, or humility can be strategic. What looks like weakness can quietly become an advantage.",
      },
      {
        id: "lp-77",
        title: "Guard Against Manipulation",
        content:
          "Reading these laws also teaches you to spot them being used on you. Awareness is the best defense against the manipulator.",
      },
      {
        id: "lp-78",
        title: "The Cat's-Paw",
        content:
          "Get someone else to do the risky or dirty deed while you stay above suspicion. Distance protects your reputation.",
      },
      {
        id: "lp-79",
        title: "Dependence Cuts Both Ways",
        content:
          "Making others need you grants power — but never become so dependent on someone that they hold the same over you.",
      },
      {
        id: "lp-80",
        title: "Control Your Image",
        content:
          "Craft the persona you present to the world. A carefully managed image shapes how much power others grant you.",
      },
      {
        id: "lp-81",
        title: "Timing the Strike",
        content:
          "Act too early and you're premature; too late and the moment's gone. Sensing the ripe moment is an art the powerful master.",
      },
      {
        id: "lp-82",
        title: "Divide and Conquer",
        content:
          "A united opposition is dangerous. Sowing division among rivals weakens them without you lifting a finger.",
      },
      {
        id: "lp-83",
        title: "Keep Rivals Off Balance",
        content:
          "Unpredictable moves prevent enemies from settling into a strategy. Constant uncertainty keeps them defensive and reactive.",
      },
      {
        id: "lp-84",
        title: "Appearances of Virtue",
        content:
          "Being seen as fair, generous, and honest builds trust you can draw on. Reputation for virtue is itself a form of power.",
      },
      {
        id: "lp-85",
        title: "The Danger of Arrogance",
        content:
          "Contempt for others invites their united hatred. Even at the height of power, humility in appearance protects you.",
      },
      {
        id: "lp-86",
        title: "Never Rely on Reputation Alone",
        content:
          "Past glory fades. Keep proving yourself, because power resting only on old achievements slowly erodes.",
      },
      {
        id: "lp-87",
        title: "Master the Courtier's Art",
        content:
          "In any organization, thriving requires tact, timing, and indirection. The subtle courtier outlasts the blunt striver.",
      },
      {
        id: "lp-88",
        title: "Read the Power Map",
        content:
          "Know who really holds influence, not just who holds titles. Aligning with true power beats flattering figureheads.",
      },
      {
        id: "lp-89",
        title: "Manufacture Scarcity",
        content:
          "What is rare feels valuable. Limiting your availability and output makes your presence and approval more prized.",
      },
      {
        id: "lp-90",
        title: "Never Outshine Upward",
        content:
          "Save your brilliance for where it helps you. Overshadowing a superior turns a potential patron into a threatened rival.",
      },
      {
        id: "lp-91",
        title: "Silence as Strategy",
        content:
          "Saying little keeps you enigmatic and safe. Others fill the silence and reveal themselves while you stay in control.",
      },
      {
        id: "lp-92",
        title: "Plan Several Moves Ahead",
        content:
          "Like a chess master, foresee the consequences of your actions. Those who think furthest ahead usually win.",
      },
      {
        id: "lp-93",
        title: "Choose Your Battles",
        content:
          "Not every fight is worth winning. Concentrate power on decisive struggles and ignore petty ones beneath you.",
      },
      {
        id: "lp-94",
        title: "The Ethics Question",
        content:
          "Many laws are manipulative by design. Greene documents how power works; using that knowledge ethically is your own responsibility.",
      },
      {
        id: "lp-95",
        title: "Power and Integrity",
        content:
          "You can apply the wisdom — reading people, timing, self-mastery — without the ruthlessness. Discernment separates strategy from cruelty.",
      },
      {
        id: "lp-96",
        title: "Self-Mastery First",
        content:
          "Before controlling others, control yourself — your temper, ego, and impulses. Inner discipline is the foundation of outer power.",
      },
      {
        id: "lp-97",
        title: "Learn From History",
        content:
          "The laws are drawn from courts, generals, and con artists across the ages. History is the greatest teacher of human behaviour.",
      },
      {
        id: "lp-98",
        title: "Defense as Much as Offense",
        content:
          "The book's real value for most readers is defensive: recognizing these tactics so you're never anyone's easy mark.",
      },
      {
        id: "lp-99",
        title: "Adapt the Laws to You",
        content:
          "The laws sometimes contradict; wisdom is knowing which applies when. Use them as flexible tools, not rigid commandments.",
      },
      {
        id: "lp-100",
        title: "Power Reveals Character",
        content:
          "How you play the game shows who you are. Power is a mirror — it magnifies whatever values you already hold.",
      },
      {
        id: "lp-101",
        title: "Play the Game Wisely",
        content:
          "Whether you seek power or simply to guard against it, understanding these laws lets you navigate people and influence with open eyes.",
      },
    ],
  },

  // Surrounded by Idiots — Thomas Erikson
  "bk-007": {
    bookId: "bk-007",
    tagline: "The four types of human behaviour — and how to communicate with each",
    updated: "2026-07",
    frames: [
      {
        id: "si-1",
        title: "Why We Feel Surrounded by Idiots",
        content:
          "We often think others are difficult or clueless when really they just communicate differently. The 'idiots' around you usually just operate on a different wavelength than you.",
      },
      {
        id: "si-2",
        title: "The Real Problem Is Communication",
        content:
          "Most conflict comes from mismatched styles, not bad intentions. Understanding how people differ turns frustration into cooperation.",
      },
      {
        id: "si-3",
        title: "Behaviour Is Predictable",
        content:
          "People's behaviour follows patterns you can learn to read. Once you see the patterns, others become far easier to understand and work with.",
      },
      {
        id: "si-4",
        title: "The DISC Model",
        content:
          "Erikson uses the DISC framework, sorting behaviour into four broad styles. He color-codes them for simplicity: Red, Yellow, Green, and Blue.",
      },
      {
        id: "si-5",
        title: "Four Colours of Behaviour",
        content:
          "Red is dominant and driven, Yellow is social and inspiring, Green is stable and kind, Blue is analytical and precise. Each sees the world its own way.",
      },
      {
        id: "si-6",
        title: "Red — Dominance",
        content:
          "Reds are direct, decisive, and results-driven. They want speed, control, and the bottom line, and can seem blunt or impatient to others.",
      },
      {
        id: "si-7",
        title: "Yellow — Inspiration",
        content:
          "Yellows are enthusiastic, talkative, and creative. They thrive on people, ideas, and attention, but can be disorganized and easily distracted.",
      },
      {
        id: "si-8",
        title: "Green — Stability",
        content:
          "Greens are calm, patient, and dependable. They value harmony and relationships, but dislike conflict and resist sudden change.",
      },
      {
        id: "si-9",
        title: "Blue — Conscientiousness",
        content:
          "Blues are analytical, careful, and detail-obsessed. They want accuracy and quality, but can seem cold, slow, or overly critical.",
      },
      {
        id: "si-10",
        title: "Most People Are a Blend",
        content:
          "Pure single-colour types are rare. Most of us are a mix of two colours, which is why people can seem contradictory at times.",
      },
      {
        id: "si-11",
        title: "Task vs People Focus",
        content:
          "One key axis is whether someone focuses on tasks (Red, Blue) or people (Yellow, Green). It shapes what they care about in any interaction.",
      },
      {
        id: "si-12",
        title: "Fast vs Slow Pace",
        content:
          "The other axis is pace: fast and assertive (Red, Yellow) versus slow and reflective (Green, Blue). Mismatched pace causes friction fast.",
      },
      {
        id: "si-13",
        title: "The Two Axes Together",
        content:
          "Combine task/people with fast/slow and you get the four colours. Placing someone on these axes quickly reveals how to deal with them.",
      },
      {
        id: "si-14",
        title: "Meet the Red",
        content:
          "Reds charge at goals, make quick decisions, and love a challenge. They ask 'what' and 'when', wanting outcomes over small talk.",
      },
      {
        id: "si-15",
        title: "Red Strengths",
        content:
          "Reds are courageous, efficient, and decisive. They get things moving, take charge in a crisis, and aren't afraid of hard calls.",
      },
      {
        id: "si-16",
        title: "Red Weaknesses",
        content:
          "Reds can be domineering, impatient, and insensitive. In their rush for results, they may steamroll feelings and details.",
      },
      {
        id: "si-17",
        title: "How Reds Communicate",
        content:
          "Reds are blunt and to the point. They interrupt, cut small talk, and can come across as aggressive even when they don't mean to.",
      },
      {
        id: "si-18",
        title: "Talking to a Red",
        content:
          "Be brief, confident, and results-focused. Skip the chit-chat, get to the point, and give them options and control.",
      },
      {
        id: "si-19",
        title: "Reds Under Stress",
        content:
          "Stressed Reds become even more domineering and combative. They push harder and may run over anyone in the way.",
      },
      {
        id: "si-20",
        title: "Motivating a Red",
        content:
          "Reds are driven by winning, challenge, and progress. Give them goals, autonomy, and a chance to compete and lead.",
      },
      {
        id: "si-21",
        title: "Red Body Language",
        content:
          "Reds use firm handshakes, direct eye contact, and fast, decisive movements. They lean in and take up space.",
      },
      {
        id: "si-22",
        title: "Giving a Red Feedback",
        content:
          "Be direct and factual. Reds respect straight talk — say what's wrong, why it matters, and what to do, without cushioning it endlessly.",
      },
      {
        id: "si-23",
        title: "Reds and Time",
        content:
          "Reds hate wasting time. Long meetings, vague plans, and slow decisions drive them up the wall.",
      },
      {
        id: "si-24",
        title: "Meet the Yellow",
        content:
          "Yellows light up a room with energy, ideas, and stories. They love people, novelty, and being liked and noticed.",
      },
      {
        id: "si-25",
        title: "Yellow Strengths",
        content:
          "Yellows are optimistic, persuasive, and creative. They inspire others, spark ideas, and keep morale high.",
      },
      {
        id: "si-26",
        title: "Yellow Weaknesses",
        content:
          "Yellows can be disorganized, unreliable with details, and prone to talking more than doing. They may overpromise and forget follow-through.",
      },
      {
        id: "si-27",
        title: "How Yellows Communicate",
        content:
          "Yellows are expressive and animated, often jumping topics. They think out loud and can dominate a conversation without realizing it.",
      },
      {
        id: "si-28",
        title: "Talking to a Yellow",
        content:
          "Be warm, upbeat, and let them talk. Show enthusiasm for their ideas, and keep things light and social before getting to business.",
      },
      {
        id: "si-29",
        title: "Yellows Under Stress",
        content:
          "Stressed Yellows get scattered and emotional, seeking reassurance. They may talk more and focus less.",
      },
      {
        id: "si-30",
        title: "Motivating a Yellow",
        content:
          "Yellows crave recognition, social contact, and fun. Praise them publicly and give them variety and people to work with.",
      },
      {
        id: "si-31",
        title: "Yellow Body Language",
        content:
          "Yellows are open, expressive, and touchy — big gestures, lots of smiling, and warm, animated faces.",
      },
      {
        id: "si-32",
        title: "Giving a Yellow Feedback",
        content:
          "Keep it positive and personal. Start with what's good, frame improvements as exciting possibilities, and preserve the relationship.",
      },
      {
        id: "si-33",
        title: "Yellows and Details",
        content:
          "Fine print bores Yellows. Bury them in data or process and their attention drifts instantly.",
      },
      {
        id: "si-34",
        title: "Meet the Green",
        content:
          "Greens are the calm, kind glue of any group. They listen, support, and keep the peace, preferring stability to the spotlight.",
      },
      {
        id: "si-35",
        title: "Green Strengths",
        content:
          "Greens are patient, loyal, and great team players. They're steady under pressure and make others feel safe and heard.",
      },
      {
        id: "si-36",
        title: "Green Weaknesses",
        content:
          "Greens can be indecisive, conflict-avoidant, and resistant to change. They may go along with things they quietly disagree with.",
      },
      {
        id: "si-37",
        title: "How Greens Communicate",
        content:
          "Greens are soft-spoken and diplomatic. They rarely push their opinion and may hide true feelings to avoid friction.",
      },
      {
        id: "si-38",
        title: "Talking to a Green",
        content:
          "Be gentle, patient, and personal. Don't rush them, give reassurance, and make them feel safe to share their real view.",
      },
      {
        id: "si-39",
        title: "Greens Under Stress",
        content:
          "Stressed Greens withdraw and go quiet, becoming stubborn or passive. They dig in silently rather than confront.",
      },
      {
        id: "si-40",
        title: "Motivating a Green",
        content:
          "Greens value security, harmony, and appreciation. Offer stability, a supportive team, and sincere, low-key recognition.",
      },
      {
        id: "si-41",
        title: "Green Body Language",
        content:
          "Greens are relaxed and gentle — soft handshakes, warm but calm expressions, and unhurried movements.",
      },
      {
        id: "si-42",
        title: "Giving a Green Feedback",
        content:
          "Be kind and reassuring. Deliver criticism gently and privately, and emphasize that the relationship is secure.",
      },
      {
        id: "si-43",
        title: "Greens and Change",
        content:
          "Sudden change unsettles Greens. Give them time, context, and a gradual path, and they'll come along willingly.",
      },
      {
        id: "si-44",
        title: "Meet the Blue",
        content:
          "Blues are the meticulous thinkers who want everything correct. They analyze, question, and prize accuracy over speed or feelings.",
      },
      {
        id: "si-45",
        title: "Blue Strengths",
        content:
          "Blues are precise, thorough, and dependable. They catch errors others miss and deliver careful, high-quality work.",
      },
      {
        id: "si-46",
        title: "Blue Weaknesses",
        content:
          "Blues can be overly critical, slow to decide, and stuck in analysis. Perfectionism can stall progress and chill relationships.",
      },
      {
        id: "si-47",
        title: "How Blues Communicate",
        content:
          "Blues are reserved, precise, and fact-focused. They ask 'why' and 'how', want evidence, and dislike exaggeration or vagueness.",
      },
      {
        id: "si-48",
        title: "Talking to a Blue",
        content:
          "Be prepared, accurate, and logical. Give them facts and detail, avoid hype, and allow time to think before deciding.",
      },
      {
        id: "si-49",
        title: "Blues Under Stress",
        content:
          "Stressed Blues over-analyze and become withdrawn and fault-finding. They retreat into detail and resist moving forward.",
      },
      {
        id: "si-50",
        title: "Motivating a Blue",
        content:
          "Blues value quality, correctness, and expertise. Give them clear standards, time to do it right, and respect for their precision.",
      },
      {
        id: "si-51",
        title: "Blue Body Language",
        content:
          "Blues are controlled and reserved — minimal gestures, careful expressions, and a preference for personal space.",
      },
      {
        id: "si-52",
        title: "Giving a Blue Feedback",
        content:
          "Be specific, logical, and evidence-based. Blues want the facts and reasoning, not vague impressions or emotional appeals.",
      },
      {
        id: "si-53",
        title: "Blues and Perfectionism",
        content:
          "Blues can chase perfect at the cost of done. Help them see when 'good enough, on time' beats flawless but late.",
      },
      {
        id: "si-54",
        title: "The Red-Yellow Mix",
        content:
          "Red-Yellows are fast, bold, and social — persuasive go-getters who can also be impatient and scattered.",
      },
      {
        id: "si-55",
        title: "The Green-Blue Mix",
        content:
          "Green-Blues are calm, careful, and considerate — reliable and precise, but slow to decide and change-averse.",
      },
      {
        id: "si-56",
        title: "When Red Meets Green",
        content:
          "The driven Red and the gentle Green are opposites. The Red finds the Green too slow; the Green finds the Red too harsh.",
      },
      {
        id: "si-57",
        title: "When Yellow Meets Blue",
        content:
          "The spontaneous Yellow and the precise Blue clash: the Yellow feels stifled by detail; the Blue is exhausted by the chaos.",
      },
      {
        id: "si-58",
        title: "Opposite Colours Clash",
        content:
          "The biggest friction is between diagonal opposites. Recognizing an opposite style is the first step to bridging the gap.",
      },
      {
        id: "si-59",
        title: "Reds and Greens Misread Each Other",
        content:
          "Reds see Greens as passive; Greens see Reds as bullies. Each just weights results and relationships differently.",
      },
      {
        id: "si-60",
        title: "Yellows and Blues Misread Each Other",
        content:
          "Yellows see Blues as cold nitpickers; Blues see Yellows as flaky windbags. Both are simply prioritizing different things.",
      },
      {
        id: "si-61",
        title: "Adapt Your Style",
        content:
          "The core skill is flexing your approach to fit the other person's colour. You keep your identity, but adjust your delivery.",
      },
      {
        id: "si-62",
        title: "Speak Their Colour",
        content:
          "Give Reds the bottom line, Yellows the excitement, Greens the reassurance, and Blues the details. Same message, tailored delivery.",
      },
      {
        id: "si-63",
        title: "Read People Quickly",
        content:
          "Watch pace and focus: fast or slow, task or people. A few clues place someone on the colour map within minutes.",
      },
      {
        id: "si-64",
        title: "Watch the Body Language",
        content:
          "Gestures, handshake, eye contact, and energy all signal colour. Bold and fast leans Red or Yellow; calm and controlled leans Green or Blue.",
      },
      {
        id: "si-65",
        title: "Listen for Word Choice",
        content:
          "Reds talk results, Yellows talk people and feelings, Greens talk harmony and 'we', Blues talk facts and precision. Language reveals type.",
      },
      {
        id: "si-66",
        title: "Colours in Meetings",
        content:
          "Reds want speed, Yellows want discussion, Greens want inclusion, Blues want an agenda and data. A good meeting serves all four.",
      },
      {
        id: "si-67",
        title: "Colours in Conflict",
        content:
          "Reds confront, Yellows dramatize, Greens avoid, Blues withdraw. Knowing each reaction helps you defuse rather than escalate.",
      },
      {
        id: "si-68",
        title: "Colours in Teams",
        content:
          "Each colour contributes something a team needs: drive, energy, harmony, and rigor. Balance beats a team of clones.",
      },
      {
        id: "si-69",
        title: "Build a Balanced Team",
        content:
          "A team of all Reds fights; all Yellows loses focus; all Greens stalls; all Blues over-analyzes. Mix colours for strength.",
      },
      {
        id: "si-70",
        title: "Colours in Sales",
        content:
          "Sell to Reds with results and ROI, Yellows with excitement and social proof, Greens with trust and safety, Blues with facts and guarantees.",
      },
      {
        id: "si-71",
        title: "Colours in Leadership",
        content:
          "Great leaders read their people and adapt: pushing Reds, inspiring Yellows, reassuring Greens, and informing Blues.",
      },
      {
        id: "si-72",
        title: "Colours in Relationships",
        content:
          "Understanding a partner's colour turns 'why won't they change?' into 'this is how they're wired.' Empathy replaces irritation.",
      },
      {
        id: "si-73",
        title: "Colours in Writing",
        content:
          "Even emails need tailoring: short for Reds, upbeat for Yellows, warm for Greens, detailed for Blues. Format for the reader, not yourself.",
      },
      {
        id: "si-74",
        title: "Feedback by Colour",
        content:
          "Direct for Reds, encouraging for Yellows, gentle for Greens, precise for Blues. The message may be the same; the wrapping isn't.",
      },
      {
        id: "si-75",
        title: "Criticism by Colour",
        content:
          "Reds argue back, Yellows take it personally, Greens go quiet and hurt, Blues get defensive over accuracy. Anticipate the reaction.",
      },
      {
        id: "si-76",
        title: "Each Colour Under Pressure",
        content:
          "Stress amplifies each colour's shadow side: Reds dominate, Yellows scatter, Greens withdraw, Blues over-scrutinize. Spot it and adjust.",
      },
      {
        id: "si-77",
        title: "Don't Stereotype",
        content:
          "Colours are a lens, not a cage. People are complex, and the model is a tool for empathy — not a label to box anyone in.",
      },
      {
        id: "si-78",
        title: "Know Your Own Colour",
        content:
          "Self-awareness comes first. Understanding your own style shows why some people rub you the wrong way — and how you affect them.",
      },
      {
        id: "si-79",
        title: "Weakness Is Strength Overused",
        content:
          "Every colour's flaw is just its strength taken too far. A Red's decisiveness becomes bullying; a Blue's care becomes paralysis.",
      },
      {
        id: "si-80",
        title: "Flex Without Faking",
        content:
          "Adapting isn't being fake; it's being considerate. You meet people where they are so your true message actually lands.",
      },
      {
        id: "si-81",
        title: "Patience With Difference",
        content:
          "What annoys you about someone is often just their colour showing. Patience grows when you see behaviour as difference, not defect.",
      },
      {
        id: "si-82",
        title: "There Are No Idiots",
        content:
          "The book's twist: no one is actually an idiot. They just process and express the world through a different colour than you.",
      },
      {
        id: "si-83",
        title: "Communication Is Your Job",
        content:
          "You can't control how others behave, only how you adapt. Taking responsibility for being understood is the mark of a great communicator.",
      },
      {
        id: "si-84",
        title: "Speak So They Can Hear",
        content:
          "Master the colours and you stop feeling surrounded by idiots. You learn to speak each person's language — and connection replaces frustration.",
      },
    ],
  },

  // You Are the Placebo — Dr. Joe Dispenza
  "bk-135": {
    bookId: "bk-135",
    tagline: "Making your mind matter — the science of belief and self-healing",
    updated: "2026-07",
    frames: [
      {
        id: "yp-1",
        title: "You Are the Placebo",
        content:
          "Dispenza's thesis: the healing power credited to sugar pills actually comes from your own mind. If belief alone can heal, you can learn to be your own placebo.",
      },
      {
        id: "yp-2",
        title: "The Mind Shapes the Body",
        content:
          "Thoughts aren't just abstract — they trigger real chemistry. What you think and feel consistently, the book argues, shows up in your physiology.",
      },
      {
        id: "yp-3",
        title: "Belief Becomes Biology",
        content:
          "Expectation, meaning, and belief can change the body's biochemistry. The placebo effect is proof that conviction can alter health.",
      },
      {
        id: "yp-4",
        title: "The Placebo Effect Explained",
        content:
          "In trials, people given inert pills often improve simply because they believe they will. The belief, not the substance, produces the result.",
      },
      {
        id: "yp-5",
        title: "The Nocebo Effect",
        content:
          "Negative expectations work the same way in reverse. Believing something will harm you can produce real symptoms — thought turned toxic.",
      },
      {
        id: "yp-6",
        title: "Thoughts Can Make You Sick",
        content:
          "Chronic worry and negative thinking keep the body in stress chemistry. Over time, Dispenza argues, that can help make you ill.",
      },
      {
        id: "yp-7",
        title: "Stories of Spontaneous Healing",
        content:
          "The book gathers cases of people who recovered against the odds by profoundly changing their inner state. Their belief shifted their biology.",
      },
      {
        id: "yp-8",
        title: "The Power of Suggestion",
        content:
          "How suggestible you are shapes how strongly belief affects you. A mind open to a new possibility can accept a new physical reality.",
      },
      {
        id: "yp-9",
        title: "Conditioning the Body",
        content:
          "Repeated associations can train the body to respond automatically — much as Pavlov's dogs learned. Ritual and repetition deepen the placebo response.",
      },
      {
        id: "yp-10",
        title: "Meaning and Ritual Matter",
        content:
          "The more meaning and ceremony surround a treatment, the stronger its effect. Belief is amplified by intention and attention.",
      },
      {
        id: "yp-11",
        title: "Genes Are Not Your Destiny",
        content:
          "You are not simply doomed by your genes. Epigenetics shows that signals — including thoughts and emotions — influence which genes switch on or off.",
      },
      {
        id: "yp-12",
        title: "Epigenetics in Everyday Life",
        content:
          "Your environment and inner state send instructions to your genes. Change the signals, the book argues, and you can change gene expression.",
      },
      {
        id: "yp-13",
        title: "Your Thoughts Are an Environment",
        content:
          "Since genes respond to environment, and your thoughts create an inner environment, your mind becomes a force that shapes your body.",
      },
      {
        id: "yp-14",
        title: "Same Thoughts, Same Life",
        content:
          "If you think the same thoughts daily, you produce the same feelings and the same biology — and keep recreating the same reality.",
      },
      {
        id: "yp-15",
        title: "The Thought-Feeling Loop",
        content:
          "Thoughts create feelings, and feelings drive more of the same thoughts. This loop can quietly lock you into your past.",
      },
      {
        id: "yp-16",
        title: "Living by Past Emotions",
        content:
          "When you constantly relive old emotions, your body believes it's still living in yesterday. Memory keeps the past physically alive.",
      },
      {
        id: "yp-17",
        title: "Emotions Are Chemical Records",
        content:
          "Emotions are the chemical residue of past experiences. Replaying them re-doses your body with the chemistry of what already happened.",
      },
      {
        id: "yp-18",
        title: "Addicted to Familiar Feelings",
        content:
          "The body can become addicted to the chemicals of stress, worry, or guilt. We unconsciously recreate situations that feed the familiar feeling.",
      },
      {
        id: "yp-19",
        title: "The Body Becomes the Mind",
        content:
          "Repeat a mental state long enough and the body memorizes it, running it automatically. Changing requires reprogramming both.",
      },
      {
        id: "yp-20",
        title: "Survival Emotions Keep You Stuck",
        content:
          "Fear, anger, and anxiety are survival states meant for emergencies. Living in them chronically narrows your body toward disease.",
      },
      {
        id: "yp-21",
        title: "Stress and Disease",
        content:
          "Long-term stress hormones knock the body out of balance. Dispenza argues sustained survival chemistry is a doorway to illness.",
      },
      {
        id: "yp-22",
        title: "Elevated Emotions Heal",
        content:
          "Gratitude, love, and joy shift the body toward growth and repair. Cultivating elevated emotions is presented as a path to healing.",
      },
      {
        id: "yp-23",
        title: "Gratitude Before the Event",
        content:
          "Feeling grateful as if your wish has already come true signals the body that the desired future is now. Gratitude is the ultimate state of receiving.",
      },
      {
        id: "yp-24",
        title: "Feel the Future Now",
        content:
          "Emotionally rehearsing your desired future in the present, Dispenza claims, begins to make your biology match it.",
      },
      {
        id: "yp-25",
        title: "Mental Rehearsal Rewires the Brain",
        content:
          "Vividly imagining an action changes the brain much as doing it would. Mental rehearsal installs new neural circuits before the physical change.",
      },
      {
        id: "yp-26",
        title: "The Brain Can't Tell the Difference",
        content:
          "To the brain, a richly imagined experience can look like a real one. This is why focused inner rehearsal produces outer results.",
      },
      {
        id: "yp-27",
        title: "Change Before the Evidence",
        content:
          "Most people wait for proof before they feel better. Dispenza urges the opposite: feel and think as the new self first, and let reality catch up.",
      },
      {
        id: "yp-28",
        title: "Bigger Than Your Environment",
        content:
          "If your thoughts only react to your surroundings, your environment controls you. Thinking greater than your environment is the first act of change.",
      },
      {
        id: "yp-29",
        title: "Bigger Than Your Body",
        content:
          "When the body cries out for its familiar emotional fix, you must not obey. Rising above the body's demands is how you reprogram it.",
      },
      {
        id: "yp-30",
        title: "Bigger Than Time",
        content:
          "Stop living in the remembered past and predictable future. The power to change lives only in the present moment.",
      },
      {
        id: "yp-31",
        title: "The Present-Moment Sweet Spot",
        content:
          "Real transformation happens when you become fully present, free of past identity and future worry. There, new possibilities open.",
      },
      {
        id: "yp-32",
        title: "Meditation as the Tool",
        content:
          "Dispenza's method is meditation — a practice to move beyond the analytical mind and reprogram the subconscious.",
      },
      {
        id: "yp-33",
        title: "From Thinking to Being",
        content:
          "It isn't enough to think positively; you must embody the new state until it becomes who you are. Knowing must become being.",
      },
      {
        id: "yp-34",
        title: "Change Your State of Being",
        content:
          "Lasting change is a shift in your habitual state of being — the blend of thoughts and feelings you carry by default.",
      },
      {
        id: "yp-35",
        title: "Personality Creates Reality",
        content:
          "Your personality — how you think, act, and feel — creates your personal reality. To change your life, you change your personality.",
      },
      {
        id: "yp-36",
        title: "Unmemorize the Old Self",
        content:
          "Breaking free means letting go of the memorized emotions and identity that keep you the same person day after day.",
      },
      {
        id: "yp-37",
        title: "Prune and Sprout",
        content:
          "Old thought patterns prune away when unused, while new ones grow with practice. The brain physically reshapes around your new focus.",
      },
      {
        id: "yp-38",
        title: "Neuroplasticity",
        content:
          "The brain remains changeable throughout life. Repeated new thoughts and feelings literally rewire it toward the person you want to be.",
      },
      {
        id: "yp-39",
        title: "The Quantum Model of Mind",
        content:
          "Dispenza draws on quantum ideas to argue that consciousness participates in shaping reality, and that mind and matter are deeply linked.",
      },
      {
        id: "yp-40",
        title: "Coherence: Heart and Brain",
        content:
          "When heart and brain move into coherence — a calm, elevated, ordered state — the body's healing capacity is said to rise.",
      },
      {
        id: "yp-41",
        title: "Beyond the Analytical Mind",
        content:
          "The overthinking analytical mind guards the old self. Meditation quiets it so new programs can reach the subconscious.",
      },
      {
        id: "yp-42",
        title: "Rest in the Unknown",
        content:
          "Growth requires stepping out of the predictable known and into the unknown — the uncomfortable space where new outcomes become possible.",
      },
      {
        id: "yp-43",
        title: "Become the Placebo",
        content:
          "Rather than needing a pill to trigger belief, you can generate the healing belief directly. You become the placebo yourself.",
      },
      {
        id: "yp-44",
        title: "Belief Without the Pill",
        content:
          "Once you understand how belief heals, you no longer need an external object to carry it. Your own conviction does the work.",
      },
      {
        id: "yp-45",
        title: "Practice Makes It Permanent",
        content:
          "One inspired session isn't enough. Daily practice is what turns a new state of being into your automatic default.",
      },
      {
        id: "yp-46",
        title: "Emotions Signal the Genes",
        content:
          "Elevated emotions are presented as instructions telling healthier genes to switch on. Feeling well, the book claims, helps the body become well.",
      },
      {
        id: "yp-47",
        title: "Break the Habit of Reaction",
        content:
          "Stop reacting automatically to life with the same old emotions. Choosing your inner state is where personal power begins.",
      },
      {
        id: "yp-48",
        title: "The Placebo Is Everywhere",
        content:
          "Belief shapes far more than medicine — it colors performance, relationships, and mood. Managing your expectations manages your life.",
      },
      {
        id: "yp-49",
        title: "Meaning Heals",
        content:
          "A strong sense of meaning and purpose supports both mind and body. Believing your life matters is itself protective.",
      },
      {
        id: "yp-50",
        title: "Mind Over Matter, Practically",
        content:
          "The book turns 'mind over matter' from a slogan into a practice: think, feel, and rehearse deliberately, and observe the changes.",
      },
      {
        id: "yp-51",
        title: "You Are Not Fixed",
        content:
          "Your health, mood, and identity are more changeable than you were taught. That flexibility is the ground of hope.",
      },
      {
        id: "yp-52",
        title: "The Daily Meditation Habit",
        content:
          "Dispenza recommends a consistent meditation practice to enter the calm, present state where reprogramming happens.",
      },
      {
        id: "yp-53",
        title: "A Note of Balance",
        content:
          "These ideas blend genuine placebo science with bolder claims. Treat them as inspiration to harness belief and reduce stress — not as a replacement for medical care.",
      },
      {
        id: "yp-54",
        title: "You Are the Healer",
        content:
          "The book's empowering message: your mind is a powerful ally in your wellbeing. Cultivate belief, gratitude, and presence, and you become your own medicine.",
      },
    ],
  },

  // The 5 AM Club — Robin Sharma
  "bk-540": {
    bookId: "bk-540",
    tagline: "Own your morning, elevate your life",
    updated: "2026-07",
    frames: [
      {
        id: "am-1",
        title: "Own Your Morning",
        content:
          "Sharma's core promise: how you begin your day shapes your whole life. Win the first hour and you win the day; win your days and you win your life.",
      },
      {
        id: "am-2",
        title: "Win the Battle of the Bed",
        content:
          "Rising early starts with beating the urge to hit snooze. That first small act of discipline sets the tone for every choice that follows.",
      },
      {
        id: "am-3",
        title: "The 5 AM Advantage",
        content:
          "The pre-dawn hours are quiet, distraction-free, and yours alone. Sharma calls this stillness the ideal time to build a world-class life.",
      },
      {
        id: "am-4",
        title: "The Victory Hour",
        content:
          "The hour from 5 to 6 AM is the Victory Hour — a daily ritual to strengthen your body, mind, and spirit before the world wakes.",
      },
      {
        id: "am-5",
        title: "The 20/20/20 Formula",
        content:
          "Split the Victory Hour into three 20-minute blocks: Move, Reflect, and Grow. This simple structure transforms an ordinary morning into a power ritual.",
      },
      {
        id: "am-6",
        title: "First 20 — Move",
        content:
          "Begin with intense exercise. Sweating early floods the brain with focus chemicals and burns away the stress hormone cortisol.",
      },
      {
        id: "am-7",
        title: "Second 20 — Reflect",
        content:
          "Spend the next twenty minutes in stillness — journaling, meditating, or planning. Reflection turns a busy mind into a clear, intentional one.",
      },
      {
        id: "am-8",
        title: "Third 20 — Grow",
        content:
          "Use the final twenty minutes to learn — read, study, or listen. Continuous growth is how ordinary people become extraordinary.",
      },
      {
        id: "am-9",
        title: "Discipline Over Motivation",
        content:
          "Motivation fades; the 5 AM habit is built on discipline. Sharma argues that self-control, practiced daily, is a muscle that strengthens.",
      },
      {
        id: "am-10",
        title: "The Four Interior Empires",
        content:
          "True success rests on four inner empires: Mindset (psychology), Heartset (emotions), Healthset (body), and Soulset (spirit). Neglect one and the others suffer.",
      },
      {
        id: "am-11",
        title: "Mindset",
        content:
          "Your beliefs and thoughts shape your performance. Tending your mindset keeps your psychology aligned with the life you want to build.",
      },
      {
        id: "am-12",
        title: "Heartset",
        content:
          "Unhealed emotions quietly sabotage success. Cleaning up your heartset — your emotional life — frees your energy for greatness.",
      },
      {
        id: "am-13",
        title: "Healthset",
        content:
          "Peak performance needs physical vitality. Fitness, nutrition, and rest are the fuel for a productive, long, and vibrant life.",
      },
      {
        id: "am-14",
        title: "Soulset",
        content:
          "Beyond mind and body lies the soul — your sense of meaning and connection. Nurturing it brings depth and purpose to achievement.",
      },
      {
        id: "am-15",
        title: "Twin Cycles of Elite Performance",
        content:
          "Great performers alternate between intense work and deep recovery. Growth happens in the rest, not just the effort.",
      },
      {
        id: "am-16",
        title: "Deliberate Practice",
        content:
          "Elite results come from focused, deliberate practice — not scattered busyness. Push your abilities intentionally at their edge.",
      },
      {
        id: "am-17",
        title: "Deep Recovery",
        content:
          "Rest is productive. Sharma insists that without genuine recovery, hard work leads to burnout rather than mastery.",
      },
      {
        id: "am-18",
        title: "The 66-Day Habit Rule",
        content:
          "Installing a habit takes about 66 days, not 21. Commit to the full stretch and the 5 AM ritual becomes automatic.",
      },
      {
        id: "am-19",
        title: "Three Phases of Change",
        content:
          "New habits pass through Destruction (hard), Installation (messy), and Integration (natural). Knowing the phases helps you push through the discomfort.",
      },
      {
        id: "am-20",
        title: "Push Through the Messy Middle",
        content:
          "The hardest part of any change is the middle, when it feels awful and results are invisible. Persist and the habit locks in.",
      },
      {
        id: "am-21",
        title: "The 3-Step Success Formula",
        content:
          "Better awareness leads to better choices, which lead to better results. Change begins by simply seeing yourself and your habits more clearly.",
      },
      {
        id: "am-22",
        title: "Protect Your Peak Hours",
        content:
          "Guard your most focused hours from distraction and trivial tasks. Your best energy should go to your most important work.",
      },
      {
        id: "am-23",
        title: "The 90/90/1 Rule",
        content:
          "For the next 90 days, devote the first 90 minutes of work to your single most important project. Concentrated focus produces breakthrough results.",
      },
      {
        id: "am-24",
        title: "The 60/10 Method",
        content:
          "Work in focused 60-minute bursts, then recover for 10. Alternating intensity and rest sustains high performance without burnout.",
      },
      {
        id: "am-25",
        title: "The 2nd Wind Workout",
        content:
          "A short evening workout can renew your energy and end the day strong, supporting both fitness and better sleep.",
      },
      {
        id: "am-26",
        title: "Digital Minimalism",
        content:
          "Constant screens fracture attention and drain willpower. Reclaiming your focus from devices is essential to the 5 AM lifestyle.",
      },
      {
        id: "am-27",
        title: "The Trap of Busyness",
        content:
          "Being busy isn't being productive. Sharma warns against mistaking frantic activity for meaningful, high-value work.",
      },
      {
        id: "am-28",
        title: "Sleep Early to Rise Early",
        content:
          "Rising at 5 AM only works if you protect your sleep. An early, consistent bedtime is the non-negotiable other half of the habit.",
      },
      {
        id: "am-29",
        title: "A Shutdown Ritual",
        content:
          "Wind down each night with a calming, screen-free routine. A deliberate shutdown protects the sleep that fuels your mornings.",
      },
      {
        id: "am-30",
        title: "Solitude Breeds Clarity",
        content:
          "Time alone in the early quiet lets you think, plan, and hear yourself. Solitude is where clarity and creativity are born.",
      },
      {
        id: "am-31",
        title: "Gratitude Each Morning",
        content:
          "Starting the day grateful primes a positive, resourceful state. Appreciation, practiced daily, reshapes your whole outlook.",
      },
      {
        id: "am-32",
        title: "Growth Is Uncomfortable",
        content:
          "Real change feels awkward and hard at first. Sharma reframes discomfort as proof that you're stretching and improving.",
      },
      {
        id: "am-33",
        title: "Capitalize on Your Gifts",
        content:
          "Everyone has natural talents that go unused. Effectiveness comes from identifying your gifts and pouring energy into them.",
      },
      {
        id: "am-34",
        title: "Freedom From Distraction",
        content:
          "Focus is the new superpower in a noisy world. Removing distractions is how you produce work that truly matters.",
      },
      {
        id: "am-35",
        title: "Consistency Over Intensity",
        content:
          "One heroic morning changes nothing; showing up daily changes everything. Small acts repeated relentlessly build a remarkable life.",
      },
      {
        id: "am-36",
        title: "Environment Shapes Behaviour",
        content:
          "Design your surroundings to support your goals — lay out clothes, remove temptations, prepare the space. Willpower needs a helpful environment.",
      },
      {
        id: "am-37",
        title: "Your Excuses Aren't Real",
        content:
          "The stories we tell to justify staying in bed are just fear in disguise. Sharma urges you to stop negotiating with your excuses.",
      },
      {
        id: "am-38",
        title: "Small Daily Wins",
        content:
          "Momentum builds from tiny victories — one workout, one page, one early rise. Stack small wins and they compound into transformation.",
      },
      {
        id: "am-39",
        title: "Lead Without a Title",
        content:
          "You don't need a position to lead; you lead by example and excellence. Mastering yourself is the first act of leadership.",
      },
      {
        id: "am-40",
        title: "Serve and Contribute",
        content:
          "Beyond personal success, Sharma emphasizes contribution. A life of impact and service gives your achievements lasting meaning.",
      },
      {
        id: "am-41",
        title: "Legacy Over Comfort",
        content:
          "Comfort is the enemy of greatness. Choosing the harder path of growth is how you build a legacy you'll be proud of.",
      },
      {
        id: "am-42",
        title: "Mindset Rituals",
        content:
          "Reinforce empowering beliefs each morning through affirmation and visualization. What you repeat to yourself, you become.",
      },
      {
        id: "am-43",
        title: "Move Your Body Daily",
        content:
          "Daily movement isn't vanity; it's the foundation of energy, mood, and focus. A strong body supports a strong mind.",
      },
      {
        id: "am-44",
        title: "Feed the Mind",
        content:
          "Read, study, and learn every single day. A mind that keeps growing keeps opening doors that a stagnant one never sees.",
      },
      {
        id: "am-45",
        title: "Master the Transitions",
        content:
          "How you move between activities — waking, working, resting — matters. Intentional transitions keep you in control of your day.",
      },
      {
        id: "am-46",
        title: "Protect Your Peak Energy",
        content:
          "Treat energy, not just time, as your scarcest resource. Spend your best energy on what matters most, early, before it drains.",
      },
      {
        id: "am-47",
        title: "The Power of Rituals",
        content:
          "Rituals remove decision fatigue and make excellence automatic. Build a set morning routine and greatness becomes a default, not a choice.",
      },
      {
        id: "am-48",
        title: "Recover Like an Athlete",
        content:
          "Elite athletes schedule recovery as seriously as training. Sleep, stillness, and downtime are where your gains are locked in.",
      },
      {
        id: "am-49",
        title: "Beat Procrastination",
        content:
          "Do the hardest, most important task first, while willpower is fresh. Early action defeats the procrastination that steals dreams.",
      },
      {
        id: "am-50",
        title: "Guard the First Hour",
        content:
          "Don't touch your phone or email in the first hour. Protect that time for growth, and you protect your power over the day.",
      },
      {
        id: "am-51",
        title: "Become World-Class",
        content:
          "Ordinary habits create ordinary results. Sharma's rituals are designed to help everyday people build genuinely world-class lives.",
      },
      {
        id: "am-52",
        title: "Patience With the Process",
        content:
          "Transformation is gradual and often invisible day to day. Trust the process and let consistent mornings compound over months.",
      },
      {
        id: "am-53",
        title: "The First Hour Sets the Day",
        content:
          "A strong, structured start creates momentum that carries you for hours. Lose the morning and you often lose the day.",
      },
      {
        id: "am-54",
        title: "Rise for a Reason",
        content:
          "Getting up at 5 is meaningless without purpose. Anchor the habit to a compelling why, and the alarm becomes easy to answer.",
      },
      {
        id: "am-55",
        title: "Join the 5 AM Club",
        content:
          "Own your morning with the 20/20/20 ritual, protect your focus, and recover deeply. Do it daily, and you elevate your entire life.",
      },
    ],
  },

  // The Metamorphosis — Franz Kafka
  "bk-086": {
    bookId: "bk-086",
    tagline: "Kafka's haunting parable of alienation and identity",
    updated: "2026-07",
    frames: [
      {
        id: "mt-1",
        title: "A Man Wakes as an Insect",
        content:
          "Gregor Samsa wakes one morning transformed into a giant insect. Kafka states this impossible fact plainly, and the whole story unfolds from that single, unexplained horror.",
      },
      {
        id: "mt-2",
        title: "The Absurd Without Explanation",
        content:
          "No cause is ever given for the transformation, and none is sought. Kafka drops us into an absurd reality and asks how humans respond when the impossible simply happens.",
      },
      {
        id: "mt-3",
        title: "Alienation Made Literal",
        content:
          "Gregor's insect body externalizes a feeling many know: being estranged, unseen, and unable to connect with those closest to you.",
      },
      {
        id: "mt-4",
        title: "Reduced to a Body",
        content:
          "Overnight Gregor becomes a creature others recoil from. The story asks how much of our worth is tied to how we look and what we can do.",
      },
      {
        id: "mt-5",
        title: "The Breadwinner's Burden",
        content:
          "Gregor had shouldered the family's debts through a job he hated. His first panic is not about his body but about missing work — a life defined by duty.",
      },
      {
        id: "mt-6",
        title: "Work as Dehumanization",
        content:
          "Before any transformation, Gregor's soul-crushing job had already reduced him to a cog. Kafka suggests modern labor can turn people into something less than human.",
      },
      {
        id: "mt-7",
        title: "The Mind Remains Human",
        content:
          "Inside the monstrous shell, Gregor still thinks, worries, and loves as before. The tragedy is that no one can see the person still trapped within.",
      },
      {
        id: "mt-8",
        title: "The Failure to Communicate",
        content:
          "Gregor understands everyone, but no one understands him. The loss of shared language becomes a metaphor for profound human isolation.",
      },
      {
        id: "mt-9",
        title: "Trapped in His Room",
        content:
          "Gregor's bedroom becomes both refuge and prison. His shrinking world mirrors how illness or difference can quietly confine a person.",
      },
      {
        id: "mt-10",
        title: "The Threshold and the Door",
        content:
          "Doors open and close throughout the story, marking who is let in and who is shut out. Gregor is forever on the wrong side of belonging.",
      },
      {
        id: "mt-11",
        title: "From Provider to Burden",
        content:
          "The moment Gregor can no longer earn, his value to the family collapses. Kafka exposes how conditional our sense of being loved can be.",
      },
      {
        id: "mt-12",
        title: "Conditional Love",
        content:
          "The family's affection proves tied to what Gregor provides. When he needs care instead of giving it, that love steadily curdles.",
      },
      {
        id: "mt-13",
        title: "Grete's Early Compassion",
        content:
          "At first his sister Grete tends to him with tenderness. Her care is the story's fragile spark of humanity — and it will not last.",
      },
      {
        id: "mt-14",
        title: "Care Turns to Resentment",
        content:
          "As the burden wears on, compassion gives way to disgust and duty. Kafka shows how caregiving can erode into weary resentment.",
      },
      {
        id: "mt-15",
        title: "The Father's Hostility",
        content:
          "Gregor's father meets him with fear and aggression rather than love. The parent who was supported now turns on the son who supported him.",
      },
      {
        id: "mt-16",
        title: "The Wound of the Apple",
        content:
          "The father hurls apples, lodging one in Gregor's back to fester. It is a wound of rejection from the very family he sacrificed for.",
      },
      {
        id: "mt-17",
        title: "Shame and Hiding",
        content:
          "Gregor hides under the couch to spare others the sight of him. His instinct is to shrink and apologize for simply existing.",
      },
      {
        id: "mt-18",
        title: "Watching Life Go On Without Him",
        content:
          "From his room Gregor observes the family adapt and move forward. The loneliest pain is seeing the world continue as if you're already gone.",
      },
      {
        id: "mt-19",
        title: "The Picture He Protects",
        content:
          "Gregor desperately guards a framed picture on his wall — a last clutch at his old identity and desires against total erasure.",
      },
      {
        id: "mt-20",
        title: "Clinging to Humanity",
        content:
          "Even as his body grows stranger, Gregor's cravings for connection and beauty persist. His humanity refuses to fully die.",
      },
      {
        id: "mt-21",
        title: "Music and the Soul",
        content:
          "Drawn out by his sister's violin, Gregor wonders if a creature so moved by music can really be just an animal. Art briefly restores his dignity.",
      },
      {
        id: "mt-22",
        title: "The Lodgers and Appearances",
        content:
          "The family takes in lodgers and hides Gregor to keep up appearances. Social respectability matters more to them than the son in the next room.",
      },
      {
        id: "mt-23",
        title: "Rejected by His Sister",
        content:
          "Finally even Grete declares the creature must go, refusing to call it Gregor. The last thread of belonging is cut.",
      },
      {
        id: "mt-24",
        title: "Deemed No Longer Himself",
        content:
          "Once the family stops seeing Gregor as Gregor, his fate is sealed. To be denied your very identity is a kind of death before death.",
      },
      {
        id: "mt-25",
        title: "The Wish to Disappear",
        content:
          "Sensing he is only a burden, Gregor comes to feel his family would be better without him. His selflessness becomes self-erasure.",
      },
      {
        id: "mt-26",
        title: "A Quiet, Lonely Death",
        content:
          "Gregor dies alone in the dark, unmourned and unnoticed until morning. Kafka gives the moment no drama — only a devastating quiet.",
      },
      {
        id: "mt-27",
        title: "Relief, Not Grief",
        content:
          "The family greets his death with relief and a sense of freedom. The absence of grief is the story's most chilling indictment.",
      },
      {
        id: "mt-28",
        title: "The Family's Renewal",
        content:
          "Freed of Gregor, the family takes a trip and imagines a bright future. Life resumes easily — a haunting comment on how quickly we are replaced.",
      },
      {
        id: "mt-29",
        title: "Grete Blossoms",
        content:
          "The story ends with the parents noticing Grete has grown into a young woman. New life moves on atop the forgotten sacrifice of the old.",
      },
      {
        id: "mt-30",
        title: "The Cruelty of Usefulness",
        content:
          "A central sting of the tale: we are often valued for our usefulness, and cast aside when we can no longer provide.",
      },
      {
        id: "mt-31",
        title: "The Body as Prison",
        content:
          "Gregor's mind is caged in a body that betrays him. Kafka evokes the anguish of anyone trapped by illness, disability, or circumstance.",
      },
      {
        id: "mt-32",
        title: "Isolation Within the Family",
        content:
          "The loneliest isolation isn't in a desert but in your own home, among people who no longer see you. That is Gregor's true torment.",
      },
      {
        id: "mt-33",
        title: "Capitalism and the Worker",
        content:
          "Many read Gregor as the worker consumed by labor, discarded once unproductive. The story critiques a world that measures people by output.",
      },
      {
        id: "mt-34",
        title: "Guilt Without a Crime",
        content:
          "Gregor apologizes and feels shame though he has done nothing wrong. Kafka's characters often carry a nameless guilt for simply being.",
      },
      {
        id: "mt-35",
        title: "Empathy's Limits",
        content:
          "The story tests how far compassion stretches before self-interest wins. It asks each reader an uncomfortable question about their own limits.",
      },
      {
        id: "mt-36",
        title: "No Moral, Only Experience",
        content:
          "Kafka offers no tidy lesson. The power lies in living the discomfort with Gregor and sitting with the questions it raises.",
      },
      {
        id: "mt-37",
        title: "The Kafkaesque",
        content:
          "This story helped define 'Kafkaesque': the nightmarish, absurd, and dehumanizing rendered in flat, matter-of-fact prose.",
      },
      {
        id: "mt-38",
        title: "Dignity in Degradation",
        content:
          "Despite everything, Gregor's continued care for his family lends him a quiet dignity the humans around him lack.",
      },
      {
        id: "mt-39",
        title: "The Reader's Discomfort",
        content:
          "Kafka makes us complicit, understanding both Gregor's suffering and the family's exhaustion. The unease is the point.",
      },
      {
        id: "mt-40",
        title: "Modern Loneliness",
        content:
          "A century on, the story speaks to anyone who has felt invisible, unproductive, or estranged in a fast, transactional world.",
      },
      {
        id: "mt-41",
        title: "Communication and Love",
        content:
          "Once Gregor can't speak, love has no channel to flow through. The tale hints that connection dies when we stop truly hearing each other.",
      },
      {
        id: "mt-42",
        title: "The Ordinary Made Strange",
        content:
          "By treating the fantastic as mundane, Kafka reveals how strange and cruel ordinary family and work life can already be.",
      },
      {
        id: "mt-43",
        title: "Sacrifice Unremembered",
        content:
          "Gregor gave years to his family's comfort, yet it's forgotten within days of his death. The story mourns the fragility of gratitude.",
      },
      {
        id: "mt-44",
        title: "Identity Beyond Appearance",
        content:
          "Are you still you if no one recognizes you? Kafka pushes the question until it aches.",
      },
      {
        id: "mt-45",
        title: "The Fear of Being a Burden",
        content:
          "Gregor's deepest dread is becoming a weight on others. It's a fear that quietly haunts the sick, the aging, and the struggling everywhere.",
      },
      {
        id: "mt-46",
        title: "Powerlessness",
        content:
          "Gregor cannot argue, explain, or plead — only endure. Kafka captures the helplessness of those who have lost their voice in the world.",
      },
      {
        id: "mt-47",
        title: "The Silence of Suffering",
        content:
          "So much of Gregor's pain goes unspoken and unseen. The story honors the private suffering that no one else witnesses.",
      },
      {
        id: "mt-48",
        title: "A Mirror to Society",
        content:
          "The family's behaviour reflects how societies treat the different and the dependent — with initial pity that hardens into rejection.",
      },
      {
        id: "mt-49",
        title: "What Makes Us Human",
        content:
          "Stripped of body, job, and recognition, what remains of a person? Kafka locates humanity in feeling, longing, and love — not utility.",
      },
      {
        id: "mt-50",
        title: "Why It Endures",
        content:
          "The Metamorphosis lasts because its horror is emotional, not fantastical. We recognize the loneliness, even if we've never grown wings or shells.",
      },
      {
        id: "mt-51",
        title: "Compassion as the Real Test",
        content:
          "The story quietly asks: could you keep loving someone who could no longer give you anything back? Our answer defines us.",
      },
      {
        id: "mt-52",
        title: "The Lasting Question",
        content:
          "Kafka leaves us with discomfort rather than comfort — a mirror held up to how we treat the vulnerable, and to our own fear of becoming one.",
      },
    ],
  },

  // The Trial — Franz Kafka
  "bk-087": {
    bookId: "bk-087",
    tagline: "A nightmare of guilt, justice, and faceless bureaucracy",
    updated: "2026-07",
    frames: [
      {
        id: "tr-1",
        title: "Arrested Without a Crime",
        content:
          "Josef K. is arrested one morning by agents who won't say what he's charged with. The nightmare begins with a guilt he can neither understand nor deny.",
      },
      {
        id: "tr-2",
        title: "Guilt Presumed",
        content:
          "The court treats K. as guilty from the start. Kafka inverts justice: instead of proving guilt, K. must somehow disprove an accusation no one will name.",
      },
      {
        id: "tr-3",
        title: "The Unknowable Charge",
        content:
          "K. never learns what he's accused of. The absence of a charge becomes more terrifying than any specific crime could be.",
      },
      {
        id: "tr-4",
        title: "The Faceless System",
        content:
          "The Court has no clear address, officials, or logic. It is everywhere and nowhere — an authority that can't be confronted or reasoned with.",
      },
      {
        id: "tr-5",
        title: "Bureaucracy as Nightmare",
        content:
          "Endless offices, forms, and functionaries lead nowhere. Kafka turns paperwork and procedure into a maze designed to exhaust and defeat.",
      },
      {
        id: "tr-6",
        title: "Courts in the Attic",
        content:
          "The tribunals hide in shabby attics of ordinary buildings. Power lurks in the mundane, woven invisibly into everyday life.",
      },
      {
        id: "tr-7",
        title: "Life Goes On Around It",
        content:
          "K. still works at his bank as the trial creeps through his life. The horror is how normalcy and dread coexist without resolution.",
      },
      {
        id: "tr-8",
        title: "The Lawyer Who Cannot Help",
        content:
          "K.'s advocate talks endlessly but achieves nothing. The legal help he seeks only entangles him deeper in the machinery.",
      },
      {
        id: "tr-9",
        title: "Endless Delay",
        content:
          "The process advances by not advancing. Perpetual postponement becomes a form of punishment in itself.",
      },
      {
        id: "tr-10",
        title: "The Machinery Grinds On",
        content:
          "No single villain runs the Court; it simply grinds forward on its own momentum. Systems, Kafka warns, can oppress with no one responsible.",
      },
      {
        id: "tr-11",
        title: "Creeping Self-Doubt",
        content:
          "As the case drags on, K. starts to wonder whether he is, somehow, guilty. The accusation slowly rewrites his sense of himself.",
      },
      {
        id: "tr-12",
        title: "Paranoia Takes Hold",
        content:
          "K. begins to see the Court's agents everywhere. The trial invades his mind long before it reaches any verdict.",
      },
      {
        id: "tr-13",
        title: "Everyone Seems Complicit",
        content:
          "Neighbors, colleagues, even strangers appear connected to the Court. Kafka evokes a world where the whole society enforces an unseen order.",
      },
      {
        id: "tr-14",
        title: "False Hope in Others",
        content:
          "K. seeks help from women and go-betweens who promise influence. Each lead dissolves, feeding hope only to deepen his helplessness.",
      },
      {
        id: "tr-15",
        title: "The Painter's Insight",
        content:
          "The court painter Titorelli explains the system's grim options, revealing that real escape is essentially impossible.",
      },
      {
        id: "tr-16",
        title: "Three Kinds of Acquittal",
        content:
          "Definite acquittal, apparent acquittal, and indefinite postponement — but the first is only a rumour no one has ever actually seen granted.",
      },
      {
        id: "tr-17",
        title: "No True Freedom",
        content:
          "Even 'apparent acquittal' means you can be re-arrested anytime. Once caught in the system, you are never truly released.",
      },
      {
        id: "tr-18",
        title: "The Absurdity of Justice",
        content:
          "The Court's rules defy all reason, yet everyone obeys them. Kafka portrays justice as a ritual emptied of meaning.",
      },
      {
        id: "tr-19",
        title: "Before the Law",
        content:
          "In the famous parable, a man waits his whole life at a gate to the Law, begging a gatekeeper for entry that never comes.",
      },
      {
        id: "tr-20",
        title: "A Door Meant Only for You",
        content:
          "At the man's death, the gatekeeper reveals the door was meant for him alone — and now it will be shut. Access was always possible yet always denied.",
      },
      {
        id: "tr-21",
        title: "Waiting a Lifetime",
        content:
          "The parable's man spends his life seeking permission he could perhaps have taken. Kafka probes how fear and deference keep us waiting forever.",
      },
      {
        id: "tr-22",
        title: "The Priest's Warning",
        content:
          "A prison chaplain tells K. the parable, warning that the Court neither wants nor rejects him — it simply receives him when he comes and lets him go when he leaves.",
      },
      {
        id: "tr-23",
        title: "Guilt as the Human Condition",
        content:
          "Many read the nameless charge as existential guilt — the vague sense of being at fault simply for being alive and imperfect.",
      },
      {
        id: "tr-24",
        title: "Seeking Meaning in the System",
        content:
          "K. keeps trying to find logic and fairness where none exists. His need to make sense of the senseless is deeply, painfully human.",
      },
      {
        id: "tr-25",
        title: "Resistance Feels Futile",
        content:
          "Every effort K. makes seems to sink him further. Kafka captures the despair of struggling against a power that cannot be grasped.",
      },
      {
        id: "tr-26",
        title: "Complicity Through Compliance",
        content:
          "By cooperating and seeking approval, K. legitimizes the very system crushing him. Obedience becomes its own trap.",
      },
      {
        id: "tr-27",
        title: "The Banality of Oppression",
        content:
          "The Court's cruelty is delivered by dull clerks doing their jobs. Evil here is bureaucratic, ordinary, and diffuse.",
      },
      {
        id: "tr-28",
        title: "A Prophecy of Totalitarianism",
        content:
          "Written before the century's great tyrannies, The Trial eerily foresaw states that arrest, accuse, and destroy citizens without cause.",
      },
      {
        id: "tr-29",
        title: "The Modern Citizen",
        content:
          "Anyone who has battled an opaque institution — an agency, a company, a system — recognizes K.'s helpless frustration.",
      },
      {
        id: "tr-30",
        title: "The Absence of Answers",
        content:
          "Kafka refuses explanations, leaving K. — and us — grasping. The withholding of answers is the story's engine of dread.",
      },
      {
        id: "tr-31",
        title: "Shame at the End",
        content:
          "As K. is led to his death, his final feeling is shame. The system has succeeded in making him feel guilty without ever proving anything.",
      },
      {
        id: "tr-32",
        title: "Like a Dog",
        content:
          "K. dies humiliated, thinking it is 'like a dog,' as if the shame would outlive him. It is one of literature's bleakest endings.",
      },
      {
        id: "tr-33",
        title: "Death Without Understanding",
        content:
          "K. never learns why any of it happened. Kafka denies the comfort of comprehension even at the very end.",
      },
      {
        id: "tr-34",
        title: "The Unfinished Novel",
        content:
          "Kafka left the book incomplete and asked for it to be burned. Its fragmentary form mirrors the incompleteness of K.'s search for truth.",
      },
      {
        id: "tr-35",
        title: "Ambiguity as the Point",
        content:
          "The Trial resists a single interpretation. Its refusal to resolve is precisely what makes it endlessly discussed.",
      },
      {
        id: "tr-36",
        title: "Existential Anxiety",
        content:
          "The book gives shape to a modern dread: the fear that life is governed by forces indifferent to our understanding or fairness.",
      },
      {
        id: "tr-37",
        title: "The Trial Within",
        content:
          "Some read the Court as K.'s own conscience, judging him from within. The prosecution may be as internal as it is external.",
      },
      {
        id: "tr-38",
        title: "Institutions Beyond Reason",
        content:
          "Kafka shows how institutions can grow so large and self-justifying that reason and mercy no longer reach them.",
      },
      {
        id: "tr-39",
        title: "The Cost of Passivity",
        content:
          "K. drifts, defers, and hopes others will save him. His passivity is part of his undoing — a warning against surrendering agency.",
      },
      {
        id: "tr-40",
        title: "Justice as Ritual",
        content:
          "The Court performs the motions of law without its substance. Kafka separates the appearance of justice from justice itself.",
      },
      {
        id: "tr-41",
        title: "The Reader as Juror",
        content:
          "We keep searching for K.'s guilt or innocence, becoming jurors in a trial with no evidence. Kafka implicates us in the judging.",
      },
      {
        id: "tr-42",
        title: "Faith and Doubt",
        content:
          "The Law can be read as the divine, forever sought and never reached. The novel becomes a meditation on faith without certainty.",
      },
      {
        id: "tr-43",
        title: "The Individual Crushed",
        content:
          "Against the vast machinery, the single human is powerless. Kafka mourns the individual swallowed by systems larger than any person.",
      },
      {
        id: "tr-44",
        title: "Dread in Ordinary Rooms",
        content:
          "Kafka locates terror not in dungeons but in offices, lodgings, and cathedrals. The everyday setting makes the horror inescapable.",
      },
      {
        id: "tr-45",
        title: "The Language of Delay",
        content:
          "Officials speak in evasions and technicalities that never commit to anything. Language itself becomes a tool of the maze.",
      },
      {
        id: "tr-46",
        title: "Hope as a Trap",
        content:
          "Each fresh hope pulls K. deeper into dependence on the Court. Kafka suggests false hope can bind us tighter than despair.",
      },
      {
        id: "tr-47",
        title: "The Weight of the Unknown",
        content:
          "Not knowing the accusation, the timeline, or the judges wears K. down. Uncertainty, Kafka shows, is a punishment all its own.",
      },
      {
        id: "tr-48",
        title: "A Warning Still Relevant",
        content:
          "In an age of vast bureaucracies and surveillance, The Trial reads less like fantasy and more like caution.",
      },
      {
        id: "tr-49",
        title: "Interpretations Multiply",
        content:
          "Psychological, political, religious, existential — each lens illuminates a different Trial. Its richness lies in holding them all.",
      },
      {
        id: "tr-50",
        title: "The Kafkaesque Defined",
        content:
          "The Trial is the purest distillation of the Kafkaesque: absurd, oppressive, and impersonal forces rendered with icy calm.",
      },
      {
        id: "tr-51",
        title: "Seeking Justice, Finding None",
        content:
          "K.'s tragedy is expecting fairness from a system built to deny it. The gap between his expectation and reality is where the anguish lives.",
      },
      {
        id: "tr-52",
        title: "The Silence of the Powerful",
        content:
          "The true authorities never appear. Power that hides its face can never be petitioned, argued with, or held to account.",
      },
      {
        id: "tr-53",
        title: "Meaning We Must Make",
        content:
          "Since the Court offers no meaning, any meaning must come from K. himself — a task he never manages, and one Kafka leaves to us.",
      },
      {
        id: "tr-54",
        title: "Empathy for the Accused",
        content:
          "The novel builds deep sympathy for anyone caught in a process they cannot understand or influence. It is a plea for the powerless.",
      },
      {
        id: "tr-55",
        title: "The Question of Guilt",
        content:
          "In the end, The Trial leaves one haunting question: are we all, in some quiet way, awaiting judgment for a charge we can't name?",
      },
    ],
  },

  // The Diary of a CEO — Steven Bartlett (33 Laws of Business & Life)
  "bk-014": {
    bookId: "bk-014",
    tagline: "The 33 laws of business and life — self, story, philosophy, team",
    updated: "2026-07",
    frames: [
      {
        id: "dc-1",
        title: "33 Laws, Four Pillars",
        content:
          "Bartlett distils years of building companies into 33 laws, grouped into four pillars: The Self, The Story, The Philosophy, and The Team. Master these in order and greatness becomes systematic, not accidental.",
      },
      {
        id: "dc-2",
        title: "Pillar 1 — The Self",
        content:
          "Everything starts with you, because the self is the only thing you truly control. Self-awareness, self-discipline, and the story you tell about yourself set the ceiling for everything else.",
      },
      {
        id: "dc-3",
        title: "Fill Your Five Buckets",
        content:
          "Law 1: your potential rests in five buckets — knowledge, skills, network, resources, and reputation — and they should be filled roughly in that order, because each one fills the next.",
      },
      {
        id: "dc-4",
        title: "The First Two Can't Be Stolen",
        content:
          "Knowledge and skills, the first two buckets, can never be taken from you. Even if you lose money, network, or reputation, those two let you rebuild everything.",
      },
      {
        id: "dc-5",
        title: "Don't Chase Money First",
        content:
          "People who chase resources and reputation before building knowledge and skills build on sand. Fill the foundational buckets and the rest follow more durably.",
      },
      {
        id: "dc-6",
        title: "Self-Awareness Is the Superpower",
        content:
          "You can't improve what you can't see. Honest self-awareness — about your habits, triggers, and blind spots — is the starting point of all growth.",
      },
      {
        id: "dc-7",
        title: "Discipline Is Self-Respect",
        content:
          "Self-control isn't punishment; it's a form of self-love. Doing what your future self will thank you for is how you honor your own potential.",
      },
      {
        id: "dc-8",
        title: "Your Self-Story Shapes You",
        content:
          "The narrative you repeat about yourself becomes your behaviour. Change the story from 'I'm not the kind of person who…' and you change what you do.",
      },
      {
        id: "dc-9",
        title: "Rewrite a Limiting Story",
        content:
          "Many limits are inherited beliefs, not facts. Audit the stories holding you back and deliberately author more empowering ones.",
      },
      {
        id: "dc-10",
        title: "Sweat the Small Stuff",
        content:
          "Bartlett flips the cliché: the tiny details others ignore are exactly where excellence lives. Caring about the small things compounds into a remarkable whole.",
      },
      {
        id: "dc-11",
        title: "Marginal Gains Compound",
        content:
          "Getting slightly better at many small things beats one big leap. Relentless minor improvements stack into an advantage rivals can't copy.",
      },
      {
        id: "dc-12",
        title: "Lean Into Bizarre Behaviour",
        content:
          "Law 5: when something confuses or unsettles you, lean in rather than away. The things you don't understand are usually where the biggest lessons and opportunities hide.",
      },
      {
        id: "dc-13",
        title: "Confusion Is a Signal",
        content:
          "Discomfort and confusion mark the edge of your understanding. Treat them as invitations to investigate, not reasons to retreat.",
      },
      {
        id: "dc-14",
        title: "Ask, Don't Tell",
        content:
          "Law 6, the question-behaviour effect: asking someone a question is more persuasive than telling them something. Questions engage people and prompt them to convince themselves.",
      },
      {
        id: "dc-15",
        title: "Questions Change Behaviour",
        content:
          "Asking 'will you exercise this week?' shifts behaviour more than saying 'you should.' Turn your statements into questions to influence others and yourself.",
      },
      {
        id: "dc-16",
        title: "Pillar 2 — The Story",
        content:
          "Influence flows through storytelling. To get people to trust, buy, follow, or act, you must master how to frame and tell a compelling story.",
      },
      {
        id: "dc-17",
        title: "Humans Buy Stories, Not Facts",
        content:
          "Data informs, but stories move. People make decisions emotionally and justify them with logic, so wrap your facts in a narrative that makes them feel.",
      },
      {
        id: "dc-18",
        title: "Avoid Being Wallpaper",
        content:
          "The forgettable and the safe get ignored. To be noticed you must be remarkable — literally worth remarking on — rather than blending into the background.",
      },
      {
        id: "dc-19",
        title: "The Power of Framing",
        content:
          "The same fact framed differently produces different reactions. How you present something often matters as much as the thing itself.",
      },
      {
        id: "dc-20",
        title: "Words Are Never Neutral",
        content:
          "Every word carries emotional weight and shapes perception. Choose language deliberately, because it quietly steers how people feel and decide.",
      },
      {
        id: "dc-21",
        title: "Give People a 'Because'",
        content:
          "A reason, even a simple one, dramatically increases compliance. Attaching a 'because' to your request makes people far more likely to say yes.",
      },
      {
        id: "dc-22",
        title: "Make the Abstract Tangible",
        content:
          "Big numbers and vague ideas don't land. Translate them into concrete, relatable images so people can actually grasp and feel them.",
      },
      {
        id: "dc-23",
        title: "Consistency Builds Trust",
        content:
          "A trusted brand or person is a predictable one. Showing up consistently, in message and quality, is how trust is slowly earned.",
      },
      {
        id: "dc-24",
        title: "Pillar 3 — The Philosophy",
        content:
          "Your personal philosophies are the single biggest predictor of how you'll behave in future. Adopt strong guiding principles and your decisions align themselves.",
      },
      {
        id: "dc-25",
        title: "Beliefs Drive Behaviour",
        content:
          "You don't rise to your goals; you fall to your philosophies. What you truly believe about work, failure, and effort shows up in what you do daily.",
      },
      {
        id: "dc-26",
        title: "Fall in Love With the Process",
        content:
          "Outcomes are unreliable; process is in your control. Learning to enjoy the daily grind is what sustains you long enough to win.",
      },
      {
        id: "dc-27",
        title: "Extreme Consistency Wins",
        content:
          "Most people are inconsistent, so consistency itself becomes an edge. Doing the boring fundamentals repeatedly beats sporadic brilliance.",
      },
      {
        id: "dc-28",
        title: "Kill Your Comfort",
        content:
          "Comfort is where growth goes to die. Deliberately choosing the harder, growth-producing path keeps you sharp and moving forward.",
      },
      {
        id: "dc-29",
        title: "Failure Is Feedback",
        content:
          "Treat failure as information, not identity. Each failure narrows the path to what works, provided you extract the lesson and continue.",
      },
      {
        id: "dc-30",
        title: "Reframe Stress as Challenge",
        content:
          "Stress viewed as a threat harms you; the same stress viewed as a challenge sharpens you. The story you tell about pressure changes its effect.",
      },
      {
        id: "dc-31",
        title: "Quit the Right Things",
        content:
          "Persistence matters, but so does quitting wisely. Abandoning the wrong goals frees your energy for the ones that truly deserve it.",
      },
      {
        id: "dc-32",
        title: "You Are Your Inputs",
        content:
          "The information, people, and content you consume shape your thinking. Curate your inputs the way an athlete curates their diet.",
      },
      {
        id: "dc-33",
        title: "Guard Your Standards",
        content:
          "You get the standards you're willing to walk past. Refusing to accept mediocrity — in yourself and around you — quietly sets the level of everything.",
      },
      {
        id: "dc-34",
        title: "Nurture Self-Belief",
        content:
          "Confidence is built by keeping small promises to yourself. Each commitment kept is evidence that you can trust your own word.",
      },
      {
        id: "dc-35",
        title: "Pillar 4 — The Team",
        content:
          "No one builds greatness alone. This pillar is about assembling the right people and getting the very best from them.",
      },
      {
        id: "dc-36",
        title: "Ask Who, Not How",
        content:
          "Law 28: instead of asking 'how do I do this?', ask 'who is the best person to do this?' Ego insists you do it yourself; potential insists you find the right people.",
      },
      {
        id: "dc-37",
        title: "Delegate to Grow",
        content:
          "Trying to do everything caps your growth at your own capacity. Delegating to capable people multiplies what you can achieve.",
      },
      {
        id: "dc-38",
        title: "Hire People Better Than You",
        content:
          "Great leaders surround themselves with people smarter than themselves in their domains. Insecurity hires down; confidence hires up.",
      },
      {
        id: "dc-39",
        title: "Culture Is What You Tolerate",
        content:
          "Culture isn't the values on the wall; it's the worst behaviour you allow. What you walk past, you endorse.",
      },
      {
        id: "dc-40",
        title: "Psychological Safety",
        content:
          "Teams perform best when people feel safe to speak up, admit mistakes, and challenge ideas. Fear silences the truths a leader most needs to hear.",
      },
      {
        id: "dc-41",
        title: "Leverage the Power of Progress",
        content:
          "Law 31: nothing motivates like felt progress. Break work into visible wins and celebrate them, because momentum, not pressure, sustains effort.",
      },
      {
        id: "dc-42",
        title: "Celebrate Small Wins",
        content:
          "Recognizing small steps forward releases motivation for the next. Progress you can see is the most reliable fuel for a team.",
      },
      {
        id: "dc-43",
        title: "Motivation Follows Momentum",
        content:
          "Waiting to feel motivated is backwards. Start, create a small win, and the momentum itself generates the motivation to continue.",
      },
      {
        id: "dc-44",
        title: "The Power of a Deadline",
        content:
          "Open-ended work drifts. A clear, meaningful deadline focuses energy and forces the decisions that endless time avoids.",
      },
      {
        id: "dc-45",
        title: "Turn Knowledge Into Skill",
        content:
          "Knowledge you can't apply is trivia. Skill comes from putting what you learn into deliberate, repeated practice.",
      },
      {
        id: "dc-46",
        title: "Skills Beat Credentials",
        content:
          "The market rewards what you can do, not what your certificate says. Build demonstrable skills and opportunities follow.",
      },
      {
        id: "dc-47",
        title: "Your Network Compounds",
        content:
          "Relationships built through genuine value compound over years. The network bucket fills fastest when you give before you take.",
      },
      {
        id: "dc-48",
        title: "Reputation Is Everything",
        content:
          "Reputation is the bucket that opens doors while you sleep. It's slow to build, fast to lose, and worth protecting above short-term gain.",
      },
      {
        id: "dc-49",
        title: "Feedback Over Praise",
        content:
          "Comfortable praise feels good but teaches little. Actively seeking honest, even harsh, feedback is how the ambitious improve fastest.",
      },
      {
        id: "dc-50",
        title: "Data Beats Opinion",
        content:
          "Bartlett's companies run on evidence, not ego. Test, measure, and let real results — not the loudest voice — decide the direction.",
      },
      {
        id: "dc-51",
        title: "Experiment Relentlessly",
        content:
          "Treat business and life as a series of experiments. Many small, cheap tests reveal what works far better than one big bet.",
      },
      {
        id: "dc-52",
        title: "Master One Thing",
        content:
          "Spreading thin produces mediocrity everywhere. Deep mastery in one area creates disproportionate value and reputation.",
      },
      {
        id: "dc-53",
        title: "Time Is Your Real Currency",
        content:
          "Money can be regained; time cannot. Spend your hours on what genuinely moves your buckets forward, and guard them from noise.",
      },
      {
        id: "dc-54",
        title: "Act Despite Fear",
        content:
          "Waiting to feel ready means waiting forever. The successful feel the same fear and doubt but choose to move anyway.",
      },
      {
        id: "dc-55",
        title: "Small Choices, Big Outcomes",
        content:
          "Greatness isn't one heroic act; it's thousands of small, disciplined choices repeated over years. Your future is built in the mundane moments.",
      },
      {
        id: "dc-56",
        title: "Be Honest, Especially With Yourself",
        content:
          "Self-deception is the costliest habit. Facing uncomfortable truths early prevents far larger failures later.",
      },
      {
        id: "dc-57",
        title: "Systems Over Motivation",
        content:
          "Motivation is fickle; systems are reliable. Design routines and environments that make the right behaviour the default.",
      },
      {
        id: "dc-58",
        title: "Stay a Student",
        content:
          "The moment you think you've arrived, you start falling behind. Lifelong curiosity keeps the knowledge bucket topping up.",
      },
      {
        id: "dc-59",
        title: "Give More Than You Take",
        content:
          "Generosity with value, knowledge, and help builds every bucket at once. What you give tends to return, compounded.",
      },
      {
        id: "dc-60",
        title: "Live the 33 Laws",
        content:
          "Master yourself, master your story, build a strong philosophy, and surround yourself with a great team. Practised together, these laws turn ordinary effort into extraordinary results.",
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

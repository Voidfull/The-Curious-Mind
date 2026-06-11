export interface BlogPost {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  readTime: string;
  tags: string[];
  category: 'essay' | 'article' | 'interesting-find' | 'note';
  excerpt: string;
  content: string;
  coverEmoji?: string;
}

export const posts: BlogPost[] = [
  {
    id: 'the-statistical-silence',
    title: 'The Statistical Silence',
    subtitle: 'On entropy, order, and the improbable fact of being here',
    date: '2026-06-10',
    readTime: '10 min read',
    tags: ['philosophy', 'science', 'entropy', 'meaning'],
    category: 'essay',
    coverEmoji: '🌌',
    excerpt: 'The universe has a preference. It does not prefer you. And yet — here you are.',
    content: `The universe has a preference. It does not prefer you. It does not prefer your careful arrangements, your clean desk, your tuned instrument, your ordered thoughts. Given enough time, given really any time at all, it will take everything you have built and scatter it. Not out of malice. That is the part that should unsettle you most. It is not malice. It is just math.

![Statistical Silence](/images/ima.jfif)

## The Headcount

There are more ways for a room to be messy than clean. More ways for a song to be noise than music. More ways for atoms to be dispersed than gathered. The second law of thermodynamics, that entropy always increases, is not really a law at all. It is a headcount. Disorder wins because disorder shows up in greater numbers. It is a democracy, and chaos has all the votes.

And yet. Here you are.

Here you are, a temporary knot of improbable order in the middle of a universe sprinting in the opposite direction. Every cell in your body is a small, exhausting act of defiance against entropy. Every thought you think, structured, sequential, meaningful, is the universe briefly, locally, failing to win. You are not just alive inside entropy. You are, in a very real statistical sense, fighting it.

I think about the infinite monkeys. Given enough of them, enough typewriters, enough time, one will accidentally produce Hamlet. Pure statistics. Nothing remarkable about the monkey. It knows nothing of Hamlet, cares nothing for iambic pentameter, feels nothing when Ophelia drowns. It just happened. The order emerged not from intention but from the sheer, grinding exhaustion of probability space.

But Shakespeare was not a monkey. Shakespeare sat down and chose the words. He imposed order on chaos deliberately, violently, with full knowledge of how many wrong arrangements existed and a commitment to finding the one that wasn't. That is something different. That is something the second law of thermodynamics has no category for. Entropy accounts for accident. It has no framework for will.

> Ramanujan said an equation has no meaning to him unless it expresses a thought of God. I think what he meant, what he could only have meant, is that mathematics is not discovered passively. It is wrested. You go into the dark, into the vast statistical silence where most arrangements are meaningless, and you come back holding something true. That is not luck. That is the mind refusing to accept the universe's default answer.

## The Right Note

When the guitarist finds the right note, when the specific vibration of a string moves air in a specific way that arrives at a specific ear and produces, impossibly, the feeling of grief or joy or longing, that is not an accident. It is a negotiation with probability, conducted by someone who refused to stop at noise. The universe offered ten thousand wrong notes. They played until they found the one that wasn't.

This is what entropy actually teaches, if you are willing to be taught by something that is trying to defeat you. It teaches that order is not free. It is not the natural state of things. It costs. Every clean room cost effort. Every true equation cost years. Every beautiful piece of music cost the wrong notes that came before it, and the stubbornness to keep going anyway. The universe charges a premium for anything that matters, paid in direct proportion to how improbable it is.

Most things in the universe are dispersed gas and cold rock. Roses are rare. Bach is vanishingly rare. The fact that you can hear Bach and feel something, that you contain whatever circuitry produces meaning from vibration, is so statistically absurd it barely computes. The universe did not intend for you to be here, moved, in the dark, by a dead German's idea of beauty. It intended gas and rock.

And yet here you are.

I do not find entropy depressing. I find it clarifying. If the universe's default is disorder, then every act of creation, every proof, every song, every clean sentence, is a small insurgency. Not against God. Perhaps it is God, in the only sense I can make honest use of the word: the natural force that makes dice fall, flowers bloom, and music land. Something that is not up anywhere. Something that is in the dice and the flower and the string, indifferently present in all of it, and in none of it caring whether you succeed.

It doesn't care. That is the point. The universe's indifference is not a wound. It is the condition of the game. It means whatever order you make, you made. Whatever beauty you find, you found. The entropy didn't give it to you. The probability didn't hand it over. You went into the distribution of all possible outcomes, most of them meaningless, most of them cold, and you came out with something that wasn't.

The universe is winning. It will keep winning. Eventually, across timescales that make history look like a held breath, it wins everything. Every star cooling to nothing, every structure dissolved back into the flat, featureless dark it came from. The math is settled. The verdict is in.

But between now and that final dispersion, in this narrow, improbable window where roses bloom and guitars ring and dead mathematicians still speak to the living through the language of equations, something unconquered moves through the wreckage. It builds. It names things. It sits in the dark and listens to Bach and feels, against all statistical reason, that this matters.

Entropy will have the last word. But it will not have this one.
`,
  },
];

export const categories = [
  { id: 'all', label: 'All Posts', emoji: '✨' },
  { id: 'essay', label: 'Essays', emoji: '✍️' },
  { id: 'article', label: 'Articles', emoji: '📄' },
  { id: 'interesting-find', label: 'Interesting Finds', emoji: '🔍' },
  { id: 'note', label: 'Notes', emoji: '📝' },
];

export const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).sort();

export function getPost(id: string): BlogPost | undefined {
  return posts.find(p => p.id === id);
}

export function getPostsByCategory(category: string): BlogPost[] {
  if (category === 'all') return posts;
  return posts.filter(p => p.category === category);
}

export function getPostsByTag(tag: string): BlogPost[] {
  return posts.filter(p => p.tags.includes(tag));
}

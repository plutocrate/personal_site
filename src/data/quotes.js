/* ==========================================================================
   QUOTES CMS / DATA STORE
   --------------------------------------------------------------------------
   Quote pool for the daily sidebar quote widget.
   Users can double-click anywhere on the page to cycle through quotes.
   
   To add a new quote, simply append an object to this array:
   { text: 'Your quote text here.', author: 'Author Name' }
   ========================================================================== */

export const quotes = [
  // --- Absurdism & Existentialism ---
  { text: 'One must imagine Sisyphus happy.', author: 'Albert Camus' },
  { text: 'In the midst of winter, I found there was, within me, an invincible summer.', author: 'Albert Camus' },
  { text: 'The absurd is born of the confrontation between human need and the unreasonable silence of the world.', author: 'Albert Camus' },
  { text: 'Man is condemned to be free.', author: 'Jean-Paul Sartre' },
  { text: 'Existence precedes essence.', author: 'Jean-Paul Sartre' },
  { text: 'Life can only be understood backwards; but it must be lived forwards.', author: 'Søren Kierkegaard' },
  { text: 'He who has a why to live can bear almost any how.', author: 'Friedrich Nietzsche' },
  { text: 'Without music, life would be an error.', author: 'Friedrich Nietzsche' },
  { text: 'A book must be the axe for the frozen sea within us.', author: 'Franz Kafka' },
  { text: 'Whereof one cannot speak, thereof one must be silent.', author: 'Ludwig Wittgenstein' },

  // --- Art & Aesthetics ---
  { text: 'Art does not reproduce the visible; rather, it makes visible.', author: 'Paul Klee' },
  { text: 'Color is a power which directly influences the soul.', author: 'Wassily Kandinsky' },
  { text: 'Art is a lie that makes us realize truth.', author: 'Pablo Picasso' },
  { text: 'I dream my painting and then I paint my dream.', author: 'Vincent van Gogh' },
  { text: 'All art is quite useless.', author: 'Oscar Wilde' },
  { text: 'Beauty will save the world.', author: 'Fyodor Dostoevsky' },
  { text: 'Talent hits a target no one else can hit; genius hits a target no one else can see.', author: 'Arthur Schopenhauer' },

  // --- Science & Philosophy of Science ---
  { text: 'The first principle is that you must not fool yourself, and you are the easiest person to fool.', author: 'Richard Feynman' },
  { text: 'Our knowledge can only be finite, while our ignorance must necessarily be infinite.', author: 'Karl Popper' },
  { text: 'The only principle that does not inhibit progress is: anything goes.', author: 'Paul Feyerabend' },
  { text: 'Normal science does not aim at novelties of fact or theory and, when successful, finds none.', author: 'Thomas Kuhn' },
  { text: 'The most beautiful thing we can experience is the mysterious.', author: 'Albert Einstein' },
  { text: 'Imagination is more important than knowledge.', author: 'Albert Einstein' },
  { text: 'Extraordinary claims require extraordinary evidence.', author: 'Carl Sagan' },
  { text: 'Science is built up of facts, as a house is built of stones; but an accumulation of facts is no more a science than a heap of stones is a house.', author: 'Henri Poincaré' },
  { text: 'We can only see a short distance ahead, but we can see plenty there that needs to be done.', author: 'Alan Turing' },
  { text: 'The whole problem with the world is that fools and fanatics are always so certain of themselves, and wiser people so full of doubts.', author: 'Bertrand Russell' },

  // --- Thought & Economics ---
  { text: 'Philosophers have only interpreted the world; the point is to change it.', author: 'Karl Marx' },
  { text: 'Freedom is always and exclusively freedom for the one who thinks differently.', author: 'Rosa Luxemburg' },
  { text: 'The old world is dying, and the new world struggles to be born: now is the time of monsters.', author: 'Antonio Gramsci' },
  { text: 'It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner.', author: 'Adam Smith' },
  { text: 'The curious task of economics is to demonstrate to men how little they really know about what they imagine they can design.', author: 'Friedrich Hayek' },
  { text: 'The difficulty lies not so much in developing new ideas as in escaping from old ones.', author: 'John Maynard Keynes' },
  { text: 'The man who dies thus rich dies disgraced.', author: 'Andrew Carnegie' },

  // --- Cult Classic Games & Unhinged Characters ---
  // Disco Elysium
  { text: 'Sunrise parabellum.', author: 'Disco Elysium' },
  { text: 'Subversive radio waves are turning the youth into homosexual communist art critics.', author: 'Kim Kitsuragi, Disco Elysium' },
  { text: 'In dark times, should the stars also go out?', author: 'Steban, Disco Elysium' },
  { text: 'The road to healing is slow, and you may find yourself broken many times along the way.', author: 'Ancient Reptilian Brain, Disco Elysium' },
  { text: 'True love is possible only in the next world — for new people. It is too late for us.', author: 'The Deserter, Disco Elysium' },
  { text: 'I am a sensitive man who feels things deeply, okay? Leave me alone.', author: 'Harrier Du Bois, Disco Elysium' },
  { text: 'Something beautiful is going to happen.', author: 'Disco Elysium' },
  { text: 'The city is a beast that eats men. But you, detective, are the indigestion.', author: 'Horrific Necktie, Disco Elysium' },

  // Postal 2 / Postal Dude
  { text: 'Hi there, would you like to sign my petition?', author: 'The Postal Dude, Postal 2' },
  { text: 'Now the flowers will grow.', author: 'The Postal Dude, Postal 2' },
  { text: 'I regret nothing.', author: 'The Postal Dude, Postal 2' },
  { text: 'Guns don’t kill people, I do.', author: 'The Postal Dude, Postal 2' },
  { text: 'Look, just sign the stupid petition, I got stuff to do.', author: 'The Postal Dude, Postal 2' },

  // S.T.A.L.K.E.R. / Metro
  { text: 'Good hunting, Stalker.', author: 'Bartender, S.T.A.L.K.E.R.: Shadow of Chernobyl' },
  { text: 'Cheeki breeki i v damke!', author: 'Bandit, S.T.A.L.K.E.R.' },
  { text: 'If we are to survive, we must accept that there are things beyond human understanding in the Zone.', author: 'S.T.A.L.K.E.R.' },
  { text: 'If not us, then who?', author: 'Miller, Metro 2033' },

  // Deus Ex (2000)
  { text: 'What a shame. He was a good man. What a rotten way to die.', author: 'JC Denton, Deus Ex' },
  { text: 'Bravery is not a function of firepower.', author: 'JC Denton, Deus Ex' },
  { text: 'Do you have a single fact to back that up?', author: 'JC Denton, Deus Ex' },
  { text: 'Your need for financial security makes you ambitious. But ambition is a poor excuse for indifference to others.', author: 'Deus Ex' },

  // Planescape: Torment
  { text: 'What can change the nature of a man?', author: 'Ravel Puzzlewell, Planescape: Torment' },
  { text: 'Endure. In enduring, grow strong.', author: 'Dak’kon, Planescape: Torment' },
  { text: 'Time is not your enemy. Forever is.', author: 'Planescape: Torment' },

  // Silent Hill 2
  { text: 'In my restless dreams, I see that town. Silent Hill.', author: 'Mary, Silent Hill 2' },
  { text: 'There was a hole here. It’s gone now.', author: 'Silent Hill 2' },
  { text: 'For me, it’s always like this.', author: 'Angela, Silent Hill 2' },

  // Pathologic / Ice-Pick Lodge
  { text: 'A miracle is an event that creates faith.', author: 'Pathologic' },
  { text: 'You cannot save everyone. You can barely save yourself.', author: 'Pathologic 2' },
  { text: 'Accept the inevitability of the disease, and only then may you begin to fight it.', author: 'The Bachelor, Pathologic' },

  // Hotline Miami
  { text: 'Do you like hurting other people?', author: 'Richard, Hotline Miami' },
  { text: 'Leaving this world is not as scary as it sounds.', author: 'Richard, Hotline Miami' },
  { text: 'Some things are better left undiscovered.', author: 'Hotline Miami 2' },

  // Bloodborne / Dark Souls
  { text: 'A hunter must hunt.', author: 'Eileen the Crow, Bloodborne' },
  { text: 'We are born of the blood, made men by the blood, undone by the blood.', author: 'Master Willem, Bloodborne' },
  { text: 'Don’t you dare go Hollow.', author: 'Laurentius, Dark Souls' },
  { text: 'Praise the sun!', author: 'Solaire of Astora, Dark Souls' },

  // Max Payne
  { text: 'There are no choices. Nothing but a straight line. The illusion comes afterwards.', author: 'Max Payne' },
  { text: 'The past is a gaping hole. You try to run from it, but the more you run, the deeper, more terrible it grows.', author: 'Max Payne' },
  { text: 'Life was good. The sun setting on a sweet summer day. The smell of fresh cut grass. And then the sky fell down.', author: 'Max Payne' },

  // Fallout: New Vegas
  { text: 'Truth is, the game was rigged from the start.', author: 'Benny, Fallout: New Vegas' },
  { text: 'Nobody’s dick’s that long, not even Long Dick Johnson, and he had a fucking long dick. Thus, the name.', author: 'Rose of Sharon Cassidy, Fallout: New Vegas' },
  { text: 'Finding it, though, that’s not the hard part. It’s letting go.', author: 'Father Elijah, Fallout: New Vegas' },
  { text: 'Patrolling the Mojave almost makes you wish for a nuclear winter.', author: 'NCR Trooper, Fallout: New Vegas' },

  // Grim Fandango
  { text: 'Nobody knows what’s going to happen at the end of the line, so you might as well enjoy the trip.', author: 'Manny Calavera, Grim Fandango' },
  { text: 'My scythe... I like to keep it where my heart used to be.', author: 'Manny Calavera, Grim Fandango' },

  // Metal Gear Solid
  { text: 'I’m no hero. Never was. I’m just an old killer, hired to do some wet work.', author: 'Solid Snake, MGS4' },
  { text: 'We’re not tools of the government, or anyone else. Fighting was the only thing I was good at, but at least I fought for what I believed in.', author: 'Gray Fox, Metal Gear Solid' },
  { text: 'Memes, the DNA of the soul.', author: 'Monsoon, Metal Gear Rising' },
];

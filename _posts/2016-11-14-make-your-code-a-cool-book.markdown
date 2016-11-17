---
layout: post
title:  "Make your code a cool book"
date:   2016-11-17 00:03:12 +0000
categories: clean_code code book practices
---

When you get a storytelling book to read, certain you will analyze some points of (your) interest
like the factual coerence inside the book reality, the read complexity level, in the first chapter
probably you will judge the story progression. We have some others individuals particularities "points" that
each people use to analyze a book.

We will get the first example point, the **coerence inside the book reality**. Imagine a fantastic world,
that exist elves, humans, half-elves, dwarfes, orcs, and some others races. And in same world, we have
a great wizard society, a huge clan of half-elves seeking your interests, a group of heroes with a mission, and...
A colossal spaceship shooting lasers in each object that moves in a huge area around this spaceship.
Okay, here we've completely destroy the *coerence* of the factual world reality. If the *coerence* is
not been destroyed when the spaceship is included on storyboard, you will need a really **GOOD** explanation about the spaceship.

The **complexity read level**, is about the vocabulary, languages, and some others factors about use of words inside the book.
Here we need to know, if we really need a dictionary to help us in some parts of book text, or if
the reading is a really lightweight reading. And other part, we need to know if the book has a particular language like
*Lord of the Rings* with *elvish (various types) language*, that is a **really** fully functional language.

**Story progression** is like your story evolve page per page, letter per letter. Each book has a particular progression,
but every progression needs to fit inside the theme.

A "perfect" book style doesn't exist, or exist for individual opinion. But the people are different, and the "perfect" book will be
different too, depending on people asked.
But we know, if the book haves a _good written style_, _story coerence_, and a _large knowledge content_. It's a good book, for anyone.
Even the book style is not the _(specific)_ people  prefered "story style".

And now, what if your way to code can abstract the _books styleguide_ into your essence. Yes, you can make you code **fun** to other people to read.
And this is a good idea, because if you write a tons code, you not only coding, you are making a specific type of **art**. And a real art,
needs to be appreciated.

You can put the **coerence inside the code reality**, avoiding to disperse your objects functions to deal with a confuse logic, for example, if your function
needs to reorganize a array that is the object property, don't manipule the object inside, create some elegant ways to do this, like returning the _reorganized array_ to the _caller_.
If you put some "Clean Code" violations in your code, your code don't creates **coerence** to the reader, and difficults the code maintaince.

**Complexity read level** is crucial to the code. For example, the code have a variable that receives the _array of available books_, and the name of the variable on code is **abk**. The reader needs to make a new reading inside the code only for purpose of undestand "What **abk** does here?", and this isn't a good practice.
Now imagine this same variable with the name **available_books**. Ok, looks better now, and the reader now will know what the purpose of variable, avoiding some minutes of reading the same code to understand.
Other thing that includes **complexity on reading**, is not use of the language (specific) function, like using **for** instead of **each** in _Ruby_ to iterate a array.

The **Story progression** is the way that you code deals with the challenges. You really needs two, or three functions to solve a problem? If you literally draw the problem, you can see, you
don't need. In most of cases, a real abstracted problem, is solved inside the one function.
The reuse of functions is good practice too, because, the code maintaner really know, if code is changed in one place, all the application can read and execute this function to solve a specific problem.

If you make your code **FUN** to read, you are making a next level art. :)

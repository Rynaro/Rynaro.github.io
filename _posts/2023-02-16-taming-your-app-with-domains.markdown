---
layout: post
author: Henrique A. Lavezzo
title:  "Taming your App with Domains"
resume: "Applying concepts, not influence"
date:   2023-02-16 22:15:12 -0300
comments: true
categories: tech
tags: domains code-architecture
---

This is not “yet another article about Domain Driven-Design”. The internet is well served with those articles, some of them are good and others not so much. It's your duty to consume them and absorb all the good stuff from each one. And just to conclude the logic, we got all classics from books the "Blue Book” by Eric Evans, the “Red Book” by Vaughn Vernon, and others.

Applications are always borns simple, with few complex codes but they always seem straightforward. But the business is here much earlier than the first sunlight hits the application code on the developer's screen.

And business is complex, and you can't avoid it. We can make it worse, business is always evolving and adapting. The application will carry those changes, and it's easy to start to entangle models simply because they seem to be part of a unity. Being part of a monolith doesn't mean you need to put concrete on top of your code and accept everything will break if you place boundaries.

Knowing the domains of your application is not an easy job, requires some day-to-day work with the codebase, conversation with other _code folks_, and sometimes with **business folks**. Not all domains will pop up in your mind (or screen), and there's no rush to anticipate some of them just because you "started” domain segregation earlier. Domains could be explicit like “Accounts” that usually hold the application's user data about, personal, billing, and security information. And other not so obvious like “Debt Validation” or “Umbrella Store Items” which already belong to a tangled code or another domain, but it's so big and has too many self-references that you noticed you have a domain under a domain (or a realm inside a realm like I usually like to say).

Segregating your code into domains always is a good choice, your application usually will organize itself, and suggest to the development team a critical view of the business. We do not need to follow all fancy stuff from articles and books, our application (usually a legacy code) not always will accept it entirely without fighting against us. Sometimes simple segregation is better or at least is just a good choice to open your way for implementing a better code architecture that fits with the application (or corporate) needs in the future.

**Work smart**, not following recipes.

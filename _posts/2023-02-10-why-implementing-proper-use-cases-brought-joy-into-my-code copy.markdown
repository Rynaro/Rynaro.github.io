---
layout: post
author: Henrique A. Lavezzo
title:  "Why implementing proper use cases brought joy into my code"
resume: "Why implementing proper use cases brought joy into my code"
date:   2023-02-10 22:15:12 -0300
comments: true
categories: tech
tags: ruby use-cases ddd motivation
---

Coding sometimes isn't about only inverting binary trees, implementing a super duper array reorder algorithm. We need to handle business cases, and not all cases are well-defined, a bunch of iterations are required with business experts, customers, and other coding folks. And those iterations sooner or later could create a web of written classes that needs to work together for a big purpose, but when you zoom out they seem not to make sense, and your code joy could get dusty.

With this in mind, and facing it every day, I decided to bring joy into it. Coding was always fun to me, a really creative part of my day. And to achieve it, I needed a (not really a code) pattern that will call the duty of holding the business and organizing it.

After revisiting some books like Clean Architecture by Uncle Bob, Domain Driven Design by Eric Evans, and Practical Object-Oriented Design _(because I’m rubist)_ by Sandy Metz. A sparkle of an idea happened on how I could organize it. Implement a simple use-case definition, with a small contract to follow!

Not only the code solved the problem, but some concepts applied around the Rails architecture helped to achieve the solution. But we can leave this discussion for another time.
From this idea and actions born [Fluxus](https://github.com/Rynaro/fluxus), a simple dependencyless library for containing the use-cases. Or just adding a set of logical steps that you and to predict what will happen.

Okay. But where is the joy? All steps to solve the problem, and having a brand new way to code and see a logical organization on it. There it is the joy! Building and bringing value to your own day!

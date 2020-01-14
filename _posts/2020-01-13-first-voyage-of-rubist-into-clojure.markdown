---
layout: post
author: Henrique A. Lavezzo
title:  "First voyage of Rubist into Clojure"
resume: "First voyage, and we'll keep go on"
date:   2020-01-13 22:15:12 -0300
comments: true
categories: tech
tags: clojure ruby functional motivation
---

Few days ago, I've decided to learn something new. But, not a new framework in a known language, in my safety zone. I wanted something, a new flame to expurge the ashes of daily issues that were consuming my motivation one month per time.

Then I have tried some languages, some tools, more than one time. I could list all techs that I've tried, but that not the focus of this post. And the fire was unexpected lit, after few minutes reading about Clojure. I felt the exact same feeling when I was tried Ruby by myself for the first time. That's was a clearly match!

My study flow, is always evolving, and under strict adaptation. For Clojure studies, I've read a lot about language, and functional paradigm. Write few random codes on `lein repl`, to train some basics of language. And after this read more about language.

After 3 days, I felt really confortable with language. And I would like to go deep, and try to build things on Clojure. That's right, I could write some codes from exercises list, but I always felt supressed when I face a list of exercises, and I subconsiously refuses to follow the exercises. (In fact, I had some problems in school classes with this kind of activities. Sometimes I was labelled "lazy student with good grades.")

Ok, list of exercises was out of options. On Ruby I really like to write granular code, and I have several "in company" private gems, and some public gems. And in Clojure we have clojars, the idea raises up. Let's build a clojar.

Recently I've a demand on Ruby code, to handle a realtime zipcode validation (we call CEP in Brazil), for boleto generation. (We'll stop here about the demand, thats other topic, we can talk about it in other post. Who knows? :grimacing: )

That's perfect, the idea was fresh in my brain. And the target service for consumption has a little outdated documentation. Then I will use this as point to research.

I've go into service sources, and tests, to learn and get new brand resources to insert into my clojar. I've tested all endpoints, and it's all clear, working perfectly. (At this point, I really in debt with this project. I'm perfect able to update the documentation. I've put in my TODO list)

The service return the REST pattern, an 200 code with body when data cames from API. And a 404 code when API does not returns nothing. When I receives a 200, its easy to return a map with contents to user, with `cheshire`.

_(Note: When you call `parse-string`, to convert the json into map, all keys cames as string too. If you want to get symbol-like in clojure. You need to fill a argument/parameter with `true`. I really don't like it. Does not sound idiomatic.)_

But when you get a 404 from service, `clj-http` raises a exception. The odds is always with us, we can perfectly handle this problem with `slingshot`, creating a custom catch for 404 code. I really like to throw exceptions, it's more than a error for me. We can express unexpected behaviors, and handle with a situation without a cascade of conditionals (Let the destiny defines what you do).
And I choose to throw an custom exception for user, but more idiomatic. (`:type ::nothing-returned`)

Alongside this code flow, I built the tests, for sure. And I really like the `clojure.test`, it's simple and get the job done. One of the points what I really like, is the use of `with-redefs`. I could do mock all `clj-http` client requests, and set responses without problem, and everything is core builted in language. And I write tests to cover all critical points of the simple "clojar".

It's done! Tests covering the code. And I think, it's simple to use, and the source code is simple, and easier to maintain too.

### Let's deploy on [Clojars](https://clojars.org/) !

I needed to create an account, just like rubygems. And after some few adjustments on `project.clj`, I was able to deploy the lib.

Just executing `lein deploy clojars`. It's dead simple, like the website  says. After some seconds, I get my clojar badge, and updates the README on GitHub.

After this, I built a simple Travis workflow, to test the code under `openjdk-8` and `openjdk-11` at every commit on `master`.

### Conclusion

I found in Clojure a new way to think, and build things. I fell in my Ruby codes today, a huge influence of Clojure way to handle things. And I really like it.

If you have interest to see my "lib", here's url https://github.com/Rynaro/postmon-clj

Thanks for reading! :tada:


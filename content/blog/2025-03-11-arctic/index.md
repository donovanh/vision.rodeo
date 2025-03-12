---
title: Arctic iOS conference 2025
permalink: /arctic-2025/
description: Learning about Swift, iOS, VisionOS and general Apple dev at the world's most northern Apple conference.
date: 2025-03-11
tags:
  - dev
---

It's been a while since I posted, as I've been busy with web projects such as the new [Classy.cards](https://classy.cards) project. However this week I've been lucky enough to attend [Arctic Conference](https://arcticonference.com) in Oulu, Finland. Here are some notes from the talks I've enjoyed.

## Highlights

- localizedStandardContains: Case-insensitive, diacritic-insensitive, locale-aware string matching in Swift.
- Apple's Translation Tooling: Useful for quick translations but requires verification for accuracy.
- Localized UI Considerations: Ensure proper text scaling and right-to-left (RTL) layout support (useful for accessibility too).
- App Intents & Localization: Structure user interactions for cross-platform usability with localized responses.

## Workshop: Level up your Swift and SwiftUI with Paul Hudson

[Arctic Conference Workshop: Level Up](https://arcticonference.com/workshop/levelup/)

I attended Paul Hudson's half-day workshop at the Arctic Conference, a hands-on session focused on refining existing Swift code. The format encouraged discussion and collaboration, with attendees suggesting and implementing improvements to a working project.

### String Matching with `localizedStandardContains`

One of the more useful discussions covered best practices for string matching in Swift. [`localizedStandardContains`](https://developer.apple.com/documentation/foundation/nsstring/1416328-localizedstandardcontains) was recommended for case-insensitive, diacritic-insensitive, locale-aware searches. This method is particularly helpful for handling special characters from different languages, such as the German sharp S (`ß`). However, it can sometimes behave unpredictably with emoji and other special characters, so testing is essential.

### Translation Tooling with Apple Intelligence

We also covered Apple's built-in translation tooling and how it can streamline internationalization. While useful, it’s important to be aware of its limitations and verify translations for accuracy.

### Best Practices for Clean Code

The session reinforced several best practices for writing cleaner Swift code:

- **Abstracting reusable code**: Moving repeated logic into separate methods for better modularity.
- **Consistent variable naming**: Keeping naming conventions uniform to improve readability.
- **Code organization**: Structuring projects logically for easier maintenance and collaboration.

The workshop provided was an interesting and practical opportunity to refine best practices and pick up new techniques.

## Arctic Day 1

The conference took place in the beautiful [Teatteri Rio](https://teatteri-rio.wheree.com).

## Ben Scheirman: From independent to big company iOS

Ben’s talk explored the transition from small teams to larger company environments, touching on the challenges and trade-offs at different stages of a developer’s career. It was centered around iOS but could easily apply to developers in other fields.

### Small Companies and Independent Work

Working in small teams offers speed, flexibility, and control over technology choices. However, it also means smaller projects, budgets, and overall impact.

For independent developers, the biggest challenges often go beyond coding—handling taxes, business management, and chasing down payments are part of the job. A useful rule of thumb: independent work should provide at least two of the following—great pay, great work, or great people. When setting up contracts, including a kill fee or buyout clause is a smart move.

While independence brings freedom, it also comes with limited involvement after project handoff and fewer long-term opportunities.

### Large Companies and Scaling Up

Larger companies function as a collection of interconnected teams, requiring strong alignment to stay on track. Finding the ‘north star’—a shared goal—is crucial to keeping teams moving in the same direction.

At scale, abstraction matters more than implementation. Good software design allows components to plug into existing platforms without micromanaging details.

#### Working Effectively in Teams

Great teams produce great software. Key practices for fostering a strong team environment include:

- **Empathy and relationships**: Building trust and offering growth opportunities.
- **Knowledge sharing**: Setting up office hours or calendar slots for technical questions.
- **PR reviews with empathy**: Being kind while maintaining standards, and using linting to automate minor checks.
- **Pair programming**: Encouraging learning and collaboration.
- **Collective code ownership**: Avoiding territorial behavior while ensuring accountability through a Directly Responsible Individual (DRI), such as a release captain.

#### Handling Scale and Stability

Planning for high demand is essential. A simple yet effective first step is leveraging HTTP caching.

Crashes become significant at scale — a seemingly low 0.5% crash rate translates to thousands of failures across millions of sessions. Tracking and addressing crashes proactively is key.

#### Writing Reliable Code

- **Prioritize compiler errors over test failures**: Catching issues early reduces reliance on runtime checks.
- **Use strong types**: Preventing errors at the type level reduces the need for manual vigilance.
- **Maintain test infrastructure**: Provide useful example tests, build a support library, and keep components small with minimal dependencies.
- **Debugging tools**: Implementing a debug menu to trigger tests and mock states can streamline development.

## Alaina Kafkes: Long live the code comment

Alaina Kafkes’ talk explored how to write effective code comments, addressing common pitfalls and best practices for clarity and maintainability.

### Common Issues with Code Comments

Poorly written comments can create more confusion than clarity. Some of the most common issues include:

- **Outdated**: No longer accurate as the code evolves.
- **Inaccurate**: Misleading or incorrect explanations.
- **Redundant**: Simply restating what the code already makes obvious.
- **Overlong**: Too much detail, making them difficult to read.
- **Incomplete**: Missing critical context or purpose.

### The Role of Comments in Code

Inspired by _A Philosophy of Software Design_ by John Ousterhout, the talk emphasized that:

- Code **shows how** something works.
- Comments **explain what** the code does and **why** it’s written that way.

### Types of Comments and Their Uses

1. **Interface Comments** (Most useful)

   - Placed above functions, explaining purpose and expected behavior.
   - Can be supplemented by well-named functions and clear APIs.

2. **Implementation Comments**

   - Found within functions, clarifying non-obvious logic.

3. **Cross-Component Comments**
   - Documentation such as READMEs to explain how different parts of a system interact.

## Vidit Bhargava: Action centered design

Vidit Bhargava’s talk explored how app design is evolving beyond single platforms, focusing on actions rather than standalone applications.

### The Shift to Action-Centered Design

Modern apps function across multiple contexts—phones, watches, desktops, and notifications. Instead of designing for a single platform, developers should think of apps as a way to enable actions that adapt to different environments.

### The Action-Centered Approach

1. **Action** → Identify the core task the user wants to accomplish.
2. **Information** → Determine the essential data required for that action.
3. **Interface** → Surface the information through the simplest possible interface, from widgets to full-screen apps.

### Implementation with App Intents

Apple’s App Intents framework helps structure this approach by:

- **Performing logic** to handle user actions.
- **Defining inputs** (AppEntities) that supply necessary information.
- **Providing results** through various interface outputs.

Action-centered design ensures that apps remain functional across different devices and contexts, making user interactions more seamless and efficient.

More insights can be found at [Vidit Bhargava’s blog](https://blog.viditb.com).

## Ellen Shapiro: An AI Skeptic Implements Apple Intelligence

[mastodon.social/@designatednerd](https://mastodon.social/@designatednerd)

### Issues with AI and LLMs

Large language models (LLMs) have fundamental flaws, including their inability to distinguish truth from fiction. This raises concerns about their reliability, as seen in real-world issues like an AI agent purchasing overpriced groceries due to poor judgment.

Some broader concerns with AI include:

- **Grand theft autocomplete** – Many models are trained on data with unclear or questionable sourcing.
- **High energy consumption** – AI systems require significantly more power than traditional computing.
- **Unpredictable errors** – AI outputs can be inconsistent and difficult to anticipate.
- **Susceptibility to abuse** – Bad actors can exploit AI hallucinations.
- **Erosion of critical thinking** – Overreliance on AI may reduce users' ability to think critically.

### Apple’s Approach to AI

Apple aims to address some of these concerns by focusing on on-device computation, making AI features more efficient and private. Their ML platforms offer structured ways to integrate AI while maintaining a user-first approach.

### Implementing Apple Intelligence

Ellen provided examples of how Apple Intelligence can be integrated into apps. See the GitHub repository for sample implementations: [Apple Intelligence Examples](https://github.com/designatednerd/AppleIntelligenceExamples).

#### Notes:

- **Image Playgrounds** – Only available on a real device (not in the simulator), with strict limitations and visual artifacts.
- **Genmoji** – Managed as a folder requiring special handling for inline usage.
- **Writing Tools** – Brings up a UI panel with customization options but has limitations (e.g., tables are not fully supported for copy/paste).
- **Translation API** – Useful for machine-driven translations, potentially helpful in apps like an iOS recipe app.

### Summary

- Be cautious of AI hype and its limitations.
- Apple Intelligence has restrictions that require real-device testing.
- Genmojis have tricky implementation details.
- TextKit 2 remains buggy and may not always be worth updating to.

### Chris Price: When Content is King

When building content-driven apps, structuring data efficiently is crucial:

- Choose a storage format that simplifies functionality (e.g., mapping SQLite to CoreData or using JSON for direct mapping to app structure).
- Develop tools for data entry, such as spreadsheets or helper apps, and document the process.
- Determine an update strategy—this could be time-based or aligned with Apple’s release cycle.
- Treat content with the same importance as code: version control it, ensure proper naming conventions, and implement a testing and bug-tracking system.

### Klemens Strasser: What Video Games Can Teach Us About Accessibility

Key accessibility considerations inspired by video game design:

- **Color Deficiency:** Use accessible color palettes and symbols instead of relying solely on color (see _Effortless SwiftUI Theming_).
- **Custom Fonts:** Support font adjustments, including accessible fonts like Lexend and OpenDyslexic.
- **Simplified Layouts:** Offer streamlined interfaces using Assistive Access (`isAssistiveAccessEnabled` environment variable) to adapt content presentation.
- **Sound Design:** Augment sound cues with haptic feedback (see _WWDC Explore Immersive Sound Design_ and use the _Haptrix_ tool for generating haptic feedback).
- **Spatial Accessibility:** Ensure Vision Pro experiences are accessible.
- **Onboarding:** Present accessibility options early, ideally with an overlay or an easily accessible settings button.

**Resources:**

- [Effortless Theming in SwiftUI](https://medium.com/@katramesh91/effortless-theming-in-swiftui-mastering-multiple-themes-and-best-practices-061113be6d3d)
- [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com)
- [AppleVis Forum](https://www.applevis.com) – Community for discussing accessibility
- [European Accessibility Act](https://ec.europa.eu/social/main.jsp?catId=1202)
- [Klemens Strasser’s Website](https://strasser.app)

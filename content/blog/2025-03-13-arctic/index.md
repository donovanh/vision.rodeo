---
title: ARCtic iOS conference 2025 - Day 2
permalink: /arctic-2025-day-2/
description: The second day at the world's most northern Apple conference.
date: 2025-03-13
tags:
  - conference
---

After a great [ARCtic Conference day 1](/arctic-2025/), we had a second day packed full of inspiring Apple development talks.

## Highlights

- TODO: Once the day ends!

If you missed it, you can find a write-up of the [talks from day one here](/arctic-2025/).

## Day 2 talks

As with day one, the conference took place in the beautiful [Teatteri Rio](https://teatteri-rio.wheree.com). The following is my notes from each of the talks.

## [Paul Hudson: Ignite](https://arcticonference.com/speaker/paul#talk)

At the recent [ARCtic Conference](https://arcticonference.com), Paul Hudson introduced [Ignite](https://github.com/twostraws/Ignite), a new tool that allows Swift developers to build websites using Swift. This talk explored why this approach makes sense and how Ignite simplifies web development while leveraging Swift’s strengths.

When building websites today, developers need to consider a range of factors:

- Browser compatibility
- Device compatibility
- Complex UI elements
- Accessibility

For Swift developers, juggling both Swift and HTML can be a challenge. Hudson’s argument is that using Swift to build websites could streamline this process, making web development more familiar and accessible for Swift developers.

One of the key innovations behind Ignite is its use of Swift’s **Result Builders** to define HTML structures. This approach allows developers to write HTML in a SwiftUI-like syntax. Just as swift handles views like this:

```swift
VStack {
  Text("Hello world")
}
```

This can be directly mapped to HTML elements:

```swift
h2 {
  Text("Hello world")
}
```

By adopting SwiftUI’s declarative approach, developers can define web pages with clean, readable Swift code that is then rendered appropriately for the web.

### Ignite: A Static Site Generator for Swift Developers

**Ignite** is a static site generator designed specifically for Swift developers. It allows you to write websites in Swift and publish them easily, whether to GitHub Pages or other hosting services.

- Supports all standard HTML elements.
- Uses [Bootstrap](https://getbootstrap.com) for styling and accessibility.
- Includes pre-built components like accordions and navigation elements.
- Automatically generates metadata for SEO and social sharing.
- Responsive design that works across all device sizes.
- Requires no direct HTML knowledge.
- Provides command-line tools for running and building projects.

This makes Ignite an appealing choice for developers who want a Swift-centric approach to building websites while ensuring modern compatibility and accessibility.

### Ignite in Practice

Ignite is open source and actively maintained, boasting **over 74 contributors** and **500+ unit tests**. While it is focused on static site generation, developers looking for more dynamic functionality can integrate it with **[Vapor](https://docs.vapor.codes/leaf/overview/)** or **[Hummingbird](https://wpmudev.com/project/wp-hummingbird/)**.

If you’re interested in seeing Ignite in action, check out the live examples available at [Ignite Samples](https://ignitesamples.hackingwithswift.com/).

During the talk, one interesting idea came to mind: **Could Ignite be used as a template for app developers to create marketing websites for their apps?**

A simple, ready-to-use **Ignite template** could include:

- A homepage with an introduction to the app
- Screenshots and feature highlights
- A direct link to the App Store
- A privacy policy page
- An optional developer blog for updates

Since Ignite handles the complexities of web development, Swift developers could quickly spin up an app website without needing to learn HTML, CSS, or JavaScript.

Find [Ignite on GitHub](https://github.com/twostraws/Ignite).

## [Mikaela Caron: Creating games with TabletopKit for VisionOS](https://arcticonference.com/speaker/mikaela#talk)

[TabletopKit](https://arcticonference.com/speaker/mikaela#talk) is a set of APIs designed for building tabletop games, working alongside RealityKit to render 3D elements. It provides a structured approach to game development by defining tables, seats, equipment, and interactions within a shared environment.

### Setting Up a Game

Each game is centered around a **table**, which exists within a **Volume** and conforms to the **Tabletop** protocol. The table is identified using an **Equipment** identifier. Players occupy **seats**, which have specific poses relative to the table. These seats conform to the **TableSeat** protocol, defining their state and position.

The primary steps to building an app with TabletopKit include:

- Configuring the game
- Implementing rules
- Adding effects with RealityKit
- Enabling SharePlay for multiplayer experiences

### Equipment and Game Elements

Each piece of equipment requires a **unique identifier** (e.g., table, seats, game pieces). Equipment conforms to the **Equipment** protocol and has a **BaseEquipmentState** for configuration and rules. Items are added to the tabletop using `setup.add`.

Additional considerations include:

- **EntityEquipment** represents individual entities that exist separately from the core equipment.
- **Dice** have a dedicated state called **TossableRepresentation**, which includes shape and initial state.
- **Tiles** can be defined as **Equipment**, representing board spaces where tokens or other game pieces can be placed.

### Handling Interactions

Interactions are managed through a structured update cycle:

- The **Game** object holds the overall setup.
- The **GameInteraction** class processes player interactions.
- The interaction cycle is updated and tracks active, canceled, or completed states.
- Interactions modify the game state based on predefined rules.

Gestures define possible actions, such as:

- Specifying where a die can be thrown using `onGesturePhaseStarted`.
- Restricting token movement to valid board spaces.
- Using `onGesturePhaseEnd` to trigger actions like tossing equipment.
- Defining actions via `interaction.addAction` once interactions conclude.

### Observing Actions and Game State

After setting up interactions, observers track game state changes and trigger responses, such as animations or state updates based on the type of equipment being used.

### Enabling SharePlay for Multiplayer

TabletopKit integrates with the **GroupActivities API** to support shared multiplayer sessions. This is managed through:

- Setting up a **GroupActivityManager** as an observable class.
- Using `coordinateWithSession` within each `Activity.session` to synchronize interactions across multiple players.

This ensures that game states remain in sync, allowing for a seamless shared experience.

## [Daniel Steinberg: What the heck happened to generics](https://arcticonference.com/speaker/daniel#talk)

### Understanding `some` and `any` in Swift

Swift provides `some` and `any` as ways to define opaque or existential types, but choosing the right one can impact performance and flexibility.

### Using `some` and `any`

- `some` indicates that while the exact type isn't specified, it remains consistent. This is useful in cases like `some View`, where the type is determined at compile time but remains opaque to the caller.
- `any` is used for type erasure when working with protocol types, creating a runtime-checked box around a value rather than preserving its concrete type.
- When returning a **random view**, `some View` cannot be used because the compiler cannot determine the exact type. Instead, `any View` is required, but this comes with additional runtime overhead.

### Handling Identifiability in Lists

- Lists require unique identifiers, but strings alone are not identifiable.
- One solution is to wrap a string in a struct that conforms to **Identifiable**, using a **UUID** as the identifier.

### Best Practices

Swift encourages certain best practices to optimize performance and maintainability:

- Prefer **let** over **var** to ensure immutability where possible.
- Use **structs** instead of classes for value semantics.
- Prefer `some` over `any` where possible, as `some` is resolved at compile time and avoids the performance costs of type erasure.

### Parameter Packs for Generic Views

To handle cases where a function needs to render multiple types of views generically, **parameter packs** can be used. These allow a flexible number of generic parameters without needing to specify them individually, improving type safety and reducing boilerplate. More details can be found in [this guide](https://www.avanderlee.com/swift/value-and-type-parameter-packs/).

## [Priyal Porwal: Building maintainable iOS apps with Swift Macros](https://arcticonference.com/speaker/priyal#talk)

Swift macros, introduced in Swift 5.9, are used throughout Xcode to reduce repetitive code and improve performance by generating code at compile time. One common example is the `#Preview` macro for SwiftUI views. While macros do not support parameters, they help streamline development by eliminating boilerplate code.

### Types of Macros

There are two main types of macros:

- **Freestanding macros** start with `#` and function independently within the code.
- **Attached macros** are used as attributes and begin with `@`, such as `@Observable`.

### Creating and Using Custom Macros

Developers can create custom macros in Xcode using the `swift-syntax` framework. Macros should be well-tested, ensuring that their output matches expected results, including formatting details like newlines. A basic example of a macro definition looks like this:

```swift
public macro myMacro(...)
```

Macros have specific roles that define how they transform code. More details on their implementation and best practices can be found [in this article](https://swiftylion.com/articles/swift-macros).

### Challenges and Considerations

While powerful, macros come with challenges. The syntax can be complex, and poorly optimized macros can increase build times. Proper testing is crucial, but unit tests for macros can be tricky due to strict formatting requirements. Macros offer significant benefits by simplifying code and improving maintainability.

## [Hidde van der Ploeg: Less AI, more magic](https://arcticonference.com/speaker/hidde#talk)

AI is everywhere. It's like when electricity replaced candles. Over time, appliances came about from better understanding of electricity. In a way, AI is similarly early.

Using AI can help in marketing, but we can go further and turn it into magic.

### Magic = achieving the impossible.

AI can help produce solutions that were not possible before. We don't need to call it out with sparkles icons. Such as when presenting a summary of data - the value is in the summary not in dressing it by advertising the implementation details.

### Approach: Start with the problem

As in, don't start with "how can we use AI to do _insert thing here_", instead ask "how do we do _insert thing here_" and if AI is an answer, maybe use it. In the end the customer doesn't care if the solution is created with AI as long as it works.

AI presents a new or extended pallette of tools. From image generation, text summaries, translations and more.

### Abstract away the complexity

Instead of using an open text field, offer more specific options such as `translate` or `improve`. The chat box is only the beginning.

### Naming features

In the example above, `translate` could be `AI translation` but not useful information for the user looking for a solution.

Sell the solution, not the technology.

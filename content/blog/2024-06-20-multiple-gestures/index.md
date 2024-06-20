---
title: Advanced gestures
permalink: /advanced-gestures/
description: Apply dragging, rotating and scaling to multiple objects
date: 2024-06-20
tags:
  - dev
---

After [creating multiple 3D objects in a Vision OS scene](https://vision.rodeo/multiple-objects/), I thought it would be good to go further than the simple drag gesture mentioned there.

<blockquote class="imgur-embed-pub" lang="en" data-id="a/5HG8G7i" data-context="false" ><a href="//imgur.com/a/5HG8G7i"></a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

In my research, I found an Apple article on [transforming realitykit entities with gestures](https://developer.apple.com/documentation/realitykit/transforming-realitykit-entities-with-gestures).

## Installing Components and Extensions

In [the downloaded code](https://docs-assets.developer.apple.com/published/0d923bca7c76/TransformingRealityKitEntitiesUsingGestures.zip) the `RealityKitContent` includes `Components` and `Extensions` folders with code for handling gestures. I copied these across into my project's RealityKitContent folder.

{% image "./files/copied-files.png", "Copied Components and Extensions folders" %}

These have been set up to allow for customisation in how we apply gestures. The first thing though is install the extensions:

```swift
RealityView { content in
    let floor = viewModel.generateFloor()
    content.add(floor)
    addEntities(content)
} update: { content in
    addEntities(content)
}
.installGestures()
```

The `installGestures` method sets up the extensions.

## Using with Reality Composer Pro

As the above files are added to the Reality Composer Pro scene, they become available as settings to allow interaction on objects and scenes defined there. However I'd like to try to apply the code to the objects created dynamically within my app.

## Applying to entities

In the shared view model (`SharedViewModel`), I added the `components` to handle gestures like so:

```swift
let jsonData = """
{
    "canDrag": true,
    "pivotOnDrag": true,
    "preserveOrientationOnPivotDrag": true,
    "canScale": true,
    "canRotate": true
}
""".data(using: .utf8)!

do {
    let decoder = JSONDecoder()
    let gestureComponent = try decoder.decode(GestureComponent.self, from: jsonData)
    shape.components.set(gestureComponent)
} catch {
    print("Failed to decode JSON: \(error)")
}
```

This sets up the configuration, in which you can set to `true` or `false` the various options, then encodes the config. It then uses a JSON decoder with the `GestureComponent.self` type to create a `gestureComponent`, all configured with our interaction settings. We then apply this to the `shape` with `shape.components.set(gestureComponent)`.

---
title: Dragging objects
permalink: /drag-gesture/
description: Using DragGesture to drag a 3D object
date: 2024-06-14
tags:
  - dev
---

With the 3D orb [created in this post](https://vision.rodeo/immersive-spaces/), we can enable dragging with gestures.

<blockquote class="imgur-embed-pub" lang="en" data-id="a/jBKlM3C" data-context="false" ><a href="//imgur.com/a/jBKlM3C"></a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

## Starting code

We begin with some code that sets up a `RealityView` and creates a shiny metallic orb. It sets the scale and position so that it's in front of us.

```swift
struct ImmersiveView: View {

    var body: some View {
        RealityView { content in
            orb = ModelEntity(
                 mesh: .generateSphere(radius: 0.1),
                 materials: [SimpleMaterial(color: .white, isMetallic: true)])
            // Scale and position
            orb.scale = [2, 2, 2]
            orb.position.y = 0.75
            orb.position.z = -1

            content.add(orb)
        }
    }
}
```

## Adding gesture

Interaction in visionOS is handled using [gestures](https://developer.apple.com/design/human-interface-guidelines/gestures).

We add a gesture to our `RealityView` like so, and pass in a `DragGesture`.

```swift
RealityView { content in
    //... orb code
}
.gesture(
    DragGesture()
        .targetedToEntity(orb)
        .onChanged { value in
            orb.position = value.convert(value.location3D, from: .local, to: orb.parent!)
        }
)
```

The `DragGesture` is configured using `targetedToEntity`, which specifies which entity to use, and then we listen for an `onChange` event. This event gives us the value, as a `location3D` entry. We need to convert that to work with the `Set3D` coordinates used by our orb.

With the gesture in place, it's not working quite yet. We can make the position change stick by applying some modifiers to the orb.

## Components and collisions

Inside the `RealityView` struct, add some configuration to tell the orb to receive the position change:

```swift
// Components
orb.components.set(InputTargetComponent())

// Collisions
orb.generateCollisionShapes(recursive: true)
```

The first component is [InputTargetComponent](https://developer.apple.com/documentation/realitykit/inputtargetcomponent). We set this to configure which sorts of `allowedInputTypes` it can receive. By default it is `all`, though if we want that can be configured by passing in an `allowedInputTypes` value.

We then set `generateCollisionShapes` with `recursive` set to true.

With these in place, we can drag the orb around.

## Adding shadow

For some polish, and to help see where the orb is when moving it, we can add a shadow:

```swift
orb.components.set(GroundingShadowComponent(castsShadow: true))
```

## Finished code

Putting it all together, the finished draggable result is:

```swift
struct ImmersiveView: View {

    @State private var orb = ModelEntity()

    var body: some View {
        RealityView { content in
            orb = ModelEntity(
                 mesh: .generateSphere(radius: 0.1),
                 materials: [SimpleMaterial(color: .white, isMetallic: true)])
            // Scale and position
            orb.scale = [2, 2, 2]
            orb.position.y = 0.75
            orb.position.z = -1

            // Components
            orb.components.set(InputTargetComponent(allowedInputTypes: .indirect))
            orb.components.set(GroundingShadowComponent(castsShadow: true))

            // Collisions
            orb.generateCollisionShapes(recursive: true)

            content.add(orb)
        }
        .gesture(
            DragGesture()
                .targetedToEntity(orb)
                .onChanged { value in
                    orb.position = value.convert(value.location3D, from: .local, to: orb.parent!)
                }
        )
    }
}
```

---
title: Detecting collisions in visionOS
permalink: /detecting-collisions/
description: Load a material for use in coded RealityKit scenes
date: 2024-06-30
tags:
  - dev
---

Looking at ways to extend [the Jenga game we built earlier](/jenga-in-vision-os/), we need to know when the pieces collide with the table. We can use that to then play sounds or even add game logic. First though we need to detect collisions.

I found [this guide to detecting collisions on Lickability](https://lickability.com/blog/detecting-collisions-with-realitykit-in-visionos/), which explains nicely how to detect collisions between our game pieces and the table or floor.

We can extend the Jenga example to add collision detection events.

## Adding collision events

There are two parts to adding collision detection events. First we need to set up a variable to store event subscriptions. In `ImmersiveView`, add a private `@State` variable:

```swift
@State private var subscription: EventSubscription?
```

Then in the `RealityKit` view we can subscribe to an event which will trigger any time something collides with the floor:

```swift
subscription = content.subscribe(to: CollisionEvents.Began.self, on: floor) { collisionEvent in
    print("💥 Collision between \(collisionEvent.entityA.name) and \(collisionEvent.entityB.name)")
}
```

Running this, any time a piece falls off the table onto the floor we should see a print statement.

### Colliding with table

I wasn't able to work out how to enable this for the table we build in Reality Composer Pro. Instead, I created a method similar to `generateFloor`.

Since we added methods to [load materials from a Reality Kit Content scene](/loading-material-from-scene/), we can make use of these to load the table material and apply it to an entity created in code. Add the following to the `SharedViewModel`:

```swift
func generateTable() -> ModelEntity {
    let material: RealityKit.Material = loadMaterial(from: "Scene", named: "table") ?? UnlitMaterial()
    let tableShape: MeshResource = .generateBox(width: 1.5, height: 0.1, depth: 1.5, cornerRadius: 0.1)
    let table = ModelEntity(
        mesh: tableShape,
        materials: [material]
    )
    table.generateCollisionShapes(recursive: false)
    table.components[PhysicsBodyComponent.self] = .init(
        massProperties: .default,
        mode: .static
    )
    return table
}
```

I made the table using a box primative, and added a `cornerRadius` to make it smoother. It's set to generate collision shapes, and physics and behave similarly to the floor.

Back in `ImmersiveView` we can use this to generate and display a table:

```swift
let table = viewModel.generateTable()
table.name = "table"
table.position.x = viewModel.startingPositionX + viewModel.pieceWidth
table.position.y = viewModel.startingPositionY
table.position.z = viewModel.startingPositionZ - viewModel.pieceWidth
```

We then can add code to subscribe to the `table` collisions:

```swift
subscription = content.subscribe(to: CollisionEvents.Began.self, on: table) { collisionEvent in
    print("💥 Collision between \(collisionEvent.entityA.name) and \(collisionEvent.entityB.name)")
}
```

We should now have a table generated in code that prints when collisions are detected:

{% image "./files/generated-table.png", "A table generated in code with a material loaded from Reality Composr Pro" %}

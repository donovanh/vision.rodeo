---
title: Adding gravity
permalink: /object-gravity/
description: Add gravity to a 3D object
date: 2024-06-15
tags:
  - dev
---

Following on from [adding a drag gesture](/drag-gesture/), we can make it respond to gravity using a [PhysicsBodyComponent](https://developer.apple.com/documentation/realitykit/physicsbodycomponent).

<blockquote class="imgur-embed-pub" lang="en" data-id="a/pfxjclk" data-context="false" ><a href="//imgur.com/a/pfxjclk"></a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

Starting with a simple reflective cube this time, adjusting from the sphere in [the drag example](/drag-gesture/). I've also adjusted the scale and position to make it easier to see. In the video above, it's being shown in the "museum" environment as it has a good amount of floor space. This demo won't account for furniture.

```swift
RealityView { content in
    // Cube entity
    cube = ModelEntity(
        mesh: .generateBox(size: 0.1),
            materials: [SimpleMaterial(color: .white, isMetallic: true)])
    // Scale and position
    cube.scale = [3, 3, 3]
    cube.position.y = 1
    cube.position.z = -4

    // Components
    cube.components.set(GroundingShadowComponent(castsShadow: true))
    cube.components.set(InputTargetComponent())

    // Collisions
    cube.generateCollisionShapes(recursive: true)


    content.add(cube)
}
.gesture(
DragGesture()
    .targetedToEntity(cube)
    .onChanged { value in
        cube.position = value.convert(value.location3D, from: .local, to: orb.parent!)
    }
)
```

## Adding physics

The cube can be dragged around and will stay position when released. We can add some gravity physics to make it fall:

```swift
let physicsMaterial = PhysicsMaterialResource.generate(
    staticFriction: 0.8,
    dynamicFriction: 0.5,
    restitution: 0.01 // How bouncy
)
cube.components[PhysicsBodyComponent.self] = .init(
    massProperties: .default,
    material: physicsMaterial,
    mode: .dynamic
)
```

In this we're creating a `PhysicsMaterialResource` which allows us to specify friction and `restition` (bounciness). A low value here means it'll behave like a solid heavy block of metal. A higher value and it'll bounce around more.

We apply this `PhysicsMaterialResource` as a material within the `PhysicsBodyComponent` component, and set `mode` to `dynamic` so that it will move.

## Creating a floor

Without a floor, the cube just falls away. We can add a floor entity:

```swift
let floor = ModelEntity(
    mesh: .generatePlane(width: 50, depth: 50),
    materials: [OcclusionMaterial()]
)
floor.generateCollisionShapes(recursive: false)
floor.components[PhysicsBodyComponent.self] = .init(
    massProperties: .default,
    mode: .static
)
content.add(floor)
```

Here we generate a `ModelEntity` made of a `plane` and using an [OcclusionMaterial](https://developer.apple.com/documentation/realitykit/occlusionmaterial). This is an invisible material which hides any objects rendered behind it.

With the physics enabled, the objects will fall and land on a "floor".

## Finished code

```swift
RealityView { content in
    // Floor
    let floor = ModelEntity(
        mesh: .generatePlane(width: 50, depth: 50),
        materials: [OcclusionMaterial()]
    )
    floor.generateCollisionShapes(recursive: false)
    floor.components[PhysicsBodyComponent.self] = .init(
        massProperties: .default,
        mode: .static
    )
    content.add(floor)

    // Cube
    cube = ModelEntity(
        mesh: .generateBox(size: 0.1),
            materials: [SimpleMaterial(color: .white, isMetallic: true)])
    // Scale and position
    cube.scale = [3, 3, 3]
    cube.position.y = 1
    cube.position.z = -4

    // Components
    cube.components.set(GroundingShadowComponent(castsShadow: true))
    cube.components.set(InputTargetComponent())

    // Collisions
    cube.generateCollisionShapes(recursive: true)

    // Physics
    let physicsMaterial = PhysicsMaterialResource.generate(
        staticFriction: 0.8,
        dynamicFriction: 0.5,
        restitution: 0.01 // How bouncy
    )
    cube.components[PhysicsBodyComponent.self] = .init(
        massProperties: .default,
        material: physicsMaterial,
        mode: .dynamic
    )

    content.add(cube)
}
.gesture(
DragGesture()
    .targetedToEntity(cube)
    .onChanged { value in
        cube.position = value.convert(value.location3D, from: .local, to: orb.parent!)
    }
)
```

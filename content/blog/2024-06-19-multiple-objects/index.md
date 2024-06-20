---
title: Multiple objects
permalink: /multiple-objects/
description: Generate lots of 3D objects
date: 2024-06-19
tags:
  - dev
---

Following on from [adding gravity to a 3D object](/object-gravity/), we will now explore how to set up and display any number of 3D objects.

<blockquote class="imgur-embed-pub" lang="en" data-id="a/dIaFeEq" data-context="false" ><a href="//imgur.com/a/dIaFeEq">Random shapes</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

## Creating a shared view model

In this demo I wanted to create a window containing a button that when pressed, would add a random object to the immersive space.

To achieve this I need a _shared_ state between the `WindowGroup` and `ImmersiveSpace` views. One way to do this is to set up a view model and pass it into both views.

To ensure the views respond to changes in the model, I'm setting it up as an `ObservableObject`:

```swift
import Foundation
import RealityKit
import SwiftUI

final class SharedViewModel: ObservableObject {
    @Published var objects: [ModelEntity] = []

    // Code to generate objects
}
```

Firstly I set up some data for use inside this class, such as an index for naming the objects, shape styles and colors:

```swift
private var index = 0

let shapes: [MeshResource] = [
    .generateBox(size: 0.1, cornerRadius: 0.1),
    .generateCone(height: 0.2, radius: 0.1),
    .generateCylinder(height: 0.2, radius: 0.1),
    .generateSphere(radius: 0.1)
]

let colors: [SimpleMaterial.Color] = [.white, .red, .green, .blue, .orange]
```

Then I add a method that I can call from the `WindowGroup` to add a shape:

```swift
func addShape() {
    objects.append(generateShape())
}
```

I now need to create the `generateShape` method:

```swift
func generateShape() -> ModelEntity {
    let mesh = shapes.randomElement() ?? .generateBox(size: 0.1, cornerRadius: 0.5)

    let shape = ModelEntity(
        mesh: mesh,
        materials: [SimpleMaterial(color: colors.randomElement() ?? .white, isMetallic: Bool.random())])
    shape.name = "Shape_\(index)"
    index += 1
    // Scale and position
    shape.scale =  SIMD3<Float>(
        Float.random(in: 1...3),
        Float.random(in: 1...3),
        Float.random(in: 1...3)
    )

    shape.position.x = Float.random(in: -0.5...0.5)
    shape.position.y = Float.random(in: 1...2)
    shape.position.z = 0 - Float.random(in: 2...4)

    // Components
    shape.components.set(GroundingShadowComponent(castsShadow: true))
    shape.components.set(InputTargetComponent())

    // Collisions
    shape.generateCollisionShapes(recursive: false)

    // Physics
    let physicsMaterial = PhysicsMaterialResource.generate(
        staticFriction: 0.6,
        dynamicFriction: 0.5,
        restitution: Float.random(in: 0...1) // How bouncy
    )
    shape.components[PhysicsBodyComponent.self] = .init(
        massProperties: .default,
        material: physicsMaterial,
        mode: .dynamic
    )

    return shape
}
```

This makes use of the shapes and colors arrays, along with a few random float values to create some random primative shapes and position them in the scene.

Lastly, I'll add a method for generating the floor so the objects have something to land on:

```swift

func generateFloor() -> ModelEntity {
    let floor = ModelEntity(
        mesh: .generatePlane(width: 50, depth: 50),
        materials: [OcclusionMaterial()]
    )
    floor.generateCollisionShapes(recursive: false)
    floor.components[PhysicsBodyComponent.self] = .init(
        massProperties: .default,
        mode: .static
    )
    return floor
}
```

The bulk of the code is now in place for the demo. Next we just need to use it.

## Applying the shared view model

We can apply the model by creating a `@StateObject` instance in the parent view and sharing it with child views.

```swift
import SwiftUI

@main
struct DemoApp: App {
    @State private var currentStyle: ImmersionStyle = .mixed
    @StateObject var viewModel = SharedViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView(viewModel: viewModel)
        }
        .defaultSize(width: 300, height: 100)

        ImmersiveSpace(id: "ImmersiveSpace") {
            ImmersiveView(viewModel: viewModel)
        }.immersionStyle(selection: $currentStyle, in: .mixed)
    }
}
```

In this case I'm creating an instance of `viewModel` and passing it to `ContentView` and `ImmersiveView`. By doing this, they will be able to make use of it and be in sync.

## Content view

In the content view, we set up an `@ObservedObject` instance of the `viewModel`. We then set up a `Button` that makes use of the `addShape` method from the view model.

```swift
struct ContentView: View {
    @ObservedObject var viewModel: SharedViewModel

    @Environment(\.openImmersiveSpace) var openImmersiveSpace

    var body: some View {
        VStack {
            Button("Add shape") {
                viewModel.addShape()
            }
            .font(.title)
            .padding(.top, 50)
        }
        .padding()
        .task {
            await openImmersiveSpace(id: "ImmersiveSpace")
        }
    }
}
```

This view also includes a `task` that opens the immersive space on load. No need to press a button!

## Immersive view

Lastly we need to show the shapes in the `ImmersiveView`:

```swift
struct ImmersiveView: View {
    @ObservedObject var viewModel: SharedViewModel

    var body: some View {
        RealityView { content in
            let floor = viewModel.generateFloor()
            content.add(floor)
            addEntities(content)
        } update: { content in
            addEntities(content)
        }
    }

    private func addEntities(_ content: RealityViewContent) {
        for object in viewModel.objects {
            content.add(object)
        }
    }
}
```

This view starts by also setting up an `@ObservedObject` `viewModel`, so we can display the `viewModel.objects` array. The `addEntities` method adds them to the scene, and the `update` method is called whenever the viewModel changes, adding any newly created shapes to the `content` of the scene.

### Adding a drag gesture

You can set the shapes to respond to gestures as before, but instead of having the gesture targeted to one specific entity, apply `targetedToAnyEntity`:

```swift
RealityView { content in
    let floor = viewModel.generateFloor()
    content.add(floor)
    addEntities(content)
} update: { content in
    addEntities(content)
}
.gesture(
    DragGesture()
    .targetedToAnyEntity()
    .onChanged { value in
        value.entity.position = value.convert(value.location3D, from: .local, to: value.entity.parent!)
    }
)
```

This will give the `value` that itself contains the entity being selected. From there we can then apply the position.

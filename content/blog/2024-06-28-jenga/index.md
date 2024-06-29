---
title: Build a Jenga game in Vision OS
permalink: /jenga-in-vision-os/
description: Create a simple Jenga-style game in Vision OS
date: 2024-06-28
tags:
  - dev
  - demo project
---

Building on the previous posts, we can put everything together into one demo.

<blockquote class="imgur-embed-pub" lang="en" data-id="a/hmhTAbp" data-context="false">
  <a href="//imgur.com/a/hmhTAbp"></a>
</blockquote>
<script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

This is the goal. To build an interactive Jenga-like brick tower game where the bricks can be removed (and stacked on top) until the tower falls over.

## Finished project

You can [download the finished code here](https://files.vision.rodeo/xcode/jenga.zip) as an Xcode project.

## Topics covered

This work brings together all the previous topics we've covered including:

- [Setting up an immersive space](/immersive-spaces/)
- [Adding physics to an entity](/object-gravity/)
- [Creating multiple 3D objects in code](/multiple-objects/)
- [Adding gestures to an entity](/advanced-gestures/)
- [Hover effects on entities](/hover-effect/)

## Getting started

Begin with a new Vision Pro app in Xcode. You don't need to change any defaults - we will set up the immersive space in code.

## Creating a table-top in Reality Composer Pro

Before creating the game in code, we can try making and importing a scene from Reality Composer Pro. For this we'll create a simple "table" object to act as a stage on which the blocks can sit.

First, in your Xcode project, select `Packages` -> `RealityKitContent` -> `Package`, then on the top right select `Open in Reality Composer Pro`.

For this project we need a large flat surface. Here's how it will look:

{% image "./files/reality-composer.png", "Reality Composer showing a 'table' object" %}

To add the floor, select the `+` on the bottom left of the scene contents list, then select `Primative Shape` -> `Cube`. This adds a plain cube. On the top right, we can scale this to the shape needed by setting a scale of `1.5`, `0.02` and `1.5` for `x`, `y` and `z`. I then adjusted it down a little by setting the `Position` value of `y` to `-8`.

We need a material also. To add a material I select the `Show content library` on the top right (`+`). I chose a grey felt material and dragged it into the scene. Then in the cube object, under `Material Bindings`, select this material.

I then set up `connectors`.

### Connectors in Reality Composer Pro

We configure the way the 3D object behaves by using connectors. On the right-hand panel select `Add Component` and add the following:

- Physics Body
- Collision

Within Physics body make sure `Mode` is set to `Static`. This means it won't fall with gravity.

Under Collision I just left everything default.

Lastly on the top left change the `Cube` name to `table`. We can now switch back to Xcode and use this object.

## Window and Immersive views

We set up the two views as before, `WindowGroup` and `ImmersiveSpace`:

```swift
struct JengaApp: App {
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

This code also instantiates `SharedViewModel` and passes is into the two views. This will allow us to coordinate resetting the game and handle the game state. We create this later.

We need to set up a `Task` in our `ContentView` that loads the `ImmersiveSpace` when the app opens:

```swift
struct ContentView: View {
    @ObservedObject var viewModel: SharedViewModel

    @Environment(\.openImmersiveSpace) var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) var dismissImmersiveSpace

    var body: some View {
        VStack {
            Text("Jenga")
                .font(.extraLargeTitle)
            Button("Reset game") {
                // Code here to reset the game
            }
        }
        .padding()
        .task {
            await openImmersiveSpace(id: "ImmersiveSpace")
        }
    }
}
```

This sets the windowed view with a title and button to reset the game.

## Adding Gestures

We can get some useful code for handling drag and rotate gestures when [adding gestures to an entity](/advanced-gestures/). Copy the files across from the `Packages -> RealityKitContent -> Sources -> RealityKitContent` "Components" and "Extensions" folders.

We then set up the immersive view that will be shown.

```swift
struct ImmersiveView: View {
    @ObservedObject var viewModel: SharedViewModel

    var body: some View {
        RealityView { content in
            // Code here to load the scene and game pieces
        }
        .installGestures()
    }

    private func loadScene() -> Entity? {
      try? Entity.load(named: "Scene", in: realityKitContentBundle)
    }
}
```

This sets up the view and calls `installGestures` to make the gestures available.

## Shared view model

We create a shared model as an `ObservableObject` in `SharedViewModel.swift`:

```swift
import Foundation
import RealityKit
import RealityKitContent
import SwiftUI

final class SharedViewModel: ObservableObject {
  // Starting positions for the table and game pieces
  let startingPositionX: Float = -0.5
  let startingPositionY: Float = 0.75
  let startingPositionZ: Float = -1.75
}
```

We set it up with some initial data which we can use to ensure a consistent position for our game table and when placing the brick pieces.

## Adding floor and table

We can add some code to our model to handle generating a floor:

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

Then in `ImmersiveView`, we use this as well as loading the `table`:

```swift
RealityView { content in
    let floor = viewModel.generateFloor()
    content.add(floor)

    if let table = loadScene() {
        table.position.x = viewModel.startingPositionX + viewModel.pieceWidth
        table.position.y = viewModel.startingPositionY
        table.position.z = viewModel.startingPositionZ - viewModel.pieceWidth

        content.add(table)
    }
}
```

At this point we should have an empty table and a window. Next we add the brick pieces.

## Generating bricks

In the `SharedViewModel` we can set up the logic to generate these brick pieces:

```swift
final class SharedViewModel: ObservableObject {
  // ... other code
  let numberOfRows = 16
  let pieceWidth: Float = 0.075
  let pieceHeight: Float = 0.045
  let pieceDepth: Float = 0.225

  // ... more code to come here
}
```

First we set some more values to describe the width, height and depth / length of the pieces. These look ok for my demo and are based on the real proportions.

We then add a method to generate a model for each brick:

```swift
func generatePiece() -> ModelEntity {

  // Simple material
  var defaultMaterial = PhysicallyBasedMaterial()
  defaultMaterial.baseColor.tint = .orange
  defaultMaterial.roughness = PhysicallyBasedMaterial.Roughness(floatLiteral: 1)

  let piece = ModelEntity(
      mesh: .generateBox(width: pieceWidth, height: pieceHeight, depth: pieceDepth, cornerRadius: 0.005),
      materials: [defaultMaterial]
  )

  // Shadow
  piece.components.set(GroundingShadowComponent(castsShadow: true))

  // Input
  piece.components.set(InputTargetComponent())

  // Hover effect
  piece.components.set(HoverEffectComponent())

  // Configure and apply gestures component
  let jsonData = """
  {
      "canDrag": true,
      "pivotOnDrag": true,
      "preserveOrientationOnPivotDrag": true,
      "canScale": false,
      "canRotate": true
  }
  """.data(using: .utf8)!

  do {
      let decoder = JSONDecoder()
      let gestureComponent = try decoder.decode(GestureComponent.self, from: jsonData)
      piece.components.set(gestureComponent)
  } catch {
      print("Failed to decode JSON: \(error)")
  }

  // Collisions
  piece.generateCollisionShapes(recursive: false)

  // Physics
  let physicsMaterial = PhysicsMaterialResource.generate(
      staticFriction: 0.35,
      dynamicFriction: 0.25,
      restitution: 0.5
  )
  piece.components[PhysicsBodyComponent.self] = .init(
      massProperties: .init(shape: .generateBox(width: pieceWidth, height: pieceHeight, depth: pieceDepth), mass: 1),
      material: physicsMaterial,
      mode: .dynamic
  )
  return piece
}
```

This method sets up a `piece` and adds all the needed components to let them be dragged, fall with gravity and more.

## Generating the tower

We need to create a tower from a set of pieces. To do this let's set up a method:

```swift
final class SharedViewModel: ObservableObject {
  // ... other code
  var tower = Entity()

  func generateTower() {
      let numberOfPieces = numberOfRows * 3
      tower.position.x = startingPositionX
      tower.position.y = startingPositionY
      tower.position.z = startingPositionZ

      for i in 0..<numberOfPieces {
          let piece = generatePiece()
          piece.name = "piece-\(i + 1)"

          // Position the piece in place
          positionPiece(index: i, piece: piece)
          tower.addChild(piece)
      }
      tower.transform.rotation = simd_quatf(angle: .pi / 4, axis: SIMD3<Float>(0, 1, 0)) // Rotate 45 degrees around the y-axis
  }
}
```

We add a `tower` of type `Entity`. This is defined in the class so it can later be used to reset the pieces.

The first method to use it is `generateTower`, which positions the entity based on the starting positions, then loops through the required number of pieces and adds them to the entity. We need to create the method that positions the piece.

```swift
func positionPiece(index: Int, piece: ModelEntity) {
    let rowIndex = index / 3
    let pieceIndexInGroup = index % 3

    if rowIndex % 2 == 0 {
        piece.position.x = Float(pieceIndexInGroup) * pieceWidth
        piece.position.z = 0
    } else {
        // Odd row: align along z-axis
        piece.position.x = pieceWidth
        piece.position.z = (Float(pieceIndexInGroup) * pieceWidth) - pieceWidth
        piece.orientation = simd_quatf(angle: .pi / 2, axis: SIMD3<Float>(0, 1, 0)) // Rotate 90 degrees around the y-axis
    }

    piece.position.y = (Float(rowIndex) * pieceHeight) - pieceHeight
}
```

This method makes use of the index of the given `piece`. It works out which row the piece is in and its position in the row. It then turns the piece 90 degrees for every odd-numbered row so that they alternate. These positions are relatvie to the containing `tower` entity.

Lastly we build the tower when the shared view model initialises.

```swift
init() {
    generateTower()
}
```

## Placing the tower

With the tower full of pieces we need to place it on the table. Back in `ImmersiveView`, add the tower to the content:

```swift
RealityView { content in
    // ... other code
    // Add pieces
    content.add(viewModel.tower)
}
```

## Rest game button

We should now have a workable Jenga tower. The next step is to have some way to reset it. Add a `reset` method to the `SharedViewModel`:

```swift
func reset() {
    var i = 0
    for child in tower.children {
        if let modelEntity = child as? ModelEntity {
            child.orientation = simd_quatf()
            positionPiece(index: i, piece: modelEntity)
            i += 1
        }
    }
}
```

This method resets the orientation of the pieces (try it without it - creates a fun explosion) then runs the `positionPiece` method on each piece to put it back into the starting position.

## Bonus: Going further

If you want to go further check out these posts:

- [Loading material from Reality Composer Pro scene](/loading-material-from-scene/)
- [Detecting collisions in Vision OS](/detecting-collisions/)

## Congrats!

This was a big one. In this post we've put together several concepts, including creating an immersive view, adding gestures, physics, collisions, and used a shared view model to control the state of a game.

If you found this post useful, don't forget to subscribe below! I'll email occasionally when I've something new to share.

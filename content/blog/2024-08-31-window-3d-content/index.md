---
title: Bringing 3D to window content
permalink: /window-3d-content/
description: Adding depth to 2D windows
date: 2024-08-31
tags:
  - dev
---

We can add depth to windowed content in visionOS with 3D objects and 3D padding.

In the post we will look at ways to use use `RealityView` to generate some 3D artwork, and position it alongside some buttons and inputs, using 3D positioning.

## 3D theme selector

When working on [BlockStack](/blockstack-testflight/) I wanted to make a theme-selector screen that showed how the textures would look in 3D. The resulting screen looks like this:

<blockquote class="imgur-embed-pub" lang="en" data-id="a/6V45WJT"  ><a href="//imgur.com/a/6V45WJT">BlockStack Theme Selector</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

The view includes a pair of 3D objects generated in code to which I've applied textures. Then it uses a `Picker` UI element to change the selected texture. Let's build something similar.

## Example

Let's build a simplified version of the above to see how 3D positioning works:

<blockquote class="imgur-embed-pub" lang="en" data-id="a/lfYc0WM"  ><a href="//imgur.com/a/lfYc0WM">A 3D window content view</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

### Adding a 3D object

To start we can set up some initial code that generates and displays different shapes based on a given `selectedShape`:

```swift
struct ContentView: View {
    @State private var selectedShape = "cube"

    var body: some View {
        VStack {
            if selectedShape == "sphere" {
                RealityView { content in
                    content.add(generateEntity("sphere"))
                }
            } else if selectedShape == "cone" {
                RealityView { content in
                    content.add(generateEntity("cone"))
                }
            } else {
                RealityView { content in
                    content.add(generateEntity())
                }
            }
        }
        .padding()
    }

    func generateEntity(_ shape: String = "cube") -> ModelEntity {
        var modelEntity = ModelEntity(mesh: .generateBox(size: 0.1))
        if shape == "sphere" {
            modelEntity = ModelEntity(mesh: .generateSphere(radius: 0.1))
        }
        if shape == "cone" {
            modelEntity = ModelEntity(mesh: .generateCone(height: 0.1, radius: 0.1))
        }
        modelEntity.model?.materials = [SimpleMaterial(color: .red, isMetallic: true)]
        return modelEntity
    }

}
```

We can generate a shape and show it in the content view. Let's add some UI. Adjust the above by adding a "Done" button and a `Picker` to select different shapes:

```swift
var body: some View {
        VStack {
            Button("Done") {
                // Perform relevant action for "Done"
            }
            .tint(.blue)

            if selectedShape == "sphere" {
                // ... existing code
            }

            Picker("Piece texture", selection: $selectedShape) {
                ForEach(["cube", "sphere", "cone"], id: \.self) { shape in
                    Text(shape.uppercased()).tag(shape)
                }
            }
        }
    }
```

This adds some 2D content to our view, but the 3D shape is in the way!

{% image "./files/blocking.png", "The UI is blocked by the 3D shape" %}

We could tweak the size of the 3D object to not block the button and Picker, but then when the picker opens it'll still be behind the object. Let's instead bring those 2D elements forward to make them easier to see and interact with.

### Adding UI depth

We can use [padding3D](https://developer.apple.com/documentation/swiftui/view/padding3d) to bring the UI forward:

```swift
Picker("Piece texture", selection: $selectedShape) {
    ForEach(["cube", "sphere", "cone"], id: \.self) { shape in
        Text(shape.uppercased()).tag(shape)
    }
}
.padding3D(.back, 400)
```

Adding `padding3D` with a `back` value of `400` will bring it forward. Apply this to both the picker and the "Done" button makes them easier to see:

{% image "./files/in-front.png", "UI positioned in front" %}

### Finished code

Here's what we have for the complete demo:

_ContentView_

```swift
struct ContentView: View {
    @State private var selectedShape = "cube"

    var body: some View {
        VStack {
            Button("Done") {
                // Perform relevant action for "Done"
            }
            .tint(.blue)
            .padding3D(.back, 400)

            if selectedShape == "sphere" {
                RealityView { content in
                    content.add(generateEntity("sphere"))
                }
            } else if selectedShape == "cone" {
                RealityView { content in
                    content.add(generateEntity("cone"))
                }
            } else {
                RealityView { content in
                    content.add(generateEntity())
                }
            }

            Picker("Piece texture", selection: $selectedShape) {
                ForEach(["cube", "sphere", "cone"], id: \.self) { shape in
                    Text(shape.uppercased()).tag(shape)
                }
            }
            .padding3D(.back, 400)
        }
        .padding()
    }

    func generateEntity(_ shape: String = "cube") -> ModelEntity {
        var modelEntity = ModelEntity(mesh: .generateBox(size: 0.1))
        if shape == "sphere" {
            modelEntity = ModelEntity(mesh: .generateSphere(radius: 0.1))
        }
        if shape == "cone" {
            modelEntity = ModelEntity(mesh: .generateCone(height: 0.1, radius: 0.1))
        }
        modelEntity.model?.materials = [SimpleMaterial(color: .red, isMetallic: true)]
        return modelEntity
    }

}
```

_App View_

```swift
struct ExampleApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .defaultSize(width: 420, height: 300)
    }
}
```

---
title: Immersive spaces
permalink: /immersive-spaces/
description: What an immersive space is, and when you might want to use it
date: 2024-06-13
tags:
  - dev
---

This post will cover what an [immersive space](https://developer.apple.com/documentation/swiftui/immersivespace) is, when you might want to use it, and how to set it up in Xcode.

## Immersive space

Unlike a [windowed window](/blender-file-in-vision/), or a [volumetric window](http://localhost:8080/volumetric-window-group/), an _immersive space_ is an unbounded space within which you can display content. You can use it when you want to remove all other distractions, and place your app either in a mixed environment, in which the user's view is still visible, or a fully immersive environment in which your app takes over the entire view.

This can be useful if you want to create an app that exists within the environment but not be bounded by the boxes of windows or volumes.

### When it's useful

An immersive space will remove all other apps when opened. It can be useful for creating focused apps or apps that may involve multiple personas.

If you want to create window-style apps with related windows that may be 3D, then a volumetric window can be a better fit as the positioning is then handled automatically.

An immersive space is best when you want to have control over positioning in relation to the user.

## Demo

Here's the simple demo top show how an immersive view can be triggered.

### Before

{% image "./files/before.png", "Simulator showing a window with toggle button" %}

### After

{% image "./files/after.png", "Toggle button pressed, orb showing" %}

## App view

Beginning with your app's App view, add an `ImmersiveSpace` as follows:

```swift
@State private var currentStyle: ImmersionStyle = .mixed

var body: some Scene {
    WindowGroup {
        ContentView()
    }

    ImmersiveSpace(id: "ImmersiveSpace") {
        ImmersiveView()
    }.immersionStyle(selection: $currentStyle, in: .mixed)
}
```

Note that `currentStyle` is also specified here, so the user can choose to enter a full or mixed immersive space as needed. Within the `ImmersiveSpace`, `ImmersiveView()` is shown.

## ImmersiveView

The ImmersiveView is a simple `RealityView` that displays a sphere model. Since objects in an immersive space are not set within bounds like windows, positioning takes place from ground level where the user's feet are. In this case I'm setting `y` to `0.5`, which lifts the sphere 0.5m from the ground and setting `z` to `-1` to bring the away from the user.

```swift
import SwiftUI
import RealityKit
import RealityKitContent

struct ImmersiveView: View {
    var body: some View {
        RealityView { content in
            let model = ModelEntity(
                 mesh: .generateSphere(radius: 0.1),
                 materials: [SimpleMaterial(color: .white, isMetallic: true)])
            model.scale = [2, 2, 2]
            model.position.y = 0.5
            model.position.z = -1
            content.add(model)
        }
    }
}
```

We then bring it together with the `ContentView` to handle showing the immersive space.

## ContentView

In the content view we use `openImmersiveSpace` and `dismissImmersiveSpace` to show and hide the immersive space. In the UI we have a toggle button which when pressed, calls the `showImmersiveSpace`. Lastly there's an `onChange` to handle setting whether the space is shown or not.

```swift
import SwiftUI
import RealityKit
import RealityKitContent

struct ContentView: View {
    @State private var showImmersiveSpace = false
    @State private var immersiveSpaceIsShown = false

    @Environment(\.openImmersiveSpace) var openImmersiveSpace
    @Environment(\.dismissImmersiveSpace) var dismissImmersiveSpace

    var body: some View {
        VStack {
            Text("Ponder the orb")
              .font(.extraLargeTitle)

            Toggle("Show Immersive Space", isOn: $showImmersiveSpace)
                .toggleStyle(.button)
                .padding(.top, 50)
        }
        .padding()
        .onChange(of: showImmersiveSpace) { _, newValue in
            Task {
                if newValue {
                    switch await openImmersiveSpace(id: "ImmersiveSpace") {
                    case .opened:
                        immersiveSpaceIsShown = true
                    case .error, .userCancelled :
                        fallthrough
                    default:
                        immersiveSpaceIsShown = false
                        showImmersiveSpace = false
                    }
                } else if immersiveSpaceIsShown {
                    await dismissImmersiveSpace()
                    immersiveSpaceIsShown = false
                }
            }
        }
    }
}
```

With that we can toggle the immersive space, and display content within it.

## Creating an immersive-first app

If you don't want to make use of the toggle to switch into immersive mode, you can update the app to be in immersive mode by default. In `info.plist`, update the following:

```
Preferred Default Scene Session Role: Window Application Session Role
```

Change it to:

```
Preferred Default Scene Session Role: Immersive Space Application Session Role
```

That should start the app in immersive space.

Alternately, you can change the `.onChange(of: showImmersiveSpace)` block to instead run a `task` on load, replacing the `onChange` block to:

```swift
.task {
    await openImmersiveSpace(id: "ImmersiveSpace")
}
```

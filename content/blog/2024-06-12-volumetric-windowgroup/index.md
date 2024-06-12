---
title: Showing volumetric window group
permalink: /volumetric-window-group/
description: Showing an animation in a volumetric window
date: 2024-06-12
tags:
  - dev
---

Now that we can [import a Blender file to RealityKit](/blender-file-in-vision/), let's make it look fancy in it's own _volumetric window_.

## Finished example

<blockquote class="imgur-embed-pub" lang="en" data-id="a/02Lb3Wk" data-context="false"><a href="//imgur.com/a/02Lb3Wk">Do a pushup! (Vision Pro demo)</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

## Initial plain WindowGroup

In your app's root view, apply the `plain` windowStyle to the main WindowGroup:

```swift
WindowGroup {
    ContentView()
}
.windowStyle(.plain)
```

This removes the usual window's background. To make our own, smaller view, we set up `ContentView`.

```swift
struct ContentView: View {
    @Environment(\.openWindow) var openWindow

    var body: some View {
        Text("Do a pushup!")
            .font(.extraLargeTitle)
            .padding(50)
            .glassBackgroundEffect()
            .onAppear {
                Task {
                    openWindow(id: "model")
                }
            }
    }
}
```

This view has some text, with padding and a glass background. It also has an `onAppear` method that runs `openWindow`.

This `openWindow` method comes from the `@Environment(\.openWindow)` setting. It's trying to open a window with `id` of `model`. We need to add that.

## Volumetric WindowGroup

Back in the root file, alongside the plain WindowGroup, add a second WindowGroup:

```swift
WindowGroup(id: "model") {
    ModelView()
}
.windowStyle(.volumetric)
.defaultSize(width: 1, height: 1, depth: 1, in: .meters)
```

This sets the `windowStyle` to `volumetric` and gives it a size of `1m` cubed. It also displays a `ModelView`. We should add that.

## Set up ModelView

Based on the code [from this post](/blender-file-in-vision/), I set up a standalone `ModelView`:

```swift
import SwiftUI
import RealityKit
import RealityKitContent

struct ModelView: View {
    var body: some View {
        RealityView { content in
            if let animatedModel = loadEntity() {
                content.add(animatedModel)
                animatedModel.isEnabled = true
            }
        } update: { content in
            guard let character = content.entities.first else { return }

            character.isEnabled = true
            character.availableAnimations.forEach { animation in
                character.playAnimation(animation.repeat())
            }
        }
    }

    private func loadEntity() -> Entity? {
        let entity = try? Entity.load(named: "Scene", in: realityKitContentBundle)

        entity?.setScale(SIMD3(x: 0.1, y: 0.1, z: 0.1), relativeTo: nil)
        entity?.setPosition(SIMD3(x: 0, y: -0.25, z: 0), relativeTo: nil)

        return entity
    }
}
```

A couple of small changes here, in the `loadEntity` function. I adjusted `setScale` to `0.1` to make the model a big bigger. I also added `setPosition` with a `y` value of `-0.25` to move the model down a little. Play around with values that suit your setup.

## Launch in simulator

When you launch the app, you should now see a small window with "Do a pushup!" which then opens a second window, with your 3D model. You can drag the handles to position and move the object.

## Shadow

Thanks to _hhjgjhghjghjghjg_ [for this suggestion](https://forums.developer.apple.com/forums/thread/733918) to extend `Entity` and introduce a `enumerateHierarchy` method that can be used to walk through all the components of the `usdz` source. The extension looks like this:

```swift
import RealityKit

extension Entity {
  // Executes a closure for each of the entity's child and descendant
  // entities, as well as for the entity itself.
  //
  // Set `stop` to true in the closure to abort further processing of the child entity subtree.
  func enumerateHierarchy(_ body: (Entity, UnsafeMutablePointer<Bool>) -> Void) {
      var stop = false

      func enumerate(_ body: (Entity, UnsafeMutablePointer<Bool>) -> Void) {
          guard !stop else {
              return
          }

          body(self, &stop)

          for child in children {
              guard !stop else {
                  break
              }
              child.enumerateHierarchy(body)
          }
      }

      enumerate(body)
  }
}
```

It's then applied to the entity like so:

```swift
entity?.enumerateHierarchy { entity, stop in
  if entity is ModelEntity {
      entity.components.set(GroundingShadowComponent(castsShadow: true))
  }
}
```

We should now have a pair of WindowGroups that load then the app loads, with one being a `.plain` window which then triggers the appearance of the `model` WindowGroup.

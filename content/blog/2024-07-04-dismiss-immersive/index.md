---
title: Dismissing immersive views
permalink: /dismiss-immersive/
description: Exit an immersive view in visionOS programatically
date: 2024-07-15
tags:
  - dev
---

When running an app that uses an immersive view, such as [this Jenga demo](/jenga-in-vision-os/), you might want the immersive scene to disappear when the window is closed. We can do this using the `scenePhase` environmental setting along with `dismissImmersiveSpace`.

For example, we can use the `scenePhase` value of the main content view to determine if it's been closed, and use that to hide the immersive view:

```swift
.onChange(of: showImmersiveSpace) { _, newValue in
    Task {
        if newValue {
            await showImmersiveView()
        } else if immersiveSpaceIsShown {
            immersiveSpaceIsShown = false
            await dismissImmersiveSpace()
        }
    }
}
.task(id: scenePhase) {
    switch scenePhase {
    case .inactive, .background:
        immersiveSpaceIsShown = false
        showImmersiveSpace = false
    default:
        break
    }
}
```

This `onChange` block will show the `ImmersiveView` if the `newValue` is `true` otherwise if the `ImmersiveView` is currently shown, it'll dismiss it.

Then the `scenePhase` task applies a switch to `scenePhase` that will update the `showImmersiveSpace` value to `false` when the window is closed or goes into the background. This would then result in the immersive view being dismissed.

## Tracking on the ImmersiveView

We can also keep track of whether the immersive view is showing by using `scenePhase` but applied to the `RealityView` in `ImmersiveView`:

```swift
.task(id: scenePhase) {
    switch scenePhase {
    case .inactive, .background:
        isShowingImmersive = false
    case .active:
        isShowingImmersive = true
    default:
        break
    }
}
```

Here a `Binding` of `isShowingImmersive` can be toggled and the system can be aware that the `ImmersiveView` has been dismissed.

---
title: Simple hover effect
permalink: /hover-effect/
description: Applying a hover to 3D objects in RealityKit
date: 2024-06-25
tags:
  - dev
---

Following from adding [advanced gestures](/advanced-gestures/), we can make the interaction easier by adding a hover effect.

<blockquote class="imgur-embed-pub" lang="en" data-id="a/jAPaQ3T" data-context="false">
  <a href="//imgur.com/a/jAPaQ3T">Simple hover effect</a>
  </blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8">
</script>

## Adding HoverEffectComponent()

In the shared view model, when adding `components`, add the [HoverEffectComponent](https://developer.apple.com/documentation/realitykit/hovereffectcomponent):

```swift
shape.components.set(HoverEffectComponent())
```

As long as the entities have an [InputTargetComponent](https://developer.apple.com/documentation/realitykit/inputtargetcomponent) and [CollisionComponent](https://developer.apple.com/documentation/realitykit/collisioncomponent) they will receive hover effects. Those were added in previous posts.

And that's it! The [documentation](https://developer.apple.com/documentation/realitykit/hovereffectcomponent) suggests being able to customise the effect but I've not managed to get the examples working yet. I'll update here if I do so.

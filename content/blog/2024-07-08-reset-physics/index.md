---
title: Reset physics in Vision OS entities
permalink: /reset-physics/
description: How to reset positions of pieces that are currently in motion
date: 2024-07-08
tags:
  - dev
---

When [building a Jenga game](/jenga-in-vision-os/), I wanted to be able to reset the pieces. I was able to write a simple `reset` method that put the pieces back to where they should be but there was an unexpected result. Each time I press `Reset`, the pieces fall over:

<blockquote class="imgur-embed-pub" lang="en" data-id="a/RZIVyh3" data-context="false" ><a href="//imgur.com/a/RZIVyh3">Jenga game without physics reset code</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

## Object physics

The video above shows that the pieces are being reset into their positions, but they still have their movement physics in place. As a result when reset, they continue to move causing the tower to collapse.

## Reset the physics

We can apply to lines of code to reset the physics. First we set the piece to static, then call [clearForcesAndTorques](<https://developer.apple.com/documentation/realitykit/modelentity/clearforcesandtorques()>).

```swift
modelEntity.physicsBody?.mode = .static
modelEntity.clearForcesAndTorques()
```

We then need to run a loop over the pieces to re-enable the physics:

```swift
for child in tower.children {
    if let modelEntity = child as? ModelEntity {
        modelEntity.physicsBody?.mode = .dynamic
    }
}
```

As a result we should now be able to set the pieces and they should stay still:

<blockquote class="imgur-embed-pub" lang="en" data-id="a/DQwj1qo" data-context="false" ><a href="//imgur.com/a/DQwj1qo">Jenga game with physics reset code</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

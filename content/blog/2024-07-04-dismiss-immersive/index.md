---
title: Dismissing immersive views
permalink: /dismiss-immersive/
description: Exit an immersive view in Vision OS programaticslly
date: 2024-06-30
tags:
  - dev
draft: true
---

When running an app that uses an immersive view, such as [this Jenga demo](/jenga-in-vision-os/), you might want the immersive scene to disappear when the window is closed. We can do this using the `scenePhase` environmental setting along with `dismissImmersiveSpace`.

- Note some caveats such as reopening (try to get a good simplified version working)

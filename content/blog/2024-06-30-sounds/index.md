---
title: Playing sounds
permalink: /playing-sounds/
description: Play a sound when a brick collides with table
date: 2024-06-30
tags:
  - dev
---

With a Jenga game capable of [detecting collisions](/detecting-collisions/), we can experiment with adding sounds to collision events.

## Prepare an audio file

To prepare a sound for this test, I grabbed a [free file from Pixabay](https://pixabay.com/sound-effects/search/jenga%20piece/) and used Audacity to export it as WAV, then an online converter to create a `caf` file. This can be added to the project and accessed when needed.

[Download the audio file here](https://files.vision.rodeo/sounds/tap01.caf).

## AudioFileResource extension

In order to load the file, we need to set up an extension to `AudioFileResource`. This will allow us to load the necessary audio files in our views. Add this as a standalone file such as `AudioFileResource-loadBundleFile`.

```swift
extension AudioFileResource {
    static func loadBundleFile(_ filename: String) -> AudioFileResource {
        if let audio = try? AudioFileResource.load(named: filename) {
            audio
        } else {
            fatalError("Unable to local audio file resource: \(filename) from bundle.")
        }
    }
}
```

## Set up Spatial Audio on entity

When setting up the `piece` entity in the view model, we can set the entity to use Spatial audio:

```swift
piece.spatialAudio = SpatialAudioComponent()
```

The [SpatialAudioComponent](https://developer.apple.com/documentation/realitykit/spatialaudiocomponent) method can be configured with `directivity` (the radiated pattern of sound), `gain` (the overall volume) and more.

We can also set orientation on the sound to work in combination with `directivity` using `piece.orienation`:

```swift
audioSource.orientation = .init(angle: .pi, axis: [0, 1, 0])
```

These can be set directly also such as when a collision event occurs and we might want to specify a value calculated in some way.

```swift
entity.spatialAudio?.directivity = .beam(focus: 0.75)
```

## Loading sound

In the `ImmersiveView`, add a line above the body that uses this `loadBundleFile` method to load the sound:

```swift
let collisionAudio = AudioFileResource.loadBundleFile("tap01.caf")
```

## Play audio from an entity

We can have the entity play this sound. As the Vision Pro makes use of spatial audio, the sound will sound like it's coming from the entity that plays it.

We can have the entity involved in a collision play the sound when a collision event occurs:

```swift
subscription = content.subscribe(to: CollisionEvents.Began.self, on: floor) { collisionEvent in
    collisionEvent.entityB.playAudio(collisionAudio)
}
```

The important detail here is that we can have `entity.playAudio(audioFile)` play the sound where needed.

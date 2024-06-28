---
title: Loading material from Reality Composer Pro scene
permalink: /loading-material-from-scene/
description: Load a material for use in coded RealityKit scenes
date: 2024-06-29
tags:
  - dev
---

In [this Jenga demo](/jenga-in-vision-os) we have some orange coloured bricks. I thought it would be good to try to apply a material from one of the predefined examples in Reality Composer Pro.

## Set up texture entity

To begin we set up a primative (I chose a sphere) in Reality Composer Pro and add the `MaplePlywood` texture from the content library. Apply this texture, and name the sphere `PieceTexture`.

{% image "./files/reality-composer-pro-piecetexture.png", "The PieceTexture object in Reality Composer Pro" %}

Since we don't want this object to be visible or interact with anything, we won't add any `connectors` like collisions or physics. Instead we can add the `Opacity` connector, and set the opacity to 0%.

{% image "./files/opacity-zero.png", "Setting opacity to zero" %}

With that in place we now have an object in the scene from which we can load the texture in code.

## Load material in code

Before we load the texture, we can set up the following in the `SharedViewModel`. Add a new `pieceMaterial` variable, and then load the material using `loadPieceMaterial` inside the `init` method.

```swift
var pieceMaterial: RealityKit.Material?

init() {
    pieceMaterial = loadPieceMaterial(from: "Scene", named: "PieceTexture")
    generateTower()
}
```

With this we can put together some code to drive this `loadPieceMaterial` method.

## Obtaining the material

To obtain the material we want we need to set up a couple of helpful functions. First we need to find the entity.

### Find the entity

```swift
// Recursive function to search the entity and children for the named entity
func findEntity(named name: String, in entity: Entity) -> Entity? {
    if entity.name == name {
        return entity
    }

    for child in entity.children {
        if let foundEntity = findEntity(named: name, in: child) {
            return foundEntity
        }
    }

    return nil
}
```

This function when called will check entities and their children and then return the matching entity if found.

### Find the material

With the entity found, we check in a similar way to see if it is a component and return the first material, or else check the children and repeat.

```swift
// Finds a material from an entity (or its children)
func findMaterial(from entity: Entity) -> RealityKit.Material? {
    if let modelComponent = entity.components[ModelComponent.self] {
        return modelComponent.materials.first
    }

    for child in entity.children {
        if let material = findMaterial(from: child) {
            return material
        }
    }

    return nil
}
```

### Putting the functions together

Lastly we put these functions together to search for the entity, then the material, and return it.

```swift
func loadPieceMaterial(from sceneName: String, named materialName: String) -> RealityKit.Material? {
  guard let scene = try? Entity.load(named: sceneName, in: realityKitContentBundle) else {
      print("Error: Unable to load the scene.")
      return nil
  }

  if let materialEntity = findEntity(named: materialName, in: scene),
      let material = findMaterial(from: materialEntity) {
      return material
  } else {
      print("Error: Unable to find entity or its material in the scene.")
      return nil
  }
}
```

That seems to work for now! I'd like to learn other hopefully more simple ways to load materials in Swift. I will update here once I learn more.

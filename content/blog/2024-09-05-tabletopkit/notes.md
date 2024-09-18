---
title: Get started with TabletopKit
permalink: /tabletopkit-getting-started/
description: Some initial setup required to make a TabletopKit game for Vision Pro
date: 2024-09-20
tags:
  - dev
draft: true
---

Notes from WWDC session "Meet TabletopKit for visionOS"
https://developer.apple.com/videos/play/wwdc2024/10091/

Plan for this post:

- Follow the steps below to create a hello world approach (see also https://developer.apple.com/documentation/tabletopkit/tabletopgame)
- See where game logic can live within it
- Document it in a way that I can configure the game settings and have the logic live adjacent to the boilerplate
- Later, apply it to my game

Plan for my initial approach:

- Set up equipment (table, tower and pieces)
- Place tower on the table
- Test that it works to display the setup
- Implement some basic event rules and actions for moving and dragging pieces, logging events
- Add Shareplay button
- Can it be tested in multiplayer? https://developer.apple.com/videos/play/wwdc2024/10201

- Goal: Get single player working first
- See if multiple people can interact, even if game not playable
- Get game playable as turn based

Setting up TabletopKit games involves several steps:

## Set up the play surface

Create the tabletop game from the table up.

### Make a table and seats

Tables can be circular or rectangular, depending on the scope of the game and play style.

To describe a table, the playable area is represented. Usually this aligns with the table's dimensions:

```swift
let entity = try! Entity.load(named: "table", in: tabletopKitBundle) // Load an entity from Reality Composer Pro, or else just create one in code
let table: TableTop = .rectangular(entity: entity) // Bounding box is automatically calculated
```

Then add "seats" to the table - places for the players to sit. This should seat 4 people:

```swift
static let seatPoses: [TableVisualState.Pose2D] = [
  .init(position: .init(x: 0, y: Double(GameMetrics.tableDimensions.z)), rotation: .degrees(0)),
  .init(position: .init(x: -Double(GameMetrics.tableDimensions.x), y: 0), rotation: .degrees(-90)),
  .init(position: .init(x: Double(GameMetrics.tableDimensions.x), y: 0), rotation: .degrees(90)),
  init(position: .init(x: 0, y: -Double(GameMetrics.tableDimensions.z)), rotation: .degrees(-180))
]
```

Additional members of the session can observe but not interact.

### Place equipment

Equipment is any items on the playing table, and take the form of `EntityEquipment` structs:

```swift
struct PlayerPawn: EntityEquipment {
  let id: ID
  let entity: Entity
  var initialState: BaseEquipmentState

  init(id: ID, seat: PlayerSeat, pose: TableVisualState.Pose2D, entity: Entity) {
    self.id = id
    self.entity = entity
    initialState = .init(seatControl: .restricted[seat.id]), pose: pose, entity: entity)
  }
}
```

The value `seatControl` is used here to ensure that only the player can more the particular pawn. The `pose` represents the starting location relative to the table, and lastly the `initialState` includes the entity so the framework can determine the bounding box of it.

Other equipment can conform to the `Equipment` protocol.

These are also set up with a `BaseEquipmentState` initial state that includes parent and boundingBox:

```swift
init(id: ID, boardID: EquipmentIdentifier, position: TableVisualState.Point2D) {
  self.id = id
  initialState = .init(parentID: boardID, pose: init(position: position, rotation: .init()), boundingBox: .init(center: .zero, size: .init(x: 0.06, y: 0, z: 0.06)))
}
```

The positions given when a parentID are all relative to the parentID.

## Implement rules

When implementing rules, set out the actions the players would need to carry out.

### Monitor interactions

TabletopKit monitors for system gestures. You can use these to modify game state. The gestures generate `Interactions` on the equipment. The callback is called asynchronously.

The callback specifies the equipment ID, and gesture phase.

The `gesture phase` starts and ends with the gesture, so would begin at the start of a pinch and end when the user lets go.

The `interaction phase` gives the phase of the TabletopKit interaction. For example, would begin when user picks up a piece and ends when it drops.

There are started, update and cancelled / stopped states.

To apply the interaction object, it can be given to the `RealityView` that renders the game:

```swift
RealityView { (content: inout RealtityViewContent) in
  content.entities.append(loadedGame.renderer.root)
}.tabletopGame(loadedGame.tabletop, parent: loadedGame.renderer.root) { _ in
  GameInteraction(game: loadedGame) // Interaction logic
}

struct GameInteraction: TabletopInteraction {
  func update(
    context: TabletopKit.TabletopInteractionContext,
    value: TabletopKit.TabletopInteractionValue) {
      switch value.phase {
        // phases represented here on each gesture update
      }
    }
}
```

### Append actions

With each action, adjust the game state. This could be actions such as moving pieces or flipping cards. Actions are enqueued and applied one by one.

For example, specifying end conditions of placing equipment into a proposed destination:

```swift
func update(
    context: TabletopKit.TabletopInteractionContext,
    value: TabletopKit.TabletopInteractionValue) {
      switch value.phase {
        case .ended: {
          guard let dst = value.proposedDestination.equipmentID else {
            return
          }
          context.addAction(.moveEquipment(matching: value.startingEquipmentID, childOf: dst))
        }
      }
    }
```

## Integrate RealityKit effects

Adding sounds:

```swift
func update(context: TabletopKit.TabletopInteractionContext,
                value: TabletopKit.TabletopInteractionValue) {
    switch value.gesturePhase {
      //...
      case .ended: {
        if let die = game.tabletop.equipment(of: Die.self,
                                       matching: value.startingEquipmentID) {
          if let audioLibraryComponent = die.entity.components[AudioLibraryComponent.self] {
            if let soundResource = audioLibraryComponent.resources["dieSoundShort.mp3"] {
              die.entity.playAudio(soundResource)
            }
          }
        }
      }
    }
  }
```

## Configure multiplayer with SharePlay

```swift
// Set up multiplayer using SharePlay.
// Provide a button to begin SharePlay.

import GroupActivities
func shareplayButton() -> some View {
  Button("SharePlay", systemImage: "shareplay") {
  Task {try! await Activity().activate() }
  }
}
```

After joining the SharePlay session, start multiplayer:

```swift
sessionTask = Task.detached { @MainActor in
  for await session in Activity.sessions() {
    tabletopGame.coordinateWithSession(session)
  }
}
```

## Custom spatial Persona templates

See this video for more detail https://developer.apple.com/videos/play/wwdc2024/10201

## Adding SharePlay to apps

From video: https://developer.apple.com/videos/play/wwdc2023/10239

Shareplay guide: https://www.polpiella.dev/setting-up-shareplay-on-an-ios-app-from-scratch

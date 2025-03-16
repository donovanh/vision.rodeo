---
title: TabletopKit
permalink: /tabletopkit/
description: Getting some of the pieces in place to start using a Tabletop app.
date: 2025-03-16
tags:
  - dev
---

For a while I've been looking for a way to make my [BlockStack vision pro game](https://blockstack.hop.ie) a multiplayer experience. Currently it's just a simple one-player game but it would be more fun if played with others.

To make this happen, Apple has a framework called [Shareplay](https://developer.apple.com/design/human-interface-guidelines/shareplay). I've been trying to work with it, but so far haven't been able to work out how to get it to share... or play. As an alternative, I'm looking into a framework specifically designed to wrap Shareplay and enable `tabletop` gaming, called [TabletopKit](https://developer.apple.com/documentation/tabletopkit).

This is also tricky but having watched a [talk from Mikaela Caron](/arctic-2025-day-2/#mikaela-caron-creating-games-with-tabletopkit-for-visionos) on creating a TabletopKit game, I thought I should go back to basics and try to learn this framework.

With that in mind, here's what I've learned so far. I've set up the following code as a [Git repo here](https://github.com/donovanh/tabletopkitexample).

## Result

<blockquote class="imgur-embed-pub" lang="en" data-id="a/mYLLdov" data-context="false" ><a href="//imgur.com/a/mYLLdov">Blockstack in TabletopKit</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

In building this demo I have learned that while `TabletopKit` has many useful tools, it's not a great fit for a physics-based project such as Blockstack.

The pieces can clip through others. They don't push other pieces over or fall using physics. There may be ways around this but this is as far as I've got so far.

However, the setup below might prove useful when starting new projects.

## TabletopKit setup

A TabletopKit app needs the following in place:

- A volumetric window
- A table
- Seats at the table
- Equipment (the parts of the game people interact with)
- Interaction logic
- Observation logic
- SharePlay

### Setting up app with Volumetric window

The app begins with the `App`, which contains a single `WindowGroup` set to display out `GameView` as a volumetric window:

```swift
var body: some Scene {
    WindowGroup(id: "game") {
        GameView()
            .volumeBaseplateVisibility(.hidden)
    }
    .windowStyle(.volumetric)
    .volumeWorldAlignment(.gravityAligned)
    .defaultSize(width: 0.7, height: 2, depth: 0.7, in: .meters)
}
```

This won't work out of the box, as one other setup step is to update `Info.plist` and set `Preferred Default Scene Session Role` to `Volumetric Window Application Session Role`.

Now when the app runs, it'll open a volumetric window as the only window.

### GameView

Our `GameView` is where the game is to be displayed. It uses a `RealityView` into which the game loads all `entities`:

```swift
import RealityKit
import RealityKitContent
import SwiftUI
import TabletopKit

@MainActor
struct GameView: View {
    @State private var game: Game?
    @State private var activityManager: GroupActivityManager?

    var body: some View {
        ZStack {
            if let loadedGame = game {
                RealityView { (content: inout RealityViewContent) in
                    content.entities.append(loadedGame.renderer.root)
                }
                .tabletopGame(loadedGame.tabletopGame, parent: loadedGame.renderer.root) { _ in
                    GameInteraction(game: loadedGame)
                }
            }
        }
        .task {
            self.game = await Game()
            self.activityManager = .init(tabletopGame: game!.tabletopGame)
        }
    }
}
```

The code above runs a `task` that loads the game. It also instantiates the `GroupActivityManager`, which handles Shareplay.

Lastly the `RealityView` has a `tabletopGame` modifier which sets up the game interaction logic.

### Game

The `GameView` calls the `Game` class. This brings together the setup of the `tabletop` and `renderer`, adds observers, renderers and sets up the initial seating.

```swift
@Observable
class Game {
    let tabletopGame: TabletopGame
    let renderer: GameRenderer
    let observer: GameObserver
    let setup: GameSetup

    @MainActor
    init() async {
        renderer = GameRenderer()
        setup = GameSetup(root: renderer.root)

        tabletopGame = TabletopGame(tableSetup: setup.setup)

        observer = GameObserver(tabletop: tabletopGame, renderer: renderer)
        tabletopGame.addObserver(observer)

        tabletopGame.addRenderDelegate(renderer)
        renderer.game = self

        tabletopGame.claimAnySeat()
    }

    deinit {
        tabletopGame.removeObserver(observer)
        tabletopGame.removeRenderDelegate(renderer)
    }
}
```

### GameRenderer

The game renders through a root `entity`. I've adjusted it to rotate the table 45 degrees to better see the result:

```swift
@MainActor
class GameRenderer: TabletopGame.RenderDelegate {
    let root: Entity
    let rootOffset: Vector3D = .init(x: 0, y: GameMetrics.tableThickness-1, z: 0)
    weak var game: Game?

    @MainActor
    init() {
        root = Entity()
        root.transform.translation = .init(rootOffset)

        let rotation = simd_quatf(angle: Float.pi / 4, axis: [0, 1, 0])
        root.transform.rotation = rotation
    }
}
```

### GameSetup

The minimum setup requires a table and seating. This is enough to get a tabletop kit app to run (and some testing blocks to illustrate the interactions):

```swift
@MainActor
class GameSetup {
    let root: Entity
    var setup: TableSetup
    var seats: [PlayerSeat] = []

    init(root: Entity) {
        self.root = root
        setup = TableSetup(tabletop: Table())

        // Adding player seats
        for (index, pose) in PlayerSeat.seatPoses.enumerated() {
            let seat = PlayerSeat(id: TableSeatIdentifier(index), pose: pose)
            seats.append(seat)
            setup.add(seat: seat)
        }

        // Adding some blocks for testing
        let blockWidth: Double = 0.04

        for index in 0..<30 {
            let orientation: Float
            if (index / 3) % 2 == 0 {
                orientation = 0
            } else {
                orientation = Float.pi / 2
            }

            let row = index / 3
            let x: Double
            let z: Double

            if row % 2 == 0 {
                x = Double(index % 3) * blockWidth
                z = 0
            } else {
                x = blockWidth
                z = (Double(index % 3) * blockWidth) - blockWidth
            }

            let blockPosition = TableVisualState.Point2D(x: x, z: z)
            let block = Block(index: self.idGenerator.newId(), position: blockPosition, orientation: orientation)

            setup.add(equipment: block)
        }
    }
}
```

### Blocks

While not part of `TabletopKit`, I wanted something to test the interaction so the following is used to generate the blocks (`Block` class above):

```swift
func generateBlock() -> ModelEntity {

    let pieceWidth: Float = 0.0375
    let pieceHeight: Float = 0.0225
    let pieceLength: Float = 0.1125

    var metallicMaterial = SimpleMaterial(color: .gray, isMetallic: true)
    metallicMaterial.metallic = MaterialScalarParameter(floatLiteral: 1.0)
    metallicMaterial.roughness = MaterialScalarParameter(floatLiteral: 0.3)

    let boxShape: MeshResource = .generateBox(
        width: pieceWidth,
        height: pieceHeight,
        depth: pieceLength,
        cornerRadius: 0.0025
    )
    let piece = ModelEntity(
        mesh: boxShape,
        materials: [metallicMaterial]
    )

    // Physics
    let physicsMaterial = PhysicsMaterialResource.generate(
        staticFriction: 0.8,
        dynamicFriction: 0.8,
        restitution: 0
    )

    piece.components[PhysicsBodyComponent.self] = .init(
        massProperties: .init(
            shape: .generateBox(
                width: pieceWidth,
                height: pieceHeight,
                depth: pieceLength
            ),
            mass: 1
        ),
        material: physicsMaterial,
        mode: .static
    )

    // Shadow
    piece.components.set(GroundingShadowComponent(castsShadow: true))

    // Input
    piece.components.set(InputTargetComponent())

    // Sound
    piece.spatialAudio = SpatialAudioComponent()

    // Collisions
    piece.generateCollisionShapes(recursive: false)

    return piece
}
```

### GameMetrics

To make configuration easier, we set up some shared variables:

```swift
enum GameMetrics {
    static let tableEdge: Float = 1
    static let tableThickness: Float = 0.025
    static let radius: Float = 0.35
}
```

### Adding game equipment

With the game view, setup logic and rendering logic, we can add the basic `equipment`. In this case it's a simple round table and a seating plan (with 3 seats):

```swift
extension EquipmentIdentifier {
     static var tableID: Self { .init(0) }
 }

struct Table: EntityTabletop {
    var shape: TabletopShape
    var entity: Entity
    var id: EquipmentIdentifier

    init() {
        let newTableEntity = ModelEntity(
            mesh: .generateCylinder(height: GameMetrics.tableThickness, radius: GameMetrics.radius),
            materials: [SimpleMaterial(color: .brown, isMetallic: false)]
        )
        newTableEntity.name = "table"

        self.entity = newTableEntity
        self.shape = .round(entity: entity)
        self.id = .tableID
    }
}

struct Block: EntityEquipment {
    var id: EquipmentIdentifier
    var entity: Entity
    var initialState: BaseEquipmentState

    @MainActor
    init(index: Int = 0, position: TableVisualState.Point2D, orientation: Float = 0) {
        id = EquipmentIdentifier(index)

        let newEntity = generateBlock()
        newEntity.name = "Block-\(index)"

        let rotation = Angle2D(radians: orientation)

        initialState = State(
            parentID: .tableID,
            pose: .init(position: position, rotation: rotation),
            entity: newEntity
        )
        entity = newEntity
    }
}

 struct PlayerSeat: TableSeat {
     let id: ID
     var initialState: TableSeatState

     @MainActor static let seatPoses: [TableVisualState.Pose2D] = [
         .init(position: .init(x: 0, z: Double(GameMetrics.tableEdge)), rotation: .degrees(0)),
         .init(position: .init(x: -Double(GameMetrics.tableEdge), z: 0), rotation: .degrees(-90)),
         .init(position: .init(x: Double(GameMetrics.tableEdge), z: 0), rotation: .degrees(90))
     ]

     init(id: TableSeatIdentifier, pose: TableVisualState.Pose2D) {
         self.id = id
         let spatialSeatPose: TableVisualState.Pose2D = .init(position: pose.position,
                                                              rotation: pose.rotation)
         initialState = .init(pose: spatialSeatPose)
     }
 }
```

There are different types of equipment. When using entities for custom equipment, `EntityEquipment` is ideal. In the example above, I have added a sinple `Block` struct so we can add some interactive elements.

`TabletopKit` also brings useful tools such as dice.

### GameInteraction

With the equipment in place, we can add some boilerplate for when we want interactions.

```swift
struct GameInteraction: TabletopInteraction.Delegate {
    let game: Game

    mutating func update(interaction: TabletopKit.TabletopInteraction) {
        let equipment = interaction.value.controlledEquipmentID
        guard let destination = interaction.value.proposedDestination else {
            return
        }

        if interaction.value.phase == .ended {
            interaction.addAction(.moveEquipment(matching: equipment, childOf: destination.equipmentID, pose: destination.pose))
        }
    }
}
```

This makes use of an `update` method that passes an `interaction.value.phase` that can be `.started` or `.ended` along with an `interaction.value.gesture?.phase` for more control. In this code we move the equipment to where it is left.

Restrictions on where equipment can be moved can be configured.

### GameObserver

The interactions set up `actions`, as above in `interaction.addAction`. These can be observed in the `GameObserver` class for other actions such as updating game state.

```swift
class GameObserver: TabletopGame.Observer {
    let tabletop: TabletopGame
    let renderer: GameRenderer

    init(tabletop: TabletopGame, renderer: GameRenderer) {
        self.tabletop = tabletop
        self.renderer = renderer
    }

    func actionIsPending(_ action: some TabletopAction, oldSnapshot: TableSnapshot, newSnapshot: TableSnapshot) {
        if let action = action as? MoveEquipmentAction {
            print("actionIsPending:  \(action)")
        }
    }

    func actionWasConfirmed(_ action: some TabletopAction, oldSnapshot: TableSnapshot, newSnapshot: TableSnapshot) {
        print("actionWasConfirmed:  \(action)")
    }

    func playerChangedSeats(_ player: Player, oldSeat: (any TableSeat)?, newSeat: (any TableSeat)?, snapshot: TableSnapshot) {
        if player.id == tabletop.localPlayer.id, newSeat == nil {
            tabletop.claimAnySeat()
        }
    }
}
```

### GroupActivityManager

To bring it all together, we set up a group activity session:

```swift
import GroupActivities
import SwiftUI
@preconcurrency import TabletopKit

struct Activity: GroupActivity {
    var metadata: GroupActivityMetadata {
        var metadata = GroupActivityMetadata()
        metadata.type = .generic
        metadata.title = "TabletopKitExample"
        return metadata
    }
}

class GroupActivityManager: Observable {
    var tabletopGame: TabletopGame
    var sessionTask = Task<Void, Never> {}

    init(tabletopGame: TabletopGame) {
        self.tabletopGame = tabletopGame
        sessionTask = Task { @MainActor in
            for await session in Activity.sessions() {
                tabletopGame.coordinateWithSession(session)
            }
        }
    }

    deinit {
        tabletopGame.detachNetworkCoordinator()
    }
}
```

You can see the [full project on Github here](https://github.com/donovanh/tabletopkitexample).

---
title: "Text & Materials"
permalink: /text-materials/
description: Get used to the basic materials used in 2D visionOS apps
date: 2024-01-30
tags:
  - apps
draft: true
---

# Text and materials

Exploration of how to effectively make use of text and materials in visionOS and how it differs from iOS etc.

Dig into HIG a bit also.

In SwiftUI, the Color values we give to views are part of a bigger type called ShapeStyle. This includes not only color but materials too. In the Vision Pro world, our apps look better when we use materials.

Optimise / combine images before adding.

Note that the way to display text only is by setting windowStyle `.plain` on the Windowgroup.

## Text sizes

```
VStack {
    Text("Extra Large Title")
        .font(.extraLargeTitle)
    Text("Extra Large Title 2")
        .font(.extraLargeTitle2)
    Text("Title")
        .font(.title)
    Text("Caption")
        .font(.caption)
}
```

Mention what each size represents in real-world sizes. How it looks small on simulator but in reality it is much bigger because <reasons>.

### Going bigger

```
VStack(alignment: .leading) {
    Text("Really Large text in Primary")
        .font(.system(size: 128).bold())
        .foregroundColor(.primary)
    Text("Some title-sized text in secondary mode.")
        .font(.title)
        .foregroundColor(.secondary)
}
```

Then apply modifiers to the VStack to see how text shows:

## Colours and materials

Primary

```
.foregroundColor(.primary)
```

Images: Primary text day / night (combine)

Secondary

```
.foregroundColor(.secondary)
```

Images: Secondary text day / night (combine)

Specific colours:

```
.foregroundColor(.red) // .green or .blue
```

Mention how using solid color may be important for branding etc and how bright colours might look best against solid backgrounds such as when you choose to use a white BG. It's important to think about eye comfort.

```
.foregroundColor(.green.opacity(0.75))
```

Mention how using solid colour on icons can look good, example Things: https://www.macrumors.com/2024/02/02/things-3-to-do-app-apple-vision-pro/

### Using tints and opacity

## Text hover effects

## Styling text with markdown

## Considering fonts

## Working with backgrounds

To be explored in more depth, but mention the material options visionOS encourages.

Check official docs and training notes for other angles. Then publish!

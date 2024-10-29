# harbour-present

Phone-based presentations

## Details

A phone-based slide presentation tool for Sailfish OS.

Give presentations using your phone.
Displays slides provided in PDF format on the screen.
These can be cast as the presentation.
Tap the screen on the left or right ot move backwards or forwards in the slide deck respectively.

## Presentations

Adjust the file `presentation/presentation.pdf` to control the presentation.

Adjust the file `presentation/lava.frag` to change the transition animation.

## Screen dimensions

The following details are for a Beamer presentation in 16:9 apsect ratio and running on an Xperia 10 III.

1. Screen size: (840, 360)
2. PDF viewport size: (453.54, 255.12)
3. Potential viewport scales: (1.8520968382061118, 1.4111006585136405)
4. Chosen scaling: 1.4111006585136405

## Building

Ensure you have the [Sailfish SDK](https://docs.sailfishos.org/Tools/Sailfish_SDK/) installed.

Get the source code, including all submodules:
```
git clone --recurse-submodules https://github.com/llewelld/harbour-present.git
```

Build it:
```
cd harbour-present
sfdk build
```

Deply it to a Sailfish OS device:
```
sfdk deploy --sdk
```

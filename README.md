# Abdulrahman Al Wasmi — Portfolio

Arabic-first UX/UI portfolio with an English switch. Static HTML, CSS and JavaScript; no dependencies, tracking, or server.

## Preview

Run `python3 -m http.server 8765` from this directory, then open `http://localhost:8765`.

## GitHub Pages

Publish the `main` branch from `/` using GitHub Pages. All paths are relative, so the site supports both a repository path and a custom domain.

## Content and assets

- Text lives in `content.js`; both languages use the same structure.
- Wird screens come from the owner's verified Duo exports. Hardware is the existing original device artwork. Screen text is not generated.
- Wird is presented in three sections: Mushaf on Duo, Tasbih and Prayer on the original Apple iPhone 18 Pro frame. Tasbih and Prayer use the owner's October 25 recordings, encoded as 60 fps H.264 MP4s. Prayer uses the revised `Untitled.mov`; Tasbih preserves the recording's AAC audio with a sound toggle. Poster images come from the same recordings.
- The Mushaf story starts with the original Night Sky Duo closed bezel, then opens to the matching inner bezel. Closed/open Mushaf screenshots and the video were captured from DeviceHub on October 25: installed `com.aboutmuslim.wird.duo.dev` 2.0 (73), iOS 27.1. The video shows the actual ayah tools opening and closing. It begins after the fold finishes, and the opening can be replayed. Hardware comes from the owner's already mounted Apple `Bezel-iPhone-Duo` resources.
- Creative screens and WakeBear artwork come from the owner's projects. WakeBear uses a labelled interactive web demonstration, not a claimed app screenshot.
- Bank logos are original SVGs from [Boubyan's branding kit](https://www.bankboubyan.com/en/bank-boubyan-branding-kit) and [Warba's website](https://www.warbabank.com/). They indicate employment history, not endorsement.
- TheSansArabic Plain, Bold and ExtraBold are the owner's supplied local font files.
- Career information is based on the supplied CV. No personal phone number or CV PDF is published.

## Motion and accessibility

Device opening, short entrances and native-dialog project transitions. Reduced-motion preferences and a manual motion control are supported. Showcase videos loop silently while visible, with play/pause controls; reduced motion starts them paused. Tasbih audio starts only after the visitor enables sound. Leaving a section, closing its dialog, or hiding the page pauses playback. Dialogs support Escape and focus restoration. Screen tabs support arrow keys, Home and End. The alarm demonstration has labelled switches and live feedback; no alarm is scheduled.

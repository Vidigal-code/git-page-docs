# Accessibility and narration

The accessibility controls include native browser narration for the current Markdown document. Narration uses the Web Speech API (`speechSynthesis`); it does not require an API key or an external GitPageDocs speech service.

## Configuration

Merge the following settings into `gitpagedocs/config.json`:

```json
{
  "site": {
    "accessibility": {
      "enabled": true,
      "narration": {
        "enabled": true,
        "defaultRate": 1,
        "defaultVolume": 1
      }
    },
    "mediaExclusivePlayback": true
  }
}
```

- `site.accessibility.enabled`: enable the accessibility interface.
- `site.accessibility.narration.enabled`: enable document narration.
- `defaultRate`: initial speed from `0.5` to `2`, in steps of `0.25`; the default is `1`.
- `defaultVolume`: initial volume from `0` (silent) to `1` (full), in steps of `0.1`; the default is `1`.
- All enable switches default to `true`; omitted settings use the shipped defaults.

## Read a document aloud

1. Open a Markdown page and the accessibility/narration controls.
2. Choose a voice and language from those exposed by your browser; adjust speed and volume.
3. Start reading. Pause temporarily, resume from the paused speech or stop the session.
4. To change reading settings predictably, stop, change the controls and start again.

Narration starts only after your action; there is no autoplay. Automatic voice selection follows the document language, while an explicit voice choice uses that voice's language. Narration does not translate the document.

The speech content is readable text extracted from the rendered Markdown. Scripts, styles, SVG content and elements marked hidden for assistive technology are excluded. Long visible content is read completely in successive blocks. Changing the document or language, disabling narration or leaving the page cancels the previous speech.

In focus mode, narration uses only the displayed section. Changing sections or documents, or entering or leaving focus mode, stops the previous reading. Start again to read the newly visible content. With `site.focusMode.sectionNavigationEnabled: false`, the whole document remains visible and narratable. These transitions preserve the selected voice, speed and volume.

The normal view and focus mode share voice, speed and volume preferences while the page remains mounted. These preferences are not stored across reloads. Non-numeric speed or volume settings use `1`; numeric settings outside the supported ranges are clamped to their nearest limit.

## One audio source at a time

With `site.mediaExclusivePlayback: true` (default), starting or resuming narration pauses the radio, audio tracks and route videos. Starting those media stops narration. A muted video remains outside this sound rule. Use `false` only when simultaneous playback is intentional.

The setting is shared with existing media playback; there is no second narration-exclusivity flag. The page remains readable when narration is disabled.

## Browser and voice availability

Speech support and voices depend on the browser, operating system and installed or remotely supplied voices. Voice lists can arrive after the page loads. A browser may expose a different set of languages than another device.

Unavailable speech support and playback errors are reported in the interface. Confirm that a usable voice exists, system audio is enabled and the page has received a user interaction. An empty voice list is not evidence that the document failed to load.

Do not assume every voice works offline: browser voices can be local or remote. This feature speaks text; it does not record microphone input. Browser narration complements keyboard navigation and screen readers; it does not replace them.

See the [Web Speech API reference](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis) for browser-level behavior.

> Version: 0.0.13

// Compiled from gitpagelayouts/v2 by pnpm run layouts:sync. Edit the v2 sources.
const themes = [
  {
    "layout": {
      "id": "alpine-meadow-dark",
      "name": "Alpine Meadow Dark",
      "author": "Kauan Vidigal",
      "file": "templates/alpine-meadow-dark.json",
      "preview": "Fresh meadow light, small floating seeds and cool mountain contours (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "alpine-meadow",
      "mode": "dark"
    },
    "colors": {
      "background": "#12271F",
      "primary": "#86EFAC",
      "secondary": "#BAE6FD",
      "text": "#EAF9EF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#203C30",
      "cardBorder": "#416653",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 50%, #203C30 0%, #12271F 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "alpine-meadow-stars-1",
          "kind": "stars",
          "count": 32,
          "colors": [
            "#86EFAC",
            "#BAE6FD"
          ],
          "opacity": 0.42,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 35,
            "y": -35
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 1.7,
          "seed": 4718
        },
        {
          "id": "alpine-meadow-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#86EFAC",
            "#BAE6FD"
          ],
          "opacity": 0.16,
          "size": {
            "min": 320,
            "max": 640
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 12,
            "y": 6
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": -14,
          "depth": 0.7,
          "seed": 4737
        },
        {
          "id": "alpine-meadow-orbs-3",
          "kind": "orbs",
          "count": 6,
          "colors": [
            "#86EFAC",
            "#BAE6FD"
          ],
          "opacity": 0.12,
          "size": {
            "min": 70,
            "max": 180
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -16,
            "y": 9
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 30,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "seed": 4756
        }
      ]
    }
  },
  {
    "layout": {
      "id": "alpine-meadow-light",
      "name": "Alpine Meadow Light",
      "author": "Kauan Vidigal",
      "file": "templates/alpine-meadow-light.json",
      "preview": "Fresh meadow light, small floating seeds and cool mountain contours (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "alpine-meadow",
      "mode": "light"
    },
    "colors": {
      "background": "#F2FCF2",
      "primary": "#166534",
      "secondary": "#0369A1",
      "text": "#294B35",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C4E1C6",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 50%, #FFFFFF 0%, #F2FCF2 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "alpine-meadow-stars-1",
          "kind": "stars",
          "count": 32,
          "colors": [
            "#166534",
            "#0369A1"
          ],
          "opacity": 0.302,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 35,
            "y": -35
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 1.7,
          "seed": 4718
        },
        {
          "id": "alpine-meadow-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#166534",
            "#0369A1"
          ],
          "opacity": 0.115,
          "size": {
            "min": 320,
            "max": 640
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 12,
            "y": 6
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": -14,
          "depth": 0.7,
          "seed": 4737
        },
        {
          "id": "alpine-meadow-orbs-3",
          "kind": "orbs",
          "count": 6,
          "colors": [
            "#166534",
            "#0369A1"
          ],
          "opacity": 0.086,
          "size": {
            "min": 70,
            "max": 180
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -16,
            "y": 9
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 30,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "seed": 4756
        }
      ]
    }
  },
  {
    "layout": {
      "id": "astral-drift-dark",
      "name": "Astral Drift",
      "author": "Kauan Vidigal",
      "file": "templates/astral-drift-dark.json",
      "preview": "Cyan stars, slow meteors and violet atmospheric depth",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#050B1B",
      "primary": "#38BDF8",
      "secondary": "#A5B4FC",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#0B162C",
      "cardBorder": "#243A58",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 15% 0%, #0B162C 0%, #050B1B 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "stars-1",
          "kind": "stars",
          "count": 28,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#38BDF8",
            "#A5B4FC"
          ],
          "seed": 1049
        },
        {
          "id": "streaks-2",
          "kind": "streaks",
          "count": 6,
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 12,
            "max": 25
          },
          "travel": {
            "x": -28,
            "y": 120
          },
          "blur": 0,
          "glow": 5,
          "rotation": 24,
          "depth": 1.1,
          "length": 100,
          "colors": [
            "#38BDF8",
            "#A5B4FC"
          ],
          "seed": 1066
        },
        {
          "id": "orbs-3",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#38BDF8",
            "#A5B4FC"
          ],
          "seed": 1083
        }
      ]
    }
  },
  {
    "layout": {
      "id": "aurora-borealis-dark",
      "name": "Aurora Borealis Dark",
      "author": "Kauan Vidigal",
      "file": "templates/aurora-borealis-dark.json",
      "preview": "Luminous ribbons and distant stars over polar skies (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "aurora-borealis",
      "mode": "dark"
    },
    "colors": {
      "background": "#06181C",
      "primary": "#6EE7B7",
      "secondary": "#A5B4FC",
      "text": "#DDFBF3",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#10272E",
      "cardBorder": "#2A4B50",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 10%, #10272E 0%, #06181C 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "aurora-borealis-orbs-1",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#6EE7B7",
            "#A5B4FC"
          ],
          "opacity": 0.24,
          "size": {
            "min": 280,
            "max": 520
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 34,
            "y": -12
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 54,
          "glow": 0,
          "rotation": 0,
          "depth": 0.6,
          "seed": 3001
        },
        {
          "id": "aurora-borealis-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#6EE7B7",
            "#A5B4FC"
          ],
          "opacity": 0.23,
          "size": {
            "min": 380,
            "max": 700
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 24,
            "y": 8
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": -18,
          "depth": 1.4,
          "seed": 3020
        },
        {
          "id": "aurora-borealis-stars-3",
          "kind": "stars",
          "count": 22,
          "colors": [
            "#6EE7B7",
            "#A5B4FC"
          ],
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 4,
            "y": -14
          },
          "position": {
            "x": -8,
            "y": 3
          },
          "blur": 0,
          "glow": 5,
          "rotation": 0,
          "depth": 0.35,
          "seed": 3039
        }
      ]
    }
  },
  {
    "layout": {
      "id": "aurora-borealis-light",
      "name": "Aurora Borealis Light",
      "author": "Kauan Vidigal",
      "file": "templates/aurora-borealis-light.json",
      "preview": "Luminous ribbons and distant stars over polar skies (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "aurora-borealis",
      "mode": "light"
    },
    "colors": {
      "background": "#EFFCF7",
      "primary": "#047857",
      "secondary": "#6D28D9",
      "text": "#15382F",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#BBDCCE",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 10%, #FFFFFF 0%, #EFFCF7 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "aurora-borealis-orbs-1",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#047857",
            "#6D28D9"
          ],
          "opacity": 0.173,
          "size": {
            "min": 280,
            "max": 520
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 34,
            "y": -12
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 54,
          "glow": 0,
          "rotation": 0,
          "depth": 0.6,
          "seed": 3001
        },
        {
          "id": "aurora-borealis-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#047857",
            "#6D28D9"
          ],
          "opacity": 0.166,
          "size": {
            "min": 380,
            "max": 700
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 24,
            "y": 8
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": -18,
          "depth": 1.4,
          "seed": 3020
        },
        {
          "id": "aurora-borealis-stars-3",
          "kind": "stars",
          "count": 22,
          "colors": [
            "#047857",
            "#6D28D9"
          ],
          "opacity": 0.36,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 4,
            "y": -14
          },
          "position": {
            "x": -8,
            "y": 3
          },
          "blur": 0,
          "glow": 5,
          "rotation": 0,
          "depth": 0.35,
          "seed": 3039
        }
      ]
    }
  },
  {
    "layout": {
      "id": "autumn-embers-dark",
      "name": "Autumn Embers Dark",
      "author": "Kauan Vidigal",
      "file": "templates/autumn-embers-dark.json",
      "preview": "Copper embers rising through layers of warm autumn haze (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "autumn-embers",
      "mode": "dark"
    },
    "colors": {
      "background": "#28180F",
      "primary": "#FDBA74",
      "secondary": "#FCA5A5",
      "text": "#FFF0DF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#3C271A",
      "cardBorder": "#6C4931",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 30%, #3C271A 0%, #28180F 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "autumn-embers-streaks-1",
          "kind": "streaks",
          "count": 14,
          "colors": [
            "#FDBA74",
            "#FCA5A5"
          ],
          "opacity": 0.52,
          "size": {
            "min": 2,
            "max": 4
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 18,
            "y": -95
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 9,
          "rotation": -15,
          "depth": 1.6,
          "length": 22,
          "seed": 3708
        },
        {
          "id": "autumn-embers-stars-2",
          "kind": "stars",
          "count": 26,
          "colors": [
            "#FDBA74",
            "#FCA5A5"
          ],
          "opacity": 0.45,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -12,
            "y": -65
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 0,
          "glow": 7,
          "rotation": 0,
          "depth": 0.8,
          "seed": 3727
        },
        {
          "id": "autumn-embers-orbs-3",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#FDBA74",
            "#FCA5A5"
          ],
          "opacity": 0.15,
          "size": {
            "min": 130,
            "max": 310
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 9,
            "y": 4
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 42,
          "glow": 0,
          "rotation": 0,
          "depth": 0.4,
          "seed": 3746
        }
      ]
    }
  },
  {
    "layout": {
      "id": "autumn-embers-light",
      "name": "Autumn Embers Light",
      "author": "Kauan Vidigal",
      "file": "templates/autumn-embers-light.json",
      "preview": "Copper embers rising through layers of warm autumn haze (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "autumn-embers",
      "mode": "light"
    },
    "colors": {
      "background": "#FFF6E9",
      "primary": "#9A3412",
      "secondary": "#B91C1C",
      "text": "#4B3020",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#E9CEAA",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 30%, #FFFFFF 0%, #FFF6E9 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "autumn-embers-streaks-1",
          "kind": "streaks",
          "count": 14,
          "colors": [
            "#9A3412",
            "#B91C1C"
          ],
          "opacity": 0.374,
          "size": {
            "min": 2,
            "max": 4
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 18,
            "y": -95
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 9,
          "rotation": -15,
          "depth": 1.6,
          "length": 22,
          "seed": 3708
        },
        {
          "id": "autumn-embers-stars-2",
          "kind": "stars",
          "count": 26,
          "colors": [
            "#9A3412",
            "#B91C1C"
          ],
          "opacity": 0.324,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -12,
            "y": -65
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 0,
          "glow": 7,
          "rotation": 0,
          "depth": 0.8,
          "seed": 3727
        },
        {
          "id": "autumn-embers-orbs-3",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#9A3412",
            "#B91C1C"
          ],
          "opacity": 0.108,
          "size": {
            "min": 130,
            "max": 310
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 9,
            "y": 4
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 42,
          "glow": 0,
          "rotation": 0,
          "depth": 0.4,
          "seed": 3746
        }
      ]
    }
  },
  {
    "layout": {
      "id": "bamboo-dawn-dark",
      "name": "Bamboo Dawn Dark",
      "author": "Kauan Vidigal",
      "file": "templates/bamboo-dawn-dark.json",
      "preview": "Slender bamboo-like shafts with warm dawn light and drifting pollen (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "bamboo-dawn",
      "mode": "dark"
    },
    "colors": {
      "background": "#182216",
      "primary": "#BEF264",
      "secondary": "#FDE68A",
      "text": "#F3F8E5",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#293723",
      "cardBorder": "#4D6240",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 10%, #293723 0%, #182216 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "bamboo-dawn-streaks-1",
          "kind": "streaks",
          "count": 13,
          "colors": [
            "#BEF264",
            "#FDE68A"
          ],
          "opacity": 0.18,
          "size": {
            "min": 4,
            "max": 10
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 3,
            "y": 12
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 4,
          "depth": 1.2,
          "length": 420,
          "seed": 4213
        },
        {
          "id": "bamboo-dawn-orbs-2",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#BEF264",
            "#FDE68A"
          ],
          "opacity": 0.16,
          "size": {
            "min": 180,
            "max": 340
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 8,
            "y": -8
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 48,
          "glow": 0,
          "rotation": 0,
          "depth": 0.4,
          "seed": 4232
        },
        {
          "id": "bamboo-dawn-stars-3",
          "kind": "stars",
          "count": 24,
          "colors": [
            "#BEF264",
            "#FDE68A"
          ],
          "opacity": 0.32,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 28,
            "y": 45
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 1.7,
          "seed": 4251
        }
      ]
    }
  },
  {
    "layout": {
      "id": "bamboo-dawn-light",
      "name": "Bamboo Dawn Light",
      "author": "Kauan Vidigal",
      "file": "templates/bamboo-dawn-light.json",
      "preview": "Slender bamboo-like shafts with warm dawn light and drifting pollen (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "bamboo-dawn",
      "mode": "light"
    },
    "colors": {
      "background": "#F7FBEF",
      "primary": "#3F6212",
      "secondary": "#854D0E",
      "text": "#344626",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#D1DFBD",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 10%, #FFFFFF 0%, #F7FBEF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "bamboo-dawn-streaks-1",
          "kind": "streaks",
          "count": 13,
          "colors": [
            "#3F6212",
            "#854D0E"
          ],
          "opacity": 0.13,
          "size": {
            "min": 4,
            "max": 10
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 3,
            "y": 12
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 4,
          "depth": 1.2,
          "length": 420,
          "seed": 4213
        },
        {
          "id": "bamboo-dawn-orbs-2",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#3F6212",
            "#854D0E"
          ],
          "opacity": 0.115,
          "size": {
            "min": 180,
            "max": 340
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 8,
            "y": -8
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 48,
          "glow": 0,
          "rotation": 0,
          "depth": 0.4,
          "seed": 4232
        },
        {
          "id": "bamboo-dawn-stars-3",
          "kind": "stars",
          "count": 24,
          "colors": [
            "#3F6212",
            "#854D0E"
          ],
          "opacity": 0.23,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 28,
            "y": 45
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 1.7,
          "seed": 4251
        }
      ]
    }
  },
  {
    "layout": {
      "id": "celestial-ice-light",
      "name": "Celestial Ice",
      "author": "Kauan Vidigal",
      "file": "templates/celestial-ice-light.json",
      "preview": "Blue ice crystals and soft celestial ripples",
      "supportsLightAndDarkModes": false,
      "mode": "light"
    },
    "colors": {
      "background": "#EFF8FC",
      "primary": "#0369A1",
      "secondary": "#0891B2",
      "text": "#17233B",
      "textSecondary": "#475569",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C5E4EF",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 0%, #FFFFFF 0%, #EFF8FC 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 1
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "stars-1",
          "kind": "stars",
          "count": 32,
          "opacity": 0.36400000000000005,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#0369A1",
            "#0891B2"
          ],
          "seed": 1554
        },
        {
          "id": "waves-2",
          "kind": "waves",
          "count": 3,
          "opacity": 0.10400000000000001,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#0369A1",
            "#0891B2"
          ],
          "seed": 1571
        }
      ]
    }
  },
  {
    "layout": {
      "id": "cloud-harbor-dark",
      "name": "Cloud Harbor Dark",
      "author": "Kauan Vidigal",
      "file": "templates/cloud-harbor-dark.json",
      "preview": "Slow cloud banks drifting above a calm open horizon (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "cloud-harbor",
      "mode": "dark"
    },
    "colors": {
      "background": "#142438",
      "primary": "#BAE6FD",
      "secondary": "#FDE68A",
      "text": "#F0F6FC",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#21384E",
      "cardBorder": "#496279",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 50%, #21384E 0%, #142438 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "cloud-harbor-orbs-1",
          "kind": "orbs",
          "count": 10,
          "colors": [
            "#BAE6FD",
            "#FDE68A"
          ],
          "opacity": 0.19,
          "size": {
            "min": 260,
            "max": 500
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 34,
            "y": -3
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 44,
          "glow": 0,
          "rotation": 0,
          "depth": 0.8,
          "seed": 3506
        },
        {
          "id": "cloud-harbor-waves-2",
          "kind": "waves",
          "count": 4,
          "colors": [
            "#BAE6FD",
            "#FDE68A"
          ],
          "opacity": 0.13,
          "size": {
            "min": 440,
            "max": 720
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -20,
            "y": 5
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": -4,
          "depth": 1.35,
          "seed": 3525
        }
      ]
    }
  },
  {
    "layout": {
      "id": "cloud-harbor-light",
      "name": "Cloud Harbor Light",
      "author": "Kauan Vidigal",
      "file": "templates/cloud-harbor-light.json",
      "preview": "Slow cloud banks drifting above a calm open horizon (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "cloud-harbor",
      "mode": "light"
    },
    "colors": {
      "background": "#F3FAFF",
      "primary": "#0369A1",
      "secondary": "#92400E",
      "text": "#213D50",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C8E0EC",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 50%, #FFFFFF 0%, #F3FAFF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "cloud-harbor-orbs-1",
          "kind": "orbs",
          "count": 10,
          "colors": [
            "#0369A1",
            "#92400E"
          ],
          "opacity": 0.137,
          "size": {
            "min": 260,
            "max": 500
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 34,
            "y": -3
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 44,
          "glow": 0,
          "rotation": 0,
          "depth": 0.8,
          "seed": 3506
        },
        {
          "id": "cloud-harbor-waves-2",
          "kind": "waves",
          "count": 4,
          "colors": [
            "#0369A1",
            "#92400E"
          ],
          "opacity": 0.094,
          "size": {
            "min": 440,
            "max": 720
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -20,
            "y": 5
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": -4,
          "depth": 1.35,
          "seed": 3525
        }
      ]
    }
  },
  {
    "layout": {
      "id": "comet-trail-dark",
      "name": "Comet Trail",
      "author": "Kauan Vidigal",
      "file": "templates/comet-trail-dark.json",
      "preview": "Turquoise comet trails above a deep teal field",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#03171C",
      "primary": "#2DD4BF",
      "secondary": "#67E8F9",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#08292F",
      "cardBorder": "#18505B",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 15% 0%, #08292F 0%, #03171C 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "streaks-1",
          "kind": "streaks",
          "count": 6,
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 12,
            "max": 25
          },
          "travel": {
            "x": -28,
            "y": 120
          },
          "blur": 0,
          "glow": 5,
          "rotation": 24,
          "depth": 1.1,
          "length": 120,
          "colors": [
            "#2DD4BF",
            "#67E8F9"
          ],
          "seed": 1453
        },
        {
          "id": "stars-2",
          "kind": "stars",
          "count": 28,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#2DD4BF",
            "#67E8F9"
          ],
          "seed": 1470
        },
        {
          "id": "grid-3",
          "kind": "grid",
          "count": 1,
          "opacity": 0.12,
          "size": {
            "min": 48,
            "max": 64
          },
          "duration": {
            "min": 48,
            "max": 70
          },
          "travel": {
            "x": 3,
            "y": 4
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "colors": [
            "#2DD4BF",
            "#67E8F9"
          ],
          "seed": 1487
        }
      ]
    }
  },
  {
    "layout": {
      "id": "coral-lagoon-dark",
      "name": "Coral Lagoon Dark",
      "author": "Kauan Vidigal",
      "file": "templates/coral-lagoon-dark.json",
      "preview": "Turquoise lagoon currents with coral highlights and rising bubbles (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "coral-lagoon",
      "mode": "dark"
    },
    "colors": {
      "background": "#07252A",
      "primary": "#5EEAD4",
      "secondary": "#FDA4AF",
      "text": "#E6FFFB",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#103B3F",
      "cardBorder": "#2D6062",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 50%, #103B3F 0%, #07252A 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "coral-lagoon-orbs-1",
          "kind": "orbs",
          "count": 20,
          "colors": [
            "#5EEAD4",
            "#FDA4AF"
          ],
          "opacity": 0.32,
          "size": {
            "min": 5,
            "max": 28
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": -8,
            "y": -110
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 0,
          "glow": 4,
          "rotation": 0,
          "depth": 1.7,
          "seed": 4112
        },
        {
          "id": "coral-lagoon-waves-2",
          "kind": "waves",
          "count": 6,
          "colors": [
            "#5EEAD4",
            "#FDA4AF"
          ],
          "opacity": 0.2,
          "size": {
            "min": 180,
            "max": 450
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 28,
            "y": 10
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 8,
          "depth": 0.9,
          "seed": 4131
        },
        {
          "id": "coral-lagoon-streaks-3",
          "kind": "streaks",
          "count": 4,
          "colors": [
            "#5EEAD4",
            "#FDA4AF"
          ],
          "opacity": 0.11,
          "size": {
            "min": 2,
            "max": 5
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 5,
            "y": 20
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 6,
          "glow": 0,
          "rotation": 24,
          "depth": 0.3,
          "length": 220,
          "seed": 4150
        }
      ]
    }
  },
  {
    "layout": {
      "id": "coral-lagoon-light",
      "name": "Coral Lagoon Light",
      "author": "Kauan Vidigal",
      "file": "templates/coral-lagoon-light.json",
      "preview": "Turquoise lagoon currents with coral highlights and rising bubbles (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "coral-lagoon",
      "mode": "light"
    },
    "colors": {
      "background": "#EFFDF9",
      "primary": "#0F766E",
      "secondary": "#BE185D",
      "text": "#1D4541",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#B9E4D9",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 50%, #FFFFFF 0%, #EFFDF9 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "coral-lagoon-orbs-1",
          "kind": "orbs",
          "count": 20,
          "colors": [
            "#0F766E",
            "#BE185D"
          ],
          "opacity": 0.23,
          "size": {
            "min": 5,
            "max": 28
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": -8,
            "y": -110
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 0,
          "glow": 4,
          "rotation": 0,
          "depth": 1.7,
          "seed": 4112
        },
        {
          "id": "coral-lagoon-waves-2",
          "kind": "waves",
          "count": 6,
          "colors": [
            "#0F766E",
            "#BE185D"
          ],
          "opacity": 0.144,
          "size": {
            "min": 180,
            "max": 450
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 28,
            "y": 10
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 8,
          "depth": 0.9,
          "seed": 4131
        },
        {
          "id": "coral-lagoon-streaks-3",
          "kind": "streaks",
          "count": 4,
          "colors": [
            "#0F766E",
            "#BE185D"
          ],
          "opacity": 0.079,
          "size": {
            "min": 2,
            "max": 5
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 5,
            "y": 20
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 6,
          "glow": 0,
          "rotation": 24,
          "depth": 0.3,
          "length": 220,
          "seed": 4150
        }
      ]
    }
  },
  {
    "layout": {
      "id": "cosmic-tide-dark",
      "name": "Cosmic Tide Dark",
      "author": "Kauan Vidigal",
      "file": "templates/cosmic-tide-dark.json",
      "preview": "Orbital wave fields, fine stars and slow galactic currents (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "cosmic-tide",
      "mode": "dark"
    },
    "colors": {
      "background": "#111A34",
      "primary": "#A5B4FC",
      "secondary": "#F0ABFC",
      "text": "#EDF0FF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#202D4B",
      "cardBorder": "#435779",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 10%, #202D4B 0%, #111A34 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "cosmic-tide-waves-1",
          "kind": "waves",
          "count": 7,
          "colors": [
            "#A5B4FC",
            "#F0ABFC"
          ],
          "opacity": 0.22,
          "size": {
            "min": 240,
            "max": 620
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 18,
            "y": -12
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 0,
          "glow": 3,
          "rotation": 38,
          "depth": 1.3,
          "seed": 4819
        },
        {
          "id": "cosmic-tide-stars-2",
          "kind": "stars",
          "count": 38,
          "colors": [
            "#A5B4FC",
            "#F0ABFC"
          ],
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -16,
            "y": 65
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 5,
          "rotation": 0,
          "depth": 0.4,
          "seed": 4838
        },
        {
          "id": "cosmic-tide-orbs-3",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#A5B4FC",
            "#F0ABFC"
          ],
          "opacity": 0.15,
          "size": {
            "min": 160,
            "max": 340
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 22,
            "y": 9
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 42,
          "glow": 0,
          "rotation": 0,
          "depth": 1.8,
          "seed": 4857
        }
      ]
    }
  },
  {
    "layout": {
      "id": "cosmic-tide-light",
      "name": "Cosmic Tide Light",
      "author": "Kauan Vidigal",
      "file": "templates/cosmic-tide-light.json",
      "preview": "Orbital wave fields, fine stars and slow galactic currents (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "cosmic-tide",
      "mode": "light"
    },
    "colors": {
      "background": "#F3F6FF",
      "primary": "#4338CA",
      "secondary": "#A21CAF",
      "text": "#293657",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C8D4EF",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 10%, #FFFFFF 0%, #F3F6FF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "cosmic-tide-waves-1",
          "kind": "waves",
          "count": 7,
          "colors": [
            "#4338CA",
            "#A21CAF"
          ],
          "opacity": 0.158,
          "size": {
            "min": 240,
            "max": 620
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 18,
            "y": -12
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 0,
          "glow": 3,
          "rotation": 38,
          "depth": 1.3,
          "seed": 4819
        },
        {
          "id": "cosmic-tide-stars-2",
          "kind": "stars",
          "count": 38,
          "colors": [
            "#4338CA",
            "#A21CAF"
          ],
          "opacity": 0.36,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -16,
            "y": 65
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 5,
          "rotation": 0,
          "depth": 0.4,
          "seed": 4838
        },
        {
          "id": "cosmic-tide-orbs-3",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#4338CA",
            "#A21CAF"
          ],
          "opacity": 0.108,
          "size": {
            "min": 160,
            "max": 340
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 22,
            "y": 9
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 42,
          "glow": 0,
          "rotation": 0,
          "depth": 1.8,
          "seed": 4857
        }
      ]
    }
  },
  {
    "layout": {
      "id": "crystal-cavern-dark",
      "name": "Crystal Cavern Dark",
      "author": "Kauan Vidigal",
      "file": "templates/crystal-cavern-dark.json",
      "preview": "Faceted grids and luminous mineral trails inside a violet cavern (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "crystal-cavern",
      "mode": "dark"
    },
    "colors": {
      "background": "#1B1530",
      "primary": "#C4B5FD",
      "secondary": "#67E8F9",
      "text": "#F2EBFF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#2C2445",
      "cardBorder": "#53446F",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 50%, #2C2445 0%, #1B1530 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "crystal-cavern-grid-1",
          "kind": "grid",
          "count": 4,
          "colors": [
            "#C4B5FD",
            "#67E8F9"
          ],
          "opacity": 0.13,
          "size": {
            "min": 100,
            "max": 210
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 10,
            "y": -8
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 45,
          "depth": 1.1,
          "seed": 4415
        },
        {
          "id": "crystal-cavern-streaks-2",
          "kind": "streaks",
          "count": 8,
          "colors": [
            "#C4B5FD",
            "#67E8F9"
          ],
          "opacity": 0.28,
          "size": {
            "min": 2,
            "max": 5
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 12,
            "y": 45
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 0,
          "glow": 10,
          "rotation": -25,
          "depth": 1.6,
          "length": 170,
          "seed": 4434
        },
        {
          "id": "crystal-cavern-stars-3",
          "kind": "stars",
          "count": 26,
          "colors": [
            "#C4B5FD",
            "#67E8F9"
          ],
          "opacity": 0.48,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -6,
            "y": -18
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 0,
          "glow": 7,
          "rotation": 0,
          "depth": 0.45,
          "seed": 4453
        }
      ]
    }
  },
  {
    "layout": {
      "id": "crystal-cavern-light",
      "name": "Crystal Cavern Light",
      "author": "Kauan Vidigal",
      "file": "templates/crystal-cavern-light.json",
      "preview": "Faceted grids and luminous mineral trails inside a violet cavern (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "crystal-cavern",
      "mode": "light"
    },
    "colors": {
      "background": "#F7F3FF",
      "primary": "#6D28D9",
      "secondary": "#0E7490",
      "text": "#382D50",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#D7CAEB",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, #F7F3FF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "crystal-cavern-grid-1",
          "kind": "grid",
          "count": 4,
          "colors": [
            "#6D28D9",
            "#0E7490"
          ],
          "opacity": 0.094,
          "size": {
            "min": 100,
            "max": 210
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 10,
            "y": -8
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 45,
          "depth": 1.1,
          "seed": 4415
        },
        {
          "id": "crystal-cavern-streaks-2",
          "kind": "streaks",
          "count": 8,
          "colors": [
            "#6D28D9",
            "#0E7490"
          ],
          "opacity": 0.202,
          "size": {
            "min": 2,
            "max": 5
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 12,
            "y": 45
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 0,
          "glow": 10,
          "rotation": -25,
          "depth": 1.6,
          "length": 170,
          "seed": 4434
        },
        {
          "id": "crystal-cavern-stars-3",
          "kind": "stars",
          "count": 26,
          "colors": [
            "#6D28D9",
            "#0E7490"
          ],
          "opacity": 0.346,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -6,
            "y": -18
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 0,
          "glow": 7,
          "rotation": 0,
          "depth": 0.45,
          "seed": 4453
        }
      ]
    }
  },
  {
    "layout": {
      "id": "desert-mirage-dark",
      "name": "Desert Mirage Dark",
      "author": "Kauan Vidigal",
      "file": "templates/desert-mirage-dark.json",
      "preview": "Sweeping dune contours and fine sand moving in a warm mirage (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "desert-mirage",
      "mode": "dark"
    },
    "colors": {
      "background": "#261D15",
      "primary": "#FCD34D",
      "secondary": "#FDBA74",
      "text": "#FFF1D7",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#3A2D20",
      "cardBorder": "#66523A",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 10%, #3A2D20 0%, #261D15 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "desert-mirage-waves-1",
          "kind": "waves",
          "count": 8,
          "colors": [
            "#FCD34D",
            "#FDBA74"
          ],
          "opacity": 0.2,
          "size": {
            "min": 360,
            "max": 700
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 26,
            "y": 4
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -9,
          "depth": 1.2,
          "seed": 3910
        },
        {
          "id": "desert-mirage-orbs-2",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#FCD34D",
            "#FDBA74"
          ],
          "opacity": 0.14,
          "size": {
            "min": 180,
            "max": 380
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -15,
            "y": 8
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 48,
          "glow": 0,
          "rotation": 0,
          "depth": 0.45,
          "seed": 3929
        },
        {
          "id": "desert-mirage-stars-3",
          "kind": "stars",
          "count": 30,
          "colors": [
            "#FCD34D",
            "#FDBA74"
          ],
          "opacity": 0.35,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 115,
            "y": 16
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.7,
          "seed": 3948
        }
      ]
    }
  },
  {
    "layout": {
      "id": "desert-mirage-light",
      "name": "Desert Mirage Light",
      "author": "Kauan Vidigal",
      "file": "templates/desert-mirage-light.json",
      "preview": "Sweeping dune contours and fine sand moving in a warm mirage (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "desert-mirage",
      "mode": "light"
    },
    "colors": {
      "background": "#FFF9EB",
      "primary": "#92400E",
      "secondary": "#9A3412",
      "text": "#4B3922",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#E9D6AF",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 10%, #FFFFFF 0%, #FFF9EB 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "desert-mirage-waves-1",
          "kind": "waves",
          "count": 8,
          "colors": [
            "#92400E",
            "#9A3412"
          ],
          "opacity": 0.144,
          "size": {
            "min": 360,
            "max": 700
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 26,
            "y": 4
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -9,
          "depth": 1.2,
          "seed": 3910
        },
        {
          "id": "desert-mirage-orbs-2",
          "kind": "orbs",
          "count": 4,
          "colors": [
            "#92400E",
            "#9A3412"
          ],
          "opacity": 0.101,
          "size": {
            "min": 180,
            "max": 380
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -15,
            "y": 8
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 48,
          "glow": 0,
          "rotation": 0,
          "depth": 0.45,
          "seed": 3929
        },
        {
          "id": "desert-mirage-stars-3",
          "kind": "stars",
          "count": 30,
          "colors": [
            "#92400E",
            "#9A3412"
          ],
          "opacity": 0.252,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 115,
            "y": 16
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.7,
          "seed": 3948
        }
      ]
    }
  },
  {
    "layout": {
      "id": "dune-parallax-light",
      "name": "Dune Parallax",
      "author": "Kauan Vidigal",
      "file": "templates/dune-parallax-light.json",
      "preview": "Sand-colored contour waves with terracotta depth",
      "supportsLightAndDarkModes": false,
      "mode": "light"
    },
    "colors": {
      "background": "#FCF7ED",
      "primary": "#92400E",
      "secondary": "#9A3412",
      "text": "#17233B",
      "textSecondary": "#475569",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#E8D5AF",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 75% 0%, #FFFFFF 0%, #FCF7ED 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.08
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "waves-1",
          "kind": "waves",
          "count": 3,
          "opacity": 0.10400000000000001,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#92400E",
            "#9A3412"
          ],
          "seed": 2968
        },
        {
          "id": "grid-2",
          "kind": "grid",
          "count": 1,
          "opacity": 0.078,
          "size": {
            "min": 48,
            "max": 64
          },
          "duration": {
            "min": 48,
            "max": 70
          },
          "travel": {
            "x": 3,
            "y": 4
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "colors": [
            "#92400E",
            "#9A3412"
          ],
          "seed": 2985
        },
        {
          "id": "orbs-3",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.11699999999999999,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#92400E",
            "#9A3412"
          ],
          "seed": 3002
        }
      ]
    }
  },
  {
    "layout": {
      "id": "firefly-grove-dark",
      "name": "Firefly Grove Dark",
      "author": "Kauan Vidigal",
      "file": "templates/firefly-grove-dark.json",
      "preview": "Warm fireflies drifting through soft woodland shadows (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "firefly-grove",
      "mode": "dark"
    },
    "colors": {
      "background": "#0A1913",
      "primary": "#BEF264",
      "secondary": "#86EFAC",
      "text": "#EFFAE8",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#14291D",
      "cardBorder": "#35513C",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 30%, #14291D 0%, #0A1913 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "firefly-grove-stars-1",
          "kind": "stars",
          "count": 36,
          "colors": [
            "#BEF264",
            "#86EFAC"
          ],
          "opacity": 0.65,
          "size": {
            "min": 2,
            "max": 6
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 12,
            "y": -24
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 0,
          "glow": 12,
          "rotation": 0,
          "depth": 1.6,
          "seed": 3102
        },
        {
          "id": "firefly-grove-orbs-2",
          "kind": "orbs",
          "count": 5,
          "colors": [
            "#BEF264",
            "#86EFAC"
          ],
          "opacity": 0.13,
          "size": {
            "min": 90,
            "max": 210
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -10,
            "y": 6
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 34,
          "glow": 0,
          "rotation": 0,
          "depth": 0.55,
          "seed": 3121
        },
        {
          "id": "firefly-grove-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#BEF264",
            "#86EFAC"
          ],
          "opacity": 0.09,
          "size": {
            "min": 280,
            "max": 460
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 7,
            "y": 4
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 32,
          "depth": 0.3,
          "seed": 3140
        }
      ]
    }
  },
  {
    "layout": {
      "id": "firefly-grove-light",
      "name": "Firefly Grove Light",
      "author": "Kauan Vidigal",
      "file": "templates/firefly-grove-light.json",
      "preview": "Warm fireflies drifting through soft woodland shadows (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "firefly-grove",
      "mode": "light"
    },
    "colors": {
      "background": "#F6FBEF",
      "primary": "#4D7C0F",
      "secondary": "#047857",
      "text": "#273A1B",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#CEDDBB",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 30%, #FFFFFF 0%, #F6FBEF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "firefly-grove-stars-1",
          "kind": "stars",
          "count": 36,
          "colors": [
            "#4D7C0F",
            "#047857"
          ],
          "opacity": 0.468,
          "size": {
            "min": 2,
            "max": 6
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 12,
            "y": -24
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 0,
          "glow": 12,
          "rotation": 0,
          "depth": 1.6,
          "seed": 3102
        },
        {
          "id": "firefly-grove-orbs-2",
          "kind": "orbs",
          "count": 5,
          "colors": [
            "#4D7C0F",
            "#047857"
          ],
          "opacity": 0.094,
          "size": {
            "min": 90,
            "max": 210
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -10,
            "y": 6
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 34,
          "glow": 0,
          "rotation": 0,
          "depth": 0.55,
          "seed": 3121
        },
        {
          "id": "firefly-grove-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#4D7C0F",
            "#047857"
          ],
          "opacity": 0.065,
          "size": {
            "min": 280,
            "max": 460
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 7,
            "y": 4
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 32,
          "depth": 0.3,
          "seed": 3140
        }
      ]
    }
  },
  {
    "layout": {
      "id": "forest-canopy-dark",
      "name": "Forest Canopy Dark",
      "author": "Kauan Vidigal",
      "file": "templates/forest-canopy-dark.json",
      "preview": "Soft canopy circles and scattered sunlight between layered leaves (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "forest-canopy",
      "mode": "dark"
    },
    "colors": {
      "background": "#0B1B12",
      "primary": "#86EFAC",
      "secondary": "#FDE68A",
      "text": "#EAF5E9",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#162D1F",
      "cardBorder": "#375540",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 10%, #162D1F 0%, #0B1B12 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "forest-canopy-orbs-1",
          "kind": "orbs",
          "count": 14,
          "colors": [
            "#86EFAC",
            "#FDE68A"
          ],
          "opacity": 0.16,
          "size": {
            "min": 90,
            "max": 230
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 16,
            "y": 8
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 24,
          "glow": 0,
          "rotation": 0,
          "depth": 1.1,
          "seed": 3304
        },
        {
          "id": "forest-canopy-stars-2",
          "kind": "stars",
          "count": 22,
          "colors": [
            "#86EFAC",
            "#FDE68A"
          ],
          "opacity": 0.34,
          "size": {
            "min": 2,
            "max": 7
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -10,
            "y": 25
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 8,
          "rotation": 0,
          "depth": 1.8,
          "seed": 3323
        },
        {
          "id": "forest-canopy-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#86EFAC",
            "#FDE68A"
          ],
          "opacity": 0.1,
          "size": {
            "min": 360,
            "max": 640
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 6,
            "y": -4
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 42,
          "depth": 0.4,
          "seed": 3342
        }
      ]
    }
  },
  {
    "layout": {
      "id": "forest-canopy-light",
      "name": "Forest Canopy Light",
      "author": "Kauan Vidigal",
      "file": "templates/forest-canopy-light.json",
      "preview": "Soft canopy circles and scattered sunlight between layered leaves (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "forest-canopy",
      "mode": "light"
    },
    "colors": {
      "background": "#F1F8ED",
      "primary": "#166534",
      "secondary": "#92400E",
      "text": "#253E27",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C4D8BD",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 10%, #FFFFFF 0%, #F1F8ED 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "forest-canopy-orbs-1",
          "kind": "orbs",
          "count": 14,
          "colors": [
            "#166534",
            "#92400E"
          ],
          "opacity": 0.115,
          "size": {
            "min": 90,
            "max": 230
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 16,
            "y": 8
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 24,
          "glow": 0,
          "rotation": 0,
          "depth": 1.1,
          "seed": 3304
        },
        {
          "id": "forest-canopy-stars-2",
          "kind": "stars",
          "count": 22,
          "colors": [
            "#166534",
            "#92400E"
          ],
          "opacity": 0.245,
          "size": {
            "min": 2,
            "max": 7
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -10,
            "y": 25
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 8,
          "rotation": 0,
          "depth": 1.8,
          "seed": 3323
        },
        {
          "id": "forest-canopy-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#166534",
            "#92400E"
          ],
          "opacity": 0.072,
          "size": {
            "min": 360,
            "max": 640
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 6,
            "y": -4
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 42,
          "depth": 0.4,
          "seed": 3342
        }
      ]
    }
  },
  {
    "layout": {
      "id": "glacier-fjord-dark",
      "name": "Glacier Fjord Dark",
      "author": "Kauan Vidigal",
      "file": "templates/glacier-fjord-dark.json",
      "preview": "Icy contours, crystalline geometry and sparse drifting snow (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "glacier-fjord",
      "mode": "dark"
    },
    "colors": {
      "background": "#0C2130",
      "primary": "#A5F3FC",
      "secondary": "#C7D2FE",
      "text": "#EAF8FF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#163547",
      "cardBorder": "#3B5A70",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 50%, #163547 0%, #0C2130 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "glacier-fjord-waves-1",
          "kind": "waves",
          "count": 6,
          "colors": [
            "#A5F3FC",
            "#C7D2FE"
          ],
          "opacity": 0.22,
          "size": {
            "min": 260,
            "max": 560
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 14,
            "y": 6
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -10,
          "depth": 1.2,
          "seed": 3809
        },
        {
          "id": "glacier-fjord-grid-2",
          "kind": "grid",
          "count": 2,
          "colors": [
            "#A5F3FC",
            "#C7D2FE"
          ],
          "opacity": 0.09,
          "size": {
            "min": 180,
            "max": 280
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -8,
            "y": 4
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 28,
          "depth": 0.45,
          "seed": 3828
        },
        {
          "id": "glacier-fjord-stars-3",
          "kind": "stars",
          "count": 28,
          "colors": [
            "#A5F3FC",
            "#C7D2FE"
          ],
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 12,
            "y": 95
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 1.8,
          "seed": 3847
        }
      ]
    }
  },
  {
    "layout": {
      "id": "glacier-fjord-light",
      "name": "Glacier Fjord Light",
      "author": "Kauan Vidigal",
      "file": "templates/glacier-fjord-light.json",
      "preview": "Icy contours, crystalline geometry and sparse drifting snow (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "glacier-fjord",
      "mode": "light"
    },
    "colors": {
      "background": "#F0FCFF",
      "primary": "#0E7490",
      "secondary": "#4338CA",
      "text": "#25404F",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C1DFE9",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 50%, #FFFFFF 0%, #F0FCFF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "glacier-fjord-waves-1",
          "kind": "waves",
          "count": 6,
          "colors": [
            "#0E7490",
            "#4338CA"
          ],
          "opacity": 0.158,
          "size": {
            "min": 260,
            "max": 560
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 14,
            "y": 6
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -10,
          "depth": 1.2,
          "seed": 3809
        },
        {
          "id": "glacier-fjord-grid-2",
          "kind": "grid",
          "count": 2,
          "colors": [
            "#0E7490",
            "#4338CA"
          ],
          "opacity": 0.065,
          "size": {
            "min": 180,
            "max": 280
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -8,
            "y": 4
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 28,
          "depth": 0.45,
          "seed": 3828
        },
        {
          "id": "glacier-fjord-stars-3",
          "kind": "stars",
          "count": 28,
          "colors": [
            "#0E7490",
            "#4338CA"
          ],
          "opacity": 0.36,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 12,
            "y": 95
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 1.8,
          "seed": 3847
        }
      ]
    }
  },
  {
    "layout": {
      "id": "golden-savanna-dark",
      "name": "Golden Savanna Dark",
      "author": "Kauan Vidigal",
      "file": "templates/golden-savanna-dark.json",
      "preview": "Golden grass-like trails and warm dust drifting across open plains (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "golden-savanna",
      "mode": "dark"
    },
    "colors": {
      "background": "#292112",
      "primary": "#FDE68A",
      "secondary": "#FDBA74",
      "text": "#FFF5DB",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#3C3120",
      "cardBorder": "#6C5938",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 30%, #3C3120 0%, #292112 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "golden-savanna-streaks-1",
          "kind": "streaks",
          "count": 18,
          "colors": [
            "#FDE68A",
            "#FDBA74"
          ],
          "opacity": 0.24,
          "size": {
            "min": 2,
            "max": 5
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 12,
            "y": 5
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -24,
          "depth": 1.5,
          "length": 150,
          "seed": 4617
        },
        {
          "id": "golden-savanna-stars-2",
          "kind": "stars",
          "count": 28,
          "colors": [
            "#FDE68A",
            "#FDBA74"
          ],
          "opacity": 0.35,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 80,
            "y": -18
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 0,
          "glow": 4,
          "rotation": 0,
          "depth": 0.8,
          "seed": 4636
        },
        {
          "id": "golden-savanna-orbs-3",
          "kind": "orbs",
          "count": 3,
          "colors": [
            "#FDE68A",
            "#FDBA74"
          ],
          "opacity": 0.15,
          "size": {
            "min": 240,
            "max": 440
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -12,
            "y": 6
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 50,
          "glow": 0,
          "rotation": 0,
          "depth": 0.3,
          "seed": 4655
        }
      ]
    }
  },
  {
    "layout": {
      "id": "golden-savanna-light",
      "name": "Golden Savanna Light",
      "author": "Kauan Vidigal",
      "file": "templates/golden-savanna-light.json",
      "preview": "Golden grass-like trails and warm dust drifting across open plains (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "golden-savanna",
      "mode": "light"
    },
    "colors": {
      "background": "#FFFAEC",
      "primary": "#854D0E",
      "secondary": "#9A3412",
      "text": "#4D3D22",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#E8D7B3",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 30%, #FFFFFF 0%, #FFFAEC 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "golden-savanna-streaks-1",
          "kind": "streaks",
          "count": 18,
          "colors": [
            "#854D0E",
            "#9A3412"
          ],
          "opacity": 0.173,
          "size": {
            "min": 2,
            "max": 5
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 12,
            "y": 5
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -24,
          "depth": 1.5,
          "length": 150,
          "seed": 4617
        },
        {
          "id": "golden-savanna-stars-2",
          "kind": "stars",
          "count": 28,
          "colors": [
            "#854D0E",
            "#9A3412"
          ],
          "opacity": 0.252,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 80,
            "y": -18
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 0,
          "glow": 4,
          "rotation": 0,
          "depth": 0.8,
          "seed": 4636
        },
        {
          "id": "golden-savanna-orbs-3",
          "kind": "orbs",
          "count": 3,
          "colors": [
            "#854D0E",
            "#9A3412"
          ],
          "opacity": 0.108,
          "size": {
            "min": 240,
            "max": 440
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -12,
            "y": 6
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 50,
          "glow": 0,
          "rotation": 0,
          "depth": 0.3,
          "seed": 4655
        }
      ]
    }
  },
  {
    "layout": {
      "id": "lavender-mist-dark",
      "name": "Lavender Mist Dark",
      "author": "Kauan Vidigal",
      "file": "templates/lavender-mist-dark.json",
      "preview": "Lavender fog, quiet contour waves and distant pearl lights (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "lavender-mist",
      "mode": "dark"
    },
    "colors": {
      "background": "#21192F",
      "primary": "#D8B4FE",
      "secondary": "#C4B5FD",
      "text": "#F5EEFF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#322540",
      "cardBorder": "#58446D",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 30%, #322540 0%, #21192F 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "lavender-mist-orbs-1",
          "kind": "orbs",
          "count": 8,
          "colors": [
            "#D8B4FE",
            "#C4B5FD"
          ],
          "opacity": 0.17,
          "size": {
            "min": 220,
            "max": 450
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 18,
            "y": -10
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 58,
          "glow": 0,
          "rotation": 0,
          "depth": 0.65,
          "seed": 4011
        },
        {
          "id": "lavender-mist-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#D8B4FE",
            "#C4B5FD"
          ],
          "opacity": 0.13,
          "size": {
            "min": 300,
            "max": 600
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -16,
            "y": 5
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 14,
          "depth": 1.2,
          "seed": 4030
        },
        {
          "id": "lavender-mist-stars-3",
          "kind": "stars",
          "count": 16,
          "colors": [
            "#D8B4FE",
            "#C4B5FD"
          ],
          "opacity": 0.3,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 5,
            "y": -22
          },
          "position": {
            "x": -8,
            "y": 3
          },
          "blur": 0,
          "glow": 6,
          "rotation": 0,
          "depth": 1.6,
          "seed": 4049
        }
      ]
    }
  },
  {
    "layout": {
      "id": "lavender-mist-light",
      "name": "Lavender Mist Light",
      "author": "Kauan Vidigal",
      "file": "templates/lavender-mist-light.json",
      "preview": "Lavender fog, quiet contour waves and distant pearl lights (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "lavender-mist",
      "mode": "light"
    },
    "colors": {
      "background": "#FAF5FF",
      "primary": "#7E22CE",
      "secondary": "#6D28D9",
      "text": "#3E2C52",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#DEC9EF",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 30%, #FFFFFF 0%, #FAF5FF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "lavender-mist-orbs-1",
          "kind": "orbs",
          "count": 8,
          "colors": [
            "#7E22CE",
            "#6D28D9"
          ],
          "opacity": 0.122,
          "size": {
            "min": 220,
            "max": 450
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 18,
            "y": -10
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 58,
          "glow": 0,
          "rotation": 0,
          "depth": 0.65,
          "seed": 4011
        },
        {
          "id": "lavender-mist-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#7E22CE",
            "#6D28D9"
          ],
          "opacity": 0.094,
          "size": {
            "min": 300,
            "max": 600
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -16,
            "y": 5
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 14,
          "depth": 1.2,
          "seed": 4030
        },
        {
          "id": "lavender-mist-stars-3",
          "kind": "stars",
          "count": 16,
          "colors": [
            "#7E22CE",
            "#6D28D9"
          ],
          "opacity": 0.216,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 5,
            "y": -22
          },
          "position": {
            "x": -8,
            "y": 3
          },
          "blur": 0,
          "glow": 6,
          "rotation": 0,
          "depth": 1.6,
          "seed": 4049
        }
      ]
    }
  },
  {
    "layout": {
      "id": "lotus-pond-dark",
      "name": "Lotus Pond Dark",
      "author": "Kauan Vidigal",
      "file": "templates/lotus-pond-dark.json",
      "preview": "Layered pond ripples, rose reflections and floating water lights (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "lotus-pond",
      "mode": "dark"
    },
    "colors": {
      "background": "#102723",
      "primary": "#99F6E4",
      "secondary": "#F9A8D4",
      "text": "#EAF9F2",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#1D3B33",
      "cardBorder": "#3D6656",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 10%, #1D3B33 0%, #102723 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "lotus-pond-waves-1",
          "kind": "waves",
          "count": 9,
          "colors": [
            "#99F6E4",
            "#F9A8D4"
          ],
          "opacity": 0.22,
          "size": {
            "min": 130,
            "max": 430
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 14,
            "y": 4
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.4,
          "seed": 4516
        },
        {
          "id": "lotus-pond-orbs-2",
          "kind": "orbs",
          "count": 9,
          "colors": [
            "#99F6E4",
            "#F9A8D4"
          ],
          "opacity": 0.2,
          "size": {
            "min": 12,
            "max": 44
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -14,
            "y": 7
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 3,
          "glow": 0,
          "rotation": 0,
          "depth": 0.8,
          "seed": 4535
        },
        {
          "id": "lotus-pond-stars-3",
          "kind": "stars",
          "count": 16,
          "colors": [
            "#99F6E4",
            "#F9A8D4"
          ],
          "opacity": 0.4,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 5,
            "y": -20
          },
          "position": {
            "x": -8,
            "y": 3
          },
          "blur": 0,
          "glow": 8,
          "rotation": 0,
          "depth": 1.8,
          "seed": 4554
        }
      ]
    }
  },
  {
    "layout": {
      "id": "lotus-pond-light",
      "name": "Lotus Pond Light",
      "author": "Kauan Vidigal",
      "file": "templates/lotus-pond-light.json",
      "preview": "Layered pond ripples, rose reflections and floating water lights (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "lotus-pond",
      "mode": "light"
    },
    "colors": {
      "background": "#F1FCF5",
      "primary": "#047857",
      "secondary": "#BE185D",
      "text": "#28493B",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C1E1CD",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 10%, #FFFFFF 0%, #F1FCF5 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 16,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "lotus-pond-waves-1",
          "kind": "waves",
          "count": 9,
          "colors": [
            "#047857",
            "#BE185D"
          ],
          "opacity": 0.158,
          "size": {
            "min": 130,
            "max": 430
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 14,
            "y": 4
          },
          "position": {
            "x": -8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.4,
          "seed": 4516
        },
        {
          "id": "lotus-pond-orbs-2",
          "kind": "orbs",
          "count": 9,
          "colors": [
            "#047857",
            "#BE185D"
          ],
          "opacity": 0.144,
          "size": {
            "min": 12,
            "max": 44
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -14,
            "y": 7
          },
          "position": {
            "x": -8,
            "y": 0
          },
          "blur": 3,
          "glow": 0,
          "rotation": 0,
          "depth": 0.8,
          "seed": 4535
        },
        {
          "id": "lotus-pond-stars-3",
          "kind": "stars",
          "count": 16,
          "colors": [
            "#047857",
            "#BE185D"
          ],
          "opacity": 0.288,
          "size": {
            "min": 1,
            "max": 4
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 5,
            "y": -20
          },
          "position": {
            "x": -8,
            "y": 3
          },
          "blur": 0,
          "glow": 8,
          "rotation": 0,
          "depth": 1.8,
          "seed": 4554
        }
      ]
    }
  },
  {
    "layout": {
      "id": "lunar-dust-light",
      "name": "Lunar Dust",
      "author": "Kauan Vidigal",
      "file": "templates/lunar-dust-light.json",
      "preview": "Fine indigo stardust on a pale lunar surface",
      "supportsLightAndDarkModes": false,
      "mode": "light"
    },
    "colors": {
      "background": "#F3F5FF",
      "primary": "#4338CA",
      "secondary": "#6366F1",
      "text": "#17233B",
      "textSecondary": "#475569",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#D8DCF5",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 55% 0%, #FFFFFF 0%, #F3F5FF 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 1
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "stars-1",
          "kind": "stars",
          "count": 36,
          "opacity": 0.36400000000000005,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#4338CA",
            "#6366F1"
          ],
          "seed": 1251
        },
        {
          "id": "orbs-2",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.11699999999999999,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#4338CA",
            "#6366F1"
          ],
          "seed": 1268
        }
      ]
    }
  },
  {
    "layout": {
      "id": "matrix-amber-dark",
      "name": "Matrix Amber",
      "author": "Kauan Vidigal",
      "file": "templates/matrix-amber-dark.json",
      "preview": "Amber terminal characters and a warm phosphor glow",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#140E03",
      "primary": "#FBBF24",
      "secondary": "#FDE68A",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#251A07",
      "cardBorder": "#5C4618",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 0%, #251A07 0%, #140E03 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "matrix-1",
          "kind": "matrix",
          "count": 12,
          "opacity": 0.28,
          "size": {
            "min": 13,
            "max": 17
          },
          "duration": {
            "min": 22,
            "max": 38
          },
          "travel": {
            "x": 0,
            "y": 115
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 0.35,
          "characters": "0123456789アイウエオカキクケコサシスセソ",
          "rows": 16,
          "colors": [
            "#FBBF24",
            "#FDE68A"
          ],
          "seed": 1958
        },
        {
          "id": "orbs-2",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#FBBF24",
            "#FDE68A"
          ],
          "seed": 1975
        }
      ]
    }
  },
  {
    "layout": {
      "id": "matrix-cyan-dark",
      "name": "Matrix Cyan",
      "author": "Kauan Vidigal",
      "file": "templates/matrix-cyan-dark.json",
      "preview": "Cyan code streams over a precise blue grid",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#03131B",
      "primary": "#22D3EE",
      "secondary": "#7DD3FC",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#082331",
      "cardBorder": "#164B60",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 55% 0%, #082331 0%, #03131B 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "matrix-1",
          "kind": "matrix",
          "count": 13,
          "opacity": 0.28,
          "size": {
            "min": 13,
            "max": 17
          },
          "duration": {
            "min": 18,
            "max": 38
          },
          "travel": {
            "x": 0,
            "y": 115
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 0.35,
          "characters": "0123456789アイウエオカキクケコサシスセソ",
          "rows": 16,
          "colors": [
            "#22D3EE",
            "#7DD3FC"
          ],
          "seed": 2059
        },
        {
          "id": "grid-2",
          "kind": "grid",
          "count": 1,
          "opacity": 0.12,
          "size": {
            "min": 48,
            "max": 64
          },
          "duration": {
            "min": 48,
            "max": 70
          },
          "travel": {
            "x": 3,
            "y": 4
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "colors": [
            "#22D3EE",
            "#7DD3FC"
          ],
          "seed": 2076
        },
        {
          "id": "stars-3",
          "kind": "stars",
          "count": 36,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#22D3EE",
            "#7DD3FC"
          ],
          "seed": 2093
        }
      ]
    }
  },
  {
    "layout": {
      "id": "matrix-mint-light",
      "name": "Matrix Mint",
      "author": "Kauan Vidigal",
      "file": "templates/matrix-mint-light.json",
      "preview": "Emerald characters drifting across cool mint",
      "supportsLightAndDarkModes": false,
      "mode": "light"
    },
    "colors": {
      "background": "#EDFCF7",
      "primary": "#047857",
      "secondary": "#0F766E",
      "text": "#17233B",
      "textSecondary": "#475569",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#C1E8DA",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 0%, #FFFFFF 0%, #EDFCF7 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "matrix-1",
          "kind": "matrix",
          "count": 13,
          "opacity": 0.18200000000000002,
          "size": {
            "min": 13,
            "max": 17
          },
          "duration": {
            "min": 21,
            "max": 38
          },
          "travel": {
            "x": 0,
            "y": 115
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 0.35,
          "characters": "0123456789アイウエオカキクケコサシスセソ",
          "rows": 16,
          "colors": [
            "#047857",
            "#0F766E"
          ],
          "seed": 2362
        },
        {
          "id": "waves-2",
          "kind": "waves",
          "count": 3,
          "opacity": 0.10400000000000001,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#047857",
            "#0F766E"
          ],
          "seed": 2379
        }
      ]
    }
  },
  {
    "layout": {
      "id": "matrix-paper-light",
      "name": "Matrix Paper",
      "author": "Kauan Vidigal",
      "file": "templates/matrix-paper-light.json",
      "preview": "Quiet green code on a readable paper canvas",
      "supportsLightAndDarkModes": false,
      "mode": "light"
    },
    "colors": {
      "background": "#F6FAF5",
      "primary": "#166534",
      "secondary": "#4D7C0F",
      "text": "#17233B",
      "textSecondary": "#475569",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#D1E3CD",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 15% 0%, #FFFFFF 0%, #F6FAF5 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "matrix-1",
          "kind": "matrix",
          "count": 12,
          "opacity": 0.18200000000000002,
          "size": {
            "min": 13,
            "max": 17
          },
          "duration": {
            "min": 20,
            "max": 38
          },
          "travel": {
            "x": 0,
            "y": 115
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 0.35,
          "characters": "0123456789アイウエオカキクケコサシスセソ",
          "rows": 16,
          "colors": [
            "#166534",
            "#4D7C0F"
          ],
          "seed": 2261
        },
        {
          "id": "grid-2",
          "kind": "grid",
          "count": 1,
          "opacity": 0.078,
          "size": {
            "min": 48,
            "max": 64
          },
          "duration": {
            "min": 48,
            "max": 70
          },
          "travel": {
            "x": 3,
            "y": 4
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "colors": [
            "#166534",
            "#4D7C0F"
          ],
          "seed": 2278
        }
      ]
    }
  },
  {
    "layout": {
      "id": "matrix-rain-dark",
      "name": "Matrix Rain",
      "author": "Kauan Vidigal",
      "file": "templates/matrix-rain-dark.json",
      "preview": "Green code rain with a restrained terminal grid",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#020A05",
      "primary": "#4ADE80",
      "secondary": "#A3E635",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#06190D",
      "cardBorder": "#17452B",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 15% 0%, #06190D 0%, #020A05 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 1
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "matrix-1",
          "kind": "matrix",
          "count": 14,
          "opacity": 0.28,
          "size": {
            "min": 13,
            "max": 17
          },
          "duration": {
            "min": 21,
            "max": 38
          },
          "travel": {
            "x": 0,
            "y": 115
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 0.35,
          "characters": "0123456789アイウエオカキクケコサシスセソ",
          "rows": 16,
          "colors": [
            "#4ADE80",
            "#A3E635"
          ],
          "seed": 1857
        },
        {
          "id": "grid-2",
          "kind": "grid",
          "count": 1,
          "opacity": 0.12,
          "size": {
            "min": 48,
            "max": 64
          },
          "duration": {
            "min": 48,
            "max": 70
          },
          "travel": {
            "x": 3,
            "y": 4
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "colors": [
            "#4ADE80",
            "#A3E635"
          ],
          "seed": 1874
        }
      ]
    }
  },
  {
    "layout": {
      "id": "matrix-violet-dark",
      "name": "Matrix Violet",
      "author": "Kauan Vidigal",
      "file": "templates/matrix-violet-dark.json",
      "preview": "Lavender code rain with magenta atmospheric light",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#10071D",
      "primary": "#D8B4FE",
      "secondary": "#F9A8D4",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#211032",
      "cardBorder": "#55316D",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 75% 0%, #211032 0%, #10071D 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 1
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "matrix-1",
          "kind": "matrix",
          "count": 14,
          "opacity": 0.28,
          "size": {
            "min": 13,
            "max": 17
          },
          "duration": {
            "min": 19,
            "max": 38
          },
          "travel": {
            "x": 0,
            "y": 115
          },
          "blur": 0,
          "glow": 2,
          "rotation": 0,
          "depth": 0.35,
          "characters": "0123456789アイウエオカキクケコサシスセソ",
          "rows": 16,
          "colors": [
            "#D8B4FE",
            "#F9A8D4"
          ],
          "seed": 2160
        },
        {
          "id": "orbs-2",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#D8B4FE",
            "#F9A8D4"
          ],
          "seed": 2177
        }
      ]
    }
  },
  {
    "layout": {
      "id": "meteor-copper-dark",
      "name": "Meteor Copper",
      "author": "Kauan Vidigal",
      "file": "templates/meteor-copper-dark.json",
      "preview": "Copper meteors crossing a charcoal sky",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#17100F",
      "primary": "#FDBA74",
      "secondary": "#FB7185",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#2B1B18",
      "cardBorder": "#634134",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 75% 0%, #2B1B18 0%, #17100F 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "streaks-1",
          "kind": "streaks",
          "count": 6,
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 12,
            "max": 25
          },
          "travel": {
            "x": -28,
            "y": 120
          },
          "blur": 0,
          "glow": 5,
          "rotation": 24,
          "depth": 1.1,
          "length": 120,
          "colors": [
            "#FDBA74",
            "#FB7185"
          ],
          "seed": 1756
        },
        {
          "id": "stars-2",
          "kind": "stars",
          "count": 40,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#FDBA74",
            "#FB7185"
          ],
          "seed": 1773
        }
      ]
    }
  },
  {
    "layout": {
      "id": "nebula-violet-dark",
      "name": "Nebula Violet",
      "author": "Kauan Vidigal",
      "file": "templates/nebula-violet-dark.json",
      "preview": "Violet nebula clouds with distant starlight",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#12091F",
      "primary": "#C084FC",
      "secondary": "#F0ABFC",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#211332",
      "cardBorder": "#57366E",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 55% 0%, #211332 0%, #12091F 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "orbs-1",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#C084FC",
            "#F0ABFC"
          ],
          "seed": 1655
        },
        {
          "id": "stars-2",
          "kind": "stars",
          "count": 36,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#C084FC",
            "#F0ABFC"
          ],
          "seed": 1672
        },
        {
          "id": "waves-3",
          "kind": "waves",
          "count": 3,
          "opacity": 0.16,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#C084FC",
            "#F0ABFC"
          ],
          "seed": 1689
        }
      ]
    }
  },
  {
    "layout": {
      "id": "ocean-depths-dark",
      "name": "Ocean Depths Dark",
      "author": "Kauan Vidigal",
      "file": "templates/ocean-depths-dark.json",
      "preview": "Layered ocean currents, rising bubbles and gentle light shafts (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "ocean-depths",
      "mode": "dark"
    },
    "colors": {
      "background": "#041C2C",
      "primary": "#67E8F9",
      "secondary": "#60A5FA",
      "text": "#E3F5FF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#0C2C40",
      "cardBorder": "#24516A",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 50%, #0C2C40 0%, #041C2C 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "ocean-depths-waves-1",
          "kind": "waves",
          "count": 7,
          "colors": [
            "#67E8F9",
            "#60A5FA"
          ],
          "opacity": 0.23,
          "size": {
            "min": 240,
            "max": 620
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 24,
            "y": 10
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.3,
          "seed": 3203
        },
        {
          "id": "ocean-depths-orbs-2",
          "kind": "orbs",
          "count": 14,
          "colors": [
            "#67E8F9",
            "#60A5FA"
          ],
          "opacity": 0.26,
          "size": {
            "min": 8,
            "max": 38
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 5,
            "y": -100
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 0,
          "glow": 6,
          "rotation": 0,
          "depth": 1.8,
          "seed": 3222
        },
        {
          "id": "ocean-depths-streaks-3",
          "kind": "streaks",
          "count": 5,
          "colors": [
            "#67E8F9",
            "#60A5FA"
          ],
          "opacity": 0.13,
          "size": {
            "min": 3,
            "max": 8
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 4,
            "y": 18
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 12,
          "glow": 0,
          "rotation": 17,
          "depth": 0.25,
          "length": 300,
          "seed": 3241
        }
      ]
    }
  },
  {
    "layout": {
      "id": "ocean-depths-light",
      "name": "Ocean Depths Light",
      "author": "Kauan Vidigal",
      "file": "templates/ocean-depths-light.json",
      "preview": "Layered ocean currents, rising bubbles and gentle light shafts (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "ocean-depths",
      "mode": "light"
    },
    "colors": {
      "background": "#EFFBFF",
      "primary": "#0E7490",
      "secondary": "#1D4ED8",
      "text": "#123B4C",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#BDDDE8",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 50%, #FFFFFF 0%, #EFFBFF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "ocean-depths-waves-1",
          "kind": "waves",
          "count": 7,
          "colors": [
            "#0E7490",
            "#1D4ED8"
          ],
          "opacity": 0.166,
          "size": {
            "min": 240,
            "max": 620
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": 24,
            "y": 10
          },
          "position": {
            "x": 0,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.3,
          "seed": 3203
        },
        {
          "id": "ocean-depths-orbs-2",
          "kind": "orbs",
          "count": 14,
          "colors": [
            "#0E7490",
            "#1D4ED8"
          ],
          "opacity": 0.187,
          "size": {
            "min": 8,
            "max": 38
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 5,
            "y": -100
          },
          "position": {
            "x": 0,
            "y": 0
          },
          "blur": 0,
          "glow": 6,
          "rotation": 0,
          "depth": 1.8,
          "seed": 3222
        },
        {
          "id": "ocean-depths-streaks-3",
          "kind": "streaks",
          "count": 5,
          "colors": [
            "#0E7490",
            "#1D4ED8"
          ],
          "opacity": 0.094,
          "size": {
            "min": 3,
            "max": 8
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 4,
            "y": 18
          },
          "position": {
            "x": 0,
            "y": 3
          },
          "blur": 12,
          "glow": 0,
          "rotation": 17,
          "depth": 0.25,
          "length": 300,
          "seed": 3241
        }
      ]
    }
  },
  {
    "layout": {
      "id": "paper-lanterns-dark",
      "name": "Paper Lanterns Dark",
      "author": "Kauan Vidigal",
      "file": "templates/paper-lanterns-dark.json",
      "preview": "Warm lantern-like lights ascending through a quiet evening haze (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "paper-lanterns",
      "mode": "dark"
    },
    "colors": {
      "background": "#2B1721",
      "primary": "#FDBA74",
      "secondary": "#F9A8D4",
      "text": "#FFF0F1",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#422532",
      "cardBorder": "#724555",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 30%, #422532 0%, #2B1721 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "paper-lanterns-orbs-1",
          "kind": "orbs",
          "count": 15,
          "colors": [
            "#FDBA74",
            "#F9A8D4"
          ],
          "opacity": 0.42,
          "size": {
            "min": 18,
            "max": 54
          },
          "duration": {
            "min": 30,
            "max": 58
          },
          "travel": {
            "x": 12,
            "y": -115
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 2,
          "glow": 14,
          "rotation": 0,
          "depth": 1.6,
          "seed": 4920
        },
        {
          "id": "paper-lanterns-streaks-2",
          "kind": "streaks",
          "count": 10,
          "colors": [
            "#FDBA74",
            "#F9A8D4"
          ],
          "opacity": 0.28,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -5,
            "y": -95
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 0,
          "glow": 6,
          "rotation": 0,
          "depth": 0.9,
          "length": 24,
          "seed": 4939
        },
        {
          "id": "paper-lanterns-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#FDBA74",
            "#F9A8D4"
          ],
          "opacity": 0.1,
          "size": {
            "min": 360,
            "max": 650
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 16,
            "y": 4
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -8,
          "depth": 0.35,
          "seed": 4958
        }
      ]
    }
  },
  {
    "layout": {
      "id": "paper-lanterns-light",
      "name": "Paper Lanterns Light",
      "author": "Kauan Vidigal",
      "file": "templates/paper-lanterns-light.json",
      "preview": "Warm lantern-like lights ascending through a quiet evening haze (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "paper-lanterns",
      "mode": "light"
    },
    "colors": {
      "background": "#FFF5F0",
      "primary": "#9A3412",
      "secondary": "#BE185D",
      "text": "#522C36",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#EDCDBF",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 65% 30%, #FFFFFF 0%, #FFF5F0 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.09
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "paper-lanterns-orbs-1",
          "kind": "orbs",
          "count": 15,
          "colors": [
            "#9A3412",
            "#BE185D"
          ],
          "opacity": 0.302,
          "size": {
            "min": 18,
            "max": 54
          },
          "duration": {
            "min": 30,
            "max": 58
          },
          "travel": {
            "x": 12,
            "y": -115
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 2,
          "glow": 14,
          "rotation": 0,
          "depth": 1.6,
          "seed": 4920
        },
        {
          "id": "paper-lanterns-streaks-2",
          "kind": "streaks",
          "count": 10,
          "colors": [
            "#9A3412",
            "#BE185D"
          ],
          "opacity": 0.202,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": -5,
            "y": -95
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 0,
          "glow": 6,
          "rotation": 0,
          "depth": 0.9,
          "length": 24,
          "seed": 4939
        },
        {
          "id": "paper-lanterns-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#9A3412",
            "#BE185D"
          ],
          "opacity": 0.072,
          "size": {
            "min": 360,
            "max": 650
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 16,
            "y": 4
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": -8,
          "depth": 0.35,
          "seed": 4958
        }
      ]
    }
  },
  {
    "layout": {
      "id": "petal-parallax-light",
      "name": "Petal Parallax",
      "author": "Kauan Vidigal",
      "file": "templates/petal-parallax-light.json",
      "preview": "Rose and lilac layers floating like soft petals",
      "supportsLightAndDarkModes": false,
      "mode": "light"
    },
    "colors": {
      "background": "#FDF2F8",
      "primary": "#A21CAF",
      "secondary": "#BE185D",
      "text": "#17233B",
      "textSecondary": "#475569",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#F2CBE6",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 55% 0%, #FFFFFF 0%, #FDF2F8 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.08
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "orbs-1",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.11699999999999999,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#A21CAF",
            "#BE185D"
          ],
          "seed": 2867
        },
        {
          "id": "waves-2",
          "kind": "waves",
          "count": 3,
          "opacity": 0.10400000000000001,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#A21CAF",
            "#BE185D"
          ],
          "seed": 2884
        },
        {
          "id": "stars-3",
          "kind": "stars",
          "count": 36,
          "opacity": 0.36400000000000005,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#A21CAF",
            "#BE185D"
          ],
          "seed": 2901
        }
      ]
    }
  },
  {
    "layout": {
      "id": "polaris-parallax-dark",
      "name": "Polaris Parallax",
      "author": "Kauan Vidigal",
      "file": "templates/polaris-parallax-dark.json",
      "preview": "Polar light ribbons and a sparse distant sky",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#081522",
      "primary": "#7DD3FC",
      "secondary": "#A5B4FC",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#14283C",
      "cardBorder": "#35516F",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 75% 0%, #14283C 0%, #081522 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.08
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "waves-1",
          "kind": "waves",
          "count": 3,
          "opacity": 0.16,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#7DD3FC",
            "#A5B4FC"
          ],
          "seed": 2564
        },
        {
          "id": "stars-2",
          "kind": "stars",
          "count": 40,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#7DD3FC",
            "#A5B4FC"
          ],
          "seed": 2581
        },
        {
          "id": "orbs-3",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#7DD3FC",
            "#A5B4FC"
          ],
          "seed": 2598
        }
      ]
    }
  },
  {
    "layout": {
      "id": "prism-depth-dark",
      "name": "Prism Depth",
      "author": "Kauan Vidigal",
      "file": "templates/prism-depth-dark.json",
      "preview": "Layered violet and rose prisms with pointer depth",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#100D25",
      "primary": "#A78BFA",
      "secondary": "#F472B6",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#211A39",
      "cardBorder": "#4C3B6A",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 55% 0%, #211A39 0%, #100D25 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 1
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.08
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "orbs-1",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#A78BFA",
            "#F472B6"
          ],
          "seed": 2463
        },
        {
          "id": "grid-2",
          "kind": "grid",
          "count": 1,
          "opacity": 0.12,
          "size": {
            "min": 48,
            "max": 64
          },
          "duration": {
            "min": 48,
            "max": 70
          },
          "travel": {
            "x": 3,
            "y": 4
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "colors": [
            "#A78BFA",
            "#F472B6"
          ],
          "seed": 2480
        },
        {
          "id": "waves-3",
          "kind": "waves",
          "count": 3,
          "opacity": 0.16,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#A78BFA",
            "#F472B6"
          ],
          "seed": 2497
        }
      ]
    }
  },
  {
    "layout": {
      "id": "reef-parallax-dark",
      "name": "Reef Parallax",
      "author": "Kauan Vidigal",
      "file": "templates/reef-parallax-dark.json",
      "preview": "Ocean currents, coral light and layered underwater depth",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#031C20",
      "primary": "#2DD4BF",
      "secondary": "#FDA4AF",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#0A3035",
      "cardBorder": "#246069",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 15% 0%, #0A3035 0%, #031C20 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.08
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "waves-1",
          "kind": "waves",
          "count": 3,
          "opacity": 0.16,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#2DD4BF",
            "#FDA4AF"
          ],
          "seed": 2665
        },
        {
          "id": "orbs-2",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#2DD4BF",
            "#FDA4AF"
          ],
          "seed": 2682
        }
      ]
    }
  },
  {
    "layout": {
      "id": "sakura-breeze-dark",
      "name": "Sakura Breeze Dark",
      "author": "Kauan Vidigal",
      "file": "templates/sakura-breeze-dark.json",
      "preview": "Rose petals and small highlights carried across a spring breeze (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "sakura-breeze",
      "mode": "dark"
    },
    "colors": {
      "background": "#281420",
      "primary": "#FDA4AF",
      "secondary": "#F0ABFC",
      "text": "#FCEAF3",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#3C2132",
      "cardBorder": "#664056",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 10%, #3C2132 0%, #281420 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "sakura-breeze-orbs-1",
          "kind": "orbs",
          "count": 26,
          "colors": [
            "#FDA4AF",
            "#F0ABFC"
          ],
          "opacity": 0.4,
          "size": {
            "min": 6,
            "max": 16
          },
          "duration": {
            "min": 22,
            "max": 44
          },
          "travel": {
            "x": 90,
            "y": 85
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 1,
          "glow": 0,
          "rotation": 0,
          "depth": 1.6,
          "seed": 3607
        },
        {
          "id": "sakura-breeze-stars-2",
          "kind": "stars",
          "count": 14,
          "colors": [
            "#FDA4AF",
            "#F0ABFC"
          ],
          "opacity": 0.32,
          "size": {
            "min": 2,
            "max": 4
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 65,
            "y": 48
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 0,
          "glow": 4,
          "rotation": 0,
          "depth": 0.7,
          "seed": 3626
        },
        {
          "id": "sakura-breeze-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#FDA4AF",
            "#F0ABFC"
          ],
          "opacity": 0.1,
          "size": {
            "min": 340,
            "max": 560
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 20,
            "y": -6
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 25,
          "depth": 0.35,
          "seed": 3645
        }
      ]
    }
  },
  {
    "layout": {
      "id": "sakura-breeze-light",
      "name": "Sakura Breeze Light",
      "author": "Kauan Vidigal",
      "file": "templates/sakura-breeze-light.json",
      "preview": "Rose petals and small highlights carried across a spring breeze (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "sakura-breeze",
      "mode": "light"
    },
    "colors": {
      "background": "#FFF3F8",
      "primary": "#BE185D",
      "secondary": "#7E22CE",
      "text": "#4B263C",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#F0C6D8",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 50% 10%, #FFFFFF 0%, #FFF3F8 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8500000000000001
      },
      "parallax": {
        "enabled": true,
        "pointer": 20,
        "scroll": 0.075
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "sakura-breeze-orbs-1",
          "kind": "orbs",
          "count": 26,
          "colors": [
            "#BE185D",
            "#7E22CE"
          ],
          "opacity": 0.288,
          "size": {
            "min": 6,
            "max": 16
          },
          "duration": {
            "min": 22,
            "max": 44
          },
          "travel": {
            "x": 90,
            "y": 85
          },
          "position": {
            "x": -4,
            "y": -3
          },
          "blur": 1,
          "glow": 0,
          "rotation": 0,
          "depth": 1.6,
          "seed": 3607
        },
        {
          "id": "sakura-breeze-stars-2",
          "kind": "stars",
          "count": 14,
          "colors": [
            "#BE185D",
            "#7E22CE"
          ],
          "opacity": 0.23,
          "size": {
            "min": 2,
            "max": 4
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 65,
            "y": 48
          },
          "position": {
            "x": -4,
            "y": 0
          },
          "blur": 0,
          "glow": 4,
          "rotation": 0,
          "depth": 0.7,
          "seed": 3626
        },
        {
          "id": "sakura-breeze-waves-3",
          "kind": "waves",
          "count": 3,
          "colors": [
            "#BE185D",
            "#7E22CE"
          ],
          "opacity": 0.072,
          "size": {
            "min": 340,
            "max": 560
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 20,
            "y": -6
          },
          "position": {
            "x": -4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 25,
          "depth": 0.35,
          "seed": 3645
        }
      ]
    }
  },
  {
    "layout": {
      "id": "silver-rain-dark",
      "name": "Silver Rain Dark",
      "author": "Kauan Vidigal",
      "file": "templates/silver-rain-dark.json",
      "preview": "Slanted silver rainfall, broad ripples and low mist (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "silver-rain",
      "mode": "dark"
    },
    "colors": {
      "background": "#101B2B",
      "primary": "#93C5FD",
      "secondary": "#CBD5E1",
      "text": "#ECF2FC",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#1A2B40",
      "cardBorder": "#3D526D",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 30%, #1A2B40 0%, #101B2B 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "silver-rain-streaks-1",
          "kind": "streaks",
          "count": 34,
          "colors": [
            "#93C5FD",
            "#CBD5E1"
          ],
          "opacity": 0.42,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 10,
            "max": 20
          },
          "travel": {
            "x": -20,
            "y": 150
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 10,
          "depth": 1.5,
          "length": 84,
          "seed": 3405
        },
        {
          "id": "silver-rain-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#93C5FD",
            "#CBD5E1"
          ],
          "opacity": 0.17,
          "size": {
            "min": 180,
            "max": 500
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 8,
            "y": 3
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.6,
          "seed": 3424
        },
        {
          "id": "silver-rain-orbs-3",
          "kind": "orbs",
          "count": 3,
          "colors": [
            "#93C5FD",
            "#CBD5E1"
          ],
          "opacity": 0.1,
          "size": {
            "min": 280,
            "max": 500
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -12,
            "y": 4
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 56,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "seed": 3443
        }
      ]
    }
  },
  {
    "layout": {
      "id": "silver-rain-light",
      "name": "Silver Rain Light",
      "author": "Kauan Vidigal",
      "file": "templates/silver-rain-light.json",
      "preview": "Slanted silver rainfall, broad ripples and low mist (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "silver-rain",
      "mode": "light"
    },
    "colors": {
      "background": "#F1F5FA",
      "primary": "#1D4ED8",
      "secondary": "#475569",
      "text": "#24354B",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#CAD5E3",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 20% 30%, #FFFFFF 0%, #F1F5FA 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.65
      },
      "parallax": {
        "enabled": true,
        "pointer": 32,
        "scroll": 0.045
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "silver-rain-streaks-1",
          "kind": "streaks",
          "count": 34,
          "colors": [
            "#1D4ED8",
            "#475569"
          ],
          "opacity": 0.302,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 10,
            "max": 20
          },
          "travel": {
            "x": -20,
            "y": 150
          },
          "position": {
            "x": 8,
            "y": -3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 10,
          "depth": 1.5,
          "length": 84,
          "seed": 3405
        },
        {
          "id": "silver-rain-waves-2",
          "kind": "waves",
          "count": 5,
          "colors": [
            "#1D4ED8",
            "#475569"
          ],
          "opacity": 0.122,
          "size": {
            "min": 180,
            "max": 500
          },
          "duration": {
            "min": 37,
            "max": 65
          },
          "travel": {
            "x": 8,
            "y": 3
          },
          "position": {
            "x": 8,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 0.6,
          "seed": 3424
        },
        {
          "id": "silver-rain-orbs-3",
          "kind": "orbs",
          "count": 3,
          "colors": [
            "#1D4ED8",
            "#475569"
          ],
          "opacity": 0.072,
          "size": {
            "min": 280,
            "max": 500
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": -12,
            "y": 4
          },
          "position": {
            "x": 8,
            "y": 3
          },
          "blur": 56,
          "glow": 0,
          "rotation": 0,
          "depth": 0.25,
          "seed": 3443
        }
      ]
    }
  },
  {
    "layout": {
      "id": "solar-sparks-dark",
      "name": "Solar Sparks",
      "author": "Kauan Vidigal",
      "file": "templates/solar-sparks-dark.json",
      "preview": "Golden sparks and warm solar halos",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#1A0E08",
      "primary": "#FBBF24",
      "secondary": "#FB923C",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#29170E",
      "cardBorder": "#694323",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 75% 0%, #29170E 0%, #1A0E08 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.8
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "streaks-1",
          "kind": "streaks",
          "count": 6,
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 12,
            "max": 25
          },
          "travel": {
            "x": -28,
            "y": 120
          },
          "blur": 0,
          "glow": 5,
          "rotation": 24,
          "depth": 1.1,
          "length": 100,
          "colors": [
            "#FBBF24",
            "#FB923C"
          ],
          "seed": 1352
        },
        {
          "id": "orbs-2",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.18,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#FBBF24",
            "#FB923C"
          ],
          "seed": 1369
        },
        {
          "id": "stars-3",
          "kind": "stars",
          "count": 40,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#FBBF24",
            "#FB923C"
          ],
          "seed": 1386
        }
      ]
    }
  },
  {
    "layout": {
      "id": "starfall-cobalt-dark",
      "name": "Starfall Cobalt",
      "author": "Kauan Vidigal",
      "file": "templates/starfall-cobalt-dark.json",
      "preview": "Silver starfall across a deep cobalt sky",
      "supportsLightAndDarkModes": false,
      "mode": "dark"
    },
    "colors": {
      "background": "#060F2B",
      "primary": "#60A5FA",
      "secondary": "#BFDBFE",
      "text": "#EAF2FF",
      "textSecondary": "#A7B9CE",
      "cardBackground": "#101F40",
      "cardBorder": "#294575",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 0%, #101F40 0%, #060F2B 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.9
      },
      "parallax": {
        "enabled": true,
        "pointer": 10,
        "scroll": 0.025
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "stars-1",
          "kind": "stars",
          "count": 32,
          "opacity": 0.56,
          "size": {
            "min": 1,
            "max": 3
          },
          "duration": {
            "min": 24,
            "max": 48
          },
          "travel": {
            "x": 4,
            "y": 110
          },
          "blur": 0,
          "glow": 3,
          "rotation": 0,
          "depth": 0.7,
          "colors": [
            "#60A5FA",
            "#BFDBFE"
          ],
          "seed": 1150
        },
        {
          "id": "streaks-2",
          "kind": "streaks",
          "count": 6,
          "opacity": 0.5,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 12,
            "max": 25
          },
          "travel": {
            "x": -28,
            "y": 120
          },
          "blur": 0,
          "glow": 5,
          "rotation": 24,
          "depth": 1.1,
          "length": 120,
          "colors": [
            "#60A5FA",
            "#BFDBFE"
          ],
          "seed": 1167
        }
      ]
    }
  },
  {
    "layout": {
      "id": "sunrise-parallax-light",
      "name": "Sunrise Parallax",
      "author": "Kauan Vidigal",
      "file": "templates/sunrise-parallax-light.json",
      "preview": "Peach sunrise ribbons with gentle warm parallax",
      "supportsLightAndDarkModes": false,
      "mode": "light"
    },
    "colors": {
      "background": "#FFF7ED",
      "primary": "#C2410C",
      "secondary": "#BE185D",
      "text": "#17233B",
      "textSecondary": "#475569",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#FED7AA",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 0%, #FFFFFF 0%, #FFF7ED 70%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 1
      },
      "parallax": {
        "enabled": true,
        "pointer": 24,
        "scroll": 0.08
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "waves-1",
          "kind": "waves",
          "count": 3,
          "opacity": 0.10400000000000001,
          "size": {
            "min": 180,
            "max": 300
          },
          "duration": {
            "min": 32,
            "max": 60
          },
          "travel": {
            "x": 15,
            "y": 7
          },
          "blur": 24,
          "glow": 0,
          "rotation": -12,
          "depth": 1,
          "colors": [
            "#C2410C",
            "#BE185D"
          ],
          "seed": 2766
        },
        {
          "id": "orbs-2",
          "kind": "orbs",
          "count": 4,
          "opacity": 0.11699999999999999,
          "size": {
            "min": 140,
            "max": 260
          },
          "duration": {
            "min": 28,
            "max": 52
          },
          "travel": {
            "x": 12,
            "y": -8
          },
          "blur": 36,
          "glow": 0,
          "rotation": 0,
          "depth": 1.2,
          "colors": [
            "#C2410C",
            "#BE185D"
          ],
          "seed": 2783
        }
      ]
    }
  },
  {
    "layout": {
      "id": "thunder-horizon-dark",
      "name": "Thunder Horizon Dark",
      "author": "Kauan Vidigal",
      "file": "templates/thunder-horizon-dark.json",
      "preview": "Slow storm clouds and distant rain without flashing effects (dark)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "thunder-horizon",
      "mode": "dark"
    },
    "colors": {
      "background": "#171C32",
      "primary": "#A5B4FC",
      "secondary": "#7DD3FC",
      "text": "#EFF1FF",
      "textSecondary": "#B9C8CB",
      "cardBackground": "#272E48",
      "cardBorder": "#4A5475",
      "error": "#FDA4AF",
      "success": "#86EFAC"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 30%, #272E48 0%, #171C32 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "thunder-horizon-orbs-1",
          "kind": "orbs",
          "count": 7,
          "colors": [
            "#A5B4FC",
            "#7DD3FC"
          ],
          "opacity": 0.2,
          "size": {
            "min": 260,
            "max": 520
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": -24,
            "y": 5
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 44,
          "glow": 0,
          "rotation": 0,
          "depth": 0.55,
          "seed": 4314
        },
        {
          "id": "thunder-horizon-streaks-2",
          "kind": "streaks",
          "count": 22,
          "colors": [
            "#A5B4FC",
            "#7DD3FC"
          ],
          "opacity": 0.3,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 14,
            "max": 24
          },
          "travel": {
            "x": -25,
            "y": 135
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 16,
          "depth": 1.7,
          "length": 110,
          "seed": 4333
        },
        {
          "id": "thunder-horizon-waves-3",
          "kind": "waves",
          "count": 4,
          "colors": [
            "#A5B4FC",
            "#7DD3FC"
          ],
          "opacity": 0.14,
          "size": {
            "min": 400,
            "max": 680
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 18,
            "y": -5
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.1,
          "seed": 4352
        }
      ]
    }
  },
  {
    "layout": {
      "id": "thunder-horizon-light",
      "name": "Thunder Horizon Light",
      "author": "Kauan Vidigal",
      "file": "templates/thunder-horizon-light.json",
      "preview": "Slow storm clouds and distant rain without flashing effects (light)",
      "supportsLightAndDarkModes": true,
      "supportsLightAndDarkModesReference": "thunder-horizon",
      "mode": "light"
    },
    "colors": {
      "background": "#F3F5FF",
      "primary": "#4338CA",
      "secondary": "#0369A1",
      "text": "#2B3350",
      "textSecondary": "#526269",
      "cardBackground": "#FFFFFF",
      "cardBorder": "#CCD2EB",
      "error": "#B91C1C",
      "success": "#15803D"
    },
    "backgroundEffects": {
      "enabled": true,
      "surface": "radial-gradient(ellipse at 35% 30%, #FFFFFF 0%, #F3F5FF 78%)",
      "opacity": 1,
      "animation": {
        "enabled": true,
        "speed": 0.75
      },
      "parallax": {
        "enabled": true,
        "pointer": 28,
        "scroll": 0.06
      },
      "accessibility": {
        "reducedMotion": "static",
        "showPauseButton": true
      },
      "layers": [
        {
          "id": "thunder-horizon-orbs-1",
          "kind": "orbs",
          "count": 7,
          "colors": [
            "#4338CA",
            "#0369A1"
          ],
          "opacity": 0.144,
          "size": {
            "min": 260,
            "max": 520
          },
          "duration": {
            "min": 32,
            "max": 58
          },
          "travel": {
            "x": -24,
            "y": 5
          },
          "position": {
            "x": 4,
            "y": -3
          },
          "blur": 44,
          "glow": 0,
          "rotation": 0,
          "depth": 0.55,
          "seed": 4314
        },
        {
          "id": "thunder-horizon-streaks-2",
          "kind": "streaks",
          "count": 22,
          "colors": [
            "#4338CA",
            "#0369A1"
          ],
          "opacity": 0.216,
          "size": {
            "min": 1,
            "max": 2
          },
          "duration": {
            "min": 14,
            "max": 24
          },
          "travel": {
            "x": -25,
            "y": 135
          },
          "position": {
            "x": 4,
            "y": 0
          },
          "blur": 0,
          "glow": 0,
          "rotation": 16,
          "depth": 1.7,
          "length": 110,
          "seed": 4333
        },
        {
          "id": "thunder-horizon-waves-3",
          "kind": "waves",
          "count": 4,
          "colors": [
            "#4338CA",
            "#0369A1"
          ],
          "opacity": 0.101,
          "size": {
            "min": 400,
            "max": 680
          },
          "duration": {
            "min": 42,
            "max": 72
          },
          "travel": {
            "x": 18,
            "y": -5
          },
          "position": {
            "x": 4,
            "y": 3
          },
          "blur": 0,
          "glow": 0,
          "rotation": 0,
          "depth": 1.1,
          "seed": 4352
        }
      ]
    }
  }
];

export const ANIMATED_LAYOUTS = themes.map(({ layout }) => layout);
export const ANIMATED_THEME_COLORS = Object.fromEntries(themes.map(({ layout, colors }) => [layout.id, colors]));
export const ANIMATED_BACKGROUNDS = Object.fromEntries(themes.map(({ layout, backgroundEffects }) => [layout.id, backgroundEffects]));

/**
 * Glimmer Path story — first minute is sacred.
 * Cold open: ≤2 lines then PLAY. Lore after the first win.
 */
window.GlimmerStory = {
  /** First 10 seconds — then board. Skip always. */
  coldOpen: [
    {
      speaker: "Luma",
      text: "She’s vanishing. Pip — a firefly child. Match three lights. Hold her name.",
    },
  ],

  /** After first clear — payoff, not homework */
  afterFirstWin: [
    {
      speaker: "Pip",
      text: "I… I remember the song again. Thank you!",
    },
    {
      speaker: "Luma",
      text: "You did that. More names wait on the Path. Don’t let The Dim finish them.",
    },
  ],

  afterBeam: [
    {
      speaker: "Nori",
      text: "The road marks glow. Travellers can find home again.",
    },
  ],

  afterFog: [
    {
      speaker: "Moss Elder",
      text: "Three names. Clear as rain. Bless you, Pathkeeper.",
    },
  ],

  afterBurst: [
    {
      speaker: "Kess",
      text: "We have the steps! Watch—!",
    },
  ],

  afterFinale: [
    {
      speaker: "Luma",
      text: "I still know your face. That’s everything.",
    },
    {
      speaker: "Luma",
      text: "Prototype Path complete — you saved five souls from forgetting. Come back tomorrow. Seasons will open in the full game.",
    },
  ],

  keepsakeLines: [
    "A ribbon. Someone’s favourite colour. Saved.",
    "A laugh I almost lost. It’s loud again.",
    "A map corner. Home is still on it.",
    "A small shoe print in light. Not alone.",
    "A song without words. Still ours.",
  ],
};

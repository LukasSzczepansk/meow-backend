import type Phaser from "phaser";

export function createMeowPhaserConfig(PhaserLib: typeof import("phaser"), parent: HTMLElement, scene: Phaser.Types.Scenes.SceneType): Phaser.Types.Core.GameConfig {
  return {
    type: PhaserLib.AUTO,
    parent,
    width: 390,
    height: 500,
    transparent: true,
    antialias: true,
    scene,
    input: { activePointers: 2 },
    scale: {
      mode: PhaserLib.Scale.FIT,
      autoCenter: PhaserLib.Scale.CENTER_HORIZONTALLY,
      width: 390,
      height: 500,
    },
    render: {
      antialias: true,
      roundPixels: false,
    },
  };
}

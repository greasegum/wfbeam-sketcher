import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { BeamSketchScene } from './scenes/BeamSketchScene';
import type { BeamProperties } from '../data/beamProperties';

interface PhaserBeamSketchProps {
  width: number;
  height: number;
  selectedBeam?: BeamProperties;
  onReady?: () => void;
}

export function PhaserBeamSketch({ 
  width, 
  height, 
  selectedBeam,
  onReady 
}: PhaserBeamSketchProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing game
    if (gameRef.current) {
      gameRef.current.destroy(true);
    }

    // Create Phaser configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.WEBGL,
      parent: containerRef.current,
      width,
      height,
      backgroundColor: '#1a1a1a',
      antialias: true,
      pixelArt: false,
      scene: [BeamSketchScene],
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.NO_CENTER
      },
      input: {
        mouse: {
          preventDefaultWheel: true,
          preventDefaultDown: true,
          preventDefaultUp: true,
          preventDefaultMove: false
        }
      },
      callbacks: {
        postBoot: (game) => {
          // Enable multi-touch
          game.input.addPointer(2);
          
          // Set initial beam if provided
          const scene = game.scene.getScene('BeamSketchScene') as BeamSketchScene;
          if (selectedBeam && scene) {
            scene.setBeam(selectedBeam);
          }
          
          onReady?.();
        }
      }
    };

    // Create game instance
    gameRef.current = new Phaser.Game(config);

    // Cleanup
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [width, height]);

  // Update beam when selection changes
  useEffect(() => {
    if (gameRef.current && selectedBeam) {
      const scene = gameRef.current.scene.getScene('BeamSketchScene') as BeamSketchScene;
      if (scene && scene.scene.isActive()) {
        scene.setBeam(selectedBeam);
      }
    }
  }, [selectedBeam]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    />
  );
}
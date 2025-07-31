import Phaser from 'phaser';
import type { BeamProperties } from '../../data/beamProperties';

export class BeamRenderer {
  private scene: Phaser.Scene;
  
  // Colors
  private readonly BEAM_FILL = 0x90EE90; // Light pastel green
  private readonly BEAM_STROKE = 0x000000; // Black
  private readonly DIMENSION_COLOR = 0x666666; // Gray
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  renderCrossSection(
    beam: BeamProperties,
    x: number,
    y: number,
    scale: number,
    container: Phaser.GameObjects.Container
  ) {
    console.log('BeamRenderer.renderCrossSection called', { beam, x, y, scale });
    const graphics = this.scene.add.graphics();
    
    // Calculate dimensions
    const w = beam.flangeWidth * scale;
    const h = beam.depth * scale;
    const tf = beam.flangeThickness * scale;
    const tw = beam.webThickness * scale;
    
    // Draw filled I-beam shape
    graphics.fillStyle(this.BEAM_FILL);
    graphics.lineStyle(2, this.BEAM_STROKE);
    
    // Start path
    graphics.beginPath();
    
    // Top flange
    graphics.moveTo(x, y);
    graphics.lineTo(x + w, y);
    graphics.lineTo(x + w, y + tf);
    graphics.lineTo(x + (w + tw) / 2, y + tf);
    
    // Right web
    graphics.lineTo(x + (w + tw) / 2, y + h - tf);
    
    // Bottom flange  
    graphics.lineTo(x + w, y + h - tf);
    graphics.lineTo(x + w, y + h);
    graphics.lineTo(x, y + h);
    graphics.lineTo(x, y + h - tf);
    graphics.lineTo(x + (w - tw) / 2, y + h - tf);
    
    // Left web
    graphics.lineTo(x + (w - tw) / 2, y + tf);
    graphics.lineTo(x, y + tf);
    
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // Add dimensions
    this.addCrossSectionDimensions(beam, x, y, scale, container);
    
    container.add(graphics);
  }

  renderElevation(
    beam: BeamProperties,
    length: number,
    x: number,
    y: number,
    scale: number,
    container: Phaser.GameObjects.Container
  ) {
    console.log('BeamRenderer.renderElevation called', { beam, length, x, y, scale });
    const graphics = this.scene.add.graphics();
    
    // Calculate dimensions
    const w = length * scale;
    const h = beam.depth * scale;
    const tf = beam.flangeThickness * scale;
    
    // Draw beam rectangle with fill
    graphics.fillStyle(this.BEAM_FILL);
    graphics.lineStyle(2, this.BEAM_STROKE);
    graphics.fillRect(x, y, w, h);
    graphics.strokeRect(x, y, w, h);
    
    // Draw flange lines
    graphics.lineStyle(1.5, this.BEAM_STROKE);
    graphics.lineBetween(x, y + tf, x + w, y + tf);
    graphics.lineBetween(x, y + h - tf, x + w, y + h - tf);
    
    // Add dimensions
    this.addElevationDimensions(beam, length, x, y, scale, container);
    
    container.add(graphics);
  }

  private addCrossSectionDimensions(
    beam: BeamProperties,
    x: number,
    y: number,
    scale: number,
    container: Phaser.GameObjects.Container
  ) {
    const style = { 
      fontSize: '12px', 
      color: '#666666',
      fontFamily: 'Arial'
    };
    
    // Depth dimension (left side)
    const depthText = this.scene.add.text(
      x - 30,
      y + (beam.depth * scale) / 2,
      `${beam.depth}"`,
      style
    );
    depthText.setOrigin(0.5);
    container.add(depthText);
    
    // Flange width dimension (top)
    const widthText = this.scene.add.text(
      x + (beam.flangeWidth * scale) / 2,
      y - 20,
      `${beam.flangeWidth}"`,
      style
    );
    widthText.setOrigin(0.5);
    container.add(widthText);
    
    // Add dimension lines
    const dimGraphics = this.scene.add.graphics();
    dimGraphics.lineStyle(1, this.DIMENSION_COLOR);
    
    // Vertical dimension line
    dimGraphics.lineBetween(x - 20, y, x - 20, y + beam.depth * scale);
    
    // Horizontal dimension line
    dimGraphics.lineBetween(x, y - 10, x + beam.flangeWidth * scale, y - 10);
    
    container.add(dimGraphics);
  }

  private addElevationDimensions(
    beam: BeamProperties,
    length: number,
    x: number,
    y: number,
    scale: number,
    container: Phaser.GameObjects.Container
  ) {
    const style = { 
      fontSize: '12px', 
      color: '#666666',
      fontFamily: 'Arial'
    };
    
    // Length dimension markers every 12 inches
    const dimGraphics = this.scene.add.graphics();
    dimGraphics.lineStyle(1, this.DIMENSION_COLOR);
    
    for (let i = 0; i <= length; i += 12) {
      const xPos = x + i * scale;
      
      // Tick marks
      dimGraphics.lineBetween(xPos, y + beam.depth * scale + 5, xPos, y + beam.depth * scale + 15);
      
      // Labels
      if (i % 12 === 0) {
        const feet = i / 12;
        const label = feet === 0 ? "0'" : `${feet}'`;
        const text = this.scene.add.text(xPos, y + beam.depth * scale + 20, label, style);
        text.setOrigin(0.5, 0);
        container.add(text);
      }
    }
    
    // Horizontal dimension line
    dimGraphics.lineBetween(x, y + beam.depth * scale + 10, x + length * scale, y + beam.depth * scale + 10);
    
    container.add(dimGraphics);
  }
}
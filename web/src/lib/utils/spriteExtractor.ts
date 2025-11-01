import type { SpriteFrame } from './plistParser';

/**
 * Extracts a sprite from an atlas PNG based on frame data
 * Returns a data URL of the extracted sprite
 * When textureRotated is true, the sprite is stored vertically in the atlas
 */
export async function extractSpriteFromAtlas(
	atlasImageUrl: string,
	frame: SpriteFrame
): Promise<string> {
	// Fetch the atlas image
	const response = await fetch(atlasImageUrl);
	if (!response.ok) {
		throw new Error(`Failed to fetch atlas image: ${response.statusText}`);
	}

	const blob = await response.blob();
	const bitmap = await createImageBitmap(blob);

	const { textureRect, textureRotated, spriteOffset, spriteSize } = frame;

	// When rotated, the canvas dimensions are swapped
	const canvasWidth = textureRotated ? spriteSize.height : spriteSize.width;
	const canvasHeight = textureRotated ? spriteSize.width : spriteSize.height;

	// Create a canvas for the extracted sprite
	const canvas = new OffscreenCanvas(canvasWidth, canvasHeight);
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	// Save canvas state
	ctx.save();

	// Apply rotation if needed
	if (textureRotated) {
		// Debug log only for rotated sprites
		console.log(`[SpriteExtractor] ROTATED Sprite - extracting:`, {
			textureRotated,
			spriteSize,
			textureRect,
			spriteOffset,
			canvasWidth,
			canvasHeight,
			translation: `(0, ${spriteSize.width})`,
			rotation: `-90°`
		});
		
		// For rotated sprites: translate and rotate 90 degrees counter-clockwise
		ctx.translate(0, spriteSize.width);
		ctx.rotate((-Math.PI / 180) * 90);
	}

	// Draw the sprite from the atlas
	ctx.drawImage(
		bitmap,
		textureRect.x, // source x in atlas
		textureRect.y, // source y in atlas
		textureRect.width, // source width (original texture dimensions)
		textureRect.height, // source height (original texture dimensions)
		spriteOffset.x, // destination x
		spriteOffset.y, // destination y
		textureRect.width, // destination width
		textureRect.height // destination height
	);

	// Restore canvas state
	ctx.restore();

	// Convert canvas to blob and then to data URL
	const spriteBlob = await canvas.convertToBlob();
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(spriteBlob);
	});
}

/**
 * Extracts multiple sprites from an atlas
 */
export async function extractMultipleSprites(
	atlasImageUrl: string,
	frames: { [key: string]: SpriteFrame }
): Promise<{ [key: string]: string }> {
	const results: { [key: string]: string } = {};

	for (const [frameName, frame] of Object.entries(frames)) {
		try {
			results[frameName] = await extractSpriteFromAtlas(atlasImageUrl, frame);
		} catch (error) {
			console.error(`Failed to extract sprite ${frameName}:`, error);
		}
	}

	return results;
}

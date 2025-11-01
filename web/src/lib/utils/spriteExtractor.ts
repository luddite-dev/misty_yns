import type { SpriteFrame } from './plistParser';

/**
 * Extracts a sprite from an atlas PNG based on frame data
 * Returns a data URL of the extracted sprite
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

	// Create a canvas for the extracted sprite
	const canvas = new OffscreenCanvas(frame.spriteSize.width, frame.spriteSize.height);
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new Error('Failed to get canvas context');
	}

	const { textureRect, textureRotated, spriteOffset } = frame;

	// Save canvas state
	ctx.save();

	// Apply rotation if needed
	if (textureRotated) {
		// Rotate 90 degrees clockwise and translate to correct position
		ctx.translate(frame.spriteSize.width, 0);
		ctx.rotate((Math.PI / 180) * 90);
	}

	// Draw the sprite from the atlas
	ctx.drawImage(
		bitmap,
		textureRect.x, // source x
		textureRect.y, // source y
		textureRect.width, // source width
		textureRect.height, // source height
		spriteOffset.x, // destination x
		spriteOffset.y, // destination y
		textureRect.width, // destination width (before rotation adjustment)
		textureRect.height // destination height (before rotation adjustment)
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

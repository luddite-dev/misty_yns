#!/bin/bash

set -e

if [[ $# -lt 2 ]]; then
	echo "Usage: $0 <frame_id> <output_directory>"
	echo ""
	echo "Downloads Spine assets and audio files for a given frame ID."
	echo ""
	echo "Example: $0 10001 ./downloads"
	exit 1
fi

frame_id="$1"
output_dir="$2"

mkdir -p "$output_dir"

echo "Downloading assets for frame ID: $frame_id"
echo "Output directory: $output_dir"

# Extract path from frame ID (frameId[1:3] inclusive, which is positions 1-2 in 0-indexed)
frame_path="${frame_id:1:3}"

# Function to check if a number is even
is_even() {
	(($1 % 2 == 0))
}

# Download Spine assets
echo ""
echo "Downloading Spine assets..."
index=1
while true; do
	# Determine index suffix (even numbers get "m" suffix)
	if is_even "$index"; then
		index_str="${index}m"
	else
		index_str="$index"
	fi

	# Try both .png and .atlas and .skel extensions
	downloaded=false
	for ext in png skel atlas; do
		# Check if file already exists
		if [ -f "$output_dir/${index_str}.${ext}" ]; then
			echo "  ✓ Already exists ${index_str}.${ext}"
			downloaded=true
			continue
		fi
		
		url="https://assets4.mist-train-girls.com/production-client-web-assets/Spines/Stills/${frame_path}/${frame_id}/${index_str}.${ext}"

		response=$(curl -s -w "\n%{http_code}" -o "$output_dir/${index_str}.${ext}" "$url")
		http_code=$(echo "$response" | tail -n1)

		if [[ "$http_code" == "200" ]]; then
			echo "  ✓ Downloaded ${index_str}.${ext}"
			downloaded=true
		else
			rm -f "$output_dir/${index_str}.${ext}"
			
			# If 404, try with/without m suffix
			if [[ "$http_code" == "404" ]]; then
				# If current has "m", try without
				if [[ "$index_str" == *"m" ]]; then
					alt_index_str="${index_str%m}"
				else
					# If current doesn't have "m", try with
					alt_index_str="${index_str}m"
				fi
				
				# Check if alt file already exists
				if [ -f "$output_dir/${alt_index_str}.${ext}" ]; then
					echo "  ✓ Already exists ${alt_index_str}.${ext}"
					downloaded=true
					index_str="$alt_index_str"
					continue
				fi
				
				alt_url="https://assets4.mist-train-girls.com/production-client-web-assets/Spines/Stills/${frame_path}/${frame_id}/${alt_index_str}.${ext}"
				response=$(curl -s -w "\n%{http_code}" -o "$output_dir/${alt_index_str}.${ext}" "$alt_url")
				http_code=$(echo "$response" | tail -n1)
				
				if [[ "$http_code" == "200" ]]; then
					echo "  ✓ Downloaded ${alt_index_str}.${ext}"
					downloaded=true
					index_str="$alt_index_str"
				else
					rm -f "$output_dir/${alt_index_str}.${ext}"
				fi
			fi
		fi
	done

	# Stop if we got a 404 on all extensions and both suffix variants
	if [[ "$downloaded" == false ]]; then
		echo "  ✗ No files found for index $index (HTTP 404). Stopping."
		break
	fi

	((index++))
done

# Download audio files
echo ""
echo "Downloading audio files..."
frame_path_audio="${frame_id:1:-2}"
audio_index=1
while true; do
	audio_index_str=$(printf "%03d" "$audio_index")
	audio_file="$output_dir/s_${frame_id}_${audio_index_str}.mp3"
	
	# Check if file already exists
	if [ -f "$audio_file" ]; then
		echo "  ✓ Already exists s_${frame_id}_${audio_index_str}.mp3"
		((audio_index++))
		continue
	fi
	
	url="https://assets4.mist-train-girls.com/production-client-web-assets/Sounds/Voices/Scenarios/Stills/${frame_path_audio}/s_${frame_id}/s_${frame_id}_${audio_index_str}.mp3"

	response=$(curl -s -w "\n%{http_code}" -o "$audio_file" "$url")
	http_code=$(echo "$response" | tail -n1)

	if [[ "$http_code" == "200" ]]; then
		echo "  ✓ Downloaded s_${frame_id}_${audio_index_str}.mp3"
		((audio_index++))
	else
		rm -f "$audio_file"
		echo "  ✗ No audio file at index $audio_index_str (HTTP 404). Stopping."
		break
	fi
done

echo ""
echo "Download complete! Files saved to: $output_dir"
ls -lh "$output_dir"

# Generate config
echo ""
echo "Generating config.ini..."
config_file="$output_dir/config.ini"

{
	echo "; Spine Viewer Configuration"
	echo "; Format: sprite_name = atlas_file, skel_file, png_file"
	echo ""
	echo "[sprites]"

	for skel_file in "$output_dir"/*.skel; do
		if [ -f "$skel_file" ]; then
			base_name=$(basename "$skel_file" .skel)

			atlas_file="$output_dir/${base_name}.atlas"
			png_file="$output_dir/${base_name}.png"

			if [ -f "$atlas_file" ] && [ -f "$png_file" ]; then
				echo "$base_name = ${base_name}.atlas, ${base_name}.skel, ${base_name}.png"
			fi
		fi
	done
} >"$config_file"

echo "  ✓ Generated $config_file"
cat "$config_file"

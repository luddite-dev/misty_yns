# Mist Train Girls

## Mist Train Girls API Resources

### Character Data

#### Character IDs & Metadata

`https://assets4.mist-train-girls.com/production-client-web-static/MasterData/`

- MCharacterViewModel.json
- MSceneViewModel.json

#### Character Sprites (Spines)

**Standard Definition:**

```
https://assets4.mist-train-girls.com/production-client-web-assets/Spines/SDs/<CHARACTER_ID>/<CHARACTER_ID>.png
```

**Home/Menu:**

```
https://assets4.mist-train-girls.com/production-client-web-assets/Spines/Homes/<CHARACTER_ID>/<CHARACTER_ID>.png
```

#### Character Profiles

```
https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Characters/ScenarioPhrase/<CHARACTER_ID>.png
```

### World Assets

#### Backgrounds

```
https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Backgrounds/Adventure/<BACKGROUND_ID>.jpg
```

### Scenes

#### Scene Metadata

https://assets4.mist-train-girls.com/production-client-web-static/MasterData/MSceneViewModel.json

#### Normal Scenes

**Character Spines:**

```
https://assets4.mist-train-girls.com/production-client-web-assets/Spines/Events/<CHARACTER_ID>/<CHARACTER_ID>.{png,skel,atlas}
```

**Audio:**

```
https://assets4.mist-train-girls.com/production-client-web-assets/Sounds/Voices/Scenarios/Stills/<EVENT_ID>/c_<FRAME_ID>/c_<FRAME_ID>_<INDEX>.mp3
```

#### EX Scenes

You can find the list of scenes via

```
https://assets4.mist-train-girls.com/production-client-web-assets/Textures/Icons/Atlas/CharacterExScenario/characterExScenario-<INDEX>.{png, plist}
```

**Frame:** Contains scene ID. EVENT_ID = FRAME_ID[1:-2]

**Stills:**

```
https://assets4.mist-train-girls.com/production-client-web-assets/Spines/Stills/<FRAME_ID[1:3]>/<FRAME_ID>/<INDEX>.png
```

**Audio Prefix:** `s_` (with accompanying atlas and skel files)

```
https://assets4.mist-train-girls.com/production-client-web-assets/Sounds/Voices/Scenarios/Stills/<EVENT_ID>/s_<FRAME_ID>/s_<FRAME_ID>_<INDEX_001+>.mp3
```

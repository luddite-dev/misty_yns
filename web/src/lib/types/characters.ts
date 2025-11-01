// To parse this data:
//
//   import { Convert } from "./file";
//
//   const topLevel = Convert.toTopLevel(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface TopLevel {
    Id:                              number;
    Name:                            string;
    Description:                     null;
    CharacterType:                   number;
    MCharacterBaseId:                number;
    MCharacterBase:                  MCharacterBase;
    CharacterRarity:                 number;
    MCharacterRarity:                MCharacterRarity;
    LevelStatus:                     { [key: string]: number };
    AttributeResistGroup:            AttributeResistGroup;
    MSkill1Id:                       number;
    MSkill2Id:                       number;
    MSkill3Id:                       number;
    SpecialMSkillId:                 number | null;
    AbilityMSkill1Id:                number;
    AbilityMSkill2Id:                number;
    AbilityMSkill3Id:                number;
    StatusInflation:                 StatusGrowthLimit;
    RP:                              number;
    MCharacterStatusBonuses:         MCharacterRStatusBonus[];
    MCharacterGearStatusBonuses:     MCharacterRStatusBonus[];
    MCharacterScenes:                MCharacterScene[];
    ModelId:                         number;
    MEventAbilities:                 MEventAbility[];
    Greeting:                        string;
    ReplacementNormalAttackMSkillId: number | null;
    ExtraAbilityMSkill1Id:           number | null;
    ExtraAbilityMSkill2Id:           number | null;
    RankLimitUpSkill1No:             number | null;
    RankLimitUpSkill2No:             number | null;
    WeaponEquipType:                 number;
    StatusGrowthLimit:               StatusGrowthLimit;
    StartDate:                       Date;
    EndDate:                         Date;
}

export interface AttributeResistGroup {
    Blade:  number;
    Impact: number;
    Pierce: number;
    Fire:   number;
    Water:  number;
    Wind:   number;
    Light:  number;
    Dark:   number;
}

export interface MCharacterBase {
    Id:              number;
    Name:            string;
    Description:     null;
    InitialStatus:   StatusGrowthLimit;
    WeaponEquipType: number;
    AttributeType:   number;
    Country:         Country;
    BackImageUri:    BackImageURI;
    Birthday:        string;
    Profile:         string;
    Like:            string;
    DisLike:         string;
    CharacterSkill:  string;
    Pros:            string;
    Cons:            string;
    Race:            Race;
    Constellation:   Constellation;
    Hobby:           string;
    ModelId:         number;
    KanaReading:     string;
}

export enum BackImageURI {
    Eisenglat = "Eisenglat",
    Fraymarine = "Fraymarine",
    Fterabrucke = "Fterabrucke",
    Nishiki = "Nishiki",
    NordWeiss = "NordWeiss",
    Other = "Other",
    StIris = "StIris",
    Velfolet = "Velfolet",
}

export enum Constellation {
    Constellation = "",
    Empty = "-",
    かに座 = "かに座",
    みずがめ座 = "みずがめ座",
    不明 = "不明",
    乙女座 = "乙女座",
    双子座 = "双子座",
    天秤座 = "天秤座",
    射手座 = "射手座",
    山羊座 = "山羊座",
    水瓶座 = "水瓶座",
    牡牛座 = "牡牛座",
    牡羊座 = "牡羊座",
    獅子座 = "獅子座",
    蟹座 = "蟹座",
    蠍座 = "蠍座",
    非公開 = "非公開",
    魚座 = "魚座",
}

export enum Country {
    その他 = "その他",
    アイゼングラート = "アイゼングラート",
    セントイリス = "セントイリス",
    ニシキ = "ニシキ",
    ノールヴァイス = "ノールヴァイス",
    フテラブリュケ = "フテラブリュケ",
    フレイマリン = "フレイマリン",
    ヴェルフォレット = "ヴェルフォレット",
}

export interface StatusGrowthLimit {
    HP:           number;
    Strength:     number;
    Defence:      number;
    Dexterity:    number;
    Speed:        number;
    Intelligence: number;
    MindDefence:  number;
    Mind:         number;
    Luck:         number;
}

export enum Race {
    Empty = "-",
    Race = "",
    Race獣人 = "獣人 ",
    エルフ = "エルフ",
    ゴーレム = "ゴーレム",
    サキュバス = "サキュバス",
    シャナ族 = "シャナ族",
    ダークエルフ = "ダークエルフ",
    ハーフエルフ = "ハーフエルフ",
    ヘビ獣人 = "ヘビ獣人",
    レイルロオド = "レイルロオド",
    人間 = "人間",
    人間と霜の鬼神のハーフ = "人間と霜の鬼神のハーフ",
    悪魔 = "悪魔",
    獣人 = "獣人",
    竜族 = "竜族",
    花騎士 = "花騎士",
    非公開 = "非公開",
    鬼人 = "鬼人",
    魔族 = "魔族",
}

export interface MCharacterRStatusBonus {
    MCharacterId: number;
    Level:        number;
    StatusType:   number;
    Value:        number;
}

export interface MCharacterRarity {
    CharacterRarity:         number;
    MaxLevel:                number;
    LevelLimitBreakMaxLevel: number;
    PieceQuantity:           number;
}

export interface MCharacterScene {
    MCharacterId: number;
    KizunaRank:   number;
    MSceneId:     number;
}

export interface MEventAbility {
    Name:        Name;
    Description: string;
    Types:       any[];
}

export enum Name {
    期間限定ツナガルソラ霧の世界に縁は広がるⅰ = "【期間限定】ツナガルソラ～霧の世界に縁は広がる～Ⅰ",
    期間限定ツナガルソラ霧の世界に縁は広がるⅱ = "【期間限定】ツナガルソラ～霧の世界に縁は広がる～Ⅱ",
    期間限定ツナガルソラ霧の世界に縁は広がるⅲ = "【期間限定】ツナガルソラ～霧の世界に縁は広がる～Ⅲ",
    期間限定入隊訓練ケンジントンⅰ = "【期間限定】入隊訓練：ケンジントンⅠ",
    期間限定入隊訓練ケンジントンⅱ = "【期間限定】入隊訓練：ケンジントンⅡ",
    期間限定深き森のヌシ襲来 = "【期間限定】深き森のヌシ襲来",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
    public static toTopLevel(json: string): TopLevel[] {
        return cast(JSON.parse(json), a(r("TopLevel")));
    }

    public static topLevelToJson(value: TopLevel[]): string {
        return JSON.stringify(uncast(value, a(r("TopLevel"))), null, 2);
    }
}

function invalidValue(typ: any, val: any, key: any, parent: any = ''): never {
    const prettyTyp = prettyTypeName(typ);
    const parentText = parent ? ` on ${parent}` : '';
    const keyText = key ? ` for key "${key}"` : '';
    throw Error(`Invalid value${keyText}${parentText}. Expected ${prettyTyp} but got ${JSON.stringify(val)}`);
}

function prettyTypeName(typ: any): string {
    if (Array.isArray(typ)) {
        if (typ.length === 2 && typ[0] === undefined) {
            return `an optional ${prettyTypeName(typ[1])}`;
        } else {
            return `one of [${typ.map(a => { return prettyTypeName(a); }).join(", ")}]`;
        }
    } else if (typeof typ === "object" && typ.literal !== undefined) {
        return typ.literal;
    } else {
        return typeof typ;
    }
}

function jsonToJSProps(typ: any): any {
    if (typ.jsonToJS === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
        typ.jsonToJS = map;
    }
    return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
    if (typ.jsToJSON === undefined) {
        const map: any = {};
        typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
        typ.jsToJSON = map;
    }
    return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = '', parent: any = ''): any {
    function transformPrimitive(typ: string, val: any): any {
        if (typeof typ === typeof val) return val;
        return invalidValue(typ, val, key, parent);
    }

    function transformUnion(typs: any[], val: any): any {
        // val must validate against one typ in typs
        const l = typs.length;
        for (let i = 0; i < l; i++) {
            const typ = typs[i];
            try {
                return transform(val, typ, getProps);
            } catch (_) {}
        }
        return invalidValue(typs, val, key, parent);
    }

    function transformEnum(cases: string[], val: any): any {
        if (cases.indexOf(val) !== -1) return val;
        return invalidValue(cases.map(a => { return l(a); }), val, key, parent);
    }

    function transformArray(typ: any, val: any): any {
        // val must be an array with no invalid elements
        if (!Array.isArray(val)) return invalidValue(l("array"), val, key, parent);
        return val.map(el => transform(el, typ, getProps));
    }

    function transformDate(val: any): any {
        if (val === null) {
            return null;
        }
        const d = new Date(val);
        if (isNaN(d.valueOf())) {
            return invalidValue(l("Date"), val, key, parent);
        }
        return d;
    }

    function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
        if (val === null || typeof val !== "object" || Array.isArray(val)) {
            return invalidValue(l(ref || "object"), val, key, parent);
        }
        const result: any = {};
        Object.getOwnPropertyNames(props).forEach(key => {
            const prop = props[key];
            const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
            result[prop.key] = transform(v, prop.typ, getProps, key, ref);
        });
        Object.getOwnPropertyNames(val).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(props, key)) {
                result[key] = transform(val[key], additional, getProps, key, ref);
            }
        });
        return result;
    }

    if (typ === "any") return val;
    if (typ === null) {
        if (val === null) return val;
        return invalidValue(typ, val, key, parent);
    }
    if (typ === false) return invalidValue(typ, val, key, parent);
    let ref: any = undefined;
    while (typeof typ === "object" && typ.ref !== undefined) {
        ref = typ.ref;
        typ = typeMap[typ.ref];
    }
    if (Array.isArray(typ)) return transformEnum(typ, val);
    if (typeof typ === "object") {
        return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
            : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
            : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
            : invalidValue(typ, val, key, parent);
    }
    // Numbers can be parsed by Date but shouldn't be.
    if (typ === Date && typeof val !== "number") return transformDate(val);
    return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
    return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
    return transform(val, typ, jsToJSONProps);
}

function l(typ: any) {
    return { literal: typ };
}

function a(typ: any) {
    return { arrayItems: typ };
}

function u(...typs: any[]) {
    return { unionMembers: typs };
}

function o(props: any[], additional: any) {
    return { props, additional };
}

function m(additional: any) {
    return { props: [], additional };
}

function r(name: string) {
    return { ref: name };
}

const typeMap: any = {
    "TopLevel": o([
        { json: "Id", js: "Id", typ: 0 },
        { json: "Name", js: "Name", typ: "" },
        { json: "Description", js: "Description", typ: null },
        { json: "CharacterType", js: "CharacterType", typ: 0 },
        { json: "MCharacterBaseId", js: "MCharacterBaseId", typ: 0 },
        { json: "MCharacterBase", js: "MCharacterBase", typ: r("MCharacterBase") },
        { json: "CharacterRarity", js: "CharacterRarity", typ: 0 },
        { json: "MCharacterRarity", js: "MCharacterRarity", typ: r("MCharacterRarity") },
        { json: "LevelStatus", js: "LevelStatus", typ: m(0) },
        { json: "AttributeResistGroup", js: "AttributeResistGroup", typ: r("AttributeResistGroup") },
        { json: "MSkill1Id", js: "MSkill1Id", typ: 0 },
        { json: "MSkill2Id", js: "MSkill2Id", typ: 0 },
        { json: "MSkill3Id", js: "MSkill3Id", typ: 0 },
        { json: "SpecialMSkillId", js: "SpecialMSkillId", typ: u(0, null) },
        { json: "AbilityMSkill1Id", js: "AbilityMSkill1Id", typ: 0 },
        { json: "AbilityMSkill2Id", js: "AbilityMSkill2Id", typ: 0 },
        { json: "AbilityMSkill3Id", js: "AbilityMSkill3Id", typ: 0 },
        { json: "StatusInflation", js: "StatusInflation", typ: r("StatusGrowthLimit") },
        { json: "RP", js: "RP", typ: 0 },
        { json: "MCharacterStatusBonuses", js: "MCharacterStatusBonuses", typ: a(r("MCharacterRStatusBonus")) },
        { json: "MCharacterGearStatusBonuses", js: "MCharacterGearStatusBonuses", typ: a(r("MCharacterRStatusBonus")) },
        { json: "MCharacterScenes", js: "MCharacterScenes", typ: a(r("MCharacterScene")) },
        { json: "ModelId", js: "ModelId", typ: 0 },
        { json: "MEventAbilities", js: "MEventAbilities", typ: a(r("MEventAbility")) },
        { json: "Greeting", js: "Greeting", typ: "" },
        { json: "ReplacementNormalAttackMSkillId", js: "ReplacementNormalAttackMSkillId", typ: u(0, null) },
        { json: "ExtraAbilityMSkill1Id", js: "ExtraAbilityMSkill1Id", typ: u(0, null) },
        { json: "ExtraAbilityMSkill2Id", js: "ExtraAbilityMSkill2Id", typ: u(0, null) },
        { json: "RankLimitUpSkill1No", js: "RankLimitUpSkill1No", typ: u(0, null) },
        { json: "RankLimitUpSkill2No", js: "RankLimitUpSkill2No", typ: u(0, null) },
        { json: "WeaponEquipType", js: "WeaponEquipType", typ: 0 },
        { json: "StatusGrowthLimit", js: "StatusGrowthLimit", typ: r("StatusGrowthLimit") },
        { json: "StartDate", js: "StartDate", typ: Date },
        { json: "EndDate", js: "EndDate", typ: Date },
    ], false),
    "AttributeResistGroup": o([
        { json: "Blade", js: "Blade", typ: 0 },
        { json: "Impact", js: "Impact", typ: 0 },
        { json: "Pierce", js: "Pierce", typ: 0 },
        { json: "Fire", js: "Fire", typ: 0 },
        { json: "Water", js: "Water", typ: 0 },
        { json: "Wind", js: "Wind", typ: 0 },
        { json: "Light", js: "Light", typ: 0 },
        { json: "Dark", js: "Dark", typ: 0 },
    ], false),
    "MCharacterBase": o([
        { json: "Id", js: "Id", typ: 0 },
        { json: "Name", js: "Name", typ: "" },
        { json: "Description", js: "Description", typ: null },
        { json: "InitialStatus", js: "InitialStatus", typ: r("StatusGrowthLimit") },
        { json: "WeaponEquipType", js: "WeaponEquipType", typ: 0 },
        { json: "AttributeType", js: "AttributeType", typ: 0 },
        { json: "Country", js: "Country", typ: r("Country") },
        { json: "BackImageUri", js: "BackImageUri", typ: r("BackImageURI") },
        { json: "Birthday", js: "Birthday", typ: "" },
        { json: "Profile", js: "Profile", typ: "" },
        { json: "Like", js: "Like", typ: "" },
        { json: "DisLike", js: "DisLike", typ: "" },
        { json: "CharacterSkill", js: "CharacterSkill", typ: "" },
        { json: "Pros", js: "Pros", typ: "" },
        { json: "Cons", js: "Cons", typ: "" },
        { json: "Race", js: "Race", typ: r("Race") },
        { json: "Constellation", js: "Constellation", typ: r("Constellation") },
        { json: "Hobby", js: "Hobby", typ: "" },
        { json: "ModelId", js: "ModelId", typ: 0 },
        { json: "KanaReading", js: "KanaReading", typ: "" },
    ], false),
    "StatusGrowthLimit": o([
        { json: "HP", js: "HP", typ: 0 },
        { json: "Strength", js: "Strength", typ: 0 },
        { json: "Defence", js: "Defence", typ: 0 },
        { json: "Dexterity", js: "Dexterity", typ: 0 },
        { json: "Speed", js: "Speed", typ: 0 },
        { json: "Intelligence", js: "Intelligence", typ: 0 },
        { json: "MindDefence", js: "MindDefence", typ: 0 },
        { json: "Mind", js: "Mind", typ: 0 },
        { json: "Luck", js: "Luck", typ: 0 },
    ], false),
    "MCharacterRStatusBonus": o([
        { json: "MCharacterId", js: "MCharacterId", typ: 0 },
        { json: "Level", js: "Level", typ: 0 },
        { json: "StatusType", js: "StatusType", typ: 0 },
        { json: "Value", js: "Value", typ: 0 },
    ], false),
    "MCharacterRarity": o([
        { json: "CharacterRarity", js: "CharacterRarity", typ: 0 },
        { json: "MaxLevel", js: "MaxLevel", typ: 0 },
        { json: "LevelLimitBreakMaxLevel", js: "LevelLimitBreakMaxLevel", typ: 0 },
        { json: "PieceQuantity", js: "PieceQuantity", typ: 0 },
    ], false),
    "MCharacterScene": o([
        { json: "MCharacterId", js: "MCharacterId", typ: 0 },
        { json: "KizunaRank", js: "KizunaRank", typ: 0 },
        { json: "MSceneId", js: "MSceneId", typ: 0 },
    ], false),
    "MEventAbility": o([
        { json: "Name", js: "Name", typ: r("Name") },
        { json: "Description", js: "Description", typ: "" },
        { json: "Types", js: "Types", typ: a("any") },
    ], false),
    "BackImageURI": [
        "Eisenglat",
        "Fraymarine",
        "Fterabrucke",
        "Nishiki",
        "NordWeiss",
        "Other",
        "StIris",
        "Velfolet",
    ],
    "Constellation": [
        "",
        "-",
        "かに座",
        "みずがめ座",
        "不明",
        "乙女座",
        "双子座",
        "天秤座",
        "射手座",
        "山羊座",
        "水瓶座",
        "牡牛座",
        "牡羊座",
        "獅子座",
        "蟹座",
        "蠍座",
        "非公開",
        "魚座",
    ],
    "Country": [
        "その他",
        "アイゼングラート",
        "セントイリス",
        "ニシキ",
        "ノールヴァイス",
        "フテラブリュケ",
        "フレイマリン",
        "ヴェルフォレット",
    ],
    "Race": [
        "-",
        "",
        "獣人 ",
        "エルフ",
        "ゴーレム",
        "サキュバス",
        "シャナ族",
        "ダークエルフ",
        "ハーフエルフ",
        "ヘビ獣人",
        "レイルロオド",
        "人間",
        "人間と霜の鬼神のハーフ",
        "悪魔",
        "獣人",
        "竜族",
        "花騎士",
        "非公開",
        "鬼人",
        "魔族",
    ],
    "Name": [
        "【期間限定】ツナガルソラ～霧の世界に縁は広がる～Ⅰ",
        "【期間限定】ツナガルソラ～霧の世界に縁は広がる～Ⅱ",
        "【期間限定】ツナガルソラ～霧の世界に縁は広がる～Ⅲ",
        "【期間限定】入隊訓練：ケンジントンⅠ",
        "【期間限定】入隊訓練：ケンジントンⅡ",
        "【期間限定】深き森のヌシ襲来",
    ],
};

// To parse this data:
//
//   import { Convert } from "./file";
//
//   const topLevel = Convert.toTopLevel(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface TopLevel {
    Id:                     number;
    Title:                  string;
    IsAdult:                boolean;
    NextMSceneId:           number | null;
    SceneStartEffectType:   number;
    InboxPackageId:         null;
    SceneType:              number;
    MBattleSceneViewModel:  MBattleSceneViewModel | null;
    MAdultSceneCategoryId1: number | null;
    MAdultSceneCategoryId2: number | null;
    MAdultSceneCategoryId3: number | null;
}

export interface MBattleSceneViewModel {
    Id:                           number;
    MBattleSceneUnitViewModels:   MBattleSceneUnitViewModel[];
    MBattleSceneActionViewModels: { [key: string]: number | null }[];
    BattleBackgroundId:           number;
}

export interface MBattleSceneUnitViewModel {
    Id:                                   number;
    MCharacterId:                         number | null;
    MEnemyId:                             number | null;
    WaveNumber:                           number;
    X:                                    number;
    Y:                                    number;
    Z:                                    number;
    SlotNo:                               number | null;
    HP:                                   number;
    RP:                                   number;
    SP:                                   number;
    CP:                                   number;
    MSkillId1:                            number | null;
    MSkillId2:                            number | null;
    MSkillId3:                            number | null;
    AbilityMSkillId1:                     null;
    AbilityMSkillId2:                     null;
    AbilityMSkillId3:                     null;
    AttributeResistGroup:                 AttributeResistGroup;
    ConditionResistGroup:                 ConditionResistGroup;
    MBattleSceneCharacterSkillViewModels: MBattleSceneCharacterSkillViewModel[];
    NormalAttackMSkillId:                 number | null;
    IsBoss:                               boolean;
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

export interface ConditionResistGroup {
    Confusion: number;
    Paralysis: number;
    Poison:    number;
    Sleep:     number;
    Silent:    number;
    Stun:      number;
    Blind:     number;
    Charm:     number;
}

export interface MBattleSceneCharacterSkillViewModel {
    Id:         number;
    WaveNumber: number;
    TurnNumber: number;
    MSkillId:   number;
    SkillType:  number;
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
        { json: "Title", js: "Title", typ: "" },
        { json: "IsAdult", js: "IsAdult", typ: true },
        { json: "NextMSceneId", js: "NextMSceneId", typ: u(0, null) },
        { json: "SceneStartEffectType", js: "SceneStartEffectType", typ: 0 },
        { json: "InboxPackageId", js: "InboxPackageId", typ: null },
        { json: "SceneType", js: "SceneType", typ: 0 },
        { json: "MBattleSceneViewModel", js: "MBattleSceneViewModel", typ: u(r("MBattleSceneViewModel"), null) },
        { json: "MAdultSceneCategoryId1", js: "MAdultSceneCategoryId1", typ: u(0, null) },
        { json: "MAdultSceneCategoryId2", js: "MAdultSceneCategoryId2", typ: u(0, null) },
        { json: "MAdultSceneCategoryId3", js: "MAdultSceneCategoryId3", typ: u(0, null) },
    ], false),
    "MBattleSceneViewModel": o([
        { json: "Id", js: "Id", typ: 0 },
        { json: "MBattleSceneUnitViewModels", js: "MBattleSceneUnitViewModels", typ: a(r("MBattleSceneUnitViewModel")) },
        { json: "MBattleSceneActionViewModels", js: "MBattleSceneActionViewModels", typ: a(m(u(0, null))) },
        { json: "BattleBackgroundId", js: "BattleBackgroundId", typ: 0 },
    ], false),
    "MBattleSceneUnitViewModel": o([
        { json: "Id", js: "Id", typ: 0 },
        { json: "MCharacterId", js: "MCharacterId", typ: u(0, null) },
        { json: "MEnemyId", js: "MEnemyId", typ: u(0, null) },
        { json: "WaveNumber", js: "WaveNumber", typ: 0 },
        { json: "X", js: "X", typ: 0 },
        { json: "Y", js: "Y", typ: 0 },
        { json: "Z", js: "Z", typ: 0 },
        { json: "SlotNo", js: "SlotNo", typ: u(0, null) },
        { json: "HP", js: "HP", typ: 0 },
        { json: "RP", js: "RP", typ: 0 },
        { json: "SP", js: "SP", typ: 0 },
        { json: "CP", js: "CP", typ: 0 },
        { json: "MSkillId1", js: "MSkillId1", typ: u(0, null) },
        { json: "MSkillId2", js: "MSkillId2", typ: u(0, null) },
        { json: "MSkillId3", js: "MSkillId3", typ: u(0, null) },
        { json: "AbilityMSkillId1", js: "AbilityMSkillId1", typ: null },
        { json: "AbilityMSkillId2", js: "AbilityMSkillId2", typ: null },
        { json: "AbilityMSkillId3", js: "AbilityMSkillId3", typ: null },
        { json: "AttributeResistGroup", js: "AttributeResistGroup", typ: r("AttributeResistGroup") },
        { json: "ConditionResistGroup", js: "ConditionResistGroup", typ: r("ConditionResistGroup") },
        { json: "MBattleSceneCharacterSkillViewModels", js: "MBattleSceneCharacterSkillViewModels", typ: a(r("MBattleSceneCharacterSkillViewModel")) },
        { json: "NormalAttackMSkillId", js: "NormalAttackMSkillId", typ: u(0, null) },
        { json: "IsBoss", js: "IsBoss", typ: true },
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
    "ConditionResistGroup": o([
        { json: "Confusion", js: "Confusion", typ: 0 },
        { json: "Paralysis", js: "Paralysis", typ: 0 },
        { json: "Poison", js: "Poison", typ: 0 },
        { json: "Sleep", js: "Sleep", typ: 0 },
        { json: "Silent", js: "Silent", typ: 0 },
        { json: "Stun", js: "Stun", typ: 0 },
        { json: "Blind", js: "Blind", typ: 0 },
        { json: "Charm", js: "Charm", typ: 0 },
    ], false),
    "MBattleSceneCharacterSkillViewModel": o([
        { json: "Id", js: "Id", typ: 0 },
        { json: "WaveNumber", js: "WaveNumber", typ: 0 },
        { json: "TurnNumber", js: "TurnNumber", typ: 0 },
        { json: "MSkillId", js: "MSkillId", typ: 0 },
        { json: "SkillType", js: "SkillType", typ: 0 },
    ], false),
};

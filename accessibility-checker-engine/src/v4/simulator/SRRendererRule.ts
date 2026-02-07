import { SRCursor } from "./SRCursor";
import { NavigationMode } from "./SRTypes";

export class SRRendererRule {
    constructor(private ruleDefinition: {
        modes: NavigationMode[],
        roles: string[],
        elems: string[],
        tests: Array<(cursor: SRCursor, oldCursor?: SRCursor) => string | null>
    }) {

    }

    public test(mode: NavigationMode, cursor: SRCursor, oldCursor?: SRCursor): string | null {
        if (this.ruleDefinition.modes.includes(mode)
            && (
                this.ruleDefinition.roles.includes(cursor.getRole())
                || this.ruleDefinition.elems.includes(cursor.getNode().nodeName.toUpperCase())
            )
        ) {
            for (const test of this.ruleDefinition.tests) {
                let s = test(cursor, oldCursor);
                if (typeof s === "string") return s;
            }
        }
        return null;
    }
}
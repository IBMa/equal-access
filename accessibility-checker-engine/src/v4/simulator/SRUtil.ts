import { AriaUtil } from "../util/AriaUtil";
import { VisUtil } from "../util/VisUtil";

export namespace SRUtil {
    export function isModalDialogElement(node: Node) {
        if (node.nodeType !== 1) return false;
        const elem = node as HTMLElement;
        const role = AriaUtil.getResolvedRole(elem, true);
        return role === "dialog" && elem.getAttribute("aria-modal") === "true" && VisUtil.isNodeVisible(node)
    }
}
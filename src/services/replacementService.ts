import { CreateReplacementProps, ChangedLine } from "./../types/types";
import { Replacement } from "../types/types";

const handleLine = (
    props: CreateReplacementProps,
    replacements: Replacement[],
    changedLines: ChangedLine[]
) => {
    const {
        filePath,
        isLine,
        line,
        lineNumber,
        newValue,
        oldValue,
        replaceSetting
    } = props;

    if (line === null || lineNumber === null) {
        throw new Error("Line and line number must be provided");
    }

    const changedLine = changedLines.find(
        (l) => l.lineNumber === lineNumber && l.filePath === filePath
    );

    let alreadyModifiedValue = null;
    if (changedLine) {
        alreadyModifiedValue = changedLine.value;
        changedLines = changedLines.filter((i) => i !== changedLine);
    }

    const replaceWhole = replaceSetting === "replaceWhole";
    if (replaceWhole) {
        changedLines.push({
            value: newValue,
            lineNumber,
            filePath
        });

        replacements.push({
            oldValue: alreadyModifiedValue ?? line,
            newValue,
            filePath,
            isLine,
            lineNumber,
            replaceSetting
        });

        return;
    }

    let newLineValue = null;
    const replaceAll = replaceSetting === "replaceAll";
    if (alreadyModifiedValue) {
        newLineValue = replaceAll
            ? alreadyModifiedValue.replaceAll(oldValue, newValue)
            : alreadyModifiedValue.replace(oldValue, newValue);
    } else {
        newLineValue = replaceAll
            ? line.replaceAll(oldValue, newValue)
            : line.replace(oldValue, newValue);
    }

    changedLines.push({
        value: newLineValue,
        lineNumber,
        filePath
    });

    replacements.push({
        oldValue: alreadyModifiedValue ?? line,
        newValue: newLineValue,
        filePath,
        isLine,
        lineNumber,
        replaceSetting
    });
};

const createReplacementFunction = (replacements: Replacement[]) => {
    const changedLines: ChangedLine[] = [];

    const createReplacement = (props: CreateReplacementProps) => {
        const {
            isLine,
            line,
            lineNumber,
            filePath,
            oldValue,
            newValue,
            replaceSetting
        } = props;

        if (isLine) {
            if (line === null || lineNumber === null) {
                throw new Error(
                    "Line or line number is null: " + { line, lineNumber }
                );
            }

            handleLine(props, replacements, changedLines);
        } else {
            if (replaceSetting === "replaceWhole") {
                throw new Error("Not implemented: replaceWhole for file");
            }

            replacements.push({
                oldValue,
                newValue,
                filePath,
                isLine,
                lineNumber,
                replaceSetting
            });
        }
    };
    return createReplacement;
};
export const replacementService = { createReplacementFunction };

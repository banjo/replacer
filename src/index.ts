import {
    ChangedLine,
    CreateReplacementProps,
    HandleFilesCallback,
    HandleLinesCallback,
    Replacement,
    ReplaceProps
} from "./types/types";
import { fileService } from "./services/fileService";

export const replacer = async (files: string[]) => {
    const fetchedFiles = await fileService.findFiles(files);
    if (fetchedFiles.length === 0) throw new Error("No files found");

    const replacements: Replacement[] = [];

    let changedLines: ChangedLine[] = [];
    const createReplacement = ({
        oldValue,
        newValue,
        filePath,
        isLine,
        lineNumber = null,
        replaceSetting = "replace",
        line = null
    }: CreateReplacementProps) => {
        if (isLine) {
            if (line === null || lineNumber === null) {
                throw new Error(
                    "Line or line number is null: " + { line, lineNumber }
                );
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

    const replaceWhole =
        ({
            filePath,
            line = null,
            lineNumber = null,
            replaceSetting = "replaceWhole"
        }: ReplaceProps) =>
        (newValue: string) => {
            createReplacement({
                oldValue: "",
                newValue,
                filePath,
                isLine: line ? true : false,
                lineNumber,
                line,
                replaceSetting
            });
        };

    const replace =
        ({
            filePath,
            line = null,
            lineNumber = null,
            replaceSetting = "replace"
        }: ReplaceProps) =>
        (oldValue: string, newValue: string) => {
            if (line !== null) {
                if (!line.includes(oldValue)) return;

                createReplacement({
                    oldValue,
                    newValue,
                    filePath,
                    isLine: true,
                    lineNumber,
                    line,
                    replaceSetting
                });
            } else {
                createReplacement({
                    oldValue,
                    newValue,
                    filePath,
                    isLine: false,
                    lineNumber,
                    line,
                    replaceSetting
                });
            }
        };

    const handleFiles = async (callback: HandleFilesCallback) => {
        for (const filePath of fetchedFiles) {
            const output = await fileService.readFile(filePath);
            callback({
                output,
                filePath,
                replace: replace({ filePath } as ReplaceProps),
                replaceAll: replace({
                    filePath,
                    replaceSetting: "replaceAll"
                } as ReplaceProps)
            });
        }
    };

    const handleLines = async (callback: HandleLinesCallback) => {
        for (const filePath of fetchedFiles) {
            const output = await fileService.readFile(filePath);

            const lines = output.split("\n");
            let lineNumber = 1;
            for (const line of lines) {
                callback({
                    line: line,
                    lineNumber,
                    replace: replace({
                        line,
                        filePath,
                        lineNumber,
                        replaceSetting: "replace"
                    }),
                    replaceAll: replace({
                        line,
                        filePath,
                        lineNumber,
                        replaceSetting: "replaceAll"
                    }),
                    replaceLine: replaceWhole({
                        line,
                        lineNumber,
                        filePath,
                        replaceSetting: "replaceWhole"
                    } as ReplaceProps)
                });
                lineNumber++;
            }
        }
    };

    const commit = async () => {
        for (const filePath of fetchedFiles) {
            const output = await fileService.readFile(filePath);

            const replacementsForFile = replacements.filter(
                (r) => r.filePath === filePath
            );

            const replacementsForFileOnly: Replacement[] = [];
            const replacementsForLineOnly: Replacement[] = [];
            replacementsForFile.forEach((r) => {
                if (r.isLine) {
                    replacementsForLineOnly.push(r);
                } else {
                    replacementsForFileOnly.push(r);
                }
            });

            if (
                replacementsForFileOnly.length > 0 &&
                replacementsForLineOnly.length > 0
            ) {
                throw new Error(
                    "Cannot have both line and file replacements in one commit. If you want to replace whole file, use handleFiles instead of handleLines."
                );
            }

            const selectedReplacements =
                replacementsForFileOnly.length > 0
                    ? replacementsForFileOnly
                    : replacementsForLineOnly;

            let newOutput = output;
            for (const replacement of selectedReplacements) {
                if (replacement.isLine) {
                    newOutput = newOutput.replace(
                        replacement.oldValue,
                        replacement.newValue
                    );
                } else {
                    const replaceAll =
                        replacement.replaceSetting === "replaceAll";

                    newOutput = replaceAll
                        ? newOutput.replaceAll(
                              replacement.oldValue,
                              replacement.newValue
                          )
                        : newOutput.replace(
                              replacement.oldValue,
                              replacement.newValue
                          );
                }
            }

            await fileService.writeFile(filePath, newOutput);
        }
    };

    return { handleFiles, handleLines, files: fetchedFiles, commit };
};

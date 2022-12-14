import {
    ChangedLine,
    HandleFilesCallback,
    HandleLinesCallback,
    Replacement,
    ReplaceProps
} from "./types/types";
import { fileService } from "./services/fileService";
import { replacementService } from "./services/replacementService";

export const replacer = async (files: string[]) => {
    const fetchedFiles = await fileService.findFiles(files);
    if (fetchedFiles.length === 0) throw new Error("No files found");

    const replacements: Replacement[] = [];

    const createReplacement =
        replacementService.createReplacementFunction(replacements);

    const replaceWhole = (props: ReplaceProps) => (newValue: string) => {
        createReplacement({
            oldValue: "",
            newValue,
            filePath: props.filePath,
            isLine: props.line ? true : false,
            lineNumber: props.lineNumber,
            line: props.line,
            replaceSetting: props.replaceSetting
        });
    };

    const replace =
        (props: ReplaceProps) => (oldValue: string, newValue: string) => {
            const isLine = props.line !== null && props.lineNumber !== null;
            if (isLine && !props.line?.includes(oldValue)) return;

            createReplacement({ ...props, isLine, oldValue, newValue });
        };

    const handleFiles = async (callback: HandleFilesCallback) => {
        for (const filePath of fetchedFiles) {
            const output = await fileService.readFile(filePath);
            callback({
                output,
                filePath,
                replace: replace({
                    filePath,
                    line: null,
                    lineNumber: null,
                    replaceSetting: "replace"
                } as ReplaceProps),
                replaceAll: replace({
                    filePath,
                    line: null,
                    lineNumber: null,
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

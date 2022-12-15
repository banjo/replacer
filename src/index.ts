import {
    HandleFilesCallback,
    HandleLinesCallback,
    Replacement,
    ReplaceProps
} from "./types/types";
import { fileService } from "./services/fileService";
import { replacementService } from "./services/replacementService";
import { saveService } from "./services/saveService";

export const replacer = async (files: string[]) => {
    const fetchedFiles = await fileService.findFiles(files);
    if (fetchedFiles.length === 0) throw new Error("No files found");

    const replacements: Replacement[] = [];

    const createReplacement =
        replacementService.createReplacementFunction(replacements);

    const replaceWhole =
        replacementService.createReplaceWholeFunction(createReplacement);
    const replace = replacementService.createReplaceFunction(createReplacement);

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
                    filePath,
                    output,
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
    const commit = saveService.createCommitFunction(fetchedFiles, replacements);

    return { handleFiles, handleLines, files: fetchedFiles, commit };
};

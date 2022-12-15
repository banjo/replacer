import { Replacement } from "../types/types";
import { fileService } from "./fileService";

const createCommitFunction =
    (fetchedFiles: string[], replacements: Replacement[]) => async () => {
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

export const saveService = { createCommitFunction };

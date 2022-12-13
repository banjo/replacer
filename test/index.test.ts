import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { replacer } from "../src";
import { fileService } from "../src/services/fileService";

const ORIGINAL_TEXT = `first line
second one (second)
third line
fourth and still going`;

const FILE_NAME = "test";

const timeout = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));

describe("functionality tests", () => {
    let returnOutput: string | null = null;
    beforeEach(() => {
        fileService.readFile = vi.fn(() => Promise.resolve(ORIGINAL_TEXT));
        fileService.findFiles = vi.fn(() => Promise.resolve([FILE_NAME]));
        fileService.writeFile = vi.fn((filePath, output) => {
            returnOutput = output;
            return Promise.resolve();
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });
    it("should crash if no files are found", async () => {
        fileService.findFiles = vi.fn(() => Promise.resolve([]));
        expect(replacer([FILE_NAME])).rejects.toThrow("No files found");
    });

    it("should crash on line and file modification", async () => {
        const { handleLines, commit, handleFiles } = await replacer([
            FILE_NAME
        ]);
        handleLines(({ replace }) => {
            replace("first", "FIRST");
        });

        handleFiles(({ replace }) => {
            replace("first", "FIRST");
        });

        await expect(commit()).rejects.toThrow();
    });
});

describe("basic replace tests", () => {
    let returnOutput: string | null = null;
    beforeEach(() => {
        fileService.readFile = vi.fn(() => Promise.resolve(ORIGINAL_TEXT));
        fileService.findFiles = vi.fn(() => Promise.resolve([FILE_NAME]));
        fileService.writeFile = vi.fn((filePath, output) => {
            returnOutput = output;
            return Promise.resolve();
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("line", () => {
        it("should replace a word", async () => {
            const oldValue = "first";
            const newValue = oldValue.toUpperCase();

            const { handleLines, commit } = await replacer([FILE_NAME]);
            handleLines(({ replace }) => {
                replace(oldValue, newValue);
            });

            await commit();
            await timeout();

            expect(returnOutput).toBeTruthy();
            expect(returnOutput).toBe(
                ORIGINAL_TEXT.replace(oldValue, newValue)
            );
        });

        it("should replace word on second line", async () => {
            const oldValue = "second";
            const newValue = oldValue.toUpperCase();

            const { handleLines, commit } = await replacer([FILE_NAME]);
            handleLines(({ replace, lineNumber }) => {
                if (lineNumber === 2) {
                    replace(oldValue, newValue);
                }
            });

            await commit();
            await timeout();

            expect(returnOutput).toBeTruthy();
            expect(returnOutput).toBe(
                ORIGINAL_TEXT.replace(oldValue, newValue)
            );
        });

        it("should replace multiple words in a single line", async () => {
            const oldValue = "first";
            const newValue = oldValue.toUpperCase();

            const oldValue2 = "line";
            const newValue2 = oldValue2.toUpperCase();

            const { handleLines, commit } = await replacer([FILE_NAME]);
            handleLines(({ replace }) => {
                replace(oldValue, newValue);
                replace(oldValue2, newValue2);
            });

            await commit();
            await timeout();

            expect(returnOutput).toBeTruthy();
            expect(returnOutput).toBe(
                ORIGINAL_TEXT.replace(oldValue, newValue).replaceAll(
                    oldValue2,
                    newValue2
                )
            );
        });

        it("should replaceAll on a single line", async () => {
            const oldValue = "second";
            const newValue = oldValue.toUpperCase();

            const { handleLines, commit } = await replacer([FILE_NAME]);
            handleLines(({ replaceAll, line }) => {
                if (line.includes(oldValue)) {
                    replaceAll(oldValue, newValue);
                }
            });

            await commit();
            await timeout();

            expect(returnOutput).toBeTruthy();
            expect(returnOutput).toBe(
                ORIGINAL_TEXT.replaceAll(oldValue, newValue)
            );
        });
    });

    describe("file", async () => {
        it("should replace a word", async () => {
            const oldValue = "first";
            const newValue = oldValue.toUpperCase();

            const { handleFiles, commit } = await replacer([FILE_NAME]);
            handleFiles(({ replace }) => {
                replace(oldValue, newValue);
            });

            await commit();
            await timeout();

            expect(returnOutput).toBeTruthy();
            expect(returnOutput).toBe(
                ORIGINAL_TEXT.replace(oldValue, newValue)
            );
        });

        it("should replace all words", async () => {
            const oldValue = "second";
            const newValue = oldValue.toUpperCase();

            const { handleFiles, commit } = await replacer([FILE_NAME]);
            handleFiles(({ replaceAll }) => {
                replaceAll(oldValue, newValue);
            });

            await commit();
            await timeout();

            expect(returnOutput).toBeTruthy();
            expect(returnOutput).toBe(
                ORIGINAL_TEXT.replaceAll(oldValue, newValue)
            );
        });

        it("should replace multiple times", async () => {
            const oldValue = "second";
            const newValue = oldValue.toUpperCase();

            const oldValue2 = "line";
            const newValue2 = oldValue2.toUpperCase();

            const { handleFiles, commit } = await replacer([FILE_NAME]);
            handleFiles(({ replace }) => {
                replace(oldValue, newValue);
                replace(oldValue2, newValue2);
            });

            await commit();
            await timeout();

            expect(returnOutput).toBeTruthy();
            expect(returnOutput).toBe(
                ORIGINAL_TEXT.replace(oldValue, newValue).replace(
                    oldValue2,
                    newValue2
                )
            );
        });
    });
});

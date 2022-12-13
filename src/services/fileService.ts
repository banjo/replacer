import { promises as fs } from "fs";
import { globby } from "globby";

const findFiles = async (files: string[]) => {
    try {
        return await globby(files);
    } catch (error) {
        throw new Error("No files found");
    }
};

const readFile = async (filePath: string): Promise<string> => {
    try {
        return await fs.readFile(filePath, "utf8");
    } catch (error) {
        throw new Error(`Could not read file: ${filePath}`);
    }
};

const writeFile = async (filePath: string, output: string): Promise<void> => {
    try {
        await fs.writeFile(filePath, output);
    } catch (error) {
        throw new Error(`Could not write file: ${filePath}`);
    }
};

export const fileService = { readFile, writeFile, findFiles };

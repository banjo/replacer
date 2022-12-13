export type Replacement = {
    oldValue: string;
    newValue: string;
    filePath: string;
    isLine: boolean;
    lineNumber: number | null;
    replaceSetting: ReplaceSetting;
};

type ReplaceSetting = "replace" | "replaceAll" | "replaceLine" | "replaceFile";

export type CreateReplacementProps = {
    oldValue: string;
    newValue: string;
    filePath: string;
    isLine: boolean;
    lineNumber: number | null;
    replaceSetting: ReplaceSetting;
    line: string | null;
};

export type ReplaceProps = {
    filePath: string;
    line: string | null;
    lineNumber: number | null;
    replaceSetting: ReplaceSetting;
};

export type ChangedLine = {
    value: string;
    lineNumber: number;
    filePath: string;
};

export type ReplaceCallback = (oldValue: string, newValue: string) => void;

type LineCallbackProps = {
    line: string;
    lineNumber: number;
    replace: ReplaceCallback;
    replaceAll: ReplaceCallback;
};
export type HandleLinesCallback = (props: LineCallbackProps) => void;

type FileCallbackProps = {
    output: string;
    filePath: string;
    replace: ReplaceCallback;
    replaceAll: ReplaceCallback;
};

export type HandleFilesCallback = (props: FileCallbackProps) => void;

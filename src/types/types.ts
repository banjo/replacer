export type Replacement = {
    oldValue: string;
    newValue: string;
    filePath: string;
    isLine: boolean;
    lineNumber: number | null;
    replaceAll: boolean;
};

export type CreateReplacementProps = {
    oldValue: string;
    newValue: string;
    filePath: string;
    isLine: boolean;
    lineNumber: number | null;
    replaceAll: boolean;
    line: string | null;
};

export type ReplaceProps = {
    filePath: string;
    line: string | null;
    lineNumber: number | null;
    replaceAll: boolean;
};

export type ChangedLine = {
    value: string;
    lineNumber: number;
    filePath: string;
};

export type ReplaceCallback = (oldValue: string, newValue: string) => void;

type LineCallbackProps = {
    line: string;
    replace: ReplaceCallback;
    replaceAll: ReplaceCallback;
};
export type HandleLinesCallback = (props: LineCallbackProps) => void;

export type HandleFilesCallback = (
    output: string,
    filePath: string,
    replace: ReplaceCallback,
    replaceAll: ReplaceCallback
) => void;

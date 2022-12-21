# replacer

Simple API to replace text in multiple text files.

* Using globby to find files
* Edit by full file output
* Edit by line
* Overwrites to file when the changes are commited.

## Get started

```ts
npm i @banjoanton/replacer
```

```ts
import { replacer } from "@banjoanton/replacer";

const { handleFiles, handleLines, commit } = await replacer(["/path/to/file", "/path/to/another/file"]);

// loop through each file
handleFiles(({ replace, replaceAll, output, filePath }) => {
    console.log(output);        // file output
    console.log(filePath);      // file path

    replace("oldValue", "newValue");        // replace first occurrence
    replaceAll("oldValue", "newValue")      // replace all occurrences 
});

handleLines(({replace, replaceAll, replaceWhole, output, filePath, line, lineNumber}) => {
    console.log(output);        // file output
    console.log(filePath);      // file path
    console.log(line);          // line content
    console.log(lineNumber);    // line number

    replace("oldValue", "newValue");        // replace first occurrence
    replaceAll("oldValue", "newValue")      // replace all occurrences  
    replaceWhole("newValue")                // replace whole line  
})

await commit(); // commit all changes to file
```
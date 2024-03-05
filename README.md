## Important Files:

tokenizee.py - script to generate 1) a summary of the medical progress note, 2) a set of claims in the summary, and 3) a mapping of claims in the summary to evidence in the medical note. Also processes the GPT outputs and adds them to the appropriate json/txt files

trace-text/ehr1.txt - the medical progress note

trace-text/ehr1-interp.txt - the summary

trace-text/ehr1-dict.json - the mapping of claims to references/evidence

trace-text/TextDisplay.js - main “traceable text” file: loads ehr1.txt and ehr1-interp.txt, handles phrase linking, logs mouse position data

training-PHI-Gold-Set1 - set of medical progress notes from n2c2 dataset



## How to start:

`npm install`
(might have to remove the node_modules directory first)
Run `npm audit fix` if needed
`npm start`

Open http://localhost:3000 to view it in the browser



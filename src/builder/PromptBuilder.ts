let {CUSTOM_PROMPT} = process.env as {CUSTOM_PROMPT : string};

export const promptStem = `
Please answer the following question with JSON in the format [{}] of {"status" : boolean, "message" : string}. Where Status is a true if the message is concerning or false if there is nothing to worry about, and the message is the response to the following question:
${CUSTOM_PROMPT}

please keep "message" in response to below 256 characters

`
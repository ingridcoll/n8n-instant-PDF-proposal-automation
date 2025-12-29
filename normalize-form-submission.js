//Used in node 1) Clean Up Form Submission
//Cleans and standardizes the form submission data to ensure consistent formatting for various input types
const rawSubmission = $("Tally Forms Webhook").first();

//Grab fields to target form responses
const fields = rawSubmission?.json?.body?.data?.fields ?? [];

//Rename map to tie question key to actual name
const FIELD_NAME_MAP = {
  question_J6lyW7: "firstName",
  question_g0qBkK: "lastName",
  question_7WKG1A: "clientEmail",
  question_y64OdW: "companyName",
  question_487god: "website",
  question_XDoj2V: "industry",
  question_8KL9Mo: "companySize",
  question_0x84aQ: "servicesRequested",
  question_zqMVLE: "deploymentModel",
  question_5z9NMb: "requiresIntegrations",
  question_d607vN: "complianceSupport",
  question_YQG2k0: "numberOfEndpoints",
  question_DNpLMp: "supportLevel"
};

//To store the output
let cleanSubmission = {};

for (const field of fields) {
  const originalKey = field.key || field.label;
  //Replace question key with actual name
  const key = FIELD_NAME_MAP[originalKey] || originalKey;

  //Checks if question is a dropdown, multi choice, checkboxes
  if (Array.isArray(field.options) && Array.isArray(field.value)) {
    //Finds the selected value by targeting the object with an ID
    const selected = field.options
      .filter(o => field.value.includes(o.id))
      .map(o => o.text);

    //Stores selected option for that field
    cleanSubmission[key] = selected.length === 1 ? selected[0] : selected;
    continue;
  }

  //Handles input fields
  if (field.type?.startsWith("INPUT")) {
    cleanSubmission[key] = field.value ?? null;
    continue;
  }

  //Handles anything else
  cleanSubmission[key] = field.value ?? null;
}


//Grabs submission metadata
cleanSubmission.metadata = {};
cleanSubmission.metadata.source = "Tally";
cleanSubmission.metadata.formId = rawSubmission?.json?.body?.data?.formId;
cleanSubmission.metadata.formName = rawSubmission?.json?.body?.data?.formName;
cleanSubmission.metadata.submittedAt = rawSubmission?.json?.body?.data?.createdAt;
cleanSubmission.metadata.submissionId = rawSubmission?.json?.body?.data?.submissionId;
cleanSubmission.metadata.respondentId = rawSubmission?.json?.body?.data?.respondentId;

//Return clean form data and metadata
return {
  json: cleanSubmission
};

# Instant Personalized PDF Proposal Automation with n8n
### Form Submission to Fully Automated & Personalized Proposal
Technologies used: 
- *Tally Forms* as the intake form service 
- *JavaScript* for data parsing, normalization, and cost calculations
- *Google Docs & Google Drive* for proposal template duplication and dynamic population
- *Notion* as the centralized database
- *AI Agent/Google Gemini* for personalized email generation
- *Gmail* for automated delivery of the proposal with PDF attachment
- *HubSpot* as the CRM
- *Slack* for internal notifications for proposal delivery or errors

This automation transforms a simple inbound form submission into a fully personalized proposal, complete with accurate pricing, service details, and client-specific messaging, all without _any_ manual effort. By integrating the APIs for the CRM, Notion, Google Docs, and Google Gemini, teams can instantly deliver polished proposals to prospects, speeding up sales cycles and improving client engagement.

This automation was created by *Ingrid Coll*. See my other projects on GitHub at [github.com/ingridcoll](https://github.com/ingridcoll) or send me a LinkedIn message at [linkedin.com/in/ingridcoll](https://www.linkedin.com/in/ingridcoll/) with any questions or business inquiries!

## This workflow handles everything from lead submission to proposal delivery:
- Captures and cleans form submission data
- Retrieves and parses service pricing from Notion
- Calculates total cost including endpoints, deployment, support, and fees
- Duplicates a Google Docs proposal template and replaces placeholders with client-specific data
- Generates a polished, personalized email body using AI
- Exports the proposal as a PDF and emails it to the lead
- Checks and updates HubSpot CRM records
- Sends real-time Slack notifications to internal teams

<img width="616" height="517" alt="image" src="https://github.com/user-attachments/assets/19dd91dd-d6a2-4640-b6b1-e455fadaa9c2" />
<img width="743" height="512" alt="image" src="https://github.com/user-attachments/assets/de46f32a-ae86-4e0b-92d2-ffa663b40663" />
<img width="973" height="513" alt="image" src="https://github.com/user-attachments/assets/5bced197-3295-4ff2-a797-b87cefc90cb3" />

### With this automation, sales teams can provide instant, fully customized proposals, improving efficiency, reducing turnaround time, and enhancing the client experience.
#### Sample Email Output:
*(Names have been modified for anonymity purposes)*

*Attachments*: Cyberfast_Proposal_for_Mary_Hernandez_12-29-2025.pdf

*Subject*: Cyberfast can help University Of Barcelona (Proposal Attached)!

Mary,

Recognizing the unique cybersecurity challenges University Of Barcelona faces in the Education sector, particularly concerning Threat Detection & Response, Data Encryption & Protection, and Compliance Management, Cyberfast provides a robust platform to address these head-on. We'd value the opportunity to illustrate how our solution directly strengthens your defenses and supports your operational goals during a brief, personalized demo call.

You can schedule your free 30-minute call with us here: calendly.com/cyberfast
Let us know if you have any questions!

Stay safe,

The Cyberfast Team

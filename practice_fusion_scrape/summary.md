# Practice Fusion EHR — Layout Scrape

Generated: 2026-07-13T05:44:46.197909+00:00

## Files
- Scrape log: `practice_fusion_scrape/scrape_log.jsonl`
- Layout JSON: `practice_fusion_scrape/layouts`
- Screenshots: `practice_fusion_scrape/screenshots`

## Agent notes (per step)

# Final agent summary

I'll systematically explore the Practice Fusion EHR website, documenting each screen in detail. Let me start by taking a screenshot to see the current state.

I can see the Practice Fusion dashboard. Let me document what I see and continue exploring. Let me first scroll down to see the full dashboard, then explore each section.

Good, I can see more dashboard cards. Let me scroll back up and start exploring the left sidebar navigation items systematically. Let me click on "Schedule" in the left nav.

Good, I'm back at the top. Now let me click on "Schedule" in the left sidebar.

I can see the Schedule page. Let me wait for it to load and then take a screenshot.

The Schedule page has loaded. Let me explore the sidebar filter options and then try the Week view. Let me click on "Week" tab.

Excellent! I can see the Week view of the Schedule. Let me now click "Add appointment" button to see the appointment creation flow.

Excellent! A "New appointment" modal has appeared. Let me document this carefully. I can see it has three tabs: "With patient", "Block time", "Block range". Let me scroll down to see if there's more content and also check the "Block time" tab.

I can see the "Block time" tab content. Now let me check the "Block range" tab.

I can see the "Block range" tab. Now let me close this modal and explore the Charts section to find patient charts.

Good. Let me now explore the Schedule Settings tab and the filter sidebar items before moving on to Charts.

I can see the Display Options section expanded with "Weekends" and "Non-Business hours" checkboxes. Now let me click on "Charts" in the left sidebar.

I can see the Patient Lists page showing "12 recent patients". There's a search tooltip visible. Let me click somewhere to close the tooltip and then document the full list. Let me click on the first patient "Jennifer DemoRheum" to see their chart.

I accidentally clicked on a patient "Steve DemoCardio" and it's loading their chart. Let me wait for it to load.

Excellent! The patient chart for "Steve DemoCardio" has loaded. This is very rich with information. Let me scroll down to see more of the Summary tab, then explore other tabs.

I can see more sections. Let me scroll back up to explore the chart tabs. Let me scroll to the top and click through the different tabs.

Good. Now let me click on the "Timeline" tab to see the chart timeline.

Excellent! I can see the Timeline tab showing a list of encounters. Let me click on one of the office visits to see the encounter detail. But first, let me check the dropdown that currently shows "Encounters".

I can see the Timeline filter dropdown with many options. Let me document them and then close this dropdown by pressing Escape.

The dropdown shows: Appointments, Documents pending, Documents signed, e-Prescriptions, Encounters (selected/highlighted), Exported patient records, Imaging orders, Imaging results, Lab orders, Lab results, Prescription drafts, Prior authorizations, Referrals.

Good. Now let me click on one of the Office Visit encounters to see the encounter view. I'll click on the most recent one (07/07/2026).

Excellent! I'm now in an encounter/visit view. This is very detailed. I can see the encounter details with the encounter type, note type, date, facility, status, chief complaint, and health concerns. Let me scroll down to see more of this encounter.

I can see the Flowsheets/Vitals section with a table showing measurements across multiple visit dates. Let me continue scrolling down to see more of the encounter.

I can see the Vitals table with measurements (Height, Weight, BMI, BP, Temperature, Pulse, Respiratory rate, O2 Saturation, Pain, Head Circumference) across multiple dates. Below it is the Medications section. Let me continue scrolling.

Excellent! I can see the Note section with the SOAP note editor. The Subjective section has a rich text editor toolbar and contains the patient's subjective note. Let me scroll down to see more of the SOAP note.

I can see the Objective section of the SOAP note. Let me continue scrolling to see the Assessment and Plan sections.

I can see the Assessment section with the note. Let me scroll down to see the Plan section.

I can see the Plan section of the SOAP note, with medication orders and additional actions. Let me continue scrolling to see more.

I can see the Care plan section, Documents attached to encounter, and Quality of care section. Let me scroll down further.

I can see more Quality of care checkboxes, Referral section, and Superbill section. Let me scroll down more to see the end of this encounter.

Seems to be the same view. Let me scroll back to top and explore the other chart tabs - Documents, Profile, Payment collection, Patient ledger.

I can see the Documents tab with a table that has columns: Title, Type, Comments, Provider, Date, Size, Actions. There are filter options for "Pending" (status dropdown), Provider search, and Document type. Let me wait for it to load and then click on Profile.

Excellent! The Profile tab is loaded showing patient demographics and contact information. Let me scroll down to see more profile sections.

I can see Address, Insurance/payment/eligibility sections. Let me continue scrolling to see more of the Profile.

I can see Insurance & eligibility, Guarantor, Prescriptions sections. Let me now click on the "Patient ledger" tab.

I can see the Patient Ledger tab with a billing promo and a table showing Service Date, Superbill ID, Voucher, Provider, Facility, Charge, Payments, Adjustments, Balance, Billed Date columns. Let me now go back to explore the Patient Lists screen more carefully. Let me click "Patient lists" in the breadcrumb.

I'm back on the Patient Lists page. I can see the full list of 12 recent patients. Let me click somewhere to dismiss the tooltip, then see the full list and also try the search.

I clicked on another patient's row and I'm in Steve DemoCardio's chart. Let me click "Patient lists" in the breadcrumb to go back.

Good, I can see the Patient lists page. Let me click away from the tooltip and then scroll down to see all 12 patients. Let me click on "Scheduled" to see the scheduled view.

I can see the "Scheduled" view showing "None Scheduled" for Sunday Jul 12th. The table has columns: First, Last, DOB, Contact Info, Appt/Status. Now let me explore the Tasks section.

Excellent! The Tasks page is loaded. I can see tabs: All tasks, My tasks, Unassigned tasks, Rx change/cancel, Lab results, Refill requests, Imaging results, Prior Authorizations, and more (...). There's also an Actions dropdown and a New task button. The table has columns: Date, Task, Patient, Details, Actions. Let me click "New task" to see what that modal looks like.

I can see the "New Task" modal with fields: Details (textarea), Assign to (with "Assign to me" link), Regarding patient (search field), Reminder date (with Today, +1d, +1w, +1m, +1y quick buttons), Author, and Task type. Let me close this and explore Messages.

Now let me also look at the "..." tab in Tasks to see what other options are there.

I can see additional tab options: "Rx orders", "Controlled substance eRx ac...", "Rx Errors". Now let me close this dropdown and go to Messages.

I can see the Messages page. It has tabs: Inbox, Sent, Archive, Referrals. There's a "Show all" dropdown filter, "Message settings" gear, and "New message" button. The inbox list has columns: From, Patient, Received. Let me click "New message" to see the compose form.

I can see the "New Message" modal with fields: To (dropdown with "In practice"), Search field (showing Demo, Will), Patient search (with Add to chart checkbox), Subject, Message. Footer has Cancel, Urgent checkbox, and Send button. Let me close and go to Reports.

# post_login

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/home/main

Baseline capture immediately after manual login.


# I'll systematically explore the Practice Fusion EHR website, documenting each sc

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/home/main

I'll systematically explore the Practice Fusion EHR website, documenting each screen in detail. Let me start by taking a screenshot to see the current state.


# I can see the Practice Fusion dashboard. Let me document what I see and continue

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/home/main

I can see the Practice Fusion dashboard. Let me document what I see and continue exploring. Let me first scroll down to see the full dashboard, then explore each section.


# Good, I can see more dashboard cards. Let me scroll back up and start exploring 

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/home/main

Good, I can see more dashboard cards. Let me scroll back up and start exploring the left sidebar navigation items systematically. Let me click on "Schedule" in the left nav.


# Good, I'm back at the top. Now let me click on "Schedule" in the left sidebar.

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/home/main

Good, I'm back at the top. Now let me click on "Schedule" in the left sidebar.


# I can see the Schedule page. Let me wait for it to load and then take a screensh

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/agenda

I can see the Schedule page. Let me wait for it to load and then take a screenshot.


# The Schedule page has loaded. Let me explore the sidebar filter options and then

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/agenda

The Schedule page has loaded. Let me explore the sidebar filter options and then try the Week view. Let me click on "Week" tab.


# Excellent! I can see the Week view of the Schedule. Let me now click "Add appoin

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/week

Excellent! I can see the Week view of the Schedule. Let me now click "Add appointment" button to see the appointment creation flow.


# Excellent! A "New appointment" modal has appeared. Let me document this carefull

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/week

Excellent! A "New appointment" modal has appeared. Let me document this carefully. I can see it has three tabs: "With patient", "Block time", "Block range". Let me scroll down to see if there's more content and also check the "Block time" tab.


# I can see the "Block time" tab content. Now let me check the "Block range" tab.

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/week

I can see the "Block time" tab content. Now let me check the "Block range" tab.


# I can see the "Block range" tab. Now let me close this modal and explore the Cha

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/week

I can see the "Block range" tab. Now let me close this modal and explore the Charts section to find patient charts.


# Good. Let me now explore the Schedule Settings tab and the filter sidebar items 

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/week

Good. Let me now explore the Schedule Settings tab and the filter sidebar items before moving on to Charts.


# I can see the Display Options section expanded with "Weekends" and "Non-Business

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/week

I can see the Display Options section expanded with "Weekends" and "Non-Business hours" checkboxes. Now let me click on "Charts" in the left sidebar.


# I can see the Patient Lists page showing "12 recent patients". There's a search 

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/list/all/recent

I can see the Patient Lists page showing "12 recent patients". There's a search tooltip visible. Let me click somewhere to close the tooltip and then document the full list. Let me click on the first patient "Jennifer DemoRheum" to see their chart.


# I accidentally clicked on a patient "Steve DemoCardio" and it's loading their ch

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/summary

I accidentally clicked on a patient "Steve DemoCardio" and it's loading their chart. Let me wait for it to load.


# Excellent! The patient chart for "Steve DemoCardio" has loaded. This is very ric

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/summary

Excellent! The patient chart for "Steve DemoCardio" has loaded. This is very rich with information. Let me scroll down to see more of the Summary tab, then explore other tabs.


# I can see more sections. Let me scroll back up to explore the chart tabs. Let me

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/summary

I can see more sections. Let me scroll back up to explore the chart tabs. Let me scroll to the top and click through the different tabs.


# Good. Now let me click on the "Timeline" tab to see the chart timeline.

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/summary

Good. Now let me click on the "Timeline" tab to see the chart timeline.


# Excellent! I can see the Timeline tab showing a list of encounters. Let me click

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/timeline/encounter

Excellent! I can see the Timeline tab showing a list of encounters. Let me click on one of the office visits to see the encounter detail. But first, let me check the dropdown that currently shows "Encounters".


# I can see the Timeline filter dropdown with many options. Let me document them a

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/timeline/encounter

I can see the Timeline filter dropdown with many options. Let me document them and then close this dropdown by pressing Escape.

The dropdown shows: Appointments, Documents pending, Documents signed, e-Prescriptions, Encounters (selected/highlighted), Exported patient records, Imaging orders, Imaging results, Lab orders, Lab results, Prescription drafts, Prior authorizations, Referrals.


# Good. Now let me click on one of the Office Visit encounters to see the encounte

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/timeline/encounter

Good. Now let me click on one of the Office Visit encounters to see the encounter view. I'll click on the most recent one (07/07/2026).


# Excellent! I'm now in an encounter/visit view. This is very detailed. I can see 

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

Excellent! I'm now in an encounter/visit view. This is very detailed. I can see the encounter details with the encounter type, note type, date, facility, status, chief complaint, and health concerns. Let me scroll down to see more of this encounter.


# I can see the Flowsheets/Vitals section with a table showing measurements across

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

I can see the Flowsheets/Vitals section with a table showing measurements across multiple visit dates. Let me continue scrolling down to see more of the encounter.


# I can see the Vitals table with measurements (Height, Weight, BMI, BP, Temperatu

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

I can see the Vitals table with measurements (Height, Weight, BMI, BP, Temperature, Pulse, Respiratory rate, O2 Saturation, Pain, Head Circumference) across multiple dates. Below it is the Medications section. Let me continue scrolling.


# Excellent! I can see the Note section with the SOAP note editor. The Subjective 

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

Excellent! I can see the Note section with the SOAP note editor. The Subjective section has a rich text editor toolbar and contains the patient's subjective note. Let me scroll down to see more of the SOAP note.


# I can see the Objective section of the SOAP note. Let me continue scrolling to s

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

I can see the Objective section of the SOAP note. Let me continue scrolling to see the Assessment and Plan sections.


# I can see the Assessment section with the note. Let me scroll down to see the Pl

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

I can see the Assessment section with the note. Let me scroll down to see the Plan section.


# I can see the Plan section of the SOAP note, with medication orders and addition

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

I can see the Plan section of the SOAP note, with medication orders and additional actions. Let me continue scrolling to see more.


# I can see the Care plan section, Documents attached to encounter, and Quality of

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

I can see the Care plan section, Documents attached to encounter, and Quality of care section. Let me scroll down further.


# I can see more Quality of care checkboxes, Referral section, and Superbill secti

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

I can see more Quality of care checkboxes, Referral section, and Superbill section. Let me scroll down more to see the end of this encounter.


# Seems to be the same view. Let me scroll back to top and explore the other chart

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a

Seems to be the same view. Let me scroll back to top and explore the other chart tabs - Documents, Profile, Payment collection, Patient ledger.


# I can see the Documents tab with a table that has columns: Title, Type, Comments

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/documents

I can see the Documents tab with a table that has columns: Title, Type, Comments, Provider, Date, Size, Actions. There are filter options for "Pending" (status dropdown), Provider search, and Document type. Let me wait for it to load and then click on Profile.


# Excellent! The Profile tab is loaded showing patient demographics and contact in

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/profile

Excellent! The Profile tab is loaded showing patient demographics and contact information. Let me scroll down to see more profile sections.


# I can see Address, Insurance/payment/eligibility sections. Let me continue scrol

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/profile

I can see Address, Insurance/payment/eligibility sections. Let me continue scrolling to see more of the Profile.


# I can see Insurance & eligibility, Guarantor, Prescriptions sections. Let me now

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/profile

I can see Insurance & eligibility, Guarantor, Prescriptions sections. Let me now click on the "Patient ledger" tab.


# I can see the Patient Ledger tab with a billing promo and a table showing Servic

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/ledger

I can see the Patient Ledger tab with a billing promo and a table showing Service Date, Superbill ID, Voucher, Provider, Facility, Charge, Payments, Adjustments, Balance, Billed Date columns. Let me now go back to explore the Patient Lists screen more carefully. Let me click "Patient lists" in the breadcrumb.


# I'm back on the Patient Lists page. I can see the full list of 12 recent patient

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/list/all/recent

I'm back on the Patient Lists page. I can see the full list of 12 recent patients. Let me click somewhere to dismiss the tooltip, then see the full list and also try the search.


# I clicked on another patient's row and I'm in Steve DemoCardio's chart. Let me c

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/summary

I clicked on another patient's row and I'm in Steve DemoCardio's chart. Let me click "Patient lists" in the breadcrumb to go back.


# Good, I can see the Patient lists page. Let me click away from the tooltip and t

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/list/all/recent

Good, I can see the Patient lists page. Let me click away from the tooltip and then scroll down to see all 12 patients. Let me click on "Scheduled" to see the scheduled view.


# I can see the "Scheduled" view showing "None Scheduled" for Sunday Jul 12th. The

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/list/all/2026-07-12

I can see the "Scheduled" view showing "None Scheduled" for Sunday Jul 12th. The table has columns: First, Last, DOB, Contact Info, Appt/Status. Now let me explore the Tasks section.


# Excellent! The Tasks page is loaded. I can see tabs: All tasks, My tasks, Unassi

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/tasks/lists

Excellent! The Tasks page is loaded. I can see tabs: All tasks, My tasks, Unassigned tasks, Rx change/cancel, Lab results, Refill requests, Imaging results, Prior Authorizations, and more (...). There's also an Actions dropdown and a New task button. The table has columns: Date, Task, Patient, Details, Actions. Let me click "New task" to see what that modal looks like.


# I can see the "New Task" modal with fields: Details (textarea), Assign to (with 

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/tasks/lists

I can see the "New Task" modal with fields: Details (textarea), Assign to (with "Assign to me" link), Regarding patient (search field), Reminder date (with Today, +1d, +1w, +1m, +1y quick buttons), Author, and Task type. Let me close this and explore Messages.


# Now let me also look at the "..." tab in Tasks to see what other options are the

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/tasks/lists

Now let me also look at the "..." tab in Tasks to see what other options are there.


# I can see additional tab options: "Rx orders", "Controlled substance eRx ac...",

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/tasks/lists

I can see additional tab options: "Rx orders", "Controlled substance eRx ac...", "Rx Errors". Now let me close this dropdown and go to Messages.


# I can see the Messages page. It has tabs: Inbox, Sent, Archive, Referrals. There

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/messaging/inbox

I can see the Messages page. It has tabs: Inbox, Sent, Archive, Referrals. There's a "Show all" dropdown filter, "Message settings" gear, and "New message" button. The inbox list has columns: From, Patient, Received. Let me click "New message" to see the compose form.


# I can see the "New Message" modal with fields: To (dropdown with "In practice"),

**URL:** https://static.practicefusion.com/apps/ehr/index.html#/PF/messaging/inbox

I can see the "New Message" modal with fields: To (dropdown with "In practice"), Search field (showing Demo, Will), Patient search (with Add to chart checkbox), Subject, Message. Footer has Cancel, Urgent checkbox, and Send button. Let me close and go to Reports.


## Visited URLs

- https://static.practicefusion.com/apps/ehr/index.html#/PF/home/main
- https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/agenda
- https://static.practicefusion.com/apps/ehr/index.html#/PF/schedule/scheduler/week
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/list/all/recent
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/summary
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/timeline/encounter
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/encounter/93757b9f-6c8f-48ef-a33b-b75eb760521a
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/documents
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/profile
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/patients/208ca750-5b63-41b9-8540-f7aed201a2f2/ledger
- https://static.practicefusion.com/apps/ehr/index.html#/PF/charts/list/all/2026-07-12
- https://static.practicefusion.com/apps/ehr/index.html#/PF/tasks/lists
- https://static.practicefusion.com/apps/ehr/index.html#/PF/messaging/inbox

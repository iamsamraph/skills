---
name: meeting-news-briefing
description: Prepare a concise, cited briefing on recent company news before external meetings. Use for one-off or recurring meeting preparation when the user wants material context, likely human impact, and useful questions—not a general news digest or internal account summary.
---

# Meeting News Briefing

Give the user the context that could change how they walk into the room.

## Establish the meeting list

Use meeting or company details the user supplies. If an authorised calendar or meeting source is available, use it only when the user asks to brief upcoming meetings or to schedule this briefing. Do not assume access.

For a manual run, ask for only the smallest missing input:

- the company or organisation names;
- the meeting date or date range; and
- any topic the user wants prioritised.

Default to external company meetings in the next seven days. If the user provides company names without dates, brief those companies and say that meeting dates were not supplied.

## Research recent developments

Search the public web for each company. Start with news from the previous seven days or since the last successful briefing when that date is known. Widen to 30 days only when older context is still likely to affect the meeting, and label it as background.

Prioritise developments that could materially change the conversation:

- redundancies, restructures, leadership changes, or industrial action;
- earnings, funding, acquisitions, major losses, or insolvency risk;
- security incidents, outages, litigation, or regulatory action;
- major product, strategy, partnership, or market changes relevant to the meeting.

Prefer primary sources such as company announcements and regulator or exchange filings. Use reputable reporting for independent context. Check both publication date and event date. Use direct page links, not search-result links.

Do not pad the briefing with weakly related stories. If no material recent development is found, say so plainly. Absence of search results is not proof that nothing happened.

## Protect accuracy and privacy

- Support every concrete news claim with a citation.
- Separate confirmed facts, reported claims, and your inference.
- Treat rumours and unverified social posts as leads, not facts.
- Never infer how a specific attendee feels or whether they were personally affected.
- Describe possible human impact carefully: “People in the meeting may have been affected,” not “The attendees were affected.”
- Do not include confidential notes, customer data, private attendee details, or the user's relationship to a company in web searches.
- Keep internal context out of the output unless the user explicitly asks to include it.

## Write the briefing

Lead with the one development most likely to change the user's preparation. Keep the full briefing short enough to scan immediately before a meeting.

For each company, use this shape:

### Company — meeting date

**What changed**

One to three factual bullets with dates and inline citations.

**Why it may matter in the room**

One short paragraph that clearly labels interpretation. Focus on meeting tone, timing, likely sensitivities, or a changed business priority.

**Worth considering**

Up to three practical questions or preparation prompts. Avoid manipulative talking points and do not tell the user to raise sensitive news directly unless they ask for that advice.

Finish with:

- the coverage window;
- the time the briefing was prepared and its timezone; and
- a short note on any material evidence gap.

If there are no upcoming meetings, say that no briefing was needed for the period. If the skill is running on a schedule, keep that no-meeting update to one sentence.

## When the user wants it scheduled

Confirm the cadence, timezone, meeting window, and source of company names if they are not already clear. Reuse the same briefing rules in the scheduled task. Do not claim the schedule exists until the scheduling tool confirms it.

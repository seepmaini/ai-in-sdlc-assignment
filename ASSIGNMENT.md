## AI in SDLC Assignment

## Description

# 1. Set up the context, then show that it matters. Fork the repository and extend AGENTS.md so an agent 
arriving cold knows the approval rules, the layering, the test command and your review expectations. 
# 2. Use appropriate skills for the agents. 
# 3. Use appropriate hooks for generating the structured and same format output. 
# 4. Write the specification with a spec-driven tool. Use Spec Kit, OpenSpec or BMAD, whichever you prefer, 
to produce the specification and task breakdown. Commit the files it generates.  
# 5. Implement it in at least two steps. Do not ask for the whole feature in a single prompt. Land the single
approver limits first, with tests, then the two-approver rule. Each step is its own commit, with a message 
that says what changed and why. 
# 6. Make the tests mean something. 
# 7. Review your own pull request with the agent, then judge the review. Open the pull request, run the 
review prompt from the workshop against the diff, and in the description list every finding with one of 
three verdicts: fixed, dismissed with a reason, or deferred with a reason 
# 8. Log all AI interactions in a log file - utilizing the capability of skills/hooks. 
# 9. Create multiple agents and sub-agents for the assignment. 

## Assignment related documents and URLs are mentioned below -

# 1. A pull request on your fork, with at least three commits that each stand on their own  
- https://github.com/seepmaini/ai-in-sdlc-assignment/pull/1
# 2. The updated AGENTS.md 
- Root of the directory
# 3. The specification files from whichever spec-driven tool you used 
- Used openspec
# 4. Unit tests for every approval rule, including the two negative rules 
- in the tests file
# 5. One Playwright test covering a rejected over-limit approval 
- Done in the test file
# 6. Mutation scores before and after, pasted as text in the write-up 
- review/main-base baseline - 30.77%
- review/approval-limits-by-role baseline, before test improvements - 59.21%
- review/approval-limits-by-role with current uncommitted test improvements - 75.00%
# 7. A pull request description listing every review finding with a verdict 
- https://github.com/seepmaini/ai-in-sdlc-assignment/pull/1
# 8. A log file capturing all the AI interaction 
# 9. ASSIGNMENT.md at the repository root, holding the write-up and the video link 
# 10. The 8-to-10-minute demo video, uploaded and linked
- https://drive.google.com/file/d/1S5Owc6wkNfPO-p681mAEN0dPWMAQSmiH/view?usp=sharing
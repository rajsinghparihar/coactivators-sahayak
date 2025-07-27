/**
 * Test with real Agent Engine data from production logs
 * This reproduces the exact parsing issue we're seeing
 */

describe("Agent Engine Real Data Processing", () => {
  // Real data from the backend logs
  const REAL_AGENT_ENGINE_RESPONSE = `{"content": {"parts": [{"thought": true, "text": "Alright, so here's what I'm thinking: I need to figure out how to make a million dollars as a developer in three years. Okay, that's the goal. Let's break this down because, honestly, that's a *huge* amount of money, and I know this industry.\\n\\n**Goal Analysis**: First, the numbers. A million dollars over three years means I need to be pulling in roughly $333,333 *per year*. Okay, that's the target. Now, let's get real. Unless I'm already at a senior level in a top-tier company like FAANG (or HNW) or heading into a management role with significant equity or in a very specialized and high-demand field like AI/ML, that's a massive salary. Just a straight W2 job probably won't cut it. It's going to be either a very rapid career progression or likely a combination of income streams, or I'll need a ton of luck on a startup's equity. I need to be strategic.\\n\\n**Task Breakdown**: My plan will need these elements:\\n\\n*   **A. Career Acceleration & High-Value Role Acquisition:** This is about maximizing my W2 income. It's gotta be the primary driver.\\n*   **B. Supplemental Income Generation:** Side hustles are key! Consulting, freelancing, and potentially a product.\\n*   **C. Financial Management & Optimization:**  Budgeting, saving, and smart investing. I need to handle the money I *do* make efficiently.\\n*   **D. Skill Development & Personal Branding:** This is the foundation. I need to be skilled, and I need people to *know* I'm skilled.\\n\\n**Execution Plan**: Here's the phased approach:\\n\\n*   **Phase 1: Building the Foundation (Months 1-6):**\\n    *   **Skills**: Identify in-demand tech skills – AI/ML, cloud platforms, or whatever is *hot* and in demand. Time to deep-dive with courses, projects, and certifications.\\n    *   **Branding**: Build a strong online presence – LinkedIn, GitHub, maybe a personal website and blog. This is *non-negotiable*.\\n    *   **W2 Focus**: Start job hunting, updating the resume. Find out the market value – research and negotiate for high-paying roles, aiming for a significant bump in current compensation.\\n    *   **Savings**: Set up and stick to a budget and maximize savings.\\n*   **Phase 2: Accelerate and Supplement (Months 7-18):**\\n    *   **Career Ascent**: Aim for promotions or make a strategic job hop for higher pay. Negotiate like crazy. Try for stock options or RSUs if I can.\\n    *   **Side Hustle Launch**: Start evaluating consulting, or start building a SaaS product. If I'm serious, launch it!\\n    *   **Investing**: Start investing as soon as there is capital and understand the implications.\\n    *   **Refine Branding:** Keep building, networking, making sure skills are up-to-date.\\n*   **Phase 3: Maximize and Diversify (Months 19-36):**\\n    *   **Optimize W2**: Continue moving up the ladder; aim for a senior-level role. Try to move towards management.\\n    *   **Hustle Growth**: Grow the side hustle! Market the product, or find high-paying consulting gigs.\\n    *   **Invest aggressively**: Reinvest profits.\\n    *   **Tax planning**: I'll need to consult a professional.\\n\\n**Next Steps**: First, I need to research the high-paying roles and identify which ones are the best fit. Then, I'll outline the next steps and dependencies.\\n"}], "role": "model"}, "author": "goal_planning_agent"}
{"content": {"parts": [{"text": "This is an ambitious and achievable goal for a developer, but it requires a highly strategic approach combining career acceleration, skill mastery, financial discipline, and potentially entrepreneurial ventures. Earning $1,000,000 in 3 years translates to an average of over $333,000 per year (gross income). This is significantly higher than the average senior developer salary, meaning a typical W2 salary alone might not suffice unless you secure highly specialized roles at top-tier companies or have significant equity vesting.\\n\\n## Goal Analysis\\n\\nThe user wants to accumulate $1,000,000 in gross income as a software developer within a 3-year timeframe (36 months). This implies a multi-faceted approach involving maximizing primary income, potentially generating secondary income, and rigorous financial planning.\\n\\n**Key Challenges:**\\n*   **High Income Target:** $333,333/year average is a top-tier salary, often requiring Staff/Principal Engineer, Engineering Manager, or highly specialized roles (e.g., AI/ML, HFT, certain senior architect roles) at leading tech companies or highly lucrative contracting.\\n*   **Time Constraint:** 3 years is a relatively short period for such a significant increase in earnings unless the starting point is already high.\\n*   **Skill & Market Alignment:** Requires deep expertise in high-demand, high-paying areas.\\n\\n## Task Breakdown\\n\\n### Task 1: Assess Current Standing & Define Target Roles/Compensation\\n- **Description**: Understand current skills, experience, and market value. Identify specific high-paying roles and companies that can meet the income target.\\n- **Subtasks**:\\n    - [ ] Subtask 1.1: Document current skills, experience, and career trajectory.\\n    - [ ] Subtask 1.2: Research average total compensation (salary + equity + bonus) for Staff, Principal, Lead, or specialized engineering roles (e.g., AI/ML engineer, distributed systems engineer, quant developer) at top tech companies (FAANG+, HFT firms, successful startups).\\n    - [ ] Subtask 1.3: Identify companies known for paying top 1% compensation for developers.\\n    - [ ] Subtask 1.4: Define target total compensation per year to hit $1M in 3 years, considering potential income diversification.\\n    - [ ] Subtask 1.5: Identify specific skills, certifications, or experience gaps between current standing and target roles.\\n- **Success Criteria**: A clear list of target roles/companies, required skills, and a realistic annual compensation breakdown for the 3-year period (e.g., Year 1: $X, Year 2: $Y, Year 3: $Z, totaling $1M).\\n- **Dependencies**: None.\\n\\n### Task 2: Strategic Skill Development & Specialization\\n- **Description**: Acquire and deepen expertise in high-demand, high-value technical domains that command premium salaries.\\n- **Subtasks**:\\n    - [ ] Subtask 2.1: Prioritize 1-3 high-impact technical areas (e.g., AI/ML, Cloud Architecture, Distributed Systems, Cybersecurity, Blockchain, specific niche frameworks).\\n    - [ ] Subtask 2.2: Create a structured learning plan (online courses, certifications, personal projects, open-source contributions).\\n    - [ ] Subtask 2.3: Actively work on projects that showcase mastery in chosen domains (e.g., GitHub portfolio, technical blogs).\\n    - [ ] Subtask 2.4: Develop strong soft skills crucial for senior roles: leadership, mentorship, system design, technical communication, negotiation.\\n- **Success Criteria**: Demonstrated proficiency in target high-value skills, reflected in portfolio, contributions, and readiness for complex technical challenges.\\n- **Dependencies**: Task 1 (identifying skill gaps).\\n\\n### Task 3: Career Acceleration & Compensation Maximization (Primary Income)\\n- **Description**: Strategically navigate career moves to maximize W2 (or equivalent) compensation. This may involve rapid promotions, job hopping, and aggressive negotiation.\\n- **Subtasks**:\\n    - [ ] Subtask 3.1: Optimize resume/CV and LinkedIn profile to highlight high-value skills and project impact.\\n    - [ ] Subtask 3.2: Aggressively apply to target companies and roles identified in Task 1.\\n    - [ ] Subtask 3.3: Master technical interview skills (algorithms, data structures, system design, behavioral).\\n    - [ ] Subtask 3.4: Develop expert-level salary and total compensation negotiation skills (including RSUs, signing bonuses, performance bonuses).\\n    - [ ] Subtask 3.5: Pursue internal promotions rapidly within current or new companies, demonstrating leadership and outsized impact.\\n    - [ ] Subtask 3.6: Be open to changing jobs every 12-18 months if it offers a significant compensation bump and career growth opportunity.\\n- **Success Criteria**: Secure a role(s) with an initial total compensation package of at least $200k-$250k (or higher depending on location/experience) within 6-12 months, with a clear path to $300k-$400k+ by years 2 and 3 through promotion or job changes.\\n- **Dependencies**: Task 1 (target roles), Task 2 (required skills).\\n\\n### Task 4: Explore & Implement Supplemental Income Streams (Optional but Recommended)\\n- **Description**: Diversify income beyond a single W2 salary to accelerate reaching the $1M goal.\\n- **Subtasks**:\\n    - [ ] Subtask 4.1: Evaluate potential for high-rate freelancing or consulting (e.g., 20-30 hours/month at $150-$300+/hour).\\n    - [ ] Subtask 4.2: Research and brainstorm product-based income (SaaS, mobile apps, digital courses, e-books) targeting a niche.\\n    - [ ] Subtask 4.3: If pursuing product, validate idea, build MVP, and launch.\\n    - [ ] Subtask 4.4: If pursuing consulting/freelancing, build a client pipeline and secure contracts.\\n    - [ ] Subtask 4.5: Consider content creation (YouTube, paid newsletter, technical blog with ads/sponsorships) that can generate passive income.\\n- **Success Criteria**: Generate an additional $50,000 - $150,000+ per year through supplemental income streams by year 2 or 3.\\n- **Dependencies**: Task 2 (leveraging specialized skills for side ventures).\\n\\n### Task 5: Financial Management & Optimization\\n- **Description**: Ensure efficient management of increased income, including budgeting, saving, investing, and tax planning.\\n- **Subtasks**:\\n    - [ ] Subtask 5.1: Create a detailed personal budget to track all income and expenses, ensuring a high savings rate (e.g., 50%+).\\n    - [ ] Subtask 5.2: Research high-income tax strategies (e.g., maxing out 401k/IRA, HSA, tax-loss harvesting, qualified business income deductions if self-employed).\\n    - [ ] Subtask 5.3: Consult with a financial advisor and/or tax professional to optimize financial planning.\\n    - [ ] Subtask 5.4: Implement a diversified investment strategy (e.g., low-cost index funds, real estate, company stock if applicable).\\n    - [ ] Subtask 5.5: Monitor cash flow and net worth growth regularly.\\n- **Success Criteria**: A clear financial plan that accounts for high income, minimizes tax burden, and maximizes net worth growth, leading to the $1M gross income target.\\n- **Dependencies**: Income generation from Task 3 and Task 4.\\n\\n## Execution Plan\\n\\n**Overall Strategy**: Prioritize skill development and career acceleration in year 1, aiming for a significant income jump. In years 2 and 3, focus on maintaining high W2 income through promotions or strategic job changes, and layering on supplemental income.\\n\\n**Phase 1: Foundation & Initial Acceleration (Months 1-9)**\\n*   **Goal**: Assess, upskill, and secure a significantly higher-paying role.\\n*   **Key Actions**:\\n    *   **Month 1**: Complete Task 1 (Assess Current Standing). Finalize target roles and a realistic annual compensation breakdown for 3 years (e.g., Year 1: $250k, Year 2: $350k, Year 3: $400k).\\n    *   **Months 1-3**: Begin Task 2 (Skill Development) intensely. Focus on 1-2 high-value areas. Optimize resume/LinkedIn (Subtask 3.1).\\n    *   **Months 2-6**: Actively apply and interview for higher-paying roles (Subtasks 3.2, 3.3). Practice negotiation (Subtask 3.4).\\n    *   **Months 6-9**: Secure a new role with a substantial compensation increase (ideally $200k-$250k+ TC). Begin implementing initial financial management (Subtasks 5.1, 5.2).\\n\\n**Phase 2: Sustained Growth & Diversification (Months 10-24)**\\n*   **Goal**: Maximize primary income, establish strong financial habits, and initiate supplemental income streams.\\n*   **Key Actions**:\\n    *   **Months 10-18**: Focus on demonstrating exceptional impact in your new role to set the stage for rapid promotion or another strategic move. Continue refining high-value skills (Task 2). Aggressively pursue internal promotions (Subtask 3.5).\\n    *   **Months 12-24**: If W2 income is on track for $300k-$350k+, begin exploring and launching supplemental income (Task 4). Dedicate evening/weekend hours (e.g., 10-20 hours/week) to this.\\n    *   **Ongoing**: Consistent financial management (Task 5), maximizing savings and investment contributions.\\n\\n**Phase 3: Final Push & Optimization (Months 25-36)**\\n*   **Goal**: Hit target $1M gross income, optimize tax strategy, and solidify income streams.\\n*   **Key Actions**:\\n    *   **Months 25-30**: Either secure a final high-level promotion (e.g., Staff/Principal Engineer) or make a strategic job change to a company offering the highest possible compensation (aiming for $400k+ TC). Continue excelling.\\n    *   **Months 25-36**: Scale supplemental income (if pursued) to contribute significantly towards the goal. Refine product offerings or expand client base.\\n    *   **Ongoing**: Work closely with financial and tax professionals to optimize earnings and manage investments (Subtask 5.3, 5.4). Regularly review progress against the $1M target.\\n\\n**Timeline & Priorities:**\\n*   **Year 1 (2025-07 to 2026-07)**: Focus primarily on Skill Development and securing a high-paying primary role. Target: ~$200k-$250k income.\\n*   **Year 2 (2026-07 to 2027-07)**: Focus on career progression within the primary role or another strategic move. Begin developing side income. Target: ~$300k-$350k income.\\n*   **Year 3 (2027-07 to 2028-07)**: Final career acceleration and scaling side income to bridge any gap. Target: ~$400k-$500k+ income.\\n\\n## Next Steps\\n\\n1.  **Immediate Action**: Begin Task 1: Assess your current standing. Accurately map out your current skills, experience, and market value.\\n2.  **Research**: Dedicate time to researching compensation data for top-tier developer roles and companies using resources like Levels.fyi, Glassdoor, and industry reports.\\n3.  **Skill Gap Analysis**: Based on your research, identify 2-3 specific high-value technical areas where you need to deepen your expertise.\\n4.  **Create a Learning Roadmap**: For those identified skills, outline a concrete learning plan, including courses, books, and hands-on projects you'll undertake."}], "role": "model"}, "usage_metadata": {"candidates_token_count": 2700, "candidates_tokens_details": [{"modality": "TEXT", "token_count": 2700}], "prompt_token_count": 627, "prompt_tokens_details": [{"modality": "TEXT", "token_count": 627}], "thoughts_token_count": 1330, "total_token_count": 4657, "traffic_type": "ON_DEMAND"}, "invocation_id": "e-d9e01a38-2326-4f76-ae6e-b9f7f0b31baa", "author": "goal_planning_agent"}
`;

  it("should correctly parse real Agent Engine response data", () => {
    const lines = REAL_AGENT_ENGINE_RESPONSE.trim().split("\n");

    console.log("Raw lines from Agent Engine:");
    lines.forEach((line, index) => {
      console.log(`Line ${index + 1}:`, line.substring(0, 100) + "...");
    });

    // Try to parse each line as JSON
    interface ParsedLine {
      content: {
        parts: Array<{
          text: string;
          thought?: boolean;
        }>;
        role: string;
      };
      author: string;
      usage_metadata?: {
        candidates_token_count: number;
        total_token_count: number;
      };
      invocation_id?: string;
    }

    const parsedLines: ParsedLine[] = [];
    const errors: string[] = [];

    lines.forEach((line, index) => {
      try {
        const parsed = JSON.parse(line);
        parsedLines.push(parsed);
        console.log(`✅ Line ${index + 1} parsed successfully`);
      } catch (error) {
        errors.push(`Line ${index + 1}: ${error}`);
        console.log(`❌ Line ${index + 1} failed to parse:`, error);
      }
    });

    // Should have no parsing errors
    expect(errors).toEqual([]);
    expect(parsedLines).toHaveLength(2);

    // First part should be the thought
    expect(parsedLines[0].content.parts[0]).toHaveProperty("thought", true);
    expect(parsedLines[0].content.parts[0].text).toContain(
      "Alright, so here's what I'm thinking"
    );

    // Second part should be the response
    expect(parsedLines[1].content.parts[0]).not.toHaveProperty("thought");
    expect(parsedLines[1].content.parts[0].text).toContain(
      "This is an ambitious and achievable goal"
    );
  });

  it("should demonstrate the protocol mismatch issue", () => {
    // This shows the current problem:
    // 1. We have raw JSON lines from Agent Engine
    const rawJsonLine = `{"content": {"parts": [{"thought": true, "text": "Test thought"}]}, "author": "goal_planning_agent"}`;

    // 2. Frontend tries to parse this as JSON ✅
    const parsed = JSON.parse(rawJsonLine);
    expect(parsed.content.parts[0].thought).toBe(true);

    // 3. But then frontend calls processSseEventData with raw JSON ❌
    // processSseEventData expects SSE format like: "data: {...}\n\n"

    // This is what processSseEventData would expect:
    const expectedSseFormat = `data: ${rawJsonLine}\n\n`;

    // But we're passing raw JSON, which causes parsing errors
    expect(rawJsonLine).not.toMatch(/^data: /);
    expect(expectedSseFormat).toMatch(/^data: /);
  });

  it("should show correct frontend processing approach", () => {
    const lines = REAL_AGENT_ENGINE_RESPONSE.trim().split("\n");
    interface ProcessedPart {
      text: string;
      thought: boolean;
      author: string;
    }

    const processedParts: ProcessedPart[] = [];

    // Correct approach: Parse JSON directly, don't go through SSE pipeline
    lines.forEach((line) => {
      if (!line.trim()) return;

      try {
        const jsonData = JSON.parse(line);

        if (jsonData.content?.parts && Array.isArray(jsonData.content.parts)) {
          for (const part of jsonData.content.parts) {
            if (part.text && typeof part.text === "string") {
              // Process the part directly - no SSE conversion needed
              processedParts.push({
                text: part.text,
                thought: part.thought || false,
                author: jsonData.author,
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to parse JSON line:", error);
      }
    });

    expect(processedParts).toHaveLength(2);
    expect(processedParts[0].thought).toBe(true);
    expect(processedParts[1].thought).toBe(false);
    expect(processedParts[0].author).toBe("goal_planning_agent");
    expect(processedParts[1].author).toBe("goal_planning_agent");
  });
});

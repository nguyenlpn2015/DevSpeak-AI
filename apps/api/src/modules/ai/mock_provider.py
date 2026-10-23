"""Deterministic Mock AI Provider for testing and offline practice."""

import re

from src.modules.ai.interface import AIProviderInterface
from src.modules.ai.schemas import (
    FeedbackReport,
    FeedbackSection,
    ScoreBreakdown,
)
from src.modules.questions.schemas import Question


class DeterministicMockAIProvider(AIProviderInterface):
    """Zero-cost, offline deterministic provider simulating LLM evaluations.

    Evaluates user answers using rule-based keyword matching against the question's rubric,
    heuristic text analysis (length, transition words, STAR markers), and canned recommendations.
    Never claims to be a real AI language model or standardized evaluation.
    """

    async def evaluate_answer(self, question: Question, user_answer: str) -> FeedbackReport:
        """Deterministically evaluates the candidate's answer against the rubric."""
        cleaned_text = user_answer.strip()
        lower_text = cleaned_text.lower()
        words = re.findall(r"\b\w+\b", lower_text)
        word_count = len(words)

        # 1. Technical Evaluation (Concepts & Keywords)
        matched_concepts: list[str] = []
        missing_concepts: list[str] = []

        for concept in question.rubric.key_concepts:
            clean_concept = concept.lower()
            base_concept = re.sub(r"\(.*?\)", "", clean_concept).strip()
            # Check full base phrase
            if base_concept and base_concept in lower_text:
                matched_concepts.append(concept)
            # Check slash-separated alternatives (e.g. "vmstat / top", "Argo Rollouts/Flagger")
            elif any(
                part.strip() in lower_text
                for part in clean_concept.split("/")
                if len(part.strip()) > 3
            ):
                matched_concepts.append(concept)
            # Check specific acronyms / error codes
            elif "137" in clean_concept and ("137" in lower_text or "oom" in lower_text):
                matched_concepts.append(concept)
            elif "oom" in clean_concept and "oom" in lower_text:
                matched_concepts.append(concept)
            elif "iowait" in clean_concept and ("iowait" in lower_text or "%wa" in lower_text):
                matched_concepts.append(concept)
            else:
                missing_concepts.append(concept)

        concept_ratio = len(matched_concepts) / max(len(question.rubric.key_concepts), 1)

        if concept_ratio >= 0.7:
            technical_score = 9
        elif concept_ratio >= 0.4:
            technical_score = 7
        elif concept_ratio >= 0.2:
            technical_score = 5
        else:
            technical_score = 3 if word_count < 15 else 4

        technical_feedback: list[str] = []
        if matched_concepts:
            technical_feedback.append(
                f"Demonstrated domain familiarity by mentioning key concepts: {', '.join(matched_concepts[:3])}."
            )
        else:
            technical_feedback.append(
                "Did not mention primary technical terminology expected for this topic."
            )

        if missing_concepts:
            technical_feedback.append(
                f"Consider incorporating these core concepts: {', '.join(missing_concepts[:3])}."
            )

        # 2. Clarity & Structural Evaluation (STAR or Step-by-Step)
        structure_markers = [
            "first",
            "second",
            "next",
            "then",
            "finally",
            "step",
            "because",
            "specifically",
            "for example",
            "in order to",
        ]
        found_markers = [m for m in structure_markers if m in lower_text]

        if question.rubric.star_method_applicable:
            star_hits = {
                "Situation": any(
                    k in lower_text
                    for k in ["situation", "when i was", "at my", "project", "during"]
                ),
                "Task": any(
                    k in lower_text for k in ["task", "responsible", "my role", "objective", "goal"]
                ),
                "Action": any(
                    k in lower_text
                    for k in [
                        "action",
                        "i implemented",
                        "i resolved",
                        "i executed",
                        "i led",
                        "i investigated",
                    ]
                ),
                "Result": any(
                    k in lower_text
                    for k in [
                        "result",
                        "outcome",
                        "reduced",
                        "improved",
                        "succeeded",
                        "%",
                        "minutes",
                        "hours",
                    ]
                ),
            }
            star_count = sum(1 for v in star_hits.values() if v)
            if star_count >= 3:
                clarity_score = 9
                clarity_feedback = [
                    f"Strong behavioral narrative structure. Detected clear STAR components ({', '.join(k for k, v in star_hits.items() if v)})."
                ]
            elif star_count == 2:
                clarity_score = 7
                clarity_feedback = [
                    "Fair structure, but some STAR sections are implicit. Ensure you clearly highlight your specific Action and measurable Result."
                ]
            else:
                clarity_score = 5
                clarity_feedback = [
                    "Response lacks clear STAR framework structure. Explicitly state the Situation, your specific Task, the Action you took, and the final measurable Result."
                ]
        else:
            if len(found_markers) >= 3 and word_count >= 60:
                clarity_score = 9
                clarity_feedback = [
                    f"Excellent logical progression using transition words ({', '.join(found_markers[:3])})."
                ]
            elif len(found_markers) >= 1 and word_count >= 30:
                clarity_score = 7
                clarity_feedback = [
                    "Good explanation flow. To sound more senior, structure troubleshooting chronologically (e.g., 'First, I verify... Next, I analyze... Finally, I mitigate...')."
                ]
            else:
                clarity_score = 4 if word_count < 15 else 5
                clarity_feedback = [
                    "Answer is quite brief or unstructured. Elongate your explanation to thoroughly explain the 'why' behind each action."
                ]

        # 3. Grammar & Fluency Evaluation
        sentences = [s.strip() for s in re.split(r"[.!?]+", cleaned_text) if s.strip()]
        avg_sentence_len = word_count / max(len(sentences), 1)

        grammar_feedback: list[str] = []
        if word_count < 15:
            grammar_score = 4
            grammar_feedback.append(
                "Answer is too short to demonstrate professional English proficiency."
            )
        elif word_count < 30:
            grammar_score = 6
            grammar_feedback.append(
                "Answer is somewhat brief. Elaborate with complete sentences to demonstrate fluency."
            )
        elif avg_sentence_len > 35:
            grammar_score = 7
            grammar_feedback.append(
                "Some sentences are overly long or run-on. Consider breaking them into shorter, punchy technical statements."
            )
        else:
            grammar_score = 8
            grammar_feedback.append(
                "Good sentence rhythm and professional tone suited for technical interviews."
            )

        if any(w in lower_text for w in ["gonna", "wanna", "dunno", "kinda"]):
            grammar_score = max(grammar_score - 1, 4)
            grammar_feedback.append(
                "Avoid colloquial contractions like 'gonna' or 'wanna' in formal interviews."
            )

        # Ensure all scores stay strictly within 1 to 10
        technical_score = max(1, min(10, technical_score))
        clarity_score = max(1, min(10, clarity_score))
        grammar_score = max(1, min(10, grammar_score))

        # Overall composite score (1.0 - 10.0)
        overall = round(0.4 * technical_score + 0.3 * clarity_score + 0.3 * grammar_score, 1)
        overall = max(1.0, min(10.0, overall))

        # 4. Generate Follow-Up Questions
        followups = await self.generate_followup(question, user_answer)

        return FeedbackReport(
            question_id=question.id,
            scores=ScoreBreakdown(
                grammar_score=grammar_score,
                technical_score=technical_score,
                clarity_score=clarity_score,
                overall_score=overall,
            ),
            feedback=FeedbackSection(
                grammar_feedback=grammar_feedback,
                technical_feedback=technical_feedback,
                clarity_structure_feedback=clarity_feedback,
            ),
            model_answer=question.sample_answer,
            suggested_followups=followups,
        )

    async def generate_followup(self, question: Question, user_answer: str) -> list[str]:
        """Generate 2 relevant technical probing questions based on question or topic."""
        if question.follow_up_questions:
            return question.follow_up_questions[:2]

        topic_followups = {
            "kubernetes": [
                "If the CrashLoopBackOff container was caused by a database timeout rather than OOM, how would you configure the liveness and readiness probe timings?",
                "How do you configure pod anti-affinity and resource limits to prevent a single node from cascading into an OOM state?",
            ],
            "cicd": [
                "How would you handle database schema migrations when executing an automated canary rollback?",
                "What synthetic tests or end-to-end smoke checks would you execute before initiating the canary traffic ramp-up?",
            ],
            "aws": [
                "How do you monitor and allocate inter-AZ data transfer charges in AWS Cost Explorer?",
                "When would you recommend using a single NAT Gateway versus one NAT Gateway per Availability Zone?",
            ],
            "docker": [
                "How do you implement image vulnerability scanning in the CI pipeline before pushing to the container registry?",
                "What is the difference between ADD and COPY in a Dockerfile, and when would you prefer one over the other?",
            ],
            "linux_sre": [
                "If iowait is caused by an unindexed PostgreSQL table undergoing full table scans, how would you remediate it without restarting the database?",
                "Can you explain the difference between load average and CPU utilization in a Linux system?",
            ],
            "behavioral": [
                "Looking back at that incident, what is one thing you would do differently if a similar outage occurred tomorrow?",
                "How did you help the team re-establish stakeholder confidence after the incident concluded?",
            ],
        }

        return topic_followups.get(
            question.topic,
            [
                "Can you elaborate on how you would automate the preventative measures for this scenario?",
                "What metrics would you monitor in production to ensure this issue doesn't reoccur?",
            ],
        )

    async def conduct_chat_turn(
        self,
        question: Question,
        conversation_history: list[dict[str, str]],
        candidate_message: str,
        turn_count: int,
    ) -> tuple[str, bool, FeedbackReport | None]:
        """Conduct a deterministic conversational interview turn for testing and offline practice."""
        followups = await self.generate_followup(question, candidate_message)

        if turn_count == 1:
            fu = followups[0] if followups else "How would you monitor this in production?"
            reply = (
                f"Thanks for that thorough explanation. You outlined key fundamentals well. "
                f"Let's dive a bit deeper into real-world operational challenges: {fu} "
                "How would you address that?"
            )
            return reply, False, None

        if turn_count == 2:
            fu2 = (
                followups[1]
                if len(followups) > 1
                else "What trade-offs or security implications should the team consider?"
            )
            reply = (
                f"Understood, that is a reasonable operational path. "
                f"Now consider this edge case or design trade-off: {fu2} "
                "What factors would guide your engineering decision?"
            )
            return reply, False, None

        # Turn 3 or beyond: Conclude interview with structured evaluation
        all_candidate_texts = [
            m.get("content", "") for m in conversation_history if m.get("role") == "candidate"
        ]
        all_candidate_texts.append(candidate_message)
        combined_text = " ".join(all_candidate_texts)

        feedback_report = await self.evaluate_answer(question, combined_text)
        role_title = question.role.value if hasattr(question.role, "value") else str(question.role)
        reply = (
            f"Thank you for walking me through that technical problem from start to finish. "
            f"You demonstrated good analytical structure and domain knowledge relevant for this {role_title} role. "
            "I have compiled your complete interview performance evaluation below."
        )
        return reply, True, feedback_report

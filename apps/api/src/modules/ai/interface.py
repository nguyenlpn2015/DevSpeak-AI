"""Abstract Base Class for AI Providers."""

from abc import ABC, abstractmethod

from src.modules.ai.schemas import FeedbackReport
from src.modules.questions.schemas import Question


class AIProviderInterface(ABC):
    """Abstract interface decoupling business logic from concrete AI LLM providers."""

    @abstractmethod
    async def evaluate_answer(self, question: Question, user_answer: str) -> FeedbackReport:
        """Evaluate a candidate's answer against a question's rubric.

        Args:
            question: The interview question context including rubric and sample answer.
            user_answer: The candidate's English response text.

        Returns:
            Structured FeedbackReport with scores and actionable improvement tips.
        """
        pass

    @abstractmethod
    async def generate_followup(self, question: Question, user_answer: str) -> list[str]:
        """Generate relevant follow-up interviewer probing questions.

        Args:
            question: The original question.
            user_answer: The candidate's answer.

        Returns:
            List of 1-3 follow-up question strings.
        """
        pass

    @abstractmethod
    async def conduct_chat_turn(
        self,
        question: Question,
        conversation_history: list[dict[str, str]],
        candidate_message: str,
        turn_count: int,
    ) -> tuple[str, bool, FeedbackReport | None]:
        """Conduct a single interview turn in an interactive dialogue.

        Args:
            question: The interview question context.
            conversation_history: Prior turns as list of {"role": "interviewer"|"candidate", "content": "..."}.
            candidate_message: The candidate's response in the current turn.
            turn_count: Number of candidate turns completed so far (1-indexed).

        Returns:
            Tuple of (interviewer_reply_text, is_concluding, optional_feedback_report).
        """
        pass

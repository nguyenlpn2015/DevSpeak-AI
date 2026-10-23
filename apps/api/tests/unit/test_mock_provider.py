"""Unit tests for DeterministicMockAIProvider and AI schemas."""

import pytest
from pydantic import ValidationError

from src.modules.ai.mock_provider import DeterministicMockAIProvider
from src.modules.ai.schemas import EvaluationRequest, FeedbackReport
from src.modules.questions.catalog import DEVOPS_QUESTIONS, QuestionCatalog


@pytest.fixture
def provider() -> DeterministicMockAIProvider:
    return DeterministicMockAIProvider()


@pytest.fixture
def catalog() -> QuestionCatalog:
    return QuestionCatalog()


@pytest.mark.asyncio
async def test_deterministic_output_reproducibility(
    provider: DeterministicMockAIProvider, catalog: QuestionCatalog
):
    """Identical candidate input must yield 100% identical evaluation reports."""
    question = catalog.get_question("k8s-pod-crashloopbackoff")
    assert question is not None

    answer = (
        "First, I run kubectl describe pod to inspect events and exit codes. "
        "If exit code is 137, it is an OOMKilled condition. Next, I check previous logs "
        "using kubectl logs --previous to find the fatal exception before crashing."
    )

    result_1 = await provider.evaluate_answer(question, answer)
    result_2 = await provider.evaluate_answer(question, answer)

    assert result_1.scores == result_2.scores
    assert result_1.feedback == result_2.feedback
    assert result_1.suggested_followups == result_2.suggested_followups


@pytest.mark.asyncio
async def test_high_scoring_technical_answer(
    provider: DeterministicMockAIProvider, catalog: QuestionCatalog
):
    """Answers covering key concepts and clear structure must receive high scores."""
    question = catalog.get_question("k8s-pod-crashloopbackoff")
    assert question is not None

    strong_answer = (
        "When diagnosing a CrashLoopBackOff pod in production, I systematically inspect events, "
        "previous logs, and resource limits. First, I execute kubectl describe pod to look at termination "
        "details and container exit codes. For example, Exit Code 137 indicates an OOMKilled error where "
        "memory limits were exceeded. Second, I run kubectl logs with --previous to view the unhandled crash "
        "trace. Third, I check if required secrets or ConfigMaps are missing or if liveness probes failed."
    )

    report = await provider.evaluate_answer(question, strong_answer)

    assert isinstance(report, FeedbackReport)
    assert report.scores.technical_score >= 8
    assert report.scores.clarity_score >= 8
    assert report.scores.grammar_score >= 7
    assert report.scores.overall_score >= 7.5
    assert len(report.feedback.technical_feedback) >= 1
    assert "kubectl describe" in report.feedback.technical_feedback[0].lower()


@pytest.mark.asyncio
async def test_low_scoring_technical_answer(
    provider: DeterministicMockAIProvider, catalog: QuestionCatalog
):
    """Answers with minimal relevant concepts must receive lower technical scores."""
    question = catalog.get_question("k8s-pod-crashloopbackoff")
    assert question is not None

    vague_answer = "I would just delete the pod and restart the cluster to see if it works again."

    report = await provider.evaluate_answer(question, vague_answer)

    assert report.scores.technical_score <= 5
    assert "Did not mention primary technical terminology" in report.feedback.technical_feedback[0]


@pytest.mark.asyncio
async def test_star_rubric_evaluation(
    provider: DeterministicMockAIProvider, catalog: QuestionCatalog
):
    """Behavioral answers adhering to Situation, Task, Action, Result get high clarity."""
    question = catalog.get_question("behavioral-production-outage")
    assert question is not None

    star_answer = (
        "During a critical customer demo, our authentication service went down due to database pool exhaustion. "
        "As the on-call DevOps engineer, my task was to resolve the outage quickly while updating the demo team. "
        "I immediately executed an action: rolled back the recent release and doubled connection limits. "
        "The result was recovery within seven minutes, and we held a blameless postmortem the next morning."
    )

    report = await provider.evaluate_answer(question, star_answer)

    assert report.scores.clarity_score >= 8
    assert "STAR" in report.feedback.clarity_structure_feedback[0]


@pytest.mark.asyncio
async def test_non_star_behavioral_answer_receives_feedback(
    provider: DeterministicMockAIProvider, catalog: QuestionCatalog
):
    """Behavioral answers missing STAR structure receive constructive guidance."""
    question = catalog.get_question("behavioral-production-outage")
    assert question is not None

    unstructured_answer = (
        "There was a big outage once and everyone was panicking, but we fixed the bug eventually."
    )

    report = await provider.evaluate_answer(question, unstructured_answer)

    assert report.scores.clarity_score <= 6
    assert any("STAR" in msg for msg in report.feedback.clarity_structure_feedback)


@pytest.mark.asyncio
async def test_score_boundaries_are_strictly_enforced(
    provider: DeterministicMockAIProvider, catalog: QuestionCatalog
):
    """All score categories must remain strictly between 1 and 10."""
    for question in DEVOPS_QUESTIONS:
        report = await provider.evaluate_answer(
            question, "This is a brief test answer for boundary validation."
        )
        assert 1 <= report.scores.grammar_score <= 10
        assert 1 <= report.scores.technical_score <= 10
        assert 1 <= report.scores.clarity_score <= 10
        assert 1.0 <= report.scores.overall_score <= 10.0


@pytest.mark.asyncio
async def test_transparency_disclaimer_present(
    provider: DeterministicMockAIProvider, catalog: QuestionCatalog
):
    """Every feedback report must state that it is heuristic mock feedback."""
    question = catalog.get_question("k8s-pod-crashloopbackoff")
    assert question is not None

    report = await provider.evaluate_answer(
        question, "Sample response text for checking disclaimer."
    )
    assert "mock" in report.disclaimer.lower()
    assert "heuristic" in report.disclaimer.lower()


def test_evaluation_request_validation():
    """Verify input constraints: min_length, max_length, and whitespace rejection."""
    # Valid request
    valid = EvaluationRequest(question_id="k8s-1", user_answer="Valid answer exceeding ten chars.")
    assert valid.user_answer == "Valid answer exceeding ten chars."

    # Too short (< 10 chars)
    with pytest.raises(ValidationError):
        EvaluationRequest(question_id="k8s-1", user_answer="Short")

    # Whitespace only (< 10 non-whitespace)
    with pytest.raises(ValidationError):
        EvaluationRequest(question_id="k8s-1", user_answer="         ")

    # Too long (> 4000 chars)
    with pytest.raises(ValidationError):
        EvaluationRequest(question_id="k8s-1", user_answer="a" * 4001)

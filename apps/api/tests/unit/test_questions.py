"""Unit tests for the IT/DevOps Question Bank module."""

from src.modules.questions.catalog import DEVOPS_QUESTIONS, QuestionCatalog


def test_catalog_has_all_expected_seed_topics():
    """Verify that catalog includes all 5 expected foundation topics."""
    catalog = QuestionCatalog()
    assert catalog.count() >= 5

    topics = {q.topic for q in DEVOPS_QUESTIONS}
    expected_topics = {"kubernetes", "cicd", "aws", "linux_sre", "behavioral"}
    for expected in expected_topics:
        assert expected in topics, f"Expected topic '{expected}' missing from catalog"


def test_question_attributes_integrity():
    """Ensure every question has complete, non-empty fields and valid rubrics."""
    for question in DEVOPS_QUESTIONS:
        assert question.id.strip() != ""
        assert question.title.strip() != ""
        assert question.prompt.strip() != ""
        assert len(question.competencies) >= 2
        assert len(question.rubric.key_concepts) >= 3
        assert len(question.rubric.evaluation_criteria) >= 2
        assert len(question.sample_answer.strip()) > 50
        assert len(question.follow_up_questions) >= 1


def test_question_filtering_by_role():
    """Verify question listing filters properly by engineering role."""
    catalog = QuestionCatalog()
    devops_res = catalog.list_questions(role="devops")
    assert devops_res.total > 0
    for q in devops_res.items:
        assert q.role == "devops"

    cloud_res = catalog.list_questions(role="cloud")
    assert cloud_res.total >= 1
    for q in cloud_res.items:
        assert q.role == "cloud"


def test_question_filtering_by_topic():
    """Verify question listing filters properly by topic category."""
    catalog = QuestionCatalog()
    k8s_res = catalog.list_questions(topic="kubernetes")
    assert k8s_res.total >= 1
    assert any(q.id == "k8s-pod-crashloopbackoff" for q in k8s_res.items)

    aws_res = catalog.list_questions(topic="aws")
    assert aws_res.total >= 1
    assert any(q.id == "aws-multiaz-cost-optimization" for q in aws_res.items)



def test_question_filtering_by_difficulty():
    """Verify question listing filters properly by difficulty."""
    catalog = QuestionCatalog()
    senior_res = catalog.list_questions(difficulty="senior")
    assert senior_res.total >= 2
    for q in senior_res.items:
        assert q.difficulty == "senior"


def test_get_question_by_id():
    """Verify finding existing question vs unknown question."""
    catalog = QuestionCatalog()
    found = catalog.get_question("k8s-pod-crashloopbackoff")
    assert found is not None
    assert found.id == "k8s-pod-crashloopbackoff"
    assert found.topic == "kubernetes"

    not_found = catalog.get_question("nonexistent-question-id")
    assert not_found is None

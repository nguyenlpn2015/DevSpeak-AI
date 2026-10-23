"""Pydantic schemas for Question Bank."""

from typing import Literal

from pydantic import BaseModel, Field

RoleCategory = Literal["devops", "cloud", "backend", "general_it"]
Difficulty = Literal["junior", "mid", "senior"]
Topic = Literal[
    "kubernetes",
    "cicd",
    "docker",
    "aws",
    "linux_sre",
    "system_design",
    "behavioral",
]


class QuestionRubric(BaseModel):
    """Rubric criteria used for evaluating candidate answers."""

    key_concepts: list[str] = Field(
        description="Key technical terms/concepts expected in a proficient answer"
    )
    star_method_applicable: bool = Field(
        default=False,
        description="Whether this question expects the STAR behavioral structure",
    )
    evaluation_criteria: list[str] = Field(
        description="Specific aspects the candidate will be scored on"
    )
    common_pitfalls: list[str] = Field(
        default_factory=list,
        description="Mistakes frequently made by candidates",
    )


class Question(BaseModel):
    """Complete IT interview question model."""

    id: str = Field(description="Stable unique identifier")
    title: str = Field(description="Descriptive title of the question")
    prompt: str = Field(description="The interview question text presented to candidate")
    role: RoleCategory = Field(description="Primary target engineering role")
    topic: Topic = Field(description="Technical or behavioral topic category")
    difficulty: Difficulty = Field(description="Junior, Mid, or Senior difficulty level")
    competencies: list[str] = Field(
        default_factory=list,
        description="Key engineering competencies assessed by this question",
    )
    rubric: QuestionRubric = Field(description="Evaluation rubric")
    sample_answer: str = Field(
        description="Canonical high-scoring response demonstrating ideal structure and vocabulary"
    )
    follow_up_questions: list[str] = Field(
        default_factory=list,
        description="Expected probing follow-up questions interviewers typically ask",
    )


class QuestionSummary(BaseModel):
    """Compact summary of a question for catalog browsing."""

    id: str
    title: str
    prompt: str
    role: RoleCategory
    topic: Topic
    difficulty: Difficulty
    competencies: list[str] = Field(default_factory=list)


class QuestionListResponse(BaseModel):
    """Response envelope for catalog listings."""

    total: int
    items: list[QuestionSummary]

import { Topic } from "@/types";

export type Locale = "en" | "vi";

export interface CategoryTranslation {
  title: string;
  description: string;
  badge: string;
}

export interface Translations {
  nav: {
    brandName: string;
    coachBadge: string;
    tagline: string;
    dashboard: string;
    questionBank: string;
    practiceStudio: string;
    connected: string;
    connecting: string;
    offline: string;
    heuristicBadge: string;
    selectLanguage: string;
    switchLanguageTitle: string;
    en: string;
    vi: string;
  };
  dashboard: {
    heroBadge: string;
    heroTitle: string;
    heroDesc: string;
    exploreCta: string;
    costOfflineBadge: string;
    categoriesTitle: string;
    categoriesSubtitle: string;
    viewAllCategories: string;
    startPractice: string;
    highlights: {
      technicalAccuracyTitle: string;
      technicalAccuracyDesc: string;
      starTitle: string;
      starDesc: string;
      scoringTitle: string;
      scoringDesc: string;
    };
    categories: Record<Topic, CategoryTranslation>;
  };
  catalog: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    roleFilterAll: string;
    topicFilterAll: string;
    diffFilterAll: string;
    filterSummary: string;
    clearFilters: string;
    resetFilters: string;
    emptyTitle: string;
    emptyDesc: string;
    errorTitle: string;
    retryCta: string;
    rubricBtn: string;
    practiceBtn: string;
    showingQuestions: string;
    levels: {
      junior: string;
      mid: string;
      senior: string;
    };
    roles: {
      devops: string;
      cloud: string;
      general_it: string;
    };
  };
  detail: {
    backBtn: string;
    specBadge: string;
    starBadge: string;
    targetTime: string;
    promptHeading: string;
    competenciesHeading: string;
    keyConceptsHeading: string;
    criteriaHeading: string;
    pitfallsHeading: string;
    benchmarkAnswerHeading: string;
    copyAnswerBtn: string;
    copiedBtn: string;
    followupsHeading: string;
    startPracticeBtn: string;
    loadingDetail: string;
    errorTitle: string;
    levelSuffix: string;
  };
  practice: {
    backBtn: string;
    studioBadge: string;
    promptHeading: string;
    rubricCheatSheet: string;
    keyConcepts: string;
    starTips: string;
    starChip: string;
    troubleshootingChip: string;
    answerLabel: string;
    placeholder: string;
    charCounter: string;
    wordCounter: string;
    minLengthWarning: string;
    maxLengthWarning: string;
    submitBtn: string;
    submittingBtn: string;
    studyModelBtn: string;
    clearBtn: string;
    levelSuffix: string;
  };
  feedback: {
    reportBadge: string;
    retryBtn: string;
    backToCatalogBtn: string;
    overallScore: string;
    strongTier: string;
    solidTier: string;
    developingTier: string;
    technicalAccuracy: string;
    grammarTone: string;
    starClarity: string;
    tabTechnical: string;
    tabGrammar: string;
    tabStructure: string;
    benchmarkAnswer: string;
    copyBenchmark: string;
    copiedBenchmark: string;
    followupsHeading: string;
    disclaimerTitle: string;
  };
  studio: {
    badge: string;
    sessionProgress: string;
    questionsNav: string;
    collapseNav: string;
    expandNav: string;
    exitStudio: string;
    questionStatus: {
      current: string;
      completed: string;
      unanswered: string;
    };
    targetTime: string;
    shortcutHint: string;
    clearDraft: string;
    clearedDraftToast: string;
    refineAnswer: string;
    tryAgain: string;
    nextQuestion: string;
    noMoreQuestions: string;
    tabs: {
      feedback: string;
      vocabulary: string;
      starBuilder: string;
      rubric: string;
    };
    vocabulary: {
      title: string;
      subtitle: string;
      copyTerm: string;
      copiedTerm: string;
      insertTerm: string;
      emptyText: string;
      rubricSource: string;
    };
    starBuilder: {
      title: string;
      subtitle: string;
      recommendedBadge: string;
      optionalBadge: string;
      situationTitle: string;
      situationDesc: string;
      situationStarter: string;
      taskTitle: string;
      taskDesc: string;
      taskStarter: string;
      actionTitle: string;
      actionDesc: string;
      actionStarter: string;
      resultTitle: string;
      resultDesc: string;
      resultStarter: string;
      insertStep: string;
      insertAll: string;
    };
    rubricPanel: {
      title: string;
      subtitle: string;
      criteriaHeading: string;
      pitfallsHeading: string;
    };
    mobile: {
      editorTab: string;
      coachingTab: string;
    };
  };
  footer: {
    copyright: string;
    securityFirst: string;
    zeroCost: string;
    localOffline: string;
  };
  linguaSidebar: {
    streak: string;
    level: string;
    xpProgress: string;
    learnSection: string;
    dashboard: string;
    questionBank: string;
    flashcards: string;
    vocabVault: string;
    shadowing: string;
    aiConversation: string;
    exercises: string;
    tipTitle: string;
    tipContent: string;
  };
  flowDashboard: {
    streakBanner: string;
    greeting: string;
    greetingSub: string;
    currentLevel: string;
    upperIntermediate: string;
    quickTracksLabel: string;
    metrics: {
      dayStreak: string;
      totalXP: string;
      wordsLearned: string;
      level: string;
      weekTag: string;
    };
    weeklyProgress: {
      title: string;
      subtitle: string;
      badge: string;
    };
    streakCalendar: {
      title: string;
      daysInRow: string;
      levelProgress: string;
    };
    continueLearning: {
      heading: string;
      startNow: string;
      methodsCount: string;
      cardReview: {
        title: string;
        desc: string;
        tag: string;
      };
      cardShadow: {
        title: string;
        desc: string;
        tag: string;
      };
      cardAI: {
        title: string;
        desc: string;
        tag: string;
      };
      cardExercises: {
        title: string;
        desc: string;
        tag: string;
      };
    };
    todayGoals: {
      title: string;
      subtitle: string;
      completedBadge: string;
      goal1: string;
      goal1Sub: string;
      goal2: string;
      goal2Sub: string;
      goal3: string;
      goal3Sub: string;
    };
    achievements: {
      title: string;
      subtitle: string;
      unlockedBadge: string;
      badge1: string;
      badge1Desc: string;
      badge2: string;
      badge2Desc: string;
      badge3: string;
      badge3Desc: string;
      badge4: string;
      badge4Desc: string;
    };
  };
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    fullName: string;
    targetRole: string;
    targetLevel: string;
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    noAccount: string;
    hasAccount: string;
    guestUser: string;
    profile: string;
    roles: {
      devops: string;
      cloud: string;
      backend: string;
      general_it: string;
    };
    levels: {
      b1: string;
      b2: string;
      c1: string;
    };
  };
  voice: {
    startRecording: string;
    stopRecording: string;
    listening: string;
    micPermissionDenied: string;
    speechNotSupported: string;
    speechHint: string;
  };
  chat: {
    typeYourAnswer: string;
    send: string;
    interviewerThinking: string;
    interviewConcluded: string;
    viewCompleteFeedback: string;
    turnCounter: string;
    initialGreeting: string;
  };
}


// modules/quick-ai-engine.js - Motor AI Completo para Quick Start
class QuickAIEngine {
    constructor() {
        this.patterns = null;
        this.currentSession = null;
        this.conversationContext = [];
        this.userProfile = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Cargar patrones curados desde JSON
            const response = await fetch('./data/curated_interview_patterns.json');
            if (!response.ok) throw new Error('Failed to load patterns');
            
            this.patterns = await response.json();
            this.initialized = true;
            console.log('🎥 Quick AI Engine initialized with', this.patterns.metadata.videos_analyzed, 'real interview patterns');
            return true;
        } catch (error) {
            console.error('Quick AI Engine initialization failed:', error);
            this.initializeFallbackPatterns();
            return false;
        }
    }

    initializeFallbackPatterns() {
        // Patrones básicos de emergencia si no carga el JSON
        this.patterns = {
            metadata: { source: 'fallback' },
            officer_speech_patterns: {
                opening_phrases: [
                    "Good morning, please have a seat and make yourself comfortable.",
                    "Good afternoon. I'm Officer Johnson and I'll be conducting your naturalization interview today.",
                    "Welcome. Before we begin, do you have any questions about today's process?"
                ],
                identity_verification: [
                    "Can you please state your full legal name as it appears on your application?",
                    "Please spell your last name for me.",
                    "What is your current address?"
                ],
                eligibility_questions: [
                    "I see here that you're applying based on 5 years as a permanent resident. Is that correct?",
                    "When did you become a permanent resident?",
                    "What is the basis for your naturalization application?"
                ],
                background_questions: [
                    "Let's talk about your travels outside the United States.",
                    "What is your current occupation?",
                    "Tell me about your employment during the past 5 years."
                ]
            },
            interview_flows: {
                standard_case: {
                    phases: [
                        { name: "opening", duration_minutes: 2, typical_questions: 3 },
                        { name: "eligibility_review", duration_minutes: 5, typical_questions: 8 },
                        { name: "detailed_background", duration_minutes: 8, typical_questions: 12 },
                        { name: "civics_test", duration_minutes: 5, typical_questions: 6 },
                        { name: "english_test", duration_minutes: 3, typical_questions: 2 },
                        { name: "oath_discussion", duration_minutes: 2, typical_questions: 5 },
                        { name: "decision_closing", duration_minutes: 2, typical_questions: 1 }
                    ]
                }
            }
        };
        this.initialized = true;
        console.log('⚠️ Using fallback patterns');
    }

    startInterview(userProfile = null) {
        this.userProfile = userProfile;
        
        // Crear nueva sesión
        this.currentSession = {
            id: this.generateId(),
            startTime: new Date(),
            currentPhase: 'opening',
            phaseIndex: 0,
            conversationTurns: 0,
            riskLevel: this.assessRiskLevel(userProfile),
            interviewFlow: this.selectInterviewFlow(userProfile),
            questionsInCurrentPhase: 0
        };

        this.conversationContext = [];

        // Generar saludo inicial personalizado
        const opening = this.generateRealisticOpening();
        
        return {
            success: true,
            message: opening.message,
            phase: 'opening',
            sessionId: this.currentSession.id,
            estimatedDuration: opening.estimatedDuration,
            riskLevel: this.currentSession.riskLevel
        };
    }

    generateRealisticOpening() {
        const openingPhrases = this.patterns.officer_speech_patterns?.opening_phrases || [
            "Good morning, please have a seat and make yourself comfortable."
        ];

        // Seleccionar saludo aleatorio
        const selectedOpening = this.selectRandomFromArray(openingPhrases);
        
        // Personalizar con nombre de oficial
        const officerNames = ['Johnson', 'Martinez', 'Williams', 'Brown', 'Chen', 'Davis'];
        const officerName = this.selectRandomFromArray(officerNames);
        
        let opening = selectedOpening.replace('{name}', officerName);
        if (!opening.includes('Officer')) {
            opening = opening.replace('I\'m', `I'm Officer ${officerName} and I`);
        }

        // Agregar verificación de identidad
        const identityQuestions = this.patterns.officer_speech_patterns?.identity_verification || [
            "Can you please state your full legal name as it appears on your application?"
        ];
        
        const identityQuestion = this.selectRandomFromArray(identityQuestions);
        const finalMessage = `${opening} ${identityQuestion}`;

        return {
            message: finalMessage,
            estimatedDuration: this.estimateInterviewDuration()
        };
    }

    async processUserResponse(userInput) {
        if (!this.currentSession || !this.initialized) {
            return this.getFallbackResponse();
        }

        // Registrar respuesta del usuario
        this.conversationContext.push({
            role: 'user',
            content: userInput,
            phase: this.currentSession.currentPhase,
            turn: this.currentSession.conversationTurns,
            timestamp: new Date()
        });

        this.currentSession.conversationTurns++;
        this.currentSession.questionsInCurrentPhase++;

        // Generar respuesta apropiada para la fase actual
        const response = this.generatePhaseResponse(userInput);
        
        // Registrar respuesta del oficial
        this.conversationContext.push({
            role: 'officer',
            content: response.message,
            phase: this.currentSession.currentPhase,
            turn: this.currentSession.conversationTurns,
            timestamp: new Date()
        });

        // Actualizar estado de la sesión si cambió de fase
        if (response.phase !== this.currentSession.currentPhase) {
            this.currentSession.currentPhase = response.phase;
            this.currentSession.phaseIndex++;
            this.currentSession.questionsInCurrentPhase = 0;
        }

        return response;
    }

    generatePhaseResponse(userInput) {
        const currentPhase = this.currentSession.currentPhase;
        
        switch (currentPhase) {
            case 'opening':
                return this.handleOpeningPhase(userInput);
            case 'eligibility_review':
                return this.handleEligibilityPhase(userInput);
            case 'detailed_background':
                return this.handleBackgroundPhase(userInput);
            case 'civics_test':
                return this.handleCivicsPhase(userInput);
            case 'english_test':
                return this.handleEnglishPhase(userInput);
            case 'oath_discussion':
                return this.handleOathPhase(userInput);
            case 'decision_closing':
                return this.handleClosingPhase(userInput);
            default:
                return this.getFallbackResponse();
        }
    }

    handleOpeningPhase(userInput) {
        // Detectar si dieron nombre completo
        const hasFullName = this.detectsFullName(userInput);
        
        if (hasFullName && this.shouldAdvancePhase()) {
            return this.transitionToEligibilityPhase(userInput);
        } else if (hasFullName) {
            return {
                message: "Thank you. Could you please spell your last name for me?",
                phase: 'opening',
                shouldContinue: true,
                riskLevel: 'low'
            };
        } else {
            return {
                message: "I need you to state your full legal name clearly, including your first, middle, and last name as it appears on your N-400 application.",
                phase: 'opening',
                shouldContinue: true,
                riskLevel: 'low'
            };
        }
    }

    handleEligibilityPhase(userInput) {
        const eligibilityQuestions = this.patterns.officer_speech_patterns?.eligibility_questions || [
            "When did you become a permanent resident?",
            "What is the basis for your naturalization application?"
        ];

        if (this.shouldAdvancePhase()) {
            return this.transitionToBackgroundPhase();
        }

        // Personalizar pregunta con información del perfil si existe
        let question = this.selectRandomFromArray(eligibilityQuestions);
        if (this.userProfile) {
            question = this.personalizeQuestion(question, this.userProfile);
        }

        return {
            message: question,
            phase: 'eligibility_review',
            shouldContinue: true,
            riskLevel: this.assessResponseRisk(userInput)
        };
    }

    handleBackgroundPhase(userInput) {
        const backgroundQuestions = this.patterns.officer_speech_patterns?.background_questions || [
            "Let's talk about your travels outside the United States.",
            "What is your current occupation?"
        ];

        // Detectar menciones de problemas potenciales
        if (this.detectsPotentialIssues(userInput)) {
            return this.handlePotentialIssue(userInput);
        }

        if (this.shouldAdvancePhase()) {
            return this.transitionToCivicsPhase();
        }

        let question = this.selectRandomFromArray(backgroundQuestions);
        if (this.userProfile) {
            question = this.personalizeQuestion(question, this.userProfile);
        }

        return {
            message: question,
            phase: 'detailed_background',
            shouldContinue: true,
            riskLevel: this.assessResponseRisk(userInput)
        };
    }

    handleCivicsPhase(userInput) {
        if (this.shouldAdvancePhase()) {
            return this.transitionToEnglishPhase();
        }

        // Primera pregunta cívica
        if (this.currentSession.questionsInCurrentPhase <= 1) {
            const intro = this.patterns.officer_speech_patterns?.civics_introduction?.[0] || 
                "Now we're going to move on to the civics portion of the test.";
            return {
                message: `${intro} I'll ask you up to 10 questions, and you need to answer 6 correctly. What is the supreme law of the land?`,
                phase: 'civics_test',
                shouldContinue: true,
                riskLevel: 'low'
            };
        }

        // Preguntas cívicas adicionales
        const civicsQuestions = [
            "What does the Constitution do?",
            "Name one branch or part of the government.",
            "Who makes federal laws?",
            "What are two rights in the Declaration of Independence?",
            "What is freedom of religion?",
            "Who is the President of the United States now?",
            "Name your U.S. Representative.",
            "When do we vote for President?",
            "Name one war fought by the United States in the 1900s.",
            "What ocean is on the West Coast of the United States?"
        ];

        const question = this.selectRandomFromArray(civicsQuestions);
        
        return {
            message: question,
            phase: 'civics_test',
            shouldContinue: true,
            riskLevel: 'low'
        };
    }

    handleEnglishPhase(userInput) {
        if (this.shouldAdvancePhase()) {
            return this.transitionToOathPhase();
        }

        const englishIntro = this.patterns.officer_speech_patterns?.english_test_phrases?.[0] || 
            "Now let's test your English ability.";

        if (this.currentSession.questionsInCurrentPhase <= 1) {
            const readingSentences = this.patterns.english_test_examples?.reading_sentences || [
                "America is the land of freedom.",
                "Citizens have the right to vote.",
                "The Constitution is the supreme law."
            ];
            
            const sentence = this.selectRandomFromArray(readingSentences);
            
            return {
                message: `${englishIntro} Please read this sentence out loud: "${sentence}"`,
                phase: 'english_test',
                shouldContinue: true,
                riskLevel: 'low'
            };
        } else {
            const writingSentences = this.patterns.english_test_examples?.writing_sentences || [
                "Citizens have the right to vote.",
                "America is the land of the free."
            ];
            
            const sentence = this.selectRandomFromArray(writingSentences);
            
            return {
                message: `Now please write this sentence: "${sentence}"`,
                phase: 'english_test',
                shouldContinue: true,
                riskLevel: 'low'
            };
        }
    }

    handleOathPhase(userInput) {
        if (this.shouldAdvancePhase()) {
            return this.transitionToClosingPhase();
        }

        const oathQuestions = this.patterns.officer_speech_patterns?.oath_discussion || [
            "Are you willing to take the full Oath of Allegiance to the United States?",
            "Do you understand what the oath means?",
            "Are you willing to bear arms on behalf of the United States when required by law?"
        ];

        const question = this.selectRandomFromArray(oathQuestions);

        return {
            message: question,
            phase: 'oath_discussion',
            shouldContinue: true,
            riskLevel: 'low'
        };
    }

    handleClosingPhase(userInput) {
        const decision = this.calculateDecision();
        const decisionMessages = this.patterns.decision_language?.[decision] || [
            "Based on our interview today, I'm going to recommend your application for approval."
        ];

        const message = this.selectRandomFromArray(decisionMessages);
        
        return {
            message: `${message} You'll receive information about your oath ceremony by mail. Do you have any questions?`,
            phase: 'decision_closing',
            shouldContinue: false,
            riskLevel: 'low',
            decision: decision
        };
    }

    // Métodos auxiliares

    shouldAdvancePhase() {
        const phaseLimits = {
            'opening': 2,
            'eligibility_review': 3,
            'detailed_background': 5,
            'civics_test': 6,
            'english_test': 2,
            'oath_discussion': 3,
            'decision_closing': 1
        };

        return this.currentSession.questionsInCurrentPhase >= 
               (phaseLimits[this.currentSession.currentPhase] || 2);
    }

    transitionToEligibilityPhase(userInput) {
        const extractedName = this.extractNameFromInput(userInput);
        const eligibilityQuestions = this.patterns.officer_speech_patterns?.eligibility_questions || [
            "I see here that you're applying based on 5 years as a permanent resident. Is that correct?"
        ];

        return {
            message: `Thank you, ${extractedName}. ${this.selectRandomFromArray(eligibilityQuestions)}`,
            phase: 'eligibility_review',
            shouldContinue: true,
            riskLevel: 'low'
        };
    }

    transitionToBackgroundPhase() {
        const backgroundIntro = "Now let's discuss your background in more detail.";
        const backgroundQuestions = this.patterns.officer_speech_patterns?.background_questions || [
            "Let's talk about your travels outside the United States."
        ];

        return {
            message: `${backgroundIntro} ${this.selectRandomFromArray(backgroundQuestions)}`,
            phase: 'detailed_background',
            shouldContinue: true,
            riskLevel: 'low'
        };
    }

    transitionToCivicsPhase() {
        const civicsIntro = this.patterns.officer_speech_patterns?.civics_introduction?.[0] || 
            "Now we're going to move on to the civics portion of the test.";

        return {
            message: `${civicsIntro} I'll ask you up to 10 questions, and you need to answer 6 correctly. What is the supreme law of the land?`,
            phase: 'civics_test',
            shouldContinue: true,
            riskLevel: 'low'
        };
    }

    transitionToEnglishPhase() {
        const englishIntro = this.patterns.officer_speech_patterns?.english_test_phrases?.[0] || 
            "Now let's test your English ability.";
        
        const readingSentences = this.patterns.english_test_examples?.reading_sentences || [
            "America is the land of freedom."
        ];
        
        const sentence = this.selectRandomFromArray(readingSentences);

        return {
            message: `${englishIntro} Please read this sentence out loud: "${sentence}"`,
            phase: 'english_test',
            shouldContinue: true,
            riskLevel: 'low'
        };
    }

    transitionToOathPhase() {
        const oathIntro = "Let's talk about the Oath of Allegiance.";
        const oathQuestions = this.patterns.officer_speech_patterns?.oath_discussion || [
            "Are you willing to take the full Oath of Allegiance to the United States?"
        ];

        return {
            message: `${oathIntro} ${this.selectRandomFromArray(oathQuestions)}`,
            phase: 'oath_discussion',
            shouldContinue: true,
            riskLevel: 'low'
        };
    }

    transitionToClosingPhase() {
        const decision = this.calculateDecision();
        const decisionMessages = this.patterns.decision_language?.[decision] || [
            "Based on our interview today, I'm going to recommend your application for approval."
        ];

        return {
            message: this.selectRandomFromArray(decisionMessages),
            phase: 'decision_closing',
            shouldContinue: false,
            riskLevel: 'low',
            decision: decision
        };
    }

    // Detección y análisis

    detectsFullName(input) {
        const namePatterns = [
            /my name is|i am|i'm/i,
            /[A-Z][a-z]+\s+[A-Z][a-z]+/,  // Two capitalized words
            /first.*last|last.*first/i
        ];
        
        return namePatterns.some(pattern => pattern.test(input));
    }

    detectsPotentialIssues(input) {
        const riskKeywords = ['arrest', 'trouble', 'problem', 'court', 'fine', 'violation', 'tax', 'owe'];
        return riskKeywords.some(keyword => input.toLowerCase().includes(keyword));
    }

    handlePotentialIssue(userInput) {
        const problemQuestions = this.patterns.officer_speech_patterns?.problem_indicators || [
            "I need to understand this situation better. Can you provide more details?",
            "Do you have documentation related to this issue?"
        ];

        return {
            message: this.selectRandomFromArray(problemQuestions),
            phase: this.currentSession.currentPhase,
            shouldContinue: true,
            riskLevel: 'medium'
        };
    }

    assessRiskLevel(userProfile) {
        if (!userProfile) return 'low';

        let riskScore = 0;

        // Factores de riesgo
        if (userProfile.part8_trips?.total_days_outside_us > 180) riskScore += 2;
        if (userProfile.part12_background_info?.arrests?.length > 0) riskScore += 3;
        if (!userProfile.part12_background_info?.taxes?.filed_continuously) riskScore += 2;
        if (userProfile.part12_background_info?.selective_service?.required && 
            !userProfile.part12_background_info?.selective_service?.registered) riskScore += 2;

        if (riskScore >= 4) return 'high';
        if (riskScore >= 2) return 'medium';
        return 'low';
    }

    assessResponseRisk(userInput) {
        const riskKeywords = ['arrest', 'problem', 'issue', 'trouble', 'court', 'fine'];
        const hasRiskKeywords = riskKeywords.some(keyword => 
            userInput.toLowerCase().includes(keyword)
        );
        return hasRiskKeywords ? 'medium' : 'low';
    }

    selectInterviewFlow(userProfile) {
        const riskLevel = this.assessRiskLevel(userProfile);
        
        if (riskLevel === 'high' && this.patterns.interview_flows?.complex_case) {
            return this.patterns.interview_flows.complex_case;
        }
        
        return this.patterns.interview_flows?.standard_case || {
            phases: [
                { name: "opening", duration_minutes: 2 },
                { name: "eligibility_review", duration_minutes: 5 },
                { name: "detailed_background", duration_minutes: 8 },
                { name: "civics_test", duration_minutes: 5 },
                { name: "english_test", duration_minutes: 3 },
                { name: "oath_discussion", duration_minutes: 2 },
                { name: "decision_closing", duration_minutes: 2 }
            ]
        };
    }

    personalizeQuestion(question, userProfile) {
        if (!userProfile) return question;

        // Personalizar con viajes
        if (userProfile.part8_trips?.trips?.length > 0) {
            const trip = userProfile.part8_trips.trips[0];
            question = question.replace('{country}', trip.destination_country || 'your home country');
            question = question.replace('{days}', trip.days_outside?.toString() || 'several');
        }

        // Personalizar con nombre
        if (userProfile.part2_personal_info?.current_legal_name) {
            const name = userProfile.part2_personal_info.current_legal_name;
            question = question.replace('{name}', name.given_name || 'applicant');
        }

        return question;
    }

    extractNameFromInput(input) {
        const nameMatch = input.match(/(?:my name is|i am|i'm)\s+([a-zA-Z\s]+)/i);
        if (nameMatch) {
            return nameMatch[1].trim().split(' ')[0]; // Primer nombre
        }
        
        const words = input.split(' ');
        const capitalizedWords = words.filter(word => 
            word.length > 2 && word[0] === word[0].toUpperCase()
        );
        
        return capitalizedWords[0] || 'applicant';
    }

    calculateDecision() {
        const riskLevel = this.currentSession.riskLevel;
        const random = Math.random();
        
        if (riskLevel === 'high') {
            return random > 0.7 ? 'approved' : 'continued';
        } else if (riskLevel === 'medium') {
            return random > 0.3 ? 'approved' : 'continued';
        }
        
        return 'approved';
    }

    estimateInterviewDuration() {
        const baseMinutes = 25;
        const riskLevel = this.currentSession?.riskLevel || 'low';
        
        const adjustments = {
            'low': 0,
            'medium': 5,
            'high': 15
        };

        const totalMinutes = baseMinutes + adjustments[riskLevel];
        return `${totalMinutes - 5}-${totalMinutes + 5} minutes`;
    }

    // Métodos de progreso y estado

    getInterviewProgress() {
        if (!this.currentSession) return null;

        const phases = ['opening', 'eligibility_review', 'detailed_background', 'civics_test', 'english_test', 'oath_discussion', 'decision_closing'];
        const currentIndex = phases.indexOf(this.currentSession.currentPhase);
        const progress = Math.round(((currentIndex + 1) / phases.length) * 100);

        return {
            currentPhase: this.currentSession.currentPhase,
            progress: progress,
            phasesRemaining: phases.slice(currentIndex + 1),
            estimatedTimeRemaining: this.calculateRemainingTime(currentIndex),
            phaseIndex: currentIndex + 1,
            totalPhases: phases.length
        };
    }

    calculateRemainingTime(currentIndex) {
        const phaseTimes = [2, 5, 8, 5, 3, 2, 2]; // minutos por fase
        let remaining = 0;
        
        for (let i = currentIndex + 1; i < phaseTimes.length; i++) {
            remaining += phaseTimes[i];
        }
        
        return remaining;
    }

    endInterview() {
        if (!this.currentSession) return null;

        const duration = Math.round((new Date() - this.currentSession.startTime) / 1000 / 60);
        const decision = this.calculateDecision();

        const summary = {
            duration: `${duration} minutes`,
            decision: decision,
            riskLevel: this.currentSession.riskLevel,
            phasesCompleted: this.currentSession.phaseIndex + 1,
            totalTurns: this.currentSession.conversationTurns,
            sessionId: this.currentSession.id
        };

        const recommendations = this.generateRecommendations(summary);

        this.currentSession.endTime = new Date();
        this.currentSession.summary = summary;

        return {
            summary: this.formatSummaryMessage(summary),
            recommendations: recommendations,
            sessionData: this.currentSession
        };
    }

    generateRecommendations(summary) {
        const recommendations = [];

        if (summary.riskLevel === 'high') {
            recommendations.push("Consider consulting with an immigration attorney before your real interview");
            recommendations.push("Gather all supporting documentation for any issues discussed");
            recommendations.push("Practice explaining complex situations clearly and honestly");
        }

        if (summary.riskLevel === 'medium') {
            recommendations.push("Review your travel history and employment records carefully");
            recommendations.push("Practice explaining any gaps or issues in your background");
            recommendations.push("Prepare documentation for all trips outside the United States");
        }

        // Recomendaciones generales
        recommendations.push("Continue studying all 100 civics questions until you know them perfectly");
        recommendations.push("Practice reading and writing in English daily");
        recommendations.push("Review your N-400 application thoroughly - know every detail");
        recommendations.push("Bring all required documents in an organized folder");
        recommendations.push("Arrive early to your interview and dress professionally");

        if (summary.decision === 'approved') {
            recommendations.push("Excellent work! You appear very well-prepared for your actual interview");
        } else {
            recommendations.push("Focus on addressing the areas of concern identified in this practice session");
        }

        return recommendations;
    }

    formatSummaryMessage(summary) {
        const decisionMessages = {
            'approved': `Congratulations! Based on this practice interview, you appear very well-prepared for naturalization. Your responses were clear, honest, and consistent. You demonstrated good knowledge of English and U.S. civics.`,
            'continued': `Your case would likely require additional review by USCIS. This is not uncommon and doesn't mean denial. Focus on preparing comprehensive documentation for any areas of concern we discussed.`,
            'denied': `There are some significant issues that would need to be addressed before your application could be approved. I strongly recommend consulting with a qualified immigration attorney to discuss your specific situation.`
        };

        return decisionMessages[summary.decision] || "Practice interview completed successfully.";
    }

    // Métodos utilitarios

    selectRandomFromArray(array) {
        if (!array || array.length === 0) {
            return "Please continue with your response.";
        }
        return array[Math.floor(Math.random() * array.length)];
    }

    getFallbackResponse() {
        const fallbackResponses = [
            "Thank you for that information. Can you tell me more?",
            "I understand. Let's continue with the next part of your interview.",
            "Please provide more details about that.",
            "Can you clarify that for me?",
            "I see. Let's move on to the next question."
        ];

        return {
            message: this.selectRandomFromArray(fallbackResponses),
            phase: this.currentSession?.currentPhase || 'opening',
            shouldContinue: true,
            riskLevel: 'low',
            fallback: true
        };
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Método para reiniciar sesión
    resetSession() {
        this.currentSession = null;
        this.conversationContext = [];
        this.userProfile = null;
    }

    // Método para obtener estadísticas
    getSessionStats() {
        if (!this.currentSession) return null;

        return {
            sessionId: this.currentSession.id,
            duration: new Date() - this.currentSession.startTime,
            currentPhase: this.currentSession.currentPhase,
            totalTurns: this.currentSession.conversationTurns,
            riskLevel: this.currentSession.riskLevel,
            progress: this.getInterviewProgress()
        };
    }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.QuickAIEngine = QuickAIEngine;
}

// Para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuickAIEngine;
}